#!/usr/bin/env bash
# Installs the video toolchain: FFmpeg, yt-dlp, PySceneDetect, Auto-Editor,
# Whisper (openai-whisper + faster-whisper), Real-ESRGAN (ncnn-vulkan, CPU via
# lavapipe), Remotion and HyperFrames. Idempotent; safe to re-run.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export DEBIAN_FRONTEND=noninteractive
apt-get update -q || true
apt-get install -y -q ffmpeg unzip mesa-vulkan-drivers vulkan-tools libvulkan1 libgomp1

pip install -q -U yt-dlp scenedetect opencv-python-headless auto-editor openai-whisper faster-whisper "audio-separator[cpu]" audioread standard-aifc standard-sunau

npm install -g -q hyperframes@0.9.70 @remotion/cli@4.0.545

if [ ! -x /opt/realesrgan/realesrgan-ncnn-vulkan ]; then
  tmp="$(mktemp -d)"
  curl -fsSL -o "$tmp/re.zip" https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-ubuntu.zip
  unzip -qo "$tmp/re.zip" -d /opt/realesrgan
  chmod +x /opt/realesrgan/realesrgan-ncnn-vulkan
  rm -rf "$tmp"
fi
ln -sf /opt/realesrgan/realesrgan-ncnn-vulkan /usr/local/bin/realesrgan-ncnn-vulkan

(cd "$HERE/remotion-test" && npm install --no-audit --no-fund -q)
echo "video tools installed"
