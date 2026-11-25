#!/usr/bin/env bash
# Render the video, then add voice -> SFX -> music -> loudnorm (-11 LUFS).
set -euo pipefail; cd "$(dirname "$0")"; T=../../video-tools
[ -f public/gameplay.mp4 ] || bash prep.sh
[ -d node_modules ] || npm install --no-audit --no-fund -q
npx remotion render src/index.ts Main out/video_silent.mp4 --muted --concurrency=4 --crf=18 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
ffmpeg -nostdin -loglevel error -y -i out/video_silent.mp4 -i public/speech_cut.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -af apad -shortest out/step1_voice.mp4
bash $T/add-sfx.sh out/step1_voice.mp4 out/step2_sfx.mp4 hook-alert@0 transition-swoosh@0.86 card-pop@4.0 transition-fire-swipe@8.78 card-pop@11.85 card-pop@16.12 card-pop@19.85 hook-alert@20.2
bash $T/add-music.sh out/step2_sfx.mp4 out/step3_music.mp4 0.22
ffmpeg -nostdin -loglevel error -y -i out/step3_music.mp4 -c:v copy -af "loudnorm=I=-11:TP=-1:LRA=7" -ar 48000 -c:a aac -b:a 256k -movflags +faststart out/thanksgiving-hotel.mp4
echo out/thanksgiving-hotel.mp4
