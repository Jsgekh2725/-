let studentName="";

const questions=[

{

q:"كم يساوي 4 × 3 ؟",

a:["7","12","9","15"],

c:1

},

{

q:"كم عدد النواتج إذا كان هناك 5 ألوان و3 مقاسات؟",

a:["8","10","15","20"],

c:2

},

{

q:"فضاء العينة هو:",

a:["كل النواتج الممكنة","ناتج واحد","عدد الأسئلة","لا شيء"],

c:0

},

{

q:"إذا كانت زاوية 30° فما متتامتها؟",

a:["60","150","120","90"],

c:0

},

{

q:"إذا كانت زاوية 70° فما متكاملتها؟",

a:["20","90","110","70"],

c:2

},

{

q:"مجموع زوايا المثلث؟",

a:["90","180","360","270"],

c:1

},

{

q:"إذا كانت زاويتان 50° و60° فالثالثة؟",

a:["70","80","90","60"],

c:0

},

{

q:"الزاويتان المتتامتان مجموعهما؟",

a:["90","180","360","45"],

c:0

},

{

q:"الزاويتان المتكاملتان مجموعهما؟",

a:["90","180","360","45"],

c:1

},

{

q:"عدد نواتج رمي قطعة نقود؟",

a:["1","2","3","4"],

c:1

},

{

q:"عدد نواتج مكعب الأرقام؟",

a:["4","5","6","7"],

c:2

},

{

q:"2 × 6 = ؟",

a:["8","10","12","14"],

c:2

},

{

q:"الرأس هو:",

a:["مكان التقاء الضلعين","اسم الزاوية","عدد الدرجات","المستقيم"],

c:0

},

{

q:"في تسمية الزاوية يكون الرأس:",

a:["في البداية","في الوسط","في النهاية","لا يهم"],

c:1

},

{

q:"إذا كانت الزوايا 25° و108° فالثالثة؟",

a:["47","57","67","37"],

c:0

},

{

q:"5 ألوان و4 مقاسات = ؟",

a:["20","15","10","25"],

c:0

},

{

q:"3 أنواع و2 ألوان = ؟",

a:["4","5","6","8"],

c:2

},

{

q:"45° و45° زاويتان:",

a:["متكاملتان","متتامتان","حادتان فقط","منفرجتان"],

c:1

},

{

q:"140° و40° زاويتان:",

a:["متتامتان","متكاملتان","حادتان","قائمتان"],

c:1

},

{

q:"إذا كان مجموع زاويتين 90° فهما:",

a:["متتامتان","متكاملتان","متقابلتان","متجاورتان"],

c:0

}

];

function startQuiz(){

studentName=document.getElementById("name").value;

if(studentName.length<5){

alert("اكتب الاسم الثلاثي");

return;

}

document.getElementById("start").classList.add("hidden");

document.getElementById("quiz").classList.remove("hidden");

document.getElementById("student").innerText=studentName;

let html="";

questions.forEach((q,i)=>{

html+=`

<div class="question">

<h3>${i+1}. ${q.q}</h3>

${q.a.map((x,j)=>

`<label><input type="radio" name="q${i}" value="${j}"> ${x}</label><br>`

).join("")}

</div>`;

});

document.getElementById("quizForm").innerHTML=html;

}

function finishQuiz(){

let score=0;

questions.forEach((q,i)=>{

let ans=document.querySelector(`input[name="q${i}"]:checked`);

if(ans && Number(ans.value)===q.c){

score++;

}

});

document.getElementById("quiz").classList.add("hidden");

document.getElementById("result").classList.remove("hidden");

document.getElementById("result").innerHTML=

`

<h1>انتهى الاختبار</h1>

<h2>${studentName}</h2>

<h2>الدرجة: ${score} / 20</h2>

`;

}
