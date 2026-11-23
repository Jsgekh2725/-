(() => {
  'use strict';

  /* =========================================================
     الثوابت
     ========================================================= */
  const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
  const DIGITS = '0123456789';
  const ALNUM = LETTERS + DIGITS;
  const DISCORD_ENDPOINT = 'https://discord.com/api/v9/unique-username/username-attempt-unauthed';
  const LS_SETTINGS = 'dug_settings_v1';
  const LS_CACHE = 'dug_cache_v1';
  const LS_RESULTS = 'dug_results_v1';
  const MAX_SAVED_RESULTS = 3000;

  // أنماط التكرار: نفس الحرف الصغير = نفس الحرف، نفس الرقم = نفس الرقم
  const REPEAT_PATTERNS = {
    2: [
      ['aa', 'حرفين متكررين'],
      ['11', 'رقمين متكررين'],
    ],
    3: [
      ['aaa', '3 حروف متكررة'],
      ['111', '3 أرقام متكررة'],
      ['aa1', 'حرفين متكررين + رقم'],
      ['1aa', 'رقم + حرفين متكررين'],
      ['11a', 'رقمين متكررين + حرف'],
      ['a11', 'حرف + رقمين متكررين'],
      ['a1a', 'حرف، رقم، نفس الحرف'],
      ['1a1', 'رقم، حرف، نفس الرقم'],
      ['aab', 'حرفين متكررين + حرف مختلف'],
      ['abb', 'حرف + حرفين متكررين'],
      ['aba', 'حرف، حرف، نفس الأول'],
      ['112', 'رقمين متكررين + رقم مختلف'],
      ['122', 'رقم + رقمين متكررين'],
      ['121', 'رقم، رقم، نفس الأول'],
    ],
    4: [
      ['aaaa', '4 حروف متكررة'],
      ['1111', '4 أرقام متكررة'],
      ['aa12', 'حرفين متكررين + رقمين مختلفين'],
      ['12aa', 'رقمين مختلفين + حرفين متكررين'],
      ['ab11', 'حرفين مختلفين + رقمين متكررين'],
      ['11ab', 'رقمين متكررين + حرفين مختلفين'],
      ['111a', '3 أرقام متكررة + حرف'],
      ['a111', 'حرف + 3 أرقام متكررة'],
      ['aaa1', '3 حروف متكررة + رقم'],
      ['1aaa', 'رقم + 3 حروف متكررة'],
      ['aa11', 'حرفين متكررين + رقمين متكررين'],
      ['11aa', 'رقمين متكررين + حرفين متكررين'],
      ['aaab', '3 حروف متكررة + حرف مختلف'],
      ['1112', '3 أرقام متكررة + رقم مختلف'],
      ['aabb', 'حرفين متكررين × 2'],
      ['1122', 'رقمين متكررين × 2'],
      ['abab', 'حرفين بالتناوب'],
      ['1212', 'رقمين بالتناوب'],
      ['a1a1', 'حرف ورقم بالتناوب'],
      ['1a1a', 'رقم وحرف بالتناوب'],
      ['abba', 'مرآة حروف'],
      ['1221', 'مرآة أرقام'],
    ],
  };

  const DEFAULT_REPEATS = { 2: ['aa', '11'], 3: ['aaa', '111', 'aa1', '11a'], 4: ['aa12', 'ab11', '111a', 'aaa1'] };

  /* =========================================================
     أدوات عامة
     ========================================================= */
  const $ = (id) => document.getElementById(id);

  function randInt(n) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / n) * n;
    let x;
    do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
    return x % n;
  }
  const pick = (str) => str[randInt(str.length)];

  function sampleDistinct(pool, k) {
    const arr = pool.split('');
    for (let i = 0; i < k; i++) {
      const j = i + randInt(arr.length - i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, k);
  }

  function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal && signal.aborted) return reject(new DOMException('aborted', 'AbortError'));
      const t = setTimeout(resolve, ms);
      if (signal) signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('aborted', 'AbortError')); }, { once: true });
    });
  }

  function loadJSON(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* التخزين ممتلئ أو غير متاح */ }
  }

  const fmt = (n) => Number(n).toLocaleString('en-US');

  function isValidUsername(u) {
    return /^[a-z0-9_.]{2,32}$/.test(u) && !u.includes('..');
  }

  /* =========================================================
     محرك الأنماط
     ========================================================= */
  function parsePattern(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
      const c = str[i];
      if (c === '{') {
        const end = str.indexOf('}', i);
        if (end === -1) throw new Error('فيه { بدون إغلاق }');
        const lit = str.slice(i + 1, end).toLowerCase();
        if (!/^[a-z0-9_.]*$/.test(lit)) throw new Error('النص الثابت داخل { } يقبل حروف إنجليزية وأرقام و _ . فقط');
        for (const ch of lit) tokens.push({ t: 'lit', v: ch });
        i = end + 1;
        continue;
      }
      if (c === 'L') tokens.push({ t: 'L' });
      else if (c === 'N') tokens.push({ t: 'N' });
      else if (c === 'X') tokens.push({ t: 'X' });
      else if (c === '_' || c === '.') tokens.push({ t: 'lit', v: c });
      else if (c >= 'a' && c <= 'z') tokens.push({ t: 'vl', v: c });
      else if (c >= '0' && c <= '9') tokens.push({ t: 'vd', v: c });
      else if (c === ' ') { /* تجاهل المسافات */ }
      else throw new Error(`الرمز "${c}" غير معروف`);
      i++;
    }
    if (tokens.length < 2) throw new Error('أقل طول لليوزر خانتين');
    if (tokens.length > 32) throw new Error('أكثر طول لليوزر 32 خانة');
    const lv = [...new Set(tokens.filter((t) => t.t === 'vl').map((t) => t.v))];
    const dv = [...new Set(tokens.filter((t) => t.t === 'vd').map((t) => t.v))];
    const raw = tokens.map((t) => (t.t === 'lit' ? t.v : '?')).join('');
    if (raw.includes('..')) throw new Error('ديسكورد ما يقبل نقطتين ورا بعض');
    return { tokens, lv, dv };
  }

  function generateFrom(p) {
    const lmap = {}; const dmap = {};
    sampleDistinct(LETTERS, p.lv.length).forEach((ch, i) => { lmap[p.lv[i]] = ch; });
    sampleDistinct(DIGITS, p.dv.length).forEach((ch, i) => { dmap[p.dv[i]] = ch; });
    let out = '';
    for (const t of p.tokens) {
      switch (t.t) {
        case 'L': out += pick(LETTERS); break;
        case 'N': out += pick(DIGITS); break;
        case 'X': out += pick(ALNUM); break;
        case 'vl': out += lmap[t.v]; break;
        case 'vd': out += dmap[t.v]; break;
        default: out += t.v;
      }
    }
    return out;
  }

  function perm(n, k) { let r = 1; for (let i = 0; i < k; i++) r *= (n - i); return r; }

  function spaceOf(p) {
    let s = perm(26, p.lv.length) * perm(10, p.dv.length);
    for (const t of p.tokens) {
      if (t.t === 'L') s *= 26; else if (t.t === 'N') s *= 10; else if (t.t === 'X') s *= 36;
    }
    return s;
  }

  // يبني مولّد حسب اختيارات المستخدم
  function buildGenerator(st) {
    if (st.type === 'custom') {
      const p = parsePattern(st.custom.trim());
      return { gen: () => generateFrom(p), space: spaceOf(p) };
    }

    const n = st.type === 'semi' ? 3 : Number(st.type);
    let patterns; let mixed = false;
    if (st.style === 'letters') patterns = ['L'.repeat(n)];
    else if (st.style === 'numbers') patterns = ['N'.repeat(n)];
    else if (st.style === 'mixed') { patterns = ['X'.repeat(n)]; mixed = true; }
    else {
      const allowed = new Set(REPEAT_PATTERNS[n].map((r) => r[0]));
      patterns = (st.repeats[n] || []).filter((x) => allowed.has(x));
      if (!patterns.length) throw new Error('اختر نمط تكرار واحد على الأقل');
    }
    const parsed = patterns.map(parsePattern);

    let space;
    if (mixed) space = Math.pow(36, n) - Math.pow(26, n) - Math.pow(10, n);
    else space = parsed.reduce((a, p) => a + spaceOf(p), 0);

    const base = () => {
      const p = parsed[randInt(parsed.length)];
      if (!mixed) return generateFrom(p);
      for (let i = 0; i < 200; i++) {
        const u = generateFrom(p);
        if (/[a-z]/.test(u) && /[0-9]/.test(u)) return u;
      }
      return generateFrom(p);
    };

    if (st.type !== 'semi') return { gen: base, space };

    const seps = st.seps.length ? st.seps : ['_'];
    const positions = st.positions.length ? st.positions.map(Number) : [1, 2];
    space *= seps.length * positions.length;
    return {
      space,
      gen: () => {
        const b = base();
        const pos = positions[randInt(positions.length)];
        return b.slice(0, pos) + pick(seps.join('')) + b.slice(pos);
      },
    };
  }

  /* =========================================================
     الحالة والإعدادات
     ========================================================= */
  const saved = loadJSON(LS_SETTINGS, {});
  const state = {
    type: saved.type || '3',
    style: saved.style || 'mixed',
    seps: saved.seps || ['_', '.'],
    positions: saved.positions || ['1', '2'],
    repeats: Object.assign({}, DEFAULT_REPEATS, saved.repeats || {}),
    custom: saved.custom || 'aa12',
    count: saved.count || 50,
    delay: saved.delay ?? 1500,
    skipChecked: saved.skipChecked ?? true,
    generateOnly: saved.generateOnly ?? false,
    proxy: saved.proxy || '',
  };
  const persist = () => saveJSON(LS_SETTINGS, state);

  let cache = loadJSON(LS_CACHE, {});           // username -> 'available' | 'taken'
  let results = loadJSON(LS_RESULTS, []);       // [{u, s, m}]
  let filter = 'all';
  let running = false;
  let controller = null;

  /* =========================================================
     الواجهة
     ========================================================= */
  function setActive(container, attr, values) {
    container.querySelectorAll('[data-' + attr + ']').forEach((el) => {
      el.classList.toggle('active', values.includes(el.dataset[attr]));
    });
  }

  function renderControls() {
    setActive($('typeChips'), 'type', [state.type]);
    setActive($('styleChips'), 'style', [state.style]);
    setActive($('sepChips'), 'sep', state.seps);
    setActive($('posChips'), 'pos', state.positions);
    $('semiBox').hidden = state.type !== 'semi';
    $('customBox').hidden = state.type !== 'custom';
    $('styleCard').hidden = state.type === 'custom';
    $('repeatBox').hidden = !(state.style === 'repeat' && state.type !== 'custom');
    renderRepeatGrid();
    renderPreview();
  }

  function currentLen() { return state.type === 'semi' ? 3 : Number(state.type); }

  function renderRepeatGrid() {
    if (state.type === 'custom') return;
    const n = currentLen();
    const sel = state.repeats[n] || [];
    const grid = $('repeatGrid');
    grid.innerHTML = '';
    for (const [code, desc] of REPEAT_PATTERNS[n]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rp' + (sel.includes(code) ? ' active' : '');
      b.dataset.code = code;
      let ex = '';
      try { ex = generateFrom(parsePattern(code)); } catch { /* */ }
      b.innerHTML = `<span class="code"></span><span class="ex"></span><span class="desc"></span>`;
      b.querySelector('.code').textContent = code;
      const exEl = b.querySelector('.ex');
      exEl.textContent = 'مثال: ';
      const bd = document.createElement('bdi');
      bd.dir = 'ltr';
      bd.textContent = ex;
      exEl.appendChild(bd);
      b.querySelector('.desc').textContent = desc;
      grid.appendChild(b);
    }
    const all = REPEAT_PATTERNS[n].length === sel.length;
    $('toggleAllRepeats').textContent = all ? 'إلغاء الكل' : 'تحديد الكل';
  }

  function renderPreview() {
    const list = $('previewList');
    const err = $('patternError');
    list.innerHTML = '';
    try {
      const g = buildGenerator(state);
      const seen = new Set();
      for (let i = 0; i < 40 && seen.size < 8; i++) seen.add(g.gen());
      for (const u of seen) {
        const s = document.createElement('span');
        s.textContent = u;
        list.appendChild(s);
      }
      $('spaceInfo').textContent = 'الاحتمالات: ' + fmt(g.space);
      err.hidden = true;
      $('startBtn').disabled = running;
    } catch (e) {
      $('spaceInfo').textContent = '';
      err.textContent = e.message;
      err.hidden = false;
      $('startBtn').disabled = true;
    }
  }

  function renderProxyPill(kind, text) {
    const pill = $('proxyPill');
    pill.classList.remove('ok', 'bad', 'warn');
    if (kind) pill.classList.add(kind);
    $('proxyPillText').textContent = text;
  }

  function refreshPill() {
    if (!state.proxy) renderProxyPill('warn', 'البروكسي غير مضبوط');
    else renderProxyPill('ok', 'البروكسي مضبوط');
  }

  function toast(msg, kind = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.textContent = msg;
    $('toasts').appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  function setStatus(msg, kind = '') {
    const el = $('statusLine');
    el.textContent = msg;
    el.className = 'status-line ' + kind;
  }

  /* ---------------- النتائج ---------------- */
  const STATUS_META = {
    pending: { mark: '', label: 'جاري الفحص' },
    available: { mark: '✓', label: 'متاح' },
    taken: { mark: '✗', label: 'مأخوذ' },
    error: { mark: '!', label: 'خطأ' },
    unchecked: { mark: '?', label: 'غير مفحوص' },
  };

  function rowEl(r) {
    const row = document.createElement('div');
    row.className = 'row s-' + r.s;
    row.dataset.u = r.u;
    row.innerHTML = '<span class="mark"></span><span class="name"></span><span class="meta"></span><button class="icon-btn" type="button" title="نسخ">⧉</button>';
    updateRowEl(row, r);
    return row;
  }

  function updateRowEl(row, r) {
    const meta = STATUS_META[r.s] || STATUS_META.error;
    row.className = 'row s-' + r.s;
    row.querySelector('.mark').textContent = meta.mark;
    row.querySelector('.name').textContent = r.u;
    row.querySelector('.meta').textContent = r.s === 'error' && r.m ? r.m : meta.label;
    row.querySelector('.meta').title = r.m || '';
  }

  function passesFilter(r) {
    return filter === 'all' || r.s === filter;
  }

  function renderResults() {
    const box = $('results');
    box.querySelectorAll('.row').forEach((el) => el.remove());
    const frag = document.createDocumentFragment();
    for (let i = results.length - 1; i >= 0; i--) {
      if (passesFilter(results[i])) frag.appendChild(rowEl(results[i]));
    }
    box.appendChild(frag);
    updateEmpty();
    updateStats();
  }

  function updateEmpty() {
    $('emptyState').hidden = !!$('results').querySelector('.row');
  }

  function updateStats() {
    let checked = 0, avail = 0, taken = 0, err = 0;
    for (const r of results) {
      if (r.s === 'available') { avail++; checked++; }
      else if (r.s === 'taken') { taken++; checked++; }
      else if (r.s === 'error') { err++; checked++; }
    }
    $('statChecked').textContent = fmt(checked);
    $('statAvail').textContent = fmt(avail);
    $('statTaken').textContent = fmt(taken);
    $('statErr').textContent = fmt(err);
  }

  function saveResults() {
    const clean = results.filter((r) => r.s !== 'pending').slice(-MAX_SAVED_RESULTS);
    saveJSON(LS_RESULTS, clean);
  }

  function addResult(u, s) {
    const r = { u, s, m: '' };
    results.push(r);
    let el = null;
    if (passesFilter(r)) {
      el = rowEl(r);
      $('results').insertBefore(el, $('results').querySelector('.row'));
    }
    updateEmpty();
    return { r, el };
  }

  function setResult(entry, s, m = '') {
    entry.r.s = s;
    entry.r.m = m;
    if (entry.el) {
      if (passesFilter(entry.r)) updateRowEl(entry.el, entry.r);
      else entry.el.remove();
    } else if (passesFilter(entry.r)) {
      entry.el = rowEl(entry.r);
      $('results').insertBefore(entry.el, $('results').querySelector('.row'));
    }
    if (s === 'available' || s === 'taken') cache[entry.r.u] = s;
    updateEmpty();
    updateStats();
  }

  /* =========================================================
     الفحص
     ========================================================= */
  function buildRequestUrl(proxy) {
    if (proxy.includes('{url}')) return proxy.replace('{url}', encodeURIComponent(DISCORD_ENDPOINT));
    return proxy;
  }

  async function checkUsername(u, signal) {
    const url = buildRequestUrl(state.proxy.trim());
    for (let attempt = 0; attempt < 8; attempt++) {
      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({ username: u }),
          signal,
        });
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        return { s: 'error', m: 'فشل الاتصال بالبروكسي' };
      }
      let data = null;
      try { data = await res.json(); } catch { /* ليس JSON */ }

      if (res.status === 429) {
        const sec = Number(data && data.retry_after) || 5;
        const wait = Math.ceil(sec * 1000) + 400;
        setStatus(`ديسكورد طلب انتظار (Rate limit) ${(wait / 1000).toFixed(1)} ثانية…`, 'warn');
        await sleep(wait, signal);
        continue;
      }
      if (res.ok && data && typeof data.taken === 'boolean') {
        return { s: data.taken ? 'taken' : 'available' };
      }
      if (res.status === 400) return { s: 'error', m: 'يوزر غير صالح' };
      const msg = (data && (data.message || data.error)) || ('HTTP ' + res.status);
      return { s: 'error', m: String(msg).slice(0, 40) };
    }
    return { s: 'error', m: 'Rate limit متكرر' };
  }

  function setRunning(v) {
    running = v;
    $('startBtn').disabled = v;
    $('manualBtn').disabled = v;
    $('stopBtn').disabled = !v;
    if (!v) renderPreview();
  }

  function setProgress(done, total) {
    $('progressBar').style.width = total ? Math.min(100, (done / total) * 100) + '%' : '0';
  }

  // nextFn ترجع اليوزر التالي أو null إذا خلصت
  async function runQueue(nextFn, total, opts = {}) {
    const generateOnly = !!opts.generateOnly;
    if (!generateOnly && !state.proxy.trim()) {
      toast('حط رابط البروكسي أول من الإعدادات', 'err');
      openSettings();
      return;
    }
    setRunning(true);
    controller = new AbortController();
    const signal = controller.signal;
    let done = 0;
    let found = 0;
    setProgress(0, total);
    setStatus(generateOnly ? 'جاري التوليد…' : 'جاري الفحص…');

    try {
      while (running && done < total) {
        const u = nextFn();
        if (u === null) break;

        if (generateOnly) {
          addResult(u, 'unchecked');
          done++;
          setProgress(done, total);
          continue;
        }

        const entry = addResult(u, 'pending');
        let res;
        try {
          res = await checkUsername(u, signal);
        } catch (e) {
          if (e.name === 'AbortError') {
            results.splice(results.indexOf(entry.r), 1);
            if (entry.el) entry.el.remove();
            break;
          }
          res = { s: 'error', m: String(e.message || e).slice(0, 40) };
        }
        setResult(entry, res.s, res.m);
        if (res.s === 'available') found++;
        done++;
        setProgress(done, total);
        setStatus(`تم فحص ${fmt(done)} من ${fmt(total)} — المتاح: ${fmt(found)}`);
        if (done % 5 === 0) { saveJSON(LS_CACHE, cache); saveResults(); }
        if (running && done < total && state.delay > 0) await sleep(state.delay, signal);
      }
    } catch (e) {
      if (e.name !== 'AbortError') toast('صار خطأ: ' + e.message, 'err');
    }

    saveJSON(LS_CACHE, cache);
    saveResults();
    updateEmpty();
    updateStats();
    const stopped = signal.aborted;
    setRunning(false);
    if (generateOnly) setStatus(`تم توليد ${fmt(done)} يوزر`, 'ok');
    else setStatus(`${stopped ? 'تم الإيقاف' : 'خلص'} — انفحص ${fmt(done)}، المتاح ${fmt(found)}`, found ? 'ok' : '');
    if (!generateOnly && found) toast(`لقيت ${found} يوزر متاح ✓`, 'ok');
  }

  function startGenerated() {
    let g;
    try { g = buildGenerator(state); } catch (e) { toast(e.message, 'err'); return; }
    const total = Math.max(1, Math.min(5000, Number(state.count) || 1));
    const seen = new Set(results.map((r) => r.u));
    let warned = false;
    const nextFn = () => {
      for (let tries = 0; tries < 5000; tries++) {
        const u = g.gen();
        if (!isValidUsername(u)) continue;
        if (seen.has(u)) continue;
        if (state.skipChecked && cache[u]) continue;
        seen.add(u);
        return u;
      }
      if (!warned) { warned = true; toast('خلصت الاحتمالات الجديدة لهذا النمط', 'warn'); }
      return null;
    };
    runQueue(nextFn, total, { generateOnly: state.generateOnly });
  }

  function startManual() {
    const raw = $('manualInput').value.toLowerCase().split(/[\s,،]+/).map((s) => s.trim().replace(/^@/, '')).filter(Boolean);
    const list = [...new Set(raw)];
    const valid = list.filter(isValidUsername);
    const invalid = list.length - valid.length;
    if (!valid.length) { toast('ما فيه يوزرات صالحة بالقائمة', 'err'); return; }
    if (invalid) toast(`تم تجاهل ${invalid} يوزر غير صالح`, 'warn');
    let i = 0;
    runQueue(() => (i < valid.length ? valid[i++] : null), valid.length);
  }

  function stop() {
    running = false;
    if (controller) controller.abort();
  }

  /* =========================================================
     الإعدادات (البروكسي)
     ========================================================= */
  function openSettings() {
    $('proxyInput').value = state.proxy;
    $('proxyTestResult').textContent = '';
    $('settingsModal').hidden = false;
    setTimeout(() => $('proxyInput').focus(), 50);
  }
  function closeSettings() { $('settingsModal').hidden = true; }

  async function saveAndTestProxy() {
    const v = $('proxyInput').value.trim().replace(/\/+$/, '');
    const out = $('proxyTestResult');
    state.proxy = v;
    persist();
    if (!v) { out.textContent = 'تم مسح الرابط'; out.className = 'status-line'; refreshPill(); return; }
    if (!/^https?:\/\//i.test(v)) { out.textContent = 'الرابط لازم يبدأ بـ https://'; out.className = 'status-line bad'; return; }
    out.textContent = 'جاري الاختبار…';
    out.className = 'status-line';
    // نفحص يوزر عشوائي طويل (غالباً متاح) للتأكد إن السلسلة كاملة شغالة
    const testName = 'zq' + Array.from({ length: 12 }, () => pick(ALNUM)).join('');
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const r = await checkUsername(testName, ctrl.signal);
      clearTimeout(timer);
      if (r.s === 'available' || r.s === 'taken') {
        out.textContent = 'شغال ✓ البروكسي يوصل لديسكورد بنجاح';
        out.className = 'status-line ok';
        renderProxyPill('ok', 'متصل');
        setStatus('جاهز');
      } else {
        out.textContent = 'ما اشتغل: ' + (r.m || 'خطأ غير معروف');
        out.className = 'status-line bad';
        renderProxyPill('bad', 'خطأ بالبروكسي');
      }
    } catch (e) {
      out.textContent = e.name === 'AbortError' ? 'انتهى الوقت بدون رد' : 'ما اشتغل: ' + e.message;
      out.className = 'status-line bad';
      renderProxyPill('bad', 'خطأ بالبروكسي');
    }
  }

  /* =========================================================
     الأحداث
     ========================================================= */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } finally { ta.remove(); }
    return Promise.resolve();
  }

  function bind() {
    $('typeChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-type]'); if (!b) return;
      state.type = b.dataset.type; persist(); renderControls();
    });
    $('styleChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-style]'); if (!b) return;
      state.style = b.dataset.style; persist(); renderControls();
    });
    const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    $('sepChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-sep]'); if (!b) return;
      const next = toggleIn(state.seps, b.dataset.sep);
      if (!next.length) { toast('لازم رمز واحد على الأقل', 'warn'); return; }
      state.seps = next; persist(); renderControls();
    });
    $('posChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-pos]'); if (!b) return;
      const next = toggleIn(state.positions, b.dataset.pos);
      if (!next.length) { toast('لازم مكان واحد على الأقل', 'warn'); return; }
      state.positions = next; persist(); renderControls();
    });
    $('repeatGrid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-code]'); if (!b) return;
      const n = currentLen();
      state.repeats[n] = toggleIn(state.repeats[n] || [], b.dataset.code);
      persist(); renderRepeatGrid(); renderPreview();
    });
    $('toggleAllRepeats').addEventListener('click', () => {
      const n = currentLen();
      const all = REPEAT_PATTERNS[n].map((r) => r[0]);
      state.repeats[n] = (state.repeats[n] || []).length === all.length ? [] : all;
      persist(); renderRepeatGrid(); renderPreview();
    });
    $('customPattern').addEventListener('input', (e) => {
      state.custom = e.target.value; persist(); renderPreview();
    });
    $('countInput').addEventListener('input', (e) => { state.count = Number(e.target.value) || 1; persist(); });
    $('delayInput').addEventListener('input', (e) => { state.delay = Math.max(0, Number(e.target.value) || 0); persist(); });
    $('skipChecked').addEventListener('change', (e) => { state.skipChecked = e.target.checked; persist(); });
    $('generateOnly').addEventListener('change', (e) => { state.generateOnly = e.target.checked; persist(); });
    $('refreshPreview').addEventListener('click', () => { renderRepeatGrid(); renderPreview(); });

    $('startBtn').addEventListener('click', startGenerated);
    $('stopBtn').addEventListener('click', stop);
    $('manualBtn').addEventListener('click', startManual);

    $('filterTabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]'); if (!b) return;
      filter = b.dataset.filter;
      setActive($('filterTabs'), 'filter', [filter]);
      renderResults();
    });

    $('results').addEventListener('click', (e) => {
      const b = e.target.closest('.icon-btn'); if (!b) return;
      const u = b.closest('.row').dataset.u;
      copyText(u).then(() => toast('تم نسخ ' + u, 'ok'));
    });

    $('copyAvailBtn').addEventListener('click', () => {
      const list = results.filter((r) => r.s === 'available').map((r) => r.u);
      if (!list.length) { toast('ما فيه يوزرات متاحة للحين', 'warn'); return; }
      copyText(list.join('\n')).then(() => toast(`تم نسخ ${list.length} يوزر`, 'ok'));
    });

    $('exportBtn').addEventListener('click', () => {
      const list = results.filter((r) => r.s === 'available').map((r) => r.u);
      if (!list.length) { toast('ما فيه يوزرات متاحة للحين', 'warn'); return; }
      const blob = new Blob([list.join('\n') + '\n'], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'available-usernames.txt';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });

    $('clearBtn').addEventListener('click', () => {
      if (running) { toast('وقف الفحص أول', 'warn'); return; }
      if (!results.length) return;
      results = [];
      saveResults();
      renderResults();
      setProgress(0, 0);
      setStatus('تم مسح النتائج');
    });

    $('proxyPill').addEventListener('click', openSettings);
    $('closeSettings').addEventListener('click', closeSettings);
    $('settingsModal').addEventListener('click', (e) => { if (e.target.id === 'settingsModal') closeSettings(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSettings(); });
    $('saveProxy').addEventListener('click', saveAndTestProxy);
    $('proxyInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') saveAndTestProxy(); });
    $('clearCache').addEventListener('click', () => {
      cache = {};
      saveJSON(LS_CACHE, cache);
      $('proxyTestResult').textContent = 'تم مسح سجل اليوزرات المفحوصة';
      $('proxyTestResult').className = 'status-line ok';
    });
  }

  /* =========================================================
     التشغيل
     ========================================================= */
  function init() {
    $('countInput').value = state.count;
    $('delayInput').value = state.delay;
    $('skipChecked').checked = state.skipChecked;
    $('generateOnly').checked = state.generateOnly;
    $('customPattern').value = state.custom;
    bind();
    renderControls();
    renderResults();
    refreshPill();
    if (!state.proxy) setStatus('اضبط رابط البروكسي من الزر فوق عشان يشتغل الفحص', 'warn');
  }

  // للاختبار فقط
  window.__dug = { parsePattern, generateFrom, buildGenerator, spaceOf, isValidUsername };

  init();
})();
