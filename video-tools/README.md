# Video tools

| Tool | Command |
|---|---|
| FFmpeg | `ffmpeg` |
| yt-dlp | `yt-dlp <url>` |
| PySceneDetect | `scenedetect -i in.mp4 detect-content list-scenes` |
| Auto-Editor | `auto-editor in.mp4 -o out.mp4` (removes silence) |
| Whisper | `whisper audio.mp3 --model small --language ar` or `faster-whisper` from Python |
| Real-ESRGAN | `realesrgan-ncnn-vulkan -i in.png -o out.png -n realesrgan-x4plus -m /opt/realesrgan/models` |
| Remotion | `cd remotion-test && npx remotion render src/index.ts Hello out/hello.mp4` |
| HyperFrames | `cd hyperframes-test && hyperframes render -o out/test.mp4` |
| Agent skills | `.claude/skills/` (Remotion + HyperFrames skills for Claude Code) |

- `bash video-tools/setup.sh` — install everything (run as root; idempotent)
- `bash video-tools/verify.sh` — run a real job through each tool and print PASS/FAIL
- `bash video-tools/add-music.sh in.mp4 out.mp4` — add the default background music (`assets/music/background-music.m4a`)

Whisper downloads its model on first use from `openaipublic.azureedge.net` (or `huggingface.co`
for faster-whisper); YouTube downloads need `youtube.com` and `*.googlevideo.com`. In a cloud
session with limited network access those hosts must be allowed.
Remotion in the cloud container uses the pre-installed headless shell via `--browser-executable`.
