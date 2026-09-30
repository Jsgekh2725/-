(() => {
  'use strict';
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha:false });
  const audio = document.getElementById('audio');
  const status = document.getElementById('status');
  const DESIGN_W = 720, DESIGN_H = 1280;
  const TAU = Math.PI * 2;
  let seed = 81237;
  let currentText = '';
  let currentIndex = -2;
  let particles = [];
  let transition = 1;
  let lastTime = performance.now();
  let recording = false;
  let recorder = null;
  let audioContext = null;
  let recordDestination = null;

  function rnd(){ seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function setStatus(s){ status.textContent=s; }

  function resizeParticlePool(){
    const count = 2400;
    particles = [];
    for(let i=0;i<count;i++){
      const a = rnd()*TAU;
      const radius = Math.sqrt(rnd())*58;
      const sx = DESIGN_W/2 + Math.cos(a)*radius;
      const sy = 500 + Math.sin(a)*radius*.22;
      particles.push({x:sx,y:sy,sx,sy,tx:sx,ty:sy,vx:0,vy:0,r:.7+rnd()*1.8,alpha:.25+rnd()*.75,phase:rnd()*TAU,ambient:rnd()});
    }
  }

  function makeTextPoints(text){
    const off=document.createElement('canvas'); off.width=DESIGN_W; off.height=280;
    const c=off.getContext('2d');
    c.clearRect(0,0,off.width,off.height);
    let size=72;
    if(text.length>21) size=56;
    else if(text.length>16) size=62;
    else if(text.length>11) size=68;
    c.font=`700 ${size}px Arial, "Noto Sans Arabic", sans-serif`;
    c.textAlign='center'; c.textBaseline='middle'; c.direction='rtl';
    c.fillStyle='#fff';
    c.fillText(text, DESIGN_W/2, 100);
    const data=c.getImageData(0,0,DESIGN_W,250).data;
    const raw=[];
    for(let y=0;y<250;y+=3){
      for(let x=0;x<DESIGN_W;x+=3){
        if(data[(y*DESIGN_W+x)*4+3]>90) raw.push({x,y:y+120});
      }
    }
    const max=1750;
    const step=Math.max(1,Math.ceil(raw.length/max));
    const points=[];
    for(let i=0;i<raw.length;i+=step) points.push(raw[i]);
    return points;
  }

  function setTarget(text, immediate=false){
    currentText=text;
    const pts=makeTextPoints(text);
    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      const q=pts[i%pts.length];
      const spread=i>=pts.length ? (i/particles.length) : 0;
      p.sx = immediate ? q.x : (DESIGN_W/2 + (rnd()-.5)*110);
      p.sy = immediate ? q.y : (235 + (rnd()-.5)*55);
      if(!immediate){
        const a=rnd()*TAU, rr=18+Math.sqrt(rnd())*105;
        p.sx=DESIGN_W/2+Math.cos(a)*rr;
        p.sy=255+Math.sin(a)*rr*.25;
      }
      p.x=p.sx; p.y=p.sy;
      if(spread>0){
        const a=rnd()*TAU, rr=70+Math.sqrt(rnd())*250;
        p.tx=DESIGN_W/2+Math.cos(a)*rr;
        p.ty=255+Math.sin(a)*rr*.25;
      }else{p.tx=q.x; p.ty=q.y;}
    }
    transition=immediate?1:0;
  }

  function drawCode(){
    const top=390;
    ctx.fillStyle='rgba(0,8,4,.98)'; ctx.fillRect(0,top,DESIGN_W,DESIGN_H-top);
    ctx.fillStyle='rgba(66,230,149,.025)';
    for(let y=top;y<DESIGN_H;y+=34) ctx.fillRect(0,y,DESIGN_W,1);
    const lines=[
      ['from dataclasses import dataclass','#7f75ff'],
      ['','#42e695'],
      ['PARTICLE_COLOR = "#42E695"','#42e695'],
      ['saudi_identity = {','#42e695'],
      ['  "generosity": "رمزاً للكرم",','#c8f8d7'],
      ['  "authenticity": "رمزاً للأصالة",','#c8f8d7'],
      ['  "giving": "رمزاً للعطاء",','#c8f8d7'],
      ['  "vision": "رؤية للمستقبل",','#c8f8d7'],
      ['  "courage": "رمزاً للشجاعة",','#c8f8d7'],
      ['  "ambition": "طموحاً وطنياً"','#c8f8d7'],
      ['}','#42e695'],
      ['','#42e695'],
      ['@dataclass','#b36cff'],
      ['class Scene:','#b36cff'],
      ['  shape: str','#c8f8d7'],
      ['  start: float','#c8f8d7'],
      ['  end: float','#c8f8d7'],
      ['','#42e695'],
      ['def smooth_transition(t):','#7f75ff']
    ];
    ctx.font='15px monospace'; ctx.textAlign='left'; ctx.direction='ltr';
    let y=690;
    for(const [txt,col] of lines){ctx.fillStyle=col;ctx.fillText(txt,32,y);y+=28;if(y>1245)break;}
  }

  function drawPlatform(time){
    const x=DESIGN_W/2, y=255;
    const g=ctx.createRadialGradient(x,y,0,x,y,145);
    g.addColorStop(0,'rgba(66,230,149,.15)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(x-160,y-80,x*0+320,160);
    ctx.save(); ctx.translate(x,y); ctx.scale(1,.22);
    const eg=ctx.createRadialGradient(0,0,4,0,0,100);
    eg.addColorStop(0,'rgba(66,230,149,.55)'); eg.addColorStop(.4,'rgba(22,155,83,.34)'); eg.addColorStop(1,'rgba(0,30,15,0)');
    ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(0,0,105,0,TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle='rgba(66,230,149,.13)'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(x,y,105,23,0,0,TAU); ctx.stroke();
  }

  function drawMap(){
    const pts=[]; const cx=360, cy=270, sx=165, sy=105;
    for(let i=0;i<250;i++){
      const a=i/250*TAU;
      const rr=1 + .12*Math.sin(i*3.1);
      pts.push({x:cx+Math.cos(a)*sx*rr,y:cy+Math.sin(a)*sy*rr});
    }
    ctx.strokeStyle='rgba(66,230,149,.13)'; ctx.lineWidth=1;
    ctx.beginPath();
    for(let i=0;i<pts.length;i++){const p=pts[i]; if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}
    ctx.closePath(); ctx.stroke();
  }

  function draw(now){
    const dt=Math.min(.05,(now-lastTime)/1000); lastTime=now;
    ctx.fillStyle='#020805'; ctx.fillRect(0,0,DESIGN_W,DESIGN_H);
    const glow=ctx.createRadialGradient(360,320,0,360,320,430); glow.addColorStop(0,'rgba(0,120,55,.10)'); glow.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=glow;ctx.fillRect(0,0,DESIGN_W,650);
    const t=audio.currentTime||0;
    const i= t<window.INTRO_END ? -1 : t>=window.END_START ? window.LYRICS.length : window.LYRICS.findIndex(v=>t>=v.start&&t<v.end);
    if(i!==currentIndex){
      currentIndex=i;
      if(i===-1)setTarget('النشيد الوطني السعودي');
      else if(i>=0&&i<window.LYRICS.length)setTarget(window.LYRICS[i].text);
      else setTarget('مشروع الطالب راكان بن سعد القحطاني');
    }
    const transitionSpeed=1.7;
    transition=Math.min(1,transition+dt*transitionSpeed);
    const ease=transition<.5?2*transition*transition:1-Math.pow(-2*transition+2,2)/2;
    drawPlatform(now);
    if(i===window.LYRICS.length) drawMap();
    for(const p of particles){
      const idleX=Math.sin(now*.0011+p.phase)*(.6+p.ambient*1.8);
      const idleY=Math.cos(now*.0014+p.phase)*(.35+p.ambient);
      p.x += (p.sx+(p.tx-p.sx)*ease-p.x)*Math.min(1,dt*8)+idleX*dt*5;
      p.y += (p.sy+(p.ty-p.sy)*ease-p.y)*Math.min(1,dt*8)+idleY*dt*5;
      const pulse=.75+.25*Math.sin(now*.004+p.phase);
      ctx.fillStyle=`rgba(66,230,149,${p.alpha*pulse})`;
      ctx.shadowColor='#42e695';ctx.shadowBlur=5;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();
    }
    ctx.shadowBlur=0;
    if(i===window.LYRICS.length){
      ctx.fillStyle='rgba(66,230,149,.7)';ctx.font='12px monospace';ctx.textAlign='center';ctx.direction='ltr';ctx.fillText('SAUDI NATIONAL ANTHEM // FINAL',360,375);
    }
    drawCode();
    requestAnimationFrame(draw);
  }

  function chooseMime(){
    if(!window.MediaRecorder)return '';
    return ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x))||'';
  }
  async function prepareAudio(){
    if(audioContext)return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC||!audio.captureStream)return;
    audioContext=new AC();
    const src=audioContext.createMediaElementSource(audio);
    recordDestination=audioContext.createMediaStreamDestination();
    src.connect(recordDestination); src.connect(audioContext.destination);
  }
  async function record(){
    if(recording)return;
    const mime=chooseMime();
    if(!mime){alert('استخدم Chrome أو Edge لتسجيل الفيديو.');return}
    await prepareAudio();
    if(audioContext?.state==='suspended')await audioContext.resume();
    const stream=canvas.captureStream(60);
    if(recordDestination)recordDestination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
    const chunks=[]; recorder=new MediaRecorder(stream,{mimeType: mime,videoBitsPerSecond:9000000}); recording=true; document.getElementById('record').disabled=true; setStatus('جاري التسجيل');
    recorder.ondataavailable=e=>e.data.size&&chunks.push(e.data);
    recorder.onstop=()=>{const blob=new Blob(chunks,{type:mime});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='saudi-national-anthem-particles.webm';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);recording=false;document.getElementById('record').disabled=false;setStatus('تم الحفظ')};
    audio.currentTime=0; recorder.start(200); await audio.play();
    audio.onended=()=>{if(recorder?.state!=='inactive')recorder.stop();audio.onended=null};
  }

  document.getElementById('play').onclick=async()=>{try{await audio.play();setStatus('تشغيل')}catch(e){setStatus('اضغط تشغيل مرة أخرى')}};
  document.getElementById('pause').onclick=()=>{audio.pause();setStatus('متوقف')};
  document.getElementById('restart').onclick=()=>{audio.pause();audio.currentTime=0;currentIndex=-2;audio.play().then(()=>setStatus('تشغيل')).catch(()=>{})};
  document.getElementById('volume').oninput=e=>audio.volume=+e.target.value;
  document.getElementById('record').onclick=record;
  audio.onloadedmetadata=()=>setStatus('جاهز');
  audio.onerror=()=>setStatus('خطأ في الصوت');
  resizeParticlePool();
  setTarget('النشيد الوطني السعودي',true);
  requestAnimationFrame(draw);
})();
