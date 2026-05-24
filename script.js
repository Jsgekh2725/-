const fileInput = document.getElementById("fileInput");
const pickBtn = document.getElementById("pickBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileName = document.getElementById("fileName");
const loader = document.getElementById("loader");
const resultBox = document.getElementById("resultBox");
const resultLink = document.getElementById("resultLink");
const copyBtn = document.getElementById("copyBtn");

pickBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  if(fileInput.files.length > 0){
    fileName.textContent = fileInput.files[0].name;
  }
});

uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];

  if(!file){
    alert("اختر ملف أولاً");
    return;
  }

  loader.classList.remove("hidden");
  resultBox.classList.add("hidden");

  const formData = new FormData();
  formData.append("file", file);

  try{
    const response = await fetch("https://file.io", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    loader.classList.add("hidden");

    if(data.success){
      resultBox.classList.remove("hidden");
      resultLink.value = data.link;
    }else{
      alert("فشل إنشاء الرابط");
    }

  }catch(err){
    loader.classList.add("hidden");
    alert("حدث خطأ أثناء الرفع");
    console.error(err);
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultLink.value);
  copyBtn.textContent = "تم النسخ!";

  setTimeout(() => {
    copyBtn.textContent = "نسخ الرابط";
  }, 2000);
});
