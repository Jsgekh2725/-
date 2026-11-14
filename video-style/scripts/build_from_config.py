"""Turn an edit config (edits/*.json) into a Remotion props file plus a list of upscale jobs.

Usage: build_from_config.py edits/NAME.json JOBS.txt

Config segments are played in order. Each one shows `video` from `start` for either `dur` seconds or, when it
carries a voice line, for the length of `say` (the [start, end] of the phrase in the `voice` file, which can
be a different file from the picture). `text` is that phrase, split into word-by-word captions.
"""
import json
import subprocess
import sys

FPS = 30
PRE, POST = 0.10, 0.14
GLUE = {"او", "في", "من", "ما", "لما", "هو", "مثل", "عشان", "راح", "الى"}  # shown together with the next word
OUT_W = 1296  # upscale target width: 1.2x the 1080 frame, so punch-ins stay sharp


def probe(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=width,height", "-of", "csv=p=0", path], text=True)
    w, h = map(int, out.strip().split(","))
    return w, h


def caption_groups(text):
    toks, groups, j = text.split(), [], 0
    while j < len(toks):
        g = [toks[j]]
        while g[-1] in GLUE and j + 1 < len(toks):
            j += 1
            g.append(toks[j])
        groups.append(" ".join(g))
        j += 1
    return groups


cfg = json.load(open(sys.argv[1]))
videos = cfg["videos"]
hot, icons = set(cfg.get("hot", [])), cfg.get("icons", {})
dims = {k: probe("public/" + v) for k, v in videos.items() if not v.endswith((".m4a", ".wav", ".mp3"))}

segments, words, jobs, t, used_icons = [], [], [], 0.0, set()
for i, s in enumerate(cfg["segments"]):
    W, H = dims[s["video"]]
    if "say" in s:
        a, b = s["say"]
        dur = round((b - a + PRE + POST) * FPS) / FPS
        audio = {"src": videos[s.get("voice", s["video"])], "from": round(a - PRE, 3), "volume": s.get("volume", 1.7)}
    else:
        dur = round(s["dur"] * FPS) / FPS
        audio = {"src": videos[s["video"]], "from": s["start"], "volume": s["audio"]} if s.get("audio") else None
    if s["frame"] == "fill":
        cw = round(H * 9 / 16 / 2) * 2
        cx = int(s.get("x", W / 2) - cw / 2)
    else:
        cw = s.get("w", W) // 2 * 2
        cx = int(s.get("x", W / 2) - cw / 2)
    oh = round(H * OUT_W / cw / 2) * 2
    clip = f"{cfg['name']}/sr/seg_{i:02d}.mp4"
    jobs.append(f"public/{videos[s['video']]} {s['start']} {dur} {cx}:0:{cw}:{H} {OUT_W} {oh} public/{clip}")
    segments.append({"at": round(t, 3), "dur": dur, "src": videos[s["video"]], "from": s["start"], "mode": s["frame"],
                     "h": round(1080 * H / cw), "clip": clip, "audio": audio, "kind": s.get("kind", "talk")})
    if s.get("text"):
        groups = caption_groups(s["text"])
        weights = [len(g.replace(" ", "")) + 1.6 for g in groups]
        c, span = t + PRE, s["say"][1] - s["say"][0]
        for g in groups:
            d = span * (len(g.replace(" ", "")) + 1.6) / sum(weights)
            w = {"t": round(c, 3), "d": round(d - 0.02, 3), "text": g}
            if any(x in hot for x in g.split()):
                w["hot"] = True
            ic = next((icons[x] for x in g.split() if x in icons and x not in used_icons), None)
            if ic:
                w["icon"] = ic
                used_icons.update(x for x in g.split() if x in icons)
            words.append(w)
            c += d
    t += dur

# Stickers: icons with no caption, pinned to a moment of a given source clip.
starts = {}
for g, s in zip(segments, cfg["segments"]):
    starts.setdefault(s["video"], (g["at"], s["start"]))
stickers = [{"t": round(starts[k["src"]][0] + k["t"] - starts[k["src"]][1], 3), "icon": k["icon"]}
            for k in cfg.get("stickers", [])]

out = {"accent": cfg["accent"], "video": None, "title": cfg["title"], "titleEnd": segments[0]["dur"],
       "duration": round(t, 3), "segments": segments, "words": words, "stickers": stickers}
if "music" in cfg:
    out["music"] = cfg["music"]
json.dump(out, open(cfg["out"], "w"), ensure_ascii=False, indent=1)
open(sys.argv[2], "w").write("\n".join(jobs) + "\n")
print(f"{len(segments)} segments, {len(words)} captions, {len(stickers)} stickers, {t:.1f}s")
