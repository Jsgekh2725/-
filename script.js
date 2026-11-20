const letters = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const countEl = document.getElementById("count");
const modeEl = document.getElementById("mode");
const patternEl = document.getElementById("pattern");
const resultsEl = document.getElementById("results");
let usernames = [];

function randomChar(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}
function poolFor(type, mode) {
  if (type === "l") return letters;
  if (type === "n") return numbers;
  if (mode === "letters") return letters;
  if (mode === "numbers") return numbers;
  return letters + numbers;
}
function makeName(mode, pattern) {
  let types;
  if (mode === "letters") types = ["l","l","l"];
  else if (mode === "numbers") types = ["n","n","n"];
  else if (pattern === "random") types = Array.from({length:3}, () => Math.random() < .65 ? "l" : "n");
  else types = pattern.split("");
  return types.map(t => randomChar(poolFor(t, mode))).join("");
}
function generate() {
  const wanted = Number(countEl.value);
  const mode = modeEl.value;
  const pattern = patternEl.value;
  const set = new Set();
  const maxPossible = mode === "letters" ? 26**3 : mode === "numbers" ? 10**3 : 36**3;
  const target = Math.min(wanted, maxPossible);
  let attempts = 0;
  while (set.size < target && attempts < target * 30) {
    set.add(makeName(mode, pattern));
    attempts++;
  }
  usernames = [...set];
  render();
}
function render() {
  document.getElementById("total").textContent = usernames.length;
  document.getElementById("unique").textContent = new Set(usernames).size;
  if (!usernames.length) {
    resultsEl.innerHTML = '<div class="empty">اضغط «توليد اليوزرات» لعرض النتائج</div>';
    return;
  }
  resultsEl.innerHTML = "";
  usernames.forEach(name => {
    const item = document.createElement("div");
    item.className = "username";
    const code = document.createElement("code");
    code.textContent = name;
    const button = document.createElement("button");
    button.textContent = "نسخ";
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(name);
      button.textContent = "تم";
      setTimeout(() => button.textContent = "نسخ", 900);
    });
    item.append(code, button);
    resultsEl.appendChild(item);
  });
}
document.getElementById("generate").addEventListener("click", generate);
document.getElementById("copyAll").addEventListener("click", async () => {
  if (!usernames.length) return;
  await navigator.clipboard.writeText(usernames.join("\n"));
  const btn = document.getElementById("copyAll");
  btn.textContent = "تم النسخ";
  setTimeout(() => btn.textContent = "نسخ الكل", 1000);
});
document.getElementById("download").addEventListener("click", () => {
  if (!usernames.length) return;
  const blob = new Blob([usernames.join("\n")], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "discord-3char-usernames.txt";
  a.click();
  URL.revokeObjectURL(url);
});
generate();
