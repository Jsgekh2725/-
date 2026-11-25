#!/usr/bin/env bash
# Render the video, then add voice -> SFX -> music -> loudnorm (-11 LUFS).
set -euo pipefail; cd "$(dirname "$0")"; T=../../video-tools
[ -f public/gameplay.mp4 ] && [ -f public/gameplay2.mp4 ] || bash prep.sh
[ -d node_modules ] || npm install --no-audit --no-fund -q
npx remotion render src/index.ts Main out/video_silent.mp4 --muted --concurrency=4 --crf=18 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
ffmpeg -nostdin -loglevel error -y -i out/video_silent.mp4 -i public/speech_cut.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -af apad -shortest out/step1_voice.mp4
# SFX timeline (seconds). Cards = full card-pop, icons = soft card-pop, cuts = swoosh.
SFX=(
  hook-alert@0 card-pop@0.03            # hook: map card + red circle
  transition-swoosh@0.9                 # hook → "هذا أفضل ماب"
  card-pop@1.35@0.07                    # 🏆
  transition-swoosh@3.18                # map image → gameplay
  card-pop@4.0                          # followers card
  card-pop@6.8@0.07                     # 🎬
  card-pop@8.08@0.08 card-pop@8.32@0.08 # ❤️ + follow
  transition-fire-swipe@8.78            # "ويلا نبدأ"
  card-pop@10.94@0.07                   # 🏨
  card-pop@11.85                        # quest card (knock 10 doors)
  transition-swoosh@13.45               # cut
  card-pop@14.5@0.08                    # rating down
  card-pop@16.12                        # live earnings card
  transition-swoosh@16.95               # cut to the wardrobe run
  hook-sting-horror@18.6@0.2            # hiding in the wardrobe
  card-pop@19.13@0.08                   # wardrobe icon
  card-pop@19.85                        # map card (outro)
  hook-alert@20.2                       # callback circle on the map name
)
bash $T/add-sfx.sh out/step1_voice.mp4 out/step2_sfx.mp4 "${SFX[@]}"
bash $T/add-music.sh out/step2_sfx.mp4 out/step3_music.mp4 0.22
ffmpeg -nostdin -loglevel error -y -i out/step3_music.mp4 -c:v copy -af "loudnorm=I=-11:TP=-1:LRA=7" -ar 48000 -c:a aac -b:a 256k -movflags +faststart out/thanksgiving-hotel.mp4
echo out/thanksgiving-hotel.mp4
