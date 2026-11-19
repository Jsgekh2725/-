#!/usr/bin/env bash
# Smoke-tests every video tool with a real job. Prints PASS/FAIL per tool.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$HERE")"
W="$(mktemp -d)"; cd "$W"
export HYPERFRAMES_NO_TELEMETRY=1
pass=0; fail=0
ok()  { echo "PASS  $1 — $2"; pass=$((pass+1)); }
bad() { echo "FAIL  $1 — $2"; fail=$((fail+1)); }
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1" 2>/dev/null; }

# FFmpeg: 3 scenes (red/blue/testsrc) with tone / silence / tone
ffmpeg -loglevel error -y -f lavfi -i "color=red:s=320x240:d=3,format=yuv420p" -f lavfi -i "color=blue:s=320x240:d=3" \
  -f lavfi -i "testsrc=s=320x240:d=3" -f lavfi -i "sine=f=440:d=3" -f lavfi -i "anullsrc=r=44100:cl=mono:d=3" \
  -f lavfi -i "sine=f=660:d=3" -filter_complex "[0:v][3:a][1:v][4:a][2:v][5:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -r 30 -c:v libx264 -c:a aac test.mp4 \
  && ok FFmpeg "$(ffmpeg -version | head -1 | cut -d' ' -f1-3), test clip $(dur test.mp4)s" || bad FFmpeg "encode failed"

# PySceneDetect: expect 3 scenes
n=$(scenedetect -i test.mp4 detect-content list-scenes -n 2>&1 | sed -nE 's/.*Detected ([0-9]+) scenes.*/\1/p' | tail -1)
[ "$n" = 3 ] && ok PySceneDetect "detected $n scenes" || bad PySceneDetect "detected ${n:-0} scenes (want 3)"

# Auto-Editor: silence removed → shorter output
auto-editor test.mp4 -o cut.mp4 --no-open >/dev/null 2>&1
d=$(dur cut.mp4); [ -n "$d" ] && awk "BEGIN{exit !($d < 8.5)}" && ok Auto-Editor "9.0s → ${d}s (silence cut)" || bad Auto-Editor "no shorter output"

# yt-dlp: local file always; YouTube only if the network allows it
yt-dlp -q --enable-file-urls -o "ytdlp.%(ext)s" "file://$W/test.mp4" >/dev/null 2>&1 && [ -f ytdlp.mp4 ] \
  && ok yt-dlp "$(yt-dlp --version), local download ok" || bad yt-dlp "local download failed"
if t=$(timeout 60 yt-dlp --simulate --print title "https://www.youtube.com/watch?v=jNQXAC9IVRw" 2>/dev/null); then
  ok "yt-dlp (YouTube)" "$t"; else echo "SKIP  yt-dlp (YouTube) — youtube.com not reachable from this network"; fi

# Whisper: transcribe the repo's audio (needs model download on first run)
if timeout 600 whisper "$REPO/nasheed-audio.mp3" --model tiny --language ar --fp16 False \
     --output_format txt --output_dir "$W/wh" >/dev/null 2>&1 && [ -s "$W/wh/nasheed-audio.txt" ]; then
  ok Whisper "transcript: $(head -c 80 "$W/wh/nasheed-audio.txt" | tr '\n' ' ')"
else
  bad Whisper "transcription failed (model host openaipublic.azureedge.net reachable?)"
fi

# Real-ESRGAN: 2x upscale on CPU (lavapipe Vulkan)
ffmpeg -loglevel error -y -f lavfi -i testsrc=s=96x96:d=1 -frames:v 1 small.png
realesrgan-ncnn-vulkan -i small.png -o up.png -n realesr-animevideov3 -s 2 -m /opt/realesrgan/models >/dev/null 2>&1
s=$(ffprobe -v error -show_entries stream=width,height -of csv=p=0 up.png 2>/dev/null)
[ "$s" = "192,192" ] && ok Real-ESRGAN "96x96 → ${s/,/x}" || bad Real-ESRGAN "upscale failed (${s:-no output})"

# Remotion: render the sample composition
(cd "$HERE/remotion-test" && npx remotion render src/index.ts Hello "$W/remotion.mp4" \
   --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell >/dev/null 2>&1) \
  && [ -s remotion.mp4 ] && ok Remotion "rendered $(dur remotion.mp4)s mp4" || bad Remotion "render failed"

# HyperFrames: render the sample composition
(cd "$HERE/hyperframes-test" && hyperframes render -o "$W/hf.mp4" --quality draft >/dev/null 2>&1) \
  && [ -s hf.mp4 ] && ok HyperFrames "rendered $(dur hf.mp4)s mp4" || bad HyperFrames "render failed"

# Agent skills
k=$(ls -d "$REPO"/.claude/skills/*/ 2>/dev/null | wc -l)
[ "$k" -gt 0 ] && ok "Agent skills" "$k skills in .claude/skills (Remotion + HyperFrames)" || bad "Agent skills" "none installed"

echo "---- $pass passed, $fail failed  (work dir: $W)"
[ "$fail" = 0 ]
