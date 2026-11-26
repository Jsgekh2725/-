"""Cut silences out of a speech track using aligned word times, and remap the words.
usage: cut_speech.py speech48.wav words.json out_dir [hook_seconds=1.0]
writes out_dir/speech_cut.wav and out_dir/timeline.json (words with start/end/show_until on the new timeline)."""
import sys, json, numpy as np, soundfile as sf
src, wj, out = sys.argv[1], sys.argv[2], sys.argv[3]
HOOK = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
words = json.load(open(wj)); y, sr = sf.read(src)
if y.ndim == 1: y = y[:, None]
PAD0, PAD1, MAXGAP, KEEPGAP = 0.07, 0.14, 0.28, 0.12
iv = []
for w in words:
    s, e = w['start'] - PAD0, w['end'] + PAD1
    if iv and s - iv[-1][1] < MAXGAP: iv[-1][1] = max(iv[-1][1], e)
    else: iv.append([s, e])
def rms(a, b):
    seg = y[int(a * sr):int(b * sr)]; return 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9)
for v in iv:
    while v[1] < len(y) / sr - 0.03 and rms(v[1], v[1] + 0.03) > -38: v[1] += 0.03
t = HOOK; parts = [np.zeros((int(HOOK * sr), y.shape[1]))]; maps = []
for a, b in iv:
    seg = y[int(a * sr):int(b * sr)].copy(); k = int(.004 * sr)
    seg[:k] *= np.linspace(0, 1, k)[:, None]; seg[-k:] *= np.linspace(1, 0, k)[:, None]
    parts.append(seg); maps.append((a, b, t)); t += b - a
    parts.append(np.zeros((int(KEEPGAP * sr), y.shape[1]))); t += KEEPGAP
sf.write(f'{out}/speech_cut.wav', np.concatenate(parts), sr)
def remap(x):
    for a, b, t0 in maps:
        if a - 0.2 <= x <= b + 0.2: return round(t0 + (min(max(x, a), b) - a), 3)
nw = [dict(word=w['word'], start=remap(w['start']), end=remap(w['end'])) for w in words]
for i, w in enumerate(nw):
    w['show_until'] = nw[i + 1]['start'] if i + 1 < len(nw) and nw[i + 1]['start'] - w['start'] < 1.2 else round(w['end'] + 0.35, 3)
json.dump(dict(total=round(t, 3), hook=HOOK, intervals=[dict(src=[round(a, 3), round(b, 3)], dst=round(t0, 3)) for a, b, t0 in maps], words=nw),
          open(f'{out}/timeline.json', 'w'), ensure_ascii=False, indent=1)
print('speech end %.2fs, %d words' % (t, len(nw)))
for w in nw: print(f"{w['start']:.2f} {w['word']}", end=' | ')
print()
