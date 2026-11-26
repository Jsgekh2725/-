"""AI-upscale a still image (cards, screenshots) with Real-ESRGAN general-x4v3 on CPU.
usage: upscale_image.py in.png out.png [target_width]"""
import sys, os, numpy as np, torch
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__)); from srvgg import load
torch.set_num_threads(os.cpu_count() or 4)
im = Image.open(sys.argv[1]).convert('RGB'); m = load('/opt/sr/realesr-general-x4v3.pth', 32)
x = torch.from_numpy(np.asarray(im).copy()).permute(2, 0, 1)[None].float() / 255
with torch.inference_mode(): y = m(x).clamp(0, 1)
out = Image.fromarray((y[0].permute(1, 2, 0).numpy() * 255 + 0.5).astype(np.uint8))
if len(sys.argv) > 3:
    w = int(sys.argv[3]); out = out.resize((w, round(out.height * w / out.width)), Image.LANCZOS)
out.save(sys.argv[2]); print(sys.argv[2], out.size)
