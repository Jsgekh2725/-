const canvas=document.getElementById('scene');
const ctx=canvas.getContext('2d',{alpha:false});
const audio=document.getElementById('audio');
const playBtn=document.getElementById('playBtn');
const restartBtn=document.getElementById('restartBtn');
const recordBtn=document.getElementById('recordBtn');
const progressBar=document.getElementById('progressBar');
const timeNow=document.getElementById('timeNow');
const timeTotal=document.getElementById('timeTotal');
let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2);
let particles=[],ambient=[],activeIndex=-1,lastFrame=performance.now();
let transitionStart=0,transitionDuration=.82,currentText='',nextPoints=[];
let recording=false,recorder=null,chunks=[],audioCtx=null,sourceNode=null,recordDest=null;
const green={r:49,g:245,b:141};
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const easeOutCubic=t=>1-Math.pow(1-t,3);
const easeInOut=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);buildAmbient();if(currentText)setTarget(currentText,true)}
function buildAmbient(){ambient=[];const n=Math.floor(clamp(W*H/21000,220,650));for(let i=0;i<n;i++)ambient.push({x:Math.random()*W,y:Math.random()*H,r:rand(.35,1.15),a:rand(.035,.13),p:Math.random()*6.28,s:rand(.12,.45)});}
function fontForText(text){const length=[...text].length;return clamp(Math.min(W*.115,720/Math.max(1,length*.72)),28,76)}
function sampleText(text){
 const off=document.createElement('canvas');
 const o=off.getContext('2d');
 const maxW=Math.min(W*.72,920);
 const fontSize=fontForText(text);
 off.width=Math.ceil(maxW);off.height=Math.ceil(fontSize*1.55);
 o.clearRect(0,0,off.width,off.height);o.direction='rtl';o.textAlign='center';o.textBaseline='middle';
 o.font=`700 ${fontSize}px Tahoma,Arial,sans-serif`;o.fillStyle='#fff';
 o.fillText(text,off.width/2,off.height/2,maxW*.96);
 const data=o.getImageData(0,0,off.width,off.height).data;
 const step=Math.max(2,Math.round(fontSize/20));const pts=[];
 for(let y=0;y<off.height;y+=step)for(let x=0;x<off.width;x+=step)if(data[(y*off.width+x)*4+3]>100)pts.push({x:x-off.width/2,y:y-off.height/2});
 return pts;
}
function makeParticle(){return{x:W/2+rand(-W*.08,W*.08),y:H*.48+rand(-H*.04,H*.04),tx:W/2,ty:H/2,r:rand(.62,1.35),a:rand(.58,.95),seed:Math.random()*10,delay:Math.random()*.18}}
function ensureParticles(n){while(particles.length<n)particles.push(makeParticle())}
function setTarget(text,instant=false){
 currentText=text;
 const pts=sampleText(text);ensureParticles(Math.max(pts.length+250,1700));
 const baseY=H*.40;
 for(let i=0;i<particles.length;i++){
  const p=particles[i];
  if(i<pts.length){const q=pts[i];p.tx=W/2+q.x;p.ty=baseY+q.y;p.r=rand(.72,1.45);p.a=rand(.62,.98)}
  else{const a=Math.random()*Math.PI*2,d=rand(70,Math.max(W,H)*.46);p.tx=W/2+Math.cos(a)*d;p.ty=baseY+Math.sin(a)*d*.42;p.r=rand(.45,1.05);p.a=rand(.12,.35)}
  if(instant){p.x=p.tx;p.y=p.ty}else{p.delay=Math.random()*.16}
 }
 transitionStart=performance.now();transitionDuration=instant?.01:.82;nextPoints=pts;
}
function drawBackground(t){
 ctx.fillStyle='#020605';ctx.fillRect(0,0,W,H);
 const g=ctx.createRadialGradient(W*.5,H*.40,0,W*.5,H*.40,Math.max(W,H)*.72);
 g.addColorStop(0,'rgba(13,93,56,.16)');g.addColorStop(.45,'rgba(5,37,24,.07)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.save();ctx.globalAlpha=.055;ctx.strokeStyle='#31f58d';ctx.lineWidth=1;
 const gap=Math.max(34,Math.min(62,W/15));
 for(let x=(W%gap)/2;x<W;x+=gap){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
 for(let y=(H%gap)/2;y<H;y+=gap){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 ctx.restore();
 ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle='rgba(49,245,141,.28)';ctx.lineWidth=1;
 const y=H*.73;ctx.beginPath();ctx.moveTo(W*.12,y);ctx.lineTo(W*.34,y);ctx.lineTo(W*.39,y-18);ctx.lineTo(W*.61,y-18);ctx.lineTo(W*.66,y);ctx.lineTo(W*.88,y);ctx.stroke();
 ctx.restore();
}
function drawAmbient(t){for(const a of ambient){const y=a.y+Math.sin(t*a.s+a.p)*3;ctx.fillStyle=`rgba(49,245,141,${a.a})`;ctx.beginPath();ctx.arc(a.x,y,a.r,0,Math.PI*2);ctx.fill()}}
function drawHeader(){
 ctx.save();ctx.textAlign='center';ctx.direction='rtl';
 ctx.font=`700 ${clamp(W/38,15,25)}px Tahoma,Arial,sans-serif`;ctx.fillStyle='rgba(229,255,240,.82)';ctx.shadowBlur=18;ctx.shadowColor='rgba(49,245,141,.24)';ctx.fillText('النشيد الوطني السعودي',W/2,H*.085);
 ctx.shadowBlur=0;ctx.font=`500 ${clamp(W/70,9,13)}px Tahoma,Arial,sans-serif`;ctx.fillStyle='rgba(115,246,170,.35)';ctx.fillText('سارعي للمجد والعلياء',W/2,H*.122);ctx.restore();
}
function drawOrb(){const x=W/2,y=H*.625;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(x,y,Math.min(W*.17,175)*(1+i*.17),5+i*1.6,0,0,Math.PI*2);ctx.strokeStyle=`rgba(49,245,141,${.055-i*.008})`;ctx.shadowBlur=20;ctx.shadowColor='#31f58d';ctx.stroke()}ctx.restore()}
function drawParticles(now,dt){
 const raw=clamp((now-transitionStart)/1000/transitionDuration,0,1);
 const global=easeOutCubic(raw);
 for(const p of particles){
  const local=clamp((raw-p.delay)/Math.max(.001,1-p.delay),0,1);const e=easeOutCubic(local);
  p.x=lerp(p.x,p.tx,e);p.y=lerp(p.y,p.ty,e);
  const glow=local>0.92?1:.72;
  ctx.fillStyle=`rgba(${green.r},${green.g},${green.b},${p.a*glow})`;
  ctx.shadowBlur=local>.65?5:2;ctx.shadowColor='rgba(49,245,141,.48)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
 }
 ctx.shadowBlur=0;
 if(global<1){ctx.save();ctx.globalAlpha=(1-global)*.18;ctx.strokeStyle='#31f58d';ctx.beginPath();ctx.arc(W/2,H*.40,45+global*90,0,Math.PI*2);ctx.stroke();ctx.restore()}
}
function activeLyric(t){for(let i=0;i<LYRICS.length;i++)if(t>=LYRICS[i].start&&t<LYRICS[i].end)return i;return -1}
function render(ms){const dt=Math.min(.033,(ms-lastFrame)/1000);lastFrame=ms;const t=ms/1000;drawBackground(t);drawAmbient(t);drawHeader();drawParticles(ms,dt);drawOrb();if(audio.duration){progressBar.style.width=`${audio.currentTime/audio.duration*100}%`;timeNow.textContent=fmt(audio.currentTime);timeTotal.textContent=fmt(audio.duration)}requestAnimationFrame(render)}
async function startPlayback(){try{if(audioCtx&&audioCtx.state==='suspended')await audioCtx.resume();await audio.play();playBtn.textContent='إيقاف'}catch(e){playBtn.textContent='تشغيل'}}
playBtn.onclick=()=>audio.paused?startPlayback():(audio.pause(),playBtn.textContent='تشغيل');
restartBtn.onclick=()=>{audio.currentTime=0;activeIndex=-1;setTarget(LYRICS[0].text,true);startPlayback()};
audio.addEventListener('loadedmetadata',()=>timeTotal.textContent=fmt(audio.duration));
audio.addEventListener('pause',()=>{if(!recording)playBtn.textContent='تشغيل'});
audio.addEventListener('ended',()=>{playBtn.textContent='تشغيل';setTarget('مشروع الطالب راكان بن سعد القحطاني');});
audio.addEventListener('timeupdate',()=>{const i=activeLyric(audio.currentTime);if(i!==activeIndex){activeIndex=i;if(i>=0)setTarget(LYRICS[i].text)}});
function initAudioGraph(){if(audioCtx)return;audioCtx=new AudioContext();sourceNode=audioCtx.createMediaElementSource(audio);recordDest=audioCtx.createMediaStreamDestination();sourceNode.connect(audioCtx.destination);sourceNode.connect(recordDest)}
recordBtn.onclick=async()=>{if(recording){recorder.stop();recording=false;recordBtn.textContent='تسجيل الفيديو';return}initAudioGraph();if(audioCtx.state==='suspended')await audioCtx.resume();const stream=canvas.captureStream(60);recordDest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));const types=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];const mime=types.find(MediaRecorder.isTypeSupported.bind(MediaRecorder));if(!mime){alert('المتصفح لا يدعم تسجيل الفيديو من هذه الصفحة.');return}chunks=[];recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:9000000});recorder.ondataavailable=e=>e.data.size&&chunks.push(e.data);recorder.onstop=()=>{const blob=new Blob(chunks,{type:mime});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='saudi-nasheed-particle.webm';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};recording=true;recordBtn.textContent='إيقاف التسجيل';audio.currentTime=0;setTarget(LYRICS[0].text,true);startPlayback()};
canvas.addEventListener('click',()=>{if(audio.paused)startPlayback()});
addEventListener('resize',resize);resize();ensureParticles(2000);setTarget(LYRICS[0].text,true);requestAnimationFrame(render);
