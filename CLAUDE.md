# Project notes for Claude

## Default background music — use it in EVERY video you edit or render
- File: `assets/music/background-music.m4a` (AAC stereo 44.1 kHz, 63.6 s, ≈ -15.6 LUFS), supplied by the user.
- Every video produced for this user (FFmpeg, Auto-Editor, Remotion, HyperFrames, …) gets this music unless they say otherwise for that video.
- Quick way on a finished video: `bash video-tools/add-music.sh in.mp4 out.mp4 [music_volume]`
  — loops/trims to the video length, 1 s fade-in / 2 s fade-out; mixed under existing voice at 0.25 volume, full level if the video is silent.
- Remotion: copy the file into `public/` and use `<Audio src={staticFile("background-music.m4a")} loop />`.
- HyperFrames: copy the file next to `index.html` and add it as the composition's audio track.

## Video tools
See `video-tools/README.md`. Install with `bash video-tools/setup.sh`, check with `bash video-tools/verify.sh`.
