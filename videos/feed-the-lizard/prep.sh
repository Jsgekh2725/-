#!/usr/bin/env bash
# Rebuild the vertical gameplay clips (public/g1..g6.mp4) from the original landscape recordings.
set -euo pipefail; cd "$(dirname "$0")"
for i in 1 2 3 4 5 6; do
  ffmpeg -nostdin -loglevel error -y -i source/g$i.mp4 -an \
    -vf "crop=456:810:312:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.8:5:5:0.0,fps=30,format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 18 -g 15 public/g$i.mp4
done
