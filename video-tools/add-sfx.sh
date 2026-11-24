#!/usr/bin/env bash
# Drop sound effects from assets/sfx onto a video at given times.
# Usage: add-sfx.sh in.mp4 out.mp4 name@seconds[@volume] ...
#   e.g. add-sfx.sh in.mp4 out.mp4 hook-alert@0 transition-swoosh@1.1 card-pop@4.25 card-pop@9.6
# volume defaults to the effect's suggested_volume in assets/sfx/sfx.json (original level).
set -euo pipefail
IN="$1"; OUT="$2"; shift 2
SFX="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/assets/sfx"
inputs=(-i "$IN"); filt=""; mix=""; n=1
has_audio=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN" | head -1)
for spec in "$@"; do
  IFS=@ read -r name t vol <<<"$spec"
  [ -f "$SFX/$name.wav" ] || { echo "unknown effect: $name (see $SFX)"; exit 1; }
  [ -n "${vol:-}" ] || vol=$(python3 -c "import json,sys;print(next(i['suggested_volume'] for i in json.load(open('$SFX/sfx.json'))['items'] if i['file']=='$name.wav'))")
  ms=$(awk "BEGIN{printf \"%d\", $t*1000}")
  inputs+=(-i "$SFX/$name.wav")
  filt+="[$n:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=$vol,adelay=${ms}|${ms}[s$n];"
  mix+="[s$n]"; n=$((n+1))
done
if [ -n "$has_audio" ]; then
  filt+="[0:a]aformat=sample_rates=44100:channel_layouts=stereo[base];[base]${mix}amix=inputs=$n:duration=first:normalize=0[a]"
else
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
  filt+="anullsrc=r=44100:cl=stereo:d=$D[base];[base]${mix}amix=inputs=$n:duration=first:normalize=0[a]"
fi
ffmpeg -nostdin -loglevel error -y "${inputs[@]}" -filter_complex "$filt" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$OUT"
echo "$OUT"
