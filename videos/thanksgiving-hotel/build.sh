#!/usr/bin/env bash
# Render the video, then add voice -> SFX -> music -> loudnorm (-11 LUFS).
set -euo pipefail; cd "$(dirname "$0")"; T=../../video-tools
[ -f public/gameplay.mp4 ] && [ -f public/gameplay2.mp4 ] || bash prep.sh
[ -d node_modules ] || npm install --no-audit --no-fund -q
npx remotion render src/index.ts Main out/video_silent.mp4 --muted --concurrency=4 --crf=18 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
ffmpeg -nostdin -loglevel error -y -i out/video_silent.mp4 -i public/speech_cut.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -af "volume=0.5,apad" -shortest out/step1_voice.mp4
# SFX timeline: name@seconds@volume[@max_duration]. Voice is mixed at 0.5 here, so these levels put the
# meme hits about level with the voice, transitions ~3 dB under, icon pops ~7 dB under; loudnorm (-11 LUFS) at the end.
SFX=(
  meme-vine-boom@0@0.3 hook-alert@0@0.22 card-pop@0.03@0.25    # hook: map card slam + red circle
  transition-swoosh@0.9@0.23                                   # hook → "هذا أفضل ماب"
  meme-anime-wow@1.35@0.4                                      # "أفضل" 🏆
  transition-swoosh@3.18@0.23                                  # map image → gameplay
  card-pop@4.0@0.25 meme-undertale-yellow@4.02@0.28            # followers list
  card-pop@6.8@0.2                                             # 🎬
  card-pop@8.08@0.24 meme-correct@8.32@0.38                    # ❤️ + follow
  transition-fire-swipe@8.78@0.38                              # "ويلا نبدأ"
  card-pop@10.94@0.24                                          # 🏨
  card-pop@11.85@0.25 meme-akhh@11.9@0.31                      # quest card + "تزعج"
  transition-swoosh@13.45@0.23                                 # cut
  meme-roblox@14.5@0.3 card-pop@14.5@0.2                       # rating down (oof)
  card-pop@15.78@0.24                                          # money icon
  card-pop@16.12@0.25 meme-kaching@16.3@0.95                   # live earnings card
  transition-swoosh@16.95@0.23                                 # cut to the wardrobe run
  card-pop@17.91@0.2                                           # 🫣
  meme-violin-screech@18.62@0.5@1.1                            # into the wardrobe
  card-pop@19.13@0.24                                          # wardrobe icon
  meme-taco-bell@19.85@0.33 card-pop@19.85@0.25                # map card reveal
  hook-alert@20.2@0.22                                         # callback circle on the map name
)
bash $T/add-sfx.sh out/step1_voice.mp4 out/step2_sfx.mp4 "${SFX[@]}"
bash $T/add-music.sh out/step2_sfx.mp4 out/step3_music.mp4 0.11
ffmpeg -nostdin -loglevel error -y -i out/step3_music.mp4 -c:v copy -af "loudnorm=I=-10.4:TP=-1:LRA=7" -ar 48000 -c:a aac -b:a 256k -movflags +faststart out/thanksgiving-hotel.mp4
echo out/thanksgiving-hotel.mp4
