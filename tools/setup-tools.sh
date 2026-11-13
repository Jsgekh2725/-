#!/bin/bash
# Installs the video/audio toolchain: FFmpeg (expected preinstalled), yt-dlp, PySceneDetect, Auto-Editor,
# Whisper (openai-whisper CLI + sherpa-onnx runtime), Real-ESRGAN, Remotion and HyperFrames.
# Usage: tools/setup-tools.sh [--models]   (--models also downloads Whisper large-v3 and Real-ESRGAN weights)
set -e
UV=${UV:-$(command -v uv || echo /root/.local/bin/uv)}
command -v ffmpeg >/dev/null || { echo "ffmpeg is missing: apt-get install -y ffmpeg"; exit 1; }

$UV tool install --force yt-dlp
$UV tool install --force scenedetect --with opencv-python-headless
$UV tool install --force auto-editor

# One Python env for the torch-based tools.
VENV=/opt/vtools
[ -x $VENV/bin/python ] || $UV venv --python 3.12 $VENV
$UV pip install --python $VENV/bin/python torch torchvision openai-whisper sherpa-onnx soundfile numpy realesrgan
# basicsr (Real-ESRGAN dependency) imports a module newer torchvision removed.
sed -i 's/from torchvision.transforms.functional_tensor import rgb_to_grayscale/from torchvision.transforms.functional import rgb_to_grayscale/' \
  $VENV/lib/python3.12/site-packages/basicsr/data/degradations.py
ln -sf $VENV/bin/whisper /usr/local/bin/whisper

# Remotion + HyperFrames CLIs.
mkdir -p /opt/video-tools && cd /opt/video-tools
[ -f package.json ] || npm init -y >/dev/null
npm install --no-audit --no-fund remotion @remotion/cli @remotion/bundler @remotion/renderer react react-dom hyperframes
ln -sf /opt/video-tools/node_modules/.bin/remotion /opt/video-tools/node_modules/.bin/hyperframes /usr/local/bin/

if [ "$1" = "--models" ]; then
  M=/opt/models; mkdir -p $M && cd $M
  REL=https://github.com/xinntao/Real-ESRGAN/releases/download
  [ -f realesr-general-x4v3.pth ] || curl -fsSL --retry 3 -o realesr-general-x4v3.pth $REL/v0.2.5.0/realesr-general-x4v3.pth
  [ -f RealESRGAN_x4plus.pth ] || curl -fsSL --retry 3 -o RealESRGAN_x4plus.pth $REL/v0.1.0/RealESRGAN_x4plus.pth
  if [ ! -d sherpa-onnx-whisper-large-v3 ]; then
    curl -fsSL --retry 3 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-large-v3.tar.bz2 | tar xj
  fi
fi
echo "setup-tools: done"
