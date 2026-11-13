"""Upscale one video segment x4 with Real-ESRGAN's compact general model (CPU, bf16), via raw ffmpeg pipes.

Usage: upscale.py WEIGHTS SRC START DURATION X:Y:W:H OUT_W OUT_H DST
Run with the torch env from tools/setup-tools.sh: /opt/vtools/bin/python
"""
import subprocess
import sys
import time

import torch
import torch.nn as nn
import torch.nn.functional as F


class SRVGG(nn.Module):
    """SRVGGNetCompact, the architecture of realesr-general-x4v3 / realesr-animevideov3."""

    def __init__(self, nf=64, nc=32, up=4):
        super().__init__()
        self.up = up
        body = [nn.Conv2d(3, nf, 3, 1, 1), nn.PReLU(nf)]
        for _ in range(nc):
            body += [nn.Conv2d(nf, nf, 3, 1, 1), nn.PReLU(nf)]
        body.append(nn.Conv2d(nf, 3 * up * up, 3, 1, 1))
        self.body = nn.ModuleList(body)
        self.ps = nn.PixelShuffle(up)

    def forward(self, x):
        out = x
        for layer in self.body:
            out = layer(out)
        return self.ps(out) + F.interpolate(x, scale_factor=self.up, mode="nearest")


weights, src, ss, dur, crop, outw, outh, dst = sys.argv[1:9]
x, y, w, h = map(int, crop.split(":"))
sd = torch.load(weights, map_location="cpu", weights_only=True)
sd = sd.get("params_ema", sd.get("params", sd))
nc = sum(1 for k in sd if k.endswith(".weight") and sd[k].dim() == 4) - 2
model = SRVGG(nc=nc)
model.load_state_dict(sd)
model = model.eval().to(memory_format=torch.channels_last)
torch.set_num_threads(4)
bf16 = "amx_bf16" in open("/proc/cpuinfo").read() or "avx512_bf16" in open("/proc/cpuinfo").read()

reader = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-ss", ss, "-t", dur, "-i", src, "-vf", f"fps=30,crop={w}:{h}:{x}:{y}",
     "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    stdout=subprocess.PIPE,
)
writer = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w * 4}x{h * 4}", "-r", "30",
     "-i", "-", "-vf", f"scale={outw}:{outh}:flags=lanczos", "-c:v", "libx264", "-crf", "12", "-preset", "fast",
     "-pix_fmt", "yuv420p", dst],
    stdin=subprocess.PIPE,
)
n, t0 = 0, time.time()
with torch.inference_mode(), torch.autocast("cpu", dtype=torch.bfloat16, enabled=bf16):
    while True:
        buf = reader.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        frame = torch.frombuffer(bytearray(buf), dtype=torch.uint8).view(h, w, 3).permute(2, 0, 1)[None]
        frame = frame.float().div(255).contiguous(memory_format=torch.channels_last)
        out = (model(frame).float().clamp(0, 1)[0].permute(1, 2, 0) * 255).round().byte().numpy()
        writer.stdin.write(out.tobytes())
        n += 1
writer.stdin.close()
writer.wait()
print(f"{dst}: {n} frames, {(time.time() - t0) / max(n, 1):.2f}s/frame", flush=True)
