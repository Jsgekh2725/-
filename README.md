# Saudi National Anthem — Particle Project

مشروع Web جاهز للعمل على GitHub Pages، مستوحى من أسلوب الفيديو المرجعي: خلفية داكنة، جسيمات خضراء مضيئة، نص عربي متزامن مع الصوت، وشاشة ختامية باسم الطالب.

## التشغيل

1. افتح `index.html` محليًا أو ارفعه إلى GitHub.
2. ضع تسجيل النشيد الذي تريد استخدامه في `audio/` وغيّر قيمة `src` في `index.html` إذا لزم.
3. عدّل التوقيتات في `lyrics.js` لتطابق التسجيل حرفيًا.
4. على GitHub Pages سيعمل المشروع مباشرة بعد تفعيل Pages.

## التسجيل

زر `تسجيل الفيديو` يسجل Canvas + الصوت ويخرج ملف WebM. يمكن تحويله إلى MP4 باستخدام FFmpeg:

```bash
ffmpeg -i saudi-national-anthem-project.webm -c:v libx264 -c:a aac -movflags +faststart saudi-national-anthem-project.mp4
```

## الملفات

- `index.html` — الواجهة والمشاهد والصوت.
- `style.css` — التصميم والمؤثرات.
- `app.js` — الجسيمات، التزامن، التشغيل والتسجيل.
- `lyrics.js` — كلمات النشيد والتوقيتات.
- `reference-audio.mp3` — الصوت المستخرج من الفيديو المرجعي المرفق.
- `reference-video.mp4` — الفيديو المرجعي المرفق.

> ملاحظة: ملف `reference-audio.mp3` موجود كمرجع من الملف المرفق. إذا كان هدفك استخدام تسجيل النشيد الوطني السعودي نفسه، استبدله بملف التسجيل المطلوب ثم اضبط `lyrics.js` على توقيته.
