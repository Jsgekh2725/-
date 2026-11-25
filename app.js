/* مختبر أدوات بايثون
 * بايثون يعمل داخل المتصفح عبر Pyodide — لا يحتاج خادم، لذلك يعمل على GitHub Pages.
 */
(() => {
  "use strict";

  const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/";
  const KEY_TOOLS = "pylab.tools.v1";
  const KEY_DRAFT = "pylab.draft.v1";

  const $ = (s) => document.querySelector(s);
  const els = {
    run: $("#runBtn"),
    status: $("#status"),
    statusText: $("#statusText"),
    output: $("#output"),
    runTime: $("#runTime"),
    toolName: $("#toolName"),
    stdin: $("#stdinBox"),
    pkgs: $("#pkgBox"),
    examples: $("#examplesList"),
    tools: $("#toolsList"),
    toolsEmpty: $("#toolsEmpty"),
    toolsCount: $("#toolsCount"),
    fileInput: $("#fileInput"),
    toast: $("#toast"),
    sidebar: $("#sidebar"),
    backdrop: $("#backdrop"),
  };

  let pyodide = null;
  let running = false;
  let currentToolId = null;
  let stdinQueue = [];
  let micropipLoaded = false;

  /* ================= أدوات مساعدة ================= */
  const safeStorage = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch { return false; }
    },
  };

  let toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function setStatus(state, text) {
    els.status.className = "status " + state;
    els.statusText.textContent = text;
  }

  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  /* ================= المحرر ================= */
  let editor;
  function initEditor() {
    const host = $("#editor");
    if (window.CodeMirror) {
      const cm = window.CodeMirror(host, {
        value: "",
        mode: "python",
        theme: "dracula",
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        direction: "ltr",
        lineWrapping: false,
        extraKeys: {
          Tab: (c) => c.somethingSelected() ? c.indentSelection("add") : c.replaceSelection("    ", "end"),
          "Shift-Tab": (c) => c.indentSelection("subtract"),
          "Ctrl-/": "toggleComment",
        },
      });
      editor = {
        get: () => cm.getValue(),
        set: (v) => { cm.setValue(v); cm.clearHistory(); },
        focus: () => cm.focus(),
        onChange: (fn) => cm.on("change", fn),
      };
    } else {
      // بديل بسيط إذا لم يتحمّل CodeMirror
      const ta = document.createElement("textarea");
      ta.className = "fallback-editor";
      ta.spellcheck = false;
      ta.dir = "ltr";
      host.appendChild(ta);
      ta.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const s = ta.selectionStart;
          ta.setRangeText("    ", s, ta.selectionEnd, "end");
        }
      });
      editor = {
        get: () => ta.value,
        set: (v) => { ta.value = v; },
        focus: () => ta.focus(),
        onChange: (fn) => ta.addEventListener("input", fn),
      };
    }
  }

  /* ================= المخرجات ================= */
  function clearOutput(showPlaceholder = true) {
    els.output.innerHTML = "";
    els.runTime.textContent = "";
    if (showPlaceholder) {
      const p = document.createElement("span");
      p.className = "placeholder";
      p.textContent = "اضغط «تشغيل» أو Ctrl + Enter لرؤية النتيجة هنا.";
      els.output.appendChild(p);
    }
  }

  function write(text, cls) {
    const ph = els.output.querySelector(".placeholder");
    if (ph) ph.remove();
    const span = document.createElement("span");
    if (cls) span.className = cls;
    span.textContent = text;
    els.output.appendChild(span);
    els.output.scrollTop = els.output.scrollHeight;
  }

  function writeImage(b64) {
    const ph = els.output.querySelector(".placeholder");
    if (ph) ph.remove();
    const img = document.createElement("img");
    img.className = "plot";
    img.alt = "رسم بياني";
    img.src = "data:image/png;base64," + b64;
    els.output.appendChild(img);
    els.output.scrollTop = els.output.scrollHeight;
  }

  // دوال يستدعيها بايثون
  window.pylabImage = (b64) => writeImage(String(b64));
  window.pylabInput = (promptText) => {
    promptText = String(promptText ?? "");
    if (promptText) write(promptText, "out-prompt");
    let value;
    if (stdinQueue.length) {
      value = stdinQueue.shift();
    } else {
      value = window.prompt(promptText || "أدخل قيمة:", "");
    }
    if (value === null) {
      write("\n");
      return null; // يصبح None في بايثون → EOFError
    }
    write(value + "\n", "out-stdin");
    return value;
  };

  /* ================= تحميل بايثون ================= */
  const PY_SETUP = `
import builtins, sys, js

def _pylab_input(prompt=""):
    try:
        sys.stdout.flush()
    except Exception:
        pass
    value = js.pylabInput(str(prompt))
    if value is None:
        raise EOFError("تم إلغاء الإدخال")
    return str(value)

builtins.input = _pylab_input
`;

  const PY_MPL_SETUP = `
import matplotlib
matplotlib.use("AGG")
import matplotlib.pyplot as _plt, io as _io, base64 as _b64, js as _js

def _pylab_show(*args, **kwargs):
    for num in _plt.get_fignums():
        fig = _plt.figure(num)
        buf = _io.BytesIO()
        fig.savefig(buf, format="png", dpi=110, bbox_inches="tight")
        _js.pylabImage(_b64.b64encode(buf.getvalue()).decode())
    _plt.close("all")

_plt.show = _pylab_show
`;

  const PY_MPL_FLUSH = `
import sys as _sys
_p = _sys.modules.get("matplotlib.pyplot")
if _p is not None and _p.get_fignums():
    _p.show()
`;

  async function initPython() {
    if (typeof window.loadPyodide !== "function") {
      setStatus("error", "تعذّر تحميل بايثون");
      write("تعذّر تحميل Pyodide. تأكد من اتصالك بالإنترنت ثم حدّث الصفحة.\n", "out-hint");
      return;
    }
    try {
      setStatus("loading", "جارٍ تحميل بايثون… (أول مرة قد تأخذ ثوانٍ)");
      pyodide = await window.loadPyodide({ indexURL: PYODIDE_URL });
      pyodide.setStdout({ batched: (s) => write(s + "\n") });
      pyodide.setStderr({ batched: (s) => write(s + "\n", "out-err") });
      await pyodide.runPythonAsync(PY_SETUP);
      const ver = pyodide.runPython("import sys; sys.version.split()[0]");
      setStatus("ready", `جاهز — Python ${ver}`);
      els.run.disabled = false;
    } catch (err) {
      console.error(err);
      setStatus("error", "خطأ في تحميل بايثون");
      write(String(err) + "\n", "out-err");
    }
  }

  /* ================= التشغيل ================= */
  function cleanTraceback(msg) {
    const lines = String(msg).split("\n");
    const i = lines.findIndex((l) => l.includes('File "<exec>"'));
    if (i > 0) return ["Traceback (most recent call last):", ...lines.slice(i)].join("\n").trim();
    return String(msg).trim();
  }

  function parsePkgs(str) {
    return str.split(/[\s,،]+/).map((s) => s.trim()).filter(Boolean);
  }

  async function installExtras() {
    const pkgs = parsePkgs(els.pkgs.value);
    if (!pkgs.length) return;
    if (!micropipLoaded) {
      await pyodide.loadPackage("micropip");
      micropipLoaded = true;
    }
    const micropip = pyodide.pyimport("micropip");
    write(`📦 تثبيت: ${pkgs.join(", ")}\n`, "out-info");
    await nextFrame();
    await micropip.install(pkgs);
  }

  async function run() {
    if (!pyodide || running) return;
    const code = editor.get();
    if (!code.trim()) { toast("المحرر فارغ"); return; }

    running = true;
    els.run.disabled = true;
    els.run.classList.add("is-running");
    clearOutput(false);
    stdinQueue = els.stdin.value ? els.stdin.value.split(/\r?\n/) : [];
    // إزالة سطر فارغ أخير زائد
    if (stdinQueue.length && stdinQueue[stdinQueue.length - 1] === "") stdinQueue.pop();

    let ns = null;
    let ok = false;
    const t0 = performance.now();

    try {
      // 1) المكتبات
      setStatus("running", "جارٍ تجهيز المكتبات…");
      await nextFrame();
      await installExtras();
      await pyodide.loadPackagesFromImports(code, {
        messageCallback: (m) => { if (/Loading|Loaded/.test(m)) setStatus("running", m.slice(0, 70)); },
        errorCallback: (m) => console.warn(m),
      });
      if (/\bmatplotlib\b/.test(code)) await pyodide.runPythonAsync(PY_MPL_SETUP);

      // 2) التشغيل
      setStatus("running", "جارٍ التشغيل…");
      await nextFrame();
      ns = pyodide.globals.get("dict")();
      ns.set("__name__", "__main__");
      await pyodide.runPythonAsync(code, { globals: ns });
      ok = true;
    } catch (err) {
      const msg = cleanTraceback(err && err.message ? err.message : err);
      write((els.output.textContent && !els.output.textContent.endsWith("\n") ? "\n" : "") + msg + "\n", "out-err");
      const m = msg.match(/ModuleNotFoundError: No module named '([^']+)'/);
      if (m) {
        write(`💡 المكتبة «${m[1]}» غير موجودة. اكتب اسمها في «إعدادات التشغيل ← مكتبات إضافية» ثم شغّل مرة أخرى.\n`, "out-hint");
      }
    } finally {
      try { await pyodide.runPythonAsync(PY_MPL_FLUSH); } catch { /* تجاهل */ }
      if (ns) ns.destroy();
      const ms = performance.now() - t0;
      els.runTime.textContent = ms < 1000 ? `${ms.toFixed(0)} ms` : `${(ms / 1000).toFixed(2)} s`;
      if (!els.output.childNodes.length) write("(لا توجد مخرجات)\n", "out-info");
      write(ok ? "✔ انتهى التشغيل بنجاح" : "✖ انتهى التشغيل بخطأ", ok ? "out-ok out-line" : "out-err out-line");
      setStatus(ok ? "ready" : "error", ok ? "جاهز" : "حدث خطأ — راجع المخرجات");
      running = false;
      els.run.disabled = false;
      els.run.classList.remove("is-running");
    }
  }

  /* ================= أدواتي (الحفظ) ================= */
  const getTools = () => safeStorage.get(KEY_TOOLS, []);
  const setTools = (t) => safeStorage.set(KEY_TOOLS, t);

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function saveTool() {
    let name = els.toolName.value.trim();
    if (!name) {
      name = (window.prompt("اسم الأداة:", "أداتي") || "").trim();
      if (!name) return;
      els.toolName.value = name;
    }
    const tools = getTools();
    const data = { name, code: editor.get(), inputs: els.stdin.value, packages: els.pkgs.value, updated: Date.now() };
    const idx = currentToolId ? tools.findIndex((t) => t.id === currentToolId) : -1;
    if (idx >= 0) {
      tools[idx] = { ...tools[idx], ...data };
    } else {
      currentToolId = uid();
      tools.unshift({ id: currentToolId, ...data });
    }
    if (setTools(tools)) {
      toast(`✅ تم حفظ «${name}»`);
      renderTools();
      saveDraft();
    } else {
      toast("❌ تعذّر الحفظ (مساحة المتصفح ممتلئة؟)");
    }
  }

  function loadTool(tool) {
    currentToolId = tool.id || null;
    els.toolName.value = tool.name || "";
    editor.set(tool.code || "");
    els.stdin.value = tool.inputs || "";
    els.pkgs.value = tool.packages || "";
    clearOutput();
    renderTools();
    saveDraft();
    closeSidebar();
    editor.focus();
  }

  function deleteTool(id) {
    const tools = getTools();
    const tool = tools.find((t) => t.id === id);
    if (!tool || !window.confirm(`حذف «${tool.name}»؟`)) return;
    setTools(tools.filter((t) => t.id !== id));
    if (currentToolId === id) currentToolId = null;
    renderTools();
    toast("🗑 تم الحذف");
  }

  function newTool() {
    loadTool({ id: null, name: "", code: "# اكتب أداتك هنا\n\n", inputs: "", packages: "" });
    els.toolName.focus();
  }

  function makeItem({ icon, title, desc, active, onClick, onDelete }) {
    const li = document.createElement("li");
    li.className = "item" + (active ? " active" : "");
    li.innerHTML = `<span class="item-icon"></span><div class="item-text"><div class="item-title"></div><div class="item-desc"></div></div>`;
    li.querySelector(".item-icon").textContent = icon;
    li.querySelector(".item-title").textContent = title;
    li.querySelector(".item-desc").textContent = desc;
    li.addEventListener("click", onClick);
    if (onDelete) {
      const del = document.createElement("button");
      del.className = "item-del";
      del.title = "حذف";
      del.textContent = "✕";
      del.addEventListener("click", (e) => { e.stopPropagation(); onDelete(); });
      li.appendChild(del);
    }
    return li;
  }

  function renderTools() {
    const tools = getTools();
    els.tools.innerHTML = "";
    els.toolsCount.textContent = tools.length;
    els.toolsEmpty.style.display = tools.length ? "none" : "block";
    for (const t of tools) {
      const date = new Date(t.updated).toLocaleDateString("ar", { day: "numeric", month: "short" });
      const lines = (t.code || "").split("\n").length;
      els.tools.appendChild(makeItem({
        icon: "🛠",
        title: t.name,
        desc: `${lines} سطر · ${date}`,
        active: t.id === currentToolId,
        onClick: () => loadTool(t),
        onDelete: () => deleteTool(t.id),
      }));
    }
  }

  function renderExamples() {
    const list = window.PYLAB_EXAMPLES || [];
    els.examples.innerHTML = "";
    for (const ex of list) {
      els.examples.appendChild(makeItem({
        icon: ex.icon,
        title: ex.title,
        desc: ex.desc,
        onClick: () => loadTool({ id: null, name: ex.title, code: ex.code, inputs: "", packages: "" }),
      }));
    }
  }

  /* ================= المسودة التلقائية ================= */
  function saveDraft() {
    safeStorage.set(KEY_DRAFT, {
      id: currentToolId,
      name: els.toolName.value,
      code: editor.get(),
      inputs: els.stdin.value,
      packages: els.pkgs.value,
    });
  }
  const saveDraftSoon = debounce(saveDraft, 500);

  /* ================= ملفات ومشاركة ================= */
  function downloadCode() {
    const name = (els.toolName.value.trim() || "tool").replace(/[\\/:*?"<>|]+/g, "_");
    const blob = new Blob([editor.get()], { type: "text/x-python;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name.endsWith(".py") ? name : name + ".py";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function openFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      loadTool({ id: null, name: file.name.replace(/\.(py|txt)$/i, ""), code: String(reader.result), inputs: "", packages: "" });
      toast(`📂 تم فتح ${file.name}`);
    };
    reader.readAsText(file, "utf-8");
  }

  function b64urlEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function b64urlDecode(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  async function shareLink() {
    const payload = { n: els.toolName.value, c: editor.get() };
    const url = location.href.split("#")[0] + "#t=" + b64urlEncode(JSON.stringify(payload));
    try {
      await navigator.clipboard.writeText(url);
      toast("🔗 تم نسخ رابط الأداة");
    } catch {
      window.prompt("انسخ الرابط:", url);
    }
  }

  function loadFromHash() {
    const m = location.hash.match(/^#t=(.+)$/);
    if (!m) return false;
    try {
      const data = JSON.parse(b64urlDecode(m[1]));
      loadTool({ id: null, name: data.n || "أداة مشتركة", code: data.c || "", inputs: "", packages: "" });
      history.replaceState(null, "", location.pathname + location.search);
      toast("📥 تم فتح الأداة المشتركة");
      return true;
    } catch {
      toast("❌ رابط غير صالح");
      return false;
    }
  }

  async function copyOutput() {
    const text = els.output.innerText.trim();
    if (!text) return;
    try { await navigator.clipboard.writeText(text); toast("📋 تم نسخ المخرجات"); }
    catch { toast("تعذّر النسخ"); }
  }

  /* ================= القائمة الجانبية ================= */
  function openSidebar() { els.sidebar.classList.add("open"); els.backdrop.classList.add("show"); }
  function closeSidebar() { els.sidebar.classList.remove("open"); els.backdrop.classList.remove("show"); }

  function bindTabs() {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
        document.querySelectorAll(".tab-body").forEach((b) => b.classList.toggle("active", b.id === "tab-" + tab.dataset.tab));
      });
    });
  }

  /* ================= البدء ================= */
  function init() {
    initEditor();
    renderExamples();
    renderTools();
    bindTabs();
    clearOutput();

    if (!loadFromHash()) {
      const draft = safeStorage.get(KEY_DRAFT, null);
      if (draft && draft.code) {
        loadTool(draft);
      } else if (window.PYLAB_EXAMPLES && window.PYLAB_EXAMPLES.length) {
        const ex = window.PYLAB_EXAMPLES[0];
        loadTool({ id: null, name: ex.title, code: ex.code });
      }
    }

    editor.onChange(saveDraftSoon);
    [els.toolName, els.stdin, els.pkgs].forEach((el) => el.addEventListener("input", saveDraftSoon));

    els.run.addEventListener("click", run);
    $("#clearBtn").addEventListener("click", () => clearOutput());
    $("#copyOutBtn").addEventListener("click", copyOutput);
    $("#newBtn").addEventListener("click", newTool);
    $("#saveBtn").addEventListener("click", saveTool);
    $("#downloadBtn").addEventListener("click", downloadCode);
    $("#shareBtn").addEventListener("click", shareLink);
    $("#openBtn").addEventListener("click", () => els.fileInput.click());
    els.fileInput.addEventListener("change", () => {
      if (els.fileInput.files[0]) openFile(els.fileInput.files[0]);
      els.fileInput.value = "";
    });
    $("#menuBtn").addEventListener("click", openSidebar);
    els.backdrop.addEventListener("click", closeSidebar);
    window.addEventListener("hashchange", loadFromHash);

    document.addEventListener("keydown", (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "Enter") { e.preventDefault(); run(); }
      if (mod && (e.key === "s" || e.key === "S")) { e.preventDefault(); saveTool(); }
    });

    initPython();
  }

  init();
})();
