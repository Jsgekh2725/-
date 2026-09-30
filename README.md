# Saudi Nasheed Particle

A standalone GitHub Pages project for a Saudi national anthem particle animation.

## Important
The supplied MP4 is used only as the source for the extracted audio track. The original MP4/video is **not included** in this project and is never displayed by the site.

## Files
- `index.html` — page
- `style.css` — UI and visual styling
- `app.js` — particle engine, animation, audio sync, recorder
- `lyrics.js` — lyric timing data; edit these timestamps to fine-tune sync
- `nasheed-audio.mp3` — audio extracted from the supplied MP4

## GitHub Pages
Upload all files directly to the repository root. No folders are required. Then enable GitHub Pages from the repository's Pages settings and select the main branch/root folder.

## Controls
- تشغيل: starts the extracted audio and particle animation.
- إعادة: restarts the audio.
- تسجيل الفيديو: records the canvas animation plus the audio into a `.webm` file when supported by the browser.

## Note on timing
The included timestamps are a clean starting alignment for the supplied 27.87-second audio. For exact syllable-level alignment, adjust the `start` and `end` values in `lyrics.js` after listening to the exact source audio.
