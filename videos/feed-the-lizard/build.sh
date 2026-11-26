#!/usr/bin/env bash
# Render the video, then add voice -> SFX -> music -> loudnorm (-11 LUFS).
set -euo pipefail; cd "$(dirname "$0")"; T=../../video-tools
[ -f public/g2.mp4 ] || bash prep.sh
[ -d node_modules ] || npm install --no-audit --no-fund -q
# AI upscale of the gameplay shots (cached in public/sr; delete it after changing SHOTS)
[ -f public/sr/shots.json ] || python3 $T/sr/upscale_shots.py "$PWD"
python3 -c "import json;d=json.load(open('public/sr/shots.json'));open('src/sr.ts','w').write('export const SR: Record<number, string> = '+json.dumps({int(k):v['file'] for k,v in d.items()})+';\\n')"
# PNG frames (no JPEG loss), near-lossless intermediate; the final TikTok encode happens at the end
npx remotion render src/index.ts Main out/video_silent.mp4 --muted --concurrency=3 --image-format=png --crf=10 --x264-preset=fast --color-space=bt709 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
ffmpeg -nostdin -loglevel error -y -i out/video_silent.mp4 -i public/speech_cut.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -af "volume=0.5,apad" -shortest out/step1_voice.mp4
# SFX timeline: name@seconds@volume[@max_duration]. Voice is at 0.5: meme hits ≈ voice level, transitions ~3 dB under, icon pops ~7 dB under.
SFX=(
  meme-vine-boom@0@0.3 hook-alert@0@0.22 card-pop@0.03@0.25    # hook: map card slam + red circle
  transition-swoosh@0.9@0.23                                   # hook → "هذا الماب"
  meme-roblox@1.9@0.25 card-pop@1.9@0.2                        # "ينافس" ⚔️
  card-pop@3.36@0.22                                           # 🐾 "للحيوانات"
  transition-swoosh@4.15@0.23                                  # map card → gameplay
  card-pop@5.1@0.25 meme-undertale-yellow@5.12@0.28            # followers list
  card-pop@8.32@0.2                                            # 🎬
  card-pop@9.1@0.24 meme-correct@9.32@0.38                     # ❤️ + follow
  transition-fire-swipe@9.98@0.38                              # "ويلا نبدأ"
  meme-anime-wow@10.98@0.32 card-pop@10.98@0.2                 # "فكرة" 💡
  transition-swoosh@11.85@0.23                                 # cut: food flying
  card-pop@12.83@0.22                                          # dates
  transition-swoosh@13.2@0.23 meme-tindeck@13.59@0.65          # "بنسخة عربية"
  transition-swoosh@14.65@0.23                                 # cut: throw
  card-pop@15.27@0.22                                          # "ترمي"
  card-pop@15.61@0.25 meme-undertale-yellow@15.63@0.22         # food shop card
  meme-vine-boom@16.8@0.32 meme-anime-wow@16.9@0.28            # legendary lizard reveal
  card-pop@16.93@0.2                                           # 🦎
  card-pop@17.7@0.25                                           # lizard collection card
  meme-taco-bell@18.5@0.25 card-pop@18.5@0.22                  # 16+
  meme-taco-bell@19.1@0.33 card-pop@19.1@0.25                  # map card reveal (outro)
  hook-alert@19.45@0.22                                        # callback circle on the map name
  card-pop@21.13@0.24 meme-correct@21.43@0.36                  # like & follow
  card-pop@21.91@0.22                                          # 👋 مع السلامة
)
bash $T/add-sfx.sh out/step1_voice.mp4 out/step2_sfx.mp4 "${SFX[@]}"
bash $T/add-music.sh out/step2_sfx.mp4 out/step3_music.mp4 0.11
# Final encode for TikTok: H.264 High@4.2, yuv420p TV range, BT.709 tagged, 30 fps CFR, 2 s GOP, AAC 48 kHz, faststart
ffmpeg -nostdin -loglevel error -y -i out/step3_music.mp4 \
  -vf "scale=1080:1920:flags=lanczos:in_range=auto:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 15 -maxrate 20M -bufsize 40M -profile:v high -level:v 4.2 -r 30 -g 60 -keyint_min 30 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -tag:v avc1 \
  -af "loudnorm=I=-10.4:TP=-1:LRA=7" -ar 48000 -ac 2 -c:a aac -b:a 256k -movflags +faststart out/feed-the-lizard.mp4
echo out/feed-the-lizard.mp4
