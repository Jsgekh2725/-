const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const audio=document.getElementById('audio');
const intro=document.getElementById('intro');
const lyrics=document.getElementById('lyrics');
const end=document.getElementById('end');
const lyricText=document.getElementById('lyricText');
const lyricIndex=document.getElementById('lyricIndex');
const statusEl=document.getElementById('status');
const particles=[];
let W=innerWidth,H=innerHeight,last=performance.now(),activeText='',targetText='';
let seed=1337;
function resize(){W=canvas.width=innerWidth*devicePixelRatio;H=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);W=innerWidth;H=innerHeight;makeParticles();}
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function makeParticles(){particles.length=0;for(let i=0;i<1500;i++){particles.push({x:rnd()*W,y:H*.25+rnd()*H*.5,vx:(rnd()-.5)*.35,vy:(rnd()-.5)*.35,r:.4+rnd()*1.7,a:.15+rnd()*.8});}}
function draw(now){const dt=Math.min(32,now-last);last=now;ctx.clearRect(0,0,W,H);const glow=ctx.createRadialGradient(W*.5,H*.48,10,W*.5,H*.48,W*.5);glow.addColorStop(0,'rgba(0,90,45,.12)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;ctx.fillStyle=`rgba(66,230,149,${p.a})`;ctx.shadowBlur=10;ctx.shadowColor='#42e695';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;requestAnimationFrame(draw)}
function setScene(which){[intro,lyrics,end].forEach(x=>x.classList.remove('active'));which.classList.add('active')}
function update(t){if(t<INTRO_END){setScene(intro);statusEl.textContent='INTRO';return}if(t>=END_START){setScene(end);statusEl.textContent='FINAL';return}setScene(lyrics);let i=LYRICS.findIndex(x=>t>=x.start&&t<x.end);if(i<0)return;let item=LYRICS[i];if(targetText!==item.text){targetText=item.text;lyricText.animate([{opacity:0,filter:'blur(8px)',transform:'scale(.97)'},{opacity:1,filter:'blur(0)',transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});lyricText.textContent=item.text;}lyricIndex.textContent=String(i+1).padStart(2,'0')+' / '+LYRICS.length;statusEl.textContent='SYNC '+item.start.toFixed(2)+'s'}
function tick(){update(audio.currentTime);requestAnimationFrame(tick)}
document.getElementById('play').onclick=()=>audio.play();document.getElementById('pause').onclick=()=>audio.pause();document.getElementById('restart').onclick=()=>{audio.currentTime=0;audio.play()};document.getElementById('volume').oninput=e=>audio.volume=+e.target.value;
async function record(){if(!canvas.captureStream||!window.MediaRecorder){alert('المتصفح لا يدعم تسجيل الفيديو هنا.');return}const stream=canvas.captureStream(60);const ac=new AudioContext();const src=ac.createMediaElementSource(audio);const dest=ac.createMediaStreamDestination();src.connect(dest);src.connect(ac.destination);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));const chunks=[];const rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9,opus'});rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);rec.onstop=()=>{const blob=new Blob(chunks,{type:'video/webm'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='saudi-national-anthem-project.webm';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};audio.currentTime=0;await ac.resume();rec.start();audio.play();statusEl.textContent='RECORDING';audio.onended=()=>rec.stop()}
document.getElementById('record').onclick=record;window.addEventListener('resize',resize);resize();requestAnimationFrame(draw);requestAnimationFrame(tick);
