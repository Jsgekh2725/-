"""Build src/edit.json: silence-cut segments + word-by-word captions on the output timeline."""
import json, sys

FPS = 30
TITLE = ["امتع", "ماب", "بروبلوكس"]
HOT = {"امتع", "مبدع", "سكورب", "السكورب", "موسيقية", "وحوش", "اقوى", "الغاز", "والالغاز", "بالكومنتات"}
GLUE = {"او", "في", "من", "ما", "لما", "هو", "مثل", "عشان", "راح"}  # shown together with the next word

# (source in, source out, framing, spoken text). Speech bounds come from silence detection.
FILL = {"mode": "fill", "x": 640}
MENU = {"mode": "fit", "x": 640, "w": 790}
SEGS = [
    (149.7, 151.9, FILL, None),                                    # title card
    (3.52, 7.10, FILL, "هذا امتع ماب لعبته في روبلوكس"),
    (11.07, 13.86, FILL, "طبعا الماب هو ماب سكورب الماب مرة مبدع"),
    (15.83, 21.16, FILL, "فكرة الماب لما تخش بيكون معك ادوات موسيقية هذي الادوات الموسيقية راح تستعملها عشان تجيب وحوش"),
    (23.59, 24.72, FILL, "او بالاصح سكورب"),
    (26.78, 32.71, FILL, "وتاخذ السكورب وتروح تبيع وتشتري ادوات اقوى والسكورب تكتسبه في المهام والالغاز مرة كثير"),
    (36.25, 38.13, MENU, "ومليان سكورب في الماب"),
    (39.80, 42.43, MENU, "والماب مليان سكورب مثل ما شايفين"),
    (55.60, 60.54, FILL, "يعني مستحيل تطفش من الماب والماب مليان مرة الغاز"),
    (69.42, 71.12, FILL, "وبوريكم بعض اللقطات من الماب"),
    (82.0, 84.3, {"mode": "fit", "x": 700, "w": 800}, None),       # montage
    (102.0, 104.3, {"mode": "fit", "x": 500, "w": 780}, None),
    (149.6, 151.9, FILL, None),
    (159.8, 162.0, FILL, None),
    (181.30, 184.60, FILL, "وهذا الماب كامل اسمه ماب سكورب بتلاقونه بالكومنتات"),
]
PRE, POST = 0.10, 0.14

segments, words, t = [], [], 0.0
for i, (a, b, frame, text) in enumerate(SEGS):
    s, e = (a - PRE, b + POST) if text else (a, b)
    dur = round((e - s) * FPS) / FPS
    segments.append({"at": round(t, 3), "from": round(s, 3), "dur": round(dur, 3), **frame,
                     "volume": 1.7 if text else 0.45, "kind": "title" if i == 0 else ("talk" if text else "broll")})
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
                          **({"hot": True} if any(x in HOT for x in g.split()) else {})})
            c += d
    t += dur

out = {"accent": "#ff7a1a", "video": "scorb-raw.mp4", "music": "music.wav", "title": TITLE,
       "titleEnd": segments[0]["dur"], "duration": round(t, 3), "segments": segments, "words": words}
json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
print(f"{len(segments)} segments, {len(words)} captions, {t:.1f}s")
