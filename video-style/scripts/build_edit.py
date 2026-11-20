"""Build src/edit.json: silence-cut segments + word-by-word captions on the output timeline."""
import json, sys

FPS = 30
TITLE = ["امتع", "ماب", "بروبلوكس"]
HOT = {"امتع", "مبدع", "سكورم", "السكورم", "موسيقية", "وحوش", "اقوى", "الغاز", "والغاز", "مهام", "بالكومنتات"}
ICONS = {"امتع": "🤩", "روبلوكس": "🎮", "سكورم": "🍄", "مبدع": "✨", "موسيقية": "🎸", "الموسيقية": "🎺", "وحوش": "👾",
         "تبيع": "💰", "وتشتري": "🛒", "اقوى": "💪", "مهام": "📋", "والغاز": "🧩", "الغاز": "🧩", "شايفين": "👀",
         "تطفش": "🥱", "اللقطات": "🎬", "بالكومنتات": "💬"}
GLUE = {"او", "في", "من", "ما", "لما", "هو", "مثل", "عشان", "راح"}  # shown together with the next word

# (source in, source out, framing, spoken text). Speech bounds come from silence detection.
FILL = {"mode": "fill", "x": 640}
MENU = {"mode": "fit", "x": 640, "w": 790}
SEGS = [
    (149.7, 151.9, FILL, None),                                    # title card
    (3.52, 7.10, FILL, "هذا امتع ماب لعبته في روبلوكس"),
    (11.07, 13.86, FILL, "طبعا الماب هو ماب سكورم الماب مرة مبدع"),
    (15.83, 21.16, FILL, "فكرة الماب لما تخش بيكون معك ادوات موسيقية هذي الادوات الموسيقية راح تستعملها عشان تجيب وحوش"),
    (23.59, 24.72, FILL, "او بالاصح سكورم"),
    (26.78, 32.71, FILL, "وتاخذ السكورم وتروح تبيع وتشتري ادوات اقوى والسكورم يمديك تسوي فيها مهام والغاز مرة كثير"),
    (39.80, 42.43, MENU, "والماب مليان سكورم مثل ما شايفين"),
    (57.01, 60.54, FILL, "مستحيل تطفش من الماب والماب مليان مرة الغاز"),
    (69.42, 71.12, FILL, "وبوريكم بعض اللقطات من الماب"),
    (82.0, 84.3, {"mode": "fit", "x": 700, "w": 800}, None),       # montage
    (102.0, 104.3, {"mode": "fit", "x": 500, "w": 780}, None),
    (142.0, 144.3, {"mode": "fit", "x": 640, "w": 1100}, None),
    (159.8, 162.0, FILL, None),
    (181.30, 184.60, FILL, "وهذا الماب كامل اسمه ماب سكورم بتلاقونه بالكومنتات"),
]
PRE, POST = 0.10, 0.14

segments, words, t, seen = [], [], 0.0, set()
for i, (a, b, frame, text) in enumerate(SEGS):
    s, e = (a - PRE, b + POST) if text else (a, b)
    dur = round((e - s) * FPS) / FPS
    segments.append({"at": round(t, 3), "from": round(s, 3), "dur": round(dur, 3), **frame,
                     "volume": 1.7 if text else 0.45, "clip": f"sr/seg_{i:02d}.mp4", "kind": "title" if i == 0 else ("talk" if text else "broll")})
    if text:
        toks, groups = text.split(), []
        j = 0
        while j < len(toks):
            g = [toks[j]]
            while g[-1] in GLUE and j + 1 < len(toks):
                j += 1
                g.append(toks[j])
            groups.append(" ".join(g))
            j += 1
        weights = [len(g.replace(" ", "")) + 1.6 for g in groups]
        span, c = (b - a), t + PRE
        for g, w in zip(groups, weights):
            d = span * w / sum(weights)
            words.append({"t": round(c, 3), "d": round(d - 0.02, 3), "text": g,
                          **({"hot": True} if any(x in HOT for x in g.split()) else {}),
                          **({"icon": ic} if (ic := next((ICONS[x] for x in g.split() if x in ICONS and (x != "سكورم" or x not in seen)), None)) else {})})
            seen.update(g.split())
            c += d
    t += dur

out = {"accent": "#ff7a1a", "video": "scorb-raw.mp4", "music": None, "title": TITLE,
       "titleEnd": segments[0]["dur"], "duration": round(t, 3), "segments": segments, "words": words}
json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
# Upscale jobs: source start, duration, crop x:y:w:h, output size (1.2x the on-screen size, for punch-ins).
with open(sys.argv[2], "w") as f:
    for i, g in enumerate(segments):
        w = 404 if g["mode"] == "fill" else g["w"] // 2 * 2
        x = int(g["x"] - w / 2)
        oh = round(720 * 1296 / w / 2) * 2
        f.write(f"{g['from']} {g['dur']} {x}:0:{w}:720 1296 {oh} seg_{i:02d}.mp4\n")
print(f"{len(segments)} segments, {len(words)} captions, {t:.1f}s")
