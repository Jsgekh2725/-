
let adminUnlocked = false;

function toggleMenu(){
document.getElementById('sidebar').classList.toggle('active');
}

function showPage(id){
document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
document.getElementById(id).classList.add('active');
}

function generateLink(){

const file = document.getElementById('mainFile').files[0];

if(!file){
alert('اختر ملف');
return;
}

const reader = new FileReader();

reader.onload = function(e){

const uniqueId = 'download_' + Date.now();

localStorage.setItem(uniqueId, JSON.stringify({
name:file.name,
data:e.target.result
}));

const link = window.location.origin + window.location.pathname + '?download=' + uniqueId;

document.getElementById('result').innerHTML = `
<p style="margin-top:20px">تم إنشاء صفحة التحميل:</p>
<br>
<input value="${link}" readonly>
<br><br>
<a class="download-link" href="${link}" target="_blank">فتح صفحة التحميل</a>
`;

};

reader.readAsDataURL(file);
}

function openAdmin(){

const pass = prompt('ادخل كلمة السر');

if(pass === 'AdminBlackVoid'){
adminUnlocked = true;
showPage('adminPage');
loadMods();
}else{
alert('كلمة السر خاطئة');
}

}

function saveMod(){

if(!adminUnlocked){
return;
}

const name = document.getElementById('modName').value;
const desc = document.getElementById('modDesc').value;
const file = document.getElementById('modFile').files[0];

if(!name || !desc || !file){
alert('اكمل جميع البيانات');
return;
}

const reader = new FileReader();

reader.onload = function(e){

const mods = JSON.parse(localStorage.getItem('blackvoid_mods') || '[]');

mods.push({
id:Date.now(),
name:name,
desc:desc,
fileName:file.name,
fileData:e.target.result
});

localStorage.setItem('blackvoid_mods', JSON.stringify(mods));

alert('تم رفع المود');

loadMods();
showPage('modsPage');

};

reader.readAsDataURL(file);
}

function deleteMod(id){

const mods = JSON.parse(localStorage.getItem('blackvoid_mods') || '[]');

const newMods = mods.filter(m=>m.id !== id);

localStorage.setItem('blackvoid_mods', JSON.stringify(newMods));

loadMods();
}

function editMod(id){

const mods = JSON.parse(localStorage.getItem('blackvoid_mods') || '[]');

const mod = mods.find(m=>m.id === id);

if(!mod) return;

const newName = prompt('اسم جديد', mod.name);
const newDesc = prompt('شرح جديد', mod.desc);

if(newName && newDesc){

mod.name = newName;
mod.desc = newDesc;

localStorage.setItem('blackvoid_mods', JSON.stringify(mods));

loadMods();

}
}

function loadMods(){

const container = document.getElementById('modsContainer');

container.innerHTML = '';

const mods = JSON.parse(localStorage.getItem('blackvoid_mods') || '[]');

if(mods.length === 0){
container.innerHTML = '<p>لا يوجد مودات حالياً</p>';
return;
}

mods.forEach(mod=>{

const div = document.createElement('div');

div.className = 'mod-card';

div.innerHTML = `
<h3>${mod.name}</h3>
<p>${mod.desc}</p>

<a class="download-link" href="${mod.fileData}" download="${mod.fileName}">
تحميل مباشر
</a>

${adminUnlocked ? `
<div class="admin-actions">
<button class="delete-btn" onclick="deleteMod(${mod.id})">حذف</button>
<button class="edit-btn" onclick="editMod(${mod.id})">تعديل</button>
</div>
` : ''}
`;

container.appendChild(div);

});

}

function checkDownloadPage(){

const params = new URLSearchParams(window.location.search);

const id = params.get('download');

if(!id) return;

const data = JSON.parse(localStorage.getItem(id));

if(!data){

document.body.innerHTML = '<h1 style="color:white;text-align:center;margin-top:100px">الرابط غير صالح</h1>';

return;
}

document.body.innerHTML = `
<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#050505">

<div style="background:#111;padding:40px;border-radius:20px;text-align:center;border:1px solid #00ff99;width:90%;max-width:500px">

<h1 style="color:#00ff99;margin-bottom:20px">BLACK VOID</h1>

<p style="color:white;margin-bottom:25px">${data.name}</p>

<a href="${data.data}" download="${data.name}" 
style="display:inline-block;padding:16px 24px;background:#00ff99;color:black;text-decoration:none;border-radius:12px;font-weight:bold;font-size:18px">
تحميل مباشر
</a>

</div>

</div>
`;

}

checkDownloadPage();
loadMods();
