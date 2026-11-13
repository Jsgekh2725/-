"""Synthesize an original, royalty-free background loop (playful night-forest pluck beat)."""
import sys, wave
import numpy as np

SR, BPM = 48000, 104
beat = 60 / BPM
dur = float(sys.argv[2])
n = int(SR * (dur + 1.5))
L, R = np.zeros(n), np.zeros(n)
rng = np.random.default_rng(7)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def add(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= n: return
    sig = sig[: n - i] * gain
    L[i:i + len(sig)] += sig * (1 - pan) / 2 * 2 ** 0.5
    R[i:i + len(sig)] += sig * (1 + pan) / 2 * 2 ** 0.5

def pluck(m, length=0.5):
    t = np.arange(int(SR * length)) / SR
    f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 30)) * np.exp(-t * 9)

def bass(m, length):
    t = np.arange(int(SR * length)) / SR
    f = hz(m)
    env = np.minimum(1, t * 80) * np.exp(-t * 2.2)
    return np.tanh(1.6 * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t))) * env

def kick():
    t = np.arange(int(SR * 0.28)) / SR
    return np.sin(2 * np.pi * (45 * t + 70 * (1 - np.exp(-t * 28)) / 28)) * np.exp(-t * 13)

def hat(length=0.05):
    t = np.arange(int(SR * length)) / SR
    x = rng.standard_normal(len(t))
    return np.diff(x, prepend=0) * np.exp(-t * 90)

def clap():
    t = np.arange(int(SR * 0.16)) / SR
    x = rng.standard_normal(len(t))
    x = np.convolve(x, np.ones(6) / 6, mode="same") - np.convolve(x, np.ones(60) / 60, mode="same")
    return x * np.exp(-t * 28)

def pad(notes, length):
    t = np.arange(int(SR * length)) / SR
    env = np.minimum(1, t / 0.5) * np.minimum(1, (length - t) / 0.5)
    return sum(np.sin(2 * np.pi * hz(m) * t + np.sin(2 * np.pi * 0.3 * t)) for m in notes) * env / len(notes)

# A minor, i - VI - iv - V : Am F Dm E
CH = [(45, [69, 72, 76]), (41, [65, 69, 72]), (38, [62, 65, 69]), (40, [64, 68, 71])]
ARP = [0, 1, 2, 1, 0, 2, 1, 2]
bars = int(dur / (beat * 4)) + 1
for b in range(bars):
    t0 = b * 4 * beat
    root, tri = CH[b % 4]
    full = b >= 1                       # first bar is a sparse intro under the title
    add(pad(tri, 4 * beat), t0, 0, 0.10)
    for k in range(8):
        note = tri[ARP[k]] + (12 if (k % 4 == 3 and b % 2) else 0)
        add(pluck(note), t0 + k * beat / 2, pan=(-0.5 if k % 2 else 0.5), gain=0.30)
        if full:
            add(hat(), t0 + k * beat / 2, pan=0.25, gain=0.10 if k % 2 else 0.05)
    if full:
        for k in (0, 2.5):
            add(kick(), t0 + k * beat, 0, 0.75)
            add(bass(root, beat * 1.4), t0 + k * beat, 0, 0.42)
        for k in (1, 3):
            add(clap(), t0 + k * beat, -0.1, 0.30)

mix = np.stack([L, R], 1)
fade = int(SR * 1.2)
end = int(SR * dur)
mix[end - fade:end] *= np.linspace(1, 0, fade)[:, None]
mix = mix[:end]
mix = mix / np.abs(mix).max() * 0.8
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
