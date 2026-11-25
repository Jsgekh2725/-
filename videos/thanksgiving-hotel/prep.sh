#!/usr/bin/env bash
# Rebuild public/gameplay.mp4 (vertical 1080x1920 crop) from the original landscape gameplay.
set -euo pipefail; cd "$(dirname "$0")"
ffmpeg -nostdin -loglevel error -y -t 58.5 -i source/gameplay-original.mp4 -an \
  -vf "crop=456:810:312:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.8:5:5:0.0,fps=30,format=yuv420p" \
  -c:v libx264 -preset medium -crf 18 -g 15 public/gameplay.mp4
