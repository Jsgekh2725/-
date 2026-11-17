"""Synthesize the template's sound effects into public/sfx/ (original, royalty-free).

whoosh, impact, pop, ding, riser, glitch, coin — all 48 kHz stereo WAV.
"""
import os
import wave

import numpy as np

SR = 48000
OUT = "public/sfx"
rng = np.random.default_rng(3)


def save(name, x, width=0.0):
    x = np.asarray(x, dtype=float)
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    # Tiny Haas offset for width.
    d = int(SR * width)
    left, right = x, np.concatenate([np.zeros(d), x])[: len(x)] if d else x
    st = np.stack([left, right], 1)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())


def t_(sec):
    return np.arange(int(SR * sec)) / SR


def bandpass_sweep(noise, f0, f1, q=4.0):
    """Cheap time-varying band-pass: a resonant two-pole filter whose centre glides f0 -> f1."""
    n = len(noise)
    f = np.geomspace(f0, f1, n)
    out = np.zeros(n)
    y1 = y2 = 0.0
    for i in range(n):
        w = 2 * np.pi * f[i] / SR
        r = np.exp(-w / (2 * q))
        a1, a2 = -2 * r * np.cos(w), r * r
        y = (1 - r) * noise[i] - a1 * y1 - a2 * y2
        y2, y1 = y1, y
        out[i] = y
    return out


os.makedirs(OUT, exist_ok=True)

# Whoosh: noise swept up then down, swelling in the middle.
t = t_(0.45)
env = np.sin(np.pi * t / t[-1]) ** 2
save("whoosh", bandpass_sweep(rng.standard_normal(len(t)), 300, 3500) * env, width=0.004)

# Impact: pitch-dropping sub thump + noise crack + short tail.
t = t_(0.9)
thump = np.sin(2 * np.pi * (40 * t + 90 * (1 - np.exp(-t * 18)) / 18)) * np.exp(-t * 5)
crack = rng.standard_normal(len(t)) * np.exp(-t * 60)
tail = bandpass_sweep(rng.standard_normal(len(t)), 900, 200, q=1.5) * np.exp(-t * 7)
save("impact", 1.0 * thump + 0.5 * crack + 0.35 * tail, width=0.006)

# Pop: quick upward blip.
t = t_(0.14)
save("pop", np.sin(2 * np.pi * (500 * t + 4000 * t * t)) * np.exp(-t * 35))

# Ding: bell partials with a bright attack.
t = t_(1.6)
bell = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d)
           for f, a, d in [(1318, 1.0, 2.6), (2637, 0.5, 4.0), (3520, 0.35, 5.5), (1975, 0.4, 3.2), (5274, 0.2, 9.0)])
save("ding", bell, width=0.003)

# Riser: rising noise band plus a gliding tone, ending abruptly.
t = t_(1.3)
env = (t / t[-1]) ** 2.2
tone = np.sin(2 * np.pi * (200 * t + 700 * t ** 2 / t[-1]))
save("riser", (bandpass_sweep(rng.standard_normal(len(t)), 250, 6000, q=3) + 0.25 * tone) * env, width=0.005)

# Glitch: three bit-crushed, sample-held noise stutters.
parts = []
for i, (dur, hold) in enumerate([(0.05, 12), (0.04, 40), (0.07, 7)]):
    seg = rng.standard_normal(int(SR * dur))
    seg = np.repeat(seg[::hold], hold)[: int(SR * dur)]
    seg = np.round(seg * 3) / 3
    parts += [seg, np.zeros(int(SR * 0.025))]
save("glitch", np.concatenate(parts) * 0.8)

# Coin: two quick bright tones (ka-ching).
t = t_(0.7)
def tone(f, start, dur):
    x = np.zeros(len(t)); i = int(start * SR); tt = t[: len(t) - i]
    x[i:] = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2.01 * f * tt)) * np.exp(-tt / dur)
    return x
save("coin", tone(1976, 0, 0.08) + 1.2 * tone(2637, 0.07, 0.25), width=0.002)

print("sfx:", sorted(os.listdir(OUT)))
