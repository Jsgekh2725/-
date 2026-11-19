#!/usr/bin/env bash
# Put the default background music under a video.
# Usage: add-music.sh input.mp4 output.mp4 [music_volume=0.25]
#  - music is looped/trimmed to the video length, with 1s fade-in and 2s fade-out
#  - if the video has its own audio (voice), the music is mixed under it at music_volume
#  - if the video is silent, the music plays at full level
set -euo pipefail
IN="$1"; OUT="$2"; VOL="${3:-0.25}"
MUSIC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/assets/music/background-music.m4a"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
FO=$(awk "BEGIN{print ($D>3)?$D-2:0}")
FADE="afade=t=in:d=1,afade=t=out:st=$FO:d=2"
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN" | grep -q .; then
  ffmpeg -loglevel error -y -i "$IN" -stream_loop -1 -i "$MUSIC" -filter_complex \
    "[1:a]atrim=0:$D,volume=$VOL,$FADE[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$OUT"
else
  ffmpeg -loglevel error -y -i "$IN" -stream_loop -1 -i "$MUSIC" -filter_complex \
    "[1:a]atrim=0:$D,$FADE[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$OUT"
fi
echo "$OUT"
