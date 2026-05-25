let admin=false;

function toggleMenu(){
document.getElementById('sidebar').classList.toggle('active');
}

function showPage(id){
document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
document.getElementById(id).classList.add('active');
toggleMenu();
}

function generateLink(){
const file=document.getElementById('mainFile').files[0];
if(!file)return alert('اختر ملف');

const reader=new FileReader();

reader.onload=e=>{
const data=e.target.result;

const html=`<html><body style="background:#07111c;color:white;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh"><div style="background:#0f2235;padding:40px;border-radius:25px;text-align:center"><h1 style="color:#55c8ff">BLACK VOID</h1><a href="${data}" download="${file.name}" style="background:#55c8ff;padding:15px 20px;border-radius:12px;color:black;text-decoration:none;font-weight:bold">تحميل مباشر</a></div></body></html>`;

const blob=new Blob([html],{type:'text/html'});
const url=URL.createObjectURL(blob);

document.getElementById('result').innerHTML=`
<input value="${url}" readonly>
<div class="actions">
<button class="small-btn" onclick="navigator.clipboard.writeText('${url}')">نسخ الرابط</button>
<a class="small-btn" href="${url}" target="_blank">فتح الصفحة</a>
<a class="small-btn" href="${data}" download="${file.name}">تحميل مباشر</a>
</div>`;
};

reader.readAsDataURL(file);
}

function openAdmin(){
if(prompt('كلمة السر')==='AdminBlackVoid'){
admin=true;
showPage('adminPage');
loadMods();
}else{
alert('كلمة السر خاطئة');
}
}

function saveMod(){
const n=modName.value;
const d=modDesc.value;
const c=modCategory.value;
const img=modImage.files[0];
const file=modFile.files[0];

if(!n||!d||!img||!file)return alert('اكمل البيانات');

const ir=new FileReader();
const fr=new FileReader();

ir.onload=i=>{
fr.onload=f=>{
const mods=JSON.parse(localStorage.mods||'[]');

mods.push({
id:Date.now(),
name:n,
desc:d,
cat:c,
img:i.target.result,
file:f.target.result,
filename:file.name
});

localStorage.mods=JSON.stringify(mods);
loadMods();
showPage('modsPage');
};
fr.readAsDataURL(file);
};
ir.readAsDataURL(img);
}

function deleteMod(id){
let mods=JSON.parse(localStorage.mods||'[]');
mods=mods.filter(m=>m.id!==id);
localStorage.mods=JSON.stringify(mods);
loadMods();
}

function loadMods(){
const container=document.getElementById('modsContainer');
const adminContainer=document.getElementById('adminMods');

container.innerHTML='';
adminContainer.innerHTML='';

let mods=JSON.parse(localStorage.mods||'[]');

const search=(searchInput?.value||'').toLowerCase();
const cat=categoryFilter?.value||'all';

mods=mods.filter(m=>(m.name.toLowerCase().includes(search))&&(cat==='all'||m.cat===cat));

mods.forEach(m=>{
container.innerHTML+=`
<div class="card">
<img src="${m.img}">
<h2>${m.name}</h2>
<p>${m.desc}</p>
<p>${m.cat}</p>
<div class="actions">
<a class="small-btn" href="${m.file}" download="${m.filename}">تحميل مباشر</a>
</div>
</div>`;

if(admin){
adminContainer.innerHTML+=`
<div class="card">
<img src="${m.img}">
<h2>${m.name}</h2>
<div class="actions">
<button class="small-btn" onclick="deleteMod(${m.id})">حذف</button>
</div>
</div>`;
}
});
}

loadMods();
