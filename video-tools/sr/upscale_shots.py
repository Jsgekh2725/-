"""AI-upscale only the gameplay shots a Remotion plan uses.
usage: upscale_shots.py <project_dir> [crop=456:810:312:0] [out=1296x2304]
Reads SHOTS from src/plan.ts (shots marked dark are skipped), crops each source range from source/<video>,
runs Real-ESRGAN general-x4v3 on CPU, downsamples to out size and writes public/sr/shotN.mp4 + public/sr/shots.json."""
import sys, os, re, json, subprocess, time, numpy as np, torch
sys.path.insert(0, os.path.dirname(__file__))
from srvgg import load
proj = sys.argv[1]; crop = sys.argv[2] if len(sys.argv) > 2 else '456:810:312:0'
OW, OH = map(int, (sys.argv[3] if len(sys.argv) > 3 else '1296x2304').split('x'))
cw, ch = map(int, crop.split(':')[:2]); PAD = 0.15
torch.set_num_threads(os.cpu_count() or 4)
m = load('/opt/sr/realesr-general-x4v3.pth', 32)
plan = open(f'{proj}/src/plan.ts').read()
shots = [dict(i=k, a=float(x[1]), b=float(x[2]), src=float(x[3]), video=x[5])
         for k, x in enumerate(re.finditer(r"from: ([\d.]+), to: ([\d.]+), src: ([\d.]+)([^\n]*?)video: '([\w.]+)'", plan))
         if 'dark: true' not in x[4]]
os.makedirs(f'{proj}/public/sr', exist_ok=True); done = {}
total = sum(round((s['b'] - s['a'] + PAD) * 30) for s in shots); n = 0; t0 = time.time()
for s in shots:
    out = f"{proj}/public/sr/shot{s['i']}.mp4"; dur = s['b'] - s['a'] + PAD; nf = round(dur * 30)
    src_file = f"{proj}/source/{s['video'].replace('.mp4', '')}.mp4"
    dec = subprocess.Popen(['ffmpeg', '-nostdin', '-loglevel', 'error', '-ss', str(s['src']), '-i', src_file, '-frames:v', str(nf),
        '-vf', f'fps=30,crop={crop}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{OW}x{OH}', '-r', '30',
        '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '10', '-pix_fmt', 'yuv420p', '-g', '15', out], stdin=subprocess.PIPE)
    while True:
        buf = dec.stdout.read(cw * ch * 3)
        if len(buf) < cw * ch * 3: break
        x = torch.from_numpy(np.frombuffer(buf, np.uint8).reshape(ch, cw, 3).copy()).permute(2, 0, 1)[None].float() / 255
        with torch.inference_mode():
            y = m(x).clamp(0, 1)
            y = torch.nn.functional.interpolate(y, size=(OH, OW), mode='bicubic', antialias=True, align_corners=False).clamp(0, 1)
        enc.stdin.write((y[0].permute(1, 2, 0).numpy() * 255 + 0.5).astype(np.uint8).tobytes()); n += 1
        if n % 25 == 0:
            el = time.time() - t0; print(f'{n}/{total} frames, {el/n:.1f}s/frame, ETA {el/n*(total-n)/60:.0f} min', flush=True)
    enc.stdin.close(); enc.wait(); dec.wait()
    done[str(s['i'])] = dict(file=f"sr/shot{s['i']}.mp4", src=s['src'], video=s['video'])
    json.dump(done, open(f'{proj}/public/sr/shots.json', 'w'), indent=1)
print('done', n, 'frames in %.0f min' % ((time.time() - t0) / 60))
