(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const canvas = $('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const audio = $('audio');
  const intro = $('intro');
  const lyrics = $('lyrics');
  const end = $('end');
  const lyricText = $('lyricText');
  const lyricIndex = $('lyricIndex');
  const statusEl = $('status');
  const statusDot = $('statusDot');
  const particles = [];
  let W = 0, H = 0, dpr = 1, seed = 1337, targetText = '';
  let recording = false;
  let mediaRecorder = null;
  let audioContext = null;
  let audioSource = null;

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function setStatus(text, ok = true) {
    statusEl.textContent = text;
    statusDot.classList.toggle('bad', !ok);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeParticles();
  }

  function makeParticles() {
    particles.length = 0;
    const count = Math.min(1700, Math.max(700, Math.floor((W * H) / 1200)));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: random() * W,
        y: random() * H,
        vx: (random() - .5) * .32,
        vy: (random() - .5) * .32,
        r: .45 + random() * 1.65,
        a: .15 + random() * .8,
        pulse: random() * Math.PI * 2
      });
    }
  }

  function draw(time) {
    ctx.fillStyle = '#020503';
    ctx.fillRect(0, 0, W, H);
    const dt = Math.min(32, time - (draw.last || time));
    draw.last = time;
    const centerGlow = ctx.createRadialGradient(W * .5, H * .48, 0, W * .5, H * .48, Math.max(W, H) * .62);
    centerGlow.addColorStop(0, 'rgba(0,100,48,.13)');
    centerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, W, H);
    ctx.shadowColor = '#42e695';
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;
      const alpha = p.a * (.72 + .28 * Math.sin(time * .0018 + p.pulse));
      ctx.fillStyle = `rgba(66,230,149,${alpha})`;
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  function setScene(scene) {
    [intro, lyrics, end].forEach(x => x.classList.remove('active'));
    scene.classList.add('active');
  }

  function updateScene(t) {
    if (t < window.INTRO_END) {
      setScene(intro);
      setStatus('مقدمة');
      return;
    }
    if (t >= window.END_START) {
      setScene(end);
      setStatus('النهاية');
      return;
    }
    setScene(lyrics);
    const i = window.LYRICS.findIndex(item => t >= item.start && t < item.end);
    if (i === -1) return;
    const item = window.LYRICS[i];
    if (targetText !== item.text) {
      targetText = item.text;
      lyricText.textContent = item.text;
      lyricText.animate([
        { opacity: 0, filter: 'blur(10px)', transform: 'scale(.96)' },
        { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' }
      ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    lyricIndex.textContent = String(i + 1).padStart(2, '0') + ' / ' + window.LYRICS.length;
    setStatus('متزامن ' + item.start.toFixed(2) + 's');
  }

  function loop() {
    updateScene(audio.currentTime || 0);
    requestAnimationFrame(loop);
  }

  async function playAudio() {
    try {
      await audio.play();
      setStatus('تشغيل');
    } catch (error) {
      setStatus('تعذر التشغيل — اضغط تشغيل مرة أخرى', false);
      console.error(error);
    }
  }

  function restart() {
    audio.pause();
    audio.currentTime = 0;
    targetText = '';
    playAudio();
  }

  function chooseMimeType() {
    if (!window.MediaRecorder) return '';
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
  }

  async function prepareAudioGraph() {
    if (audioContext) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx || !audio.captureStream) return;
    audioContext = new AudioCtx();
    audioSource = audioContext.createMediaElementSource(audio);
    const destination = audioContext.createMediaStreamDestination();
    audioSource.connect(destination);
    audioSource.connect(audioContext.destination);
    audio._recordDestination = destination;
  }

  async function record() {
    if (recording) return;
    const mimeType = chooseMimeType();
    if (!mimeType) {
      alert('المتصفح الحالي لا يدعم تسجيل الفيديو من الصفحة. استخدم Chrome أو Edge على الكمبيوتر.');
      return;
    }
    if (!canvas.captureStream) {
      alert('المتصفح لا يدعم تسجيل Canvas.');
      return;
    }

    recording = true;
    $('record').disabled = true;
    setStatus('جاري التسجيل');
    try {
      await prepareAudioGraph();
      const stream = canvas.captureStream(60);
      if (audio._recordDestination) {
        audio._recordDestination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      } else {
        alert('تعذر ربط الصوت بالتسجيل في هذا المتصفح. سيستمر الفيديو بدون تسجيل.');
      }
      const chunks = [];
      mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = event => {
        if (event.data && event.data.size) chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `saudi-national-anthem-project.${extension}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        recording = false;
        $('record').disabled = false;
        setStatus('تم الحفظ');
      };
      audio.currentTime = 0;
      targetText = '';
      if (audioContext && audioContext.state === 'suspended') await audioContext.resume();
      mediaRecorder.start(250);
      await audio.play();
      audio.onended = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        audio.onended = null;
      };
    } catch (error) {
      console.error(error);
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      recording = false;
      $('record').disabled = false;
      setStatus('فشل التسجيل', false);
      alert('حدث خطأ أثناء التسجيل. الفيديو نفسه يعمل، ويمكن تشغيله وتصديره بأداة تسجيل الشاشة.');
    }
  }

  $('play').addEventListener('click', playAudio);
  $('pause').addEventListener('click', () => { audio.pause(); setStatus('متوقف'); });
  $('restart').addEventListener('click', restart);
  $('volume').addEventListener('input', event => { audio.volume = Number(event.target.value); });
  $('record').addEventListener('click', record);
  audio.addEventListener('loadeddata', () => setStatus('جاهز'));
  audio.addEventListener('error', () => setStatus('ملف الصوت غير متاح', false));
  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(draw);
  requestAnimationFrame(loop);
})();
