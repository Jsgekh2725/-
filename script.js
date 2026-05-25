function showPage(id){

document.querySelectorAll('.page').forEach(page=>{
page.classList.remove('active');
});

document.getElementById(id).classList.add('active');

}

async function createLink(){

const file=document.getElementById('fileInput').files[0];

if(!file){
alert('اختر ملف');
return;
}

document.getElementById('loading').innerText='جارٍ رفع الملف...';

const formData=new FormData();
formData.append('file',file);

try{

const response=await fetch('https://store1.gofile.io/uploadFile',{
method:'POST',
body:formData
});

const data=await response.json();

if(data.status==='ok'){

document.getElementById('result').innerHTML=
`<a href="${data.data.downloadPage}" target="_blank">${data.data.downloadPage}</a>`;

document.getElementById('loading').innerText='تم رفع الملف';

}else{

document.getElementById('loading').innerText='فشل رفع الملف';

}

}catch(error){

document.getElementById('loading').innerText='حدث خطأ أثناء الرفع';

}

}

function adminLogin(){

const password=prompt('اكتب كلمة السر');

if(password!=='AdminBlackVoid'){
alert('كلمة السر غير صحيحة');
return;
}

const name=prompt('اسم المود');

if(!name) return;

const desc=prompt('شرح المود (اختياري)') || '';

const image=prompt('رابط صورة (اختياري)') || '';

const link=prompt('رابط تحميل مباشر للمود');

if(!link) return;

const mods=JSON.parse(localStorage.getItem('blackmods') || '[]');

mods.push({
name:name,
desc:desc,
image:image,
link:link
});

localStorage.setItem('blackmods',JSON.stringify(mods));

loadMods();

alert('تم إضافة المود');

}

function loadMods(){

const mods=JSON.parse(localStorage.getItem('blackmods') || '[]');

const container=document.getElementById('modsList');

container.innerHTML='';

if(mods.length===0){

container.innerHTML='<div class="mod"><h2>لا يوجد مودات</h2></div>';
return;

}

mods.forEach((mod,index)=>{

container.innerHTML+=`
<div class="mod">

${mod.image ? `<img src="${mod.image}">` : ''}

<h2>${mod.name}</h2>

<p>${mod.desc}</p>

<a href="${mod.link}" target="_blank">تحميل مباشر</a>

</div>
`;

});

}

loadMods();
