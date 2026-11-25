#!/usr/bin/env bash
# Rebuild the vertical gameplay files and the live balance card from the original recordings.
set -euo pipefail; cd "$(dirname "$0")"
V="crop=456:810:312:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.8:5:5:0.0,fps=30,format=yuv420p"
ffmpeg -nostdin -loglevel error -y -t 58.5 -i source/gameplay-original.mp4 -an -vf "$V" -c:v libx264 -preset medium -crf 18 -g 15 public/gameplay.mp4
ffmpeg -nostdin -loglevel error -y -i source/gameplay2-original.mp4 -an -vf "$V" -c:v libx264 -preset medium -crf 18 -g 15 public/gameplay2.mp4
ffmpeg -nostdin -loglevel error -y -ss 17.9 -t 1.6 -i source/gameplay2-original.mp4 -an \
  -vf "crop=212:120:855:9,scale=742:420:flags=lanczos,unsharp=5:5:0.6,fps=30,format=yuv420p" -c:v libx264 -crf 16 public/card_money.mp4
