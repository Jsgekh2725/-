# Project notes for Claude

## House style — follow it in EVERY video
Read `assets/style/STYLE.md` before editing or rendering any video. It describes the user's style
(vertical Arabic gaming shorts: red circle/arrow hook, one-word white captions at center,
2–3 s cuts, pop-in proof cards, hook callback + outro, loud mix with continuous music).
Be inspired by it — never copy the reference videos literally.

## Sound effects — use them in EVERY video
`assets/sfx/` holds SFX extracted from the user's reference videos (catalog + suggested levels in `assets/sfx/sfx.json`):
`card-pop` (every card/screenshot pop-in — the signature sound), `hook-alert` / `hook-sting-horror` (hook frame),
`transition-swoosh` (hook → story dissolve), `transition-fire-swipe` (section swipe), `outro-sting-horror` (hook callback + end card).
Place them with `bash video-tools/add-sfx.sh in.mp4 out.mp4 name@seconds[@volume] ...`, then add music, then loudnorm to -11 LUFS.

## Default background music — use it in EVERY video you edit or render
- File: `assets/music/background-music.m4a` (AAC stereo 44.1 kHz, 63.6 s, ≈ -15.6 LUFS), supplied by the user.
- Every video produced for this user (FFmpeg, Auto-Editor, Remotion, HyperFrames, …) gets this music unless they say otherwise for that video.
- Quick way on a finished video: `bash video-tools/add-music.sh in.mp4 out.mp4 [music_volume]`
  — loops/trims to the video length, 1 s fade-in / 2 s fade-out; mixed under existing voice at 0.25 volume, full level if the video is silent.
- Remotion: copy the file into `public/` and use `<Audio src={staticFile("background-music.m4a")} loop />`.
- HyperFrames: copy the file next to `index.html` and add it as the composition's audio track.

## Video tools
See `video-tools/README.md`. Install with `bash video-tools/setup.sh`, check with `bash video-tools/verify.sh`.
