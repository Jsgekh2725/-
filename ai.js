/* RoGUI Studio — ai.js : مساعد الذكاء الاصطناعي
   1) مراجعة التصميم: وش الناقص؟ + إصلاح تلقائي أو يدوي
   2) صمّم لي: تكتب وصف والذكاء يبني الواجهة كاملة
   3) أيقونات: أيقونة من عناصر GUI بتأثيرات، أو صورة PNG ترفعها على روبلوكس */
'use strict';

const AI = {
  PROVIDERS: {
    free: { n: '🆓 Pollinations — مجاني بدون مفتاح', model: 'openai', keyOpt: true, link: 'https://enter.pollinations.ai', note: 'مجاني لكن بطيء ومحدود (طلب كل ~15 ثانية). مفتاح Pollinations المجاني يرفع الحد.' },
    anthropic: { n: 'Claude (Anthropic)', model: 'claude-sonnet-5-5', link: 'https://console.anthropic.com/settings/keys', note: 'أفضل جودة للتصاميم. يحتاج مفتاح API.' },
    openai: { n: 'OpenAI (ChatGPT)', model: 'gpt-4.1-mini', link: 'https://platform.openai.com/api-keys', note: 'يحتاج مفتاح API. تقدر تغيّر اسم الموديل.' },
    gemini: { n: 'Google Gemini', model: 'gemini-2.5-flash', link: 'https://aistudio.google.com/apikey', note: 'Google AI Studio يعطي مفتاح مجاني بحدود.' },
    openrouter: { n: 'OpenRouter', model: 'openrouter/auto', link: 'https://openrouter.ai/keys', note: 'بوابة لموديلات كثيرة (فيها مجانية).' },
    offline: { n: '📴 ذكاء محلي (بدون إنترنت)', local: true, note: 'قواعد تصميم مدمجة في الموقع — سريع ومجاني، أقل إبداعاً من الذكاء الحقيقي.' }
  },
  cfg() { return Object.assign({ provider: 'free', keys: {}, models: {} }, Store.get('rogui_ai', {})); },
  save(c) { Store.set('rogui_ai', c); },
  isLocal() { return this.cfg().provider === 'offline'; },
  providerName() { const c = this.cfg(); return (this.PROVIDERS[c.provider] || this.PROVIDERS.free).n; },

  async ask(system, user, maxTokens = 6000) {
    const c = this.cfg(), p = c.provider, P = this.PROVIDERS[p] || this.PROVIDERS.free;
    if (P.local) throw new Error('local');
    const key = (c.keys[p] || '').trim(), model = (c.models[p] || '').trim() || P.model;
    if (!P.keyOpt && !key) throw new Error(`حط مفتاح ${P.n} في تبويب الإعدادات ⚙ أولاً`);
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 120000);
    const post = async (url, headers, body) => {
      let r;
      try { r = await fetch(url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: JSON.stringify(body), signal: ctl.signal }); }
      catch (e) { throw new Error(e.name === 'AbortError' ? 'انتهى الوقت — جرب مرة ثانية' : 'تعذر الاتصال بخدمة الذكاء (تحقق من الإنترنت)'); }
      const txt = await r.text();
      if (!r.ok) {
        let msg = txt; try { const j = JSON.parse(txt); msg = (j.error && (j.error.message || j.error)) || j.message || txt; } catch (e) { }
        if (r.status === 401 || r.status === 403) msg = 'المفتاح غير صحيح أو ما عنده صلاحية — ' + msg;
        if (r.status === 429) msg = 'وصلت للحد المسموح — انتظر شوي وجرب — ' + msg;
        throw new Error(`(${r.status}) ${String(msg).slice(0, 220)}`);
      }
      try { return JSON.parse(txt); } catch (e) { return { _raw: txt }; }
    };
    try {
      const msgs = [{ role: 'system', content: system }, { role: 'user', content: user }];
      if (p === 'anthropic') {
        const j = await post('https://api.anthropic.com/v1/messages', { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
          { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] });
        return (j.content || []).map(x => x.text || '').join('');
      }
      if (p === 'gemini') {
        const j = await post(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {},
          { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 } });
        return ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(x => x.text || '').join('');
      }
      let url, headers = {};
      if (p === 'openai') { url = 'https://api.openai.com/v1/chat/completions'; headers.Authorization = 'Bearer ' + key; }
      else if (p === 'openrouter') { url = 'https://openrouter.ai/api/v1/chat/completions'; headers.Authorization = 'Bearer ' + key; headers['X-Title'] = 'RoGUI Studio'; }
      else if (key) { url = 'https://gen.pollinations.ai/v1/chat/completions'; headers.Authorization = 'Bearer ' + key; }
      else url = 'https://text.pollinations.ai/openai';
      const j = await post(url, headers, { model, messages: msgs, max_tokens: maxTokens });
      if (j._raw) return j._raw;
      return ((j.choices || [])[0] || {}).message ? j.choices[0].message.content : JSON.stringify(j);
    } finally { clearTimeout(timer); }
  },
  parseJSON(text) {
    let t = String(text || '').trim();
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i); if (fence) t = fence[1];
    const a = t.search(/[\[{]/), b = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    if (a >= 0 && b > a) t = t.slice(a, b + 1);
    try { return JSON.parse(t); } catch (e) { }
    try { return JSON.parse(t.replace(/,\s*([}\]])/g, '$1')); } catch (e) { }
    throw new Error('رد الذكاء ما كان بالصيغة المطلوبة — جرب مرة ثانية');
  }
};

/* ===================== تحويل رد الذكاء إلى عناصر ===================== */
const NAMED_COLORS = { white: '#ffffff', black: '#000000', red: '#ff4d6d', green: '#06d6a0', blue: '#4cc9f0', yellow: '#ffd60a', orange: '#ff9f1c', purple: '#7f5cff', pink: '#ff5d8f', gray: '#8d90ab', grey: '#8d90ab', gold: '#ffd60a', cyan: '#00e5ff' };
const CLASS_ALIAS = { label: 'TextLabel', text: 'TextLabel', textlabel: 'TextLabel', button: 'TextButton', textbutton: 'TextButton', textbox: 'TextBox', input: 'TextBox', image: 'ImageLabel', imagelabel: 'ImageLabel', imagebutton: 'ImageButton', frame: 'Frame', scrollingframe: 'ScrollingFrame', scroll: 'ScrollingFrame', canvasgroup: 'CanvasGroup' };
const PROP_ALIAS = { backgroundcolor: 'BackgroundColor3', bgcolor: 'BackgroundColor3', background: 'BackgroundColor3', textcolor: 'TextColor3', color3: 'BackgroundColor3', transparency: 'BackgroundTransparency', imagecolor: 'ImageColor3', strokecolor: 'TextStrokeColor3', radius: 'CornerRadius' };
function aiColor(v) {
  if (v == null) return null;
  if (Array.isArray(v) && v.length >= 3) { const m = Math.max(...v.slice(0, 3)) <= 1 ? 255 : 1; return rgbHex(v.slice(0, 3).map(x => +x * m)); }
  if (typeof v === 'object') { if ('r' in v) { const m = Math.max(v.r, v.g, v.b) <= 1 ? 255 : 1; return rgbHex([v.r * m, v.g * m, v.b * m]); } if ('R' in v) return rgbHex([v.R * 255, v.G * 255, v.B * 255]); }
  let s = String(v).trim().toLowerCase();
  if (NAMED_COLORS[s]) return NAMED_COLORS[s];
  const rg = s.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/); if (rg && !s.startsWith('#')) return rgbHex([+rg[1], +rg[2], +rg[3]]);
  if (/^#?[0-9a-f]{3}$/.test(s)) s = '#' + s.replace('#', '').split('').map(c => c + c).join('');
  if (/^#?[0-9a-f]{6}/.test(s)) return '#' + s.replace('#', '').slice(0, 6);
  return null;
}
const nums = v => { if (typeof v === 'string') v = v.replace(/[{}()\[\]]|UDim2\.new|UDim\.new|Vector2\.new|UDim2\.fromScale|UDim2\.fromOffset/gi, '').split(',').map(Number); if (Array.isArray(v)) return v.map(Number).filter(x => !isNaN(x)); return null; };
function aiValue(p, v) {
  if (v == null) return undefined;
  switch (p.type) {
    case 'bool': return v === true || v === 'true' || v === 1;
    case 'number': { let n = +v; if (isNaN(n)) return undefined; if (p.min != null) n = Math.max(p.min, n); if (p.max != null) n = Math.min(p.max, n); return n; }
    case 'string': case 'text': case 'target': return String(v);
    case 'color': return aiColor(v) || undefined;
    case 'enum': { const s = String(v).split('.').pop().toLowerCase(); return p.opts.find(o => o.toLowerCase() === s); }
    case 'font': { const s = String(v).split('.').pop().toLowerCase(); return FONT_LIST.find(f => f.toLowerCase() === s) || 'GothamBold'; }
    case 'image': case 'sound': return imageId(v);
    case 'udim2': {
      if (v && typeof v === 'object' && !Array.isArray(v)) { if ('xs' in v) return U2(+v.xs || 0, +v.xo || 0, +v.ys || 0, +v.yo || 0); if (v.X) return U2(+v.X.Scale || 0, +v.X.Offset || 0, +v.Y.Scale || 0, +v.Y.Offset || 0); }
      const a = nums(v); if (!a) return undefined;
      if (a.length >= 4) return U2(a[0], a[1], a[2], a[3]);
      if (a.length === 2) return Math.abs(a[0]) <= 1 && Math.abs(a[1]) <= 1 ? U2(a[0], 0, a[1], 0) : U2(0, a[0], 0, a[1]);
      return undefined;
    }
    case 'udim': {
      if (typeof v === 'number') return UD(0, v);
      if (v && typeof v === 'object' && !Array.isArray(v)) return UD(+(v.s ?? v.Scale ?? 0), +(v.o ?? v.Offset ?? 0));
      const a = nums(v); if (!a || !a.length) return undefined; return a.length === 1 ? UD(0, a[0]) : UD(a[0], a[1]);
    }
    case 'vec2': {
      if (v && typeof v === 'object' && !Array.isArray(v)) return V2(+(v.x ?? v.X ?? 0), +(v.y ?? v.Y ?? 0));
      const a = nums(v); if (!a || a.length < 2) return undefined; return V2(a[0], a[1]);
    }
    case 'rect': { const a = nums(v); if (!a || a.length < 4) return undefined; return { x0: a[0], y0: a[1], x1: a[2], y1: a[3] }; }
    case 'colorseq': {
      if (!Array.isArray(v) || !v.length) return undefined;
      const out = v.map((k, i) => {
        if (typeof k === 'string' || (Array.isArray(k) && k.length >= 3 && typeof k[0] === 'number' && k.length !== 2)) return { t: v.length === 1 ? 0 : i / (v.length - 1), c: aiColor(k) };
        if (Array.isArray(k)) return { t: +k[0], c: aiColor(k[1]) };
        return { t: +(k.t ?? k.time ?? k.Time ?? 0), c: aiColor(k.c ?? k.color ?? k.Color ?? k.value) };
      }).filter(k => k.c && !isNaN(k.t));
      if (out.length === 1) out.push({ t: 1, c: out[0].c });
      return out.length ? out : undefined;
    }
    case 'numseq': {
      if (typeof v === 'number') return [{ t: 0, v }, { t: 1, v }];
      if (!Array.isArray(v) || !v.length) return undefined;
      const out = v.map((k, i) => typeof k === 'number' ? { t: v.length === 1 ? 0 : i / (v.length - 1), v: k } : Array.isArray(k) ? { t: +k[0], v: +k[1] } : { t: +(k.t ?? k.time ?? 0), v: +(k.v ?? k.value ?? 0) }).filter(k => !isNaN(k.t) && !isNaN(k.v));
      if (out.length === 1) out.push({ t: 1, v: out[0].v });
      return out.length ? out : undefined;
    }
    case 'colors': { const a = (Array.isArray(v) ? v : [v]).map(aiColor).filter(Boolean); return a.length ? a : undefined; }
  }
  return undefined;
}
function aiSetProps(n, props) {
  if (!props || typeof props !== 'object') return;
  const schema = SCHEMA[n.cls] || [];
  Object.keys(props).forEach(k0 => {
    const lk = k0.toLowerCase();
    let p = schema.find(s => s.k.toLowerCase() === lk) || schema.find(s => s.k === PROP_ALIAS[lk]);
    if (!p && isMod(n) && (lk === 'color' || lk === 'colour')) p = schema.find(s => s.k === 'Color');
    if (!p || p.k[0] === '_') return;
    const v = aiValue(p, props[k0]);
    if (v !== undefined) n.props[p.k] = v;
  });
}
function aiAnim(a) {
  const out = {};
  if (!a || typeof a !== 'object') return out;
  Object.keys(a).forEach(k => {
    const p = ANIM.find(x => x.k.toLowerCase() === k.toLowerCase()); if (!p) return;
    const v = aiValue(p, a[k]); if (v !== undefined) out[p.k] = v;
  });
  return out;
}
const aiName = s => (String(s || '').replace(/[^\w؀-ۿ]/g, '').slice(0, 40) || null);
function aiNode(o, depth = 0) {
  if (!o || typeof o !== 'object' || depth > 14) return null;
  let cls = String(o.class || o.cls || o.ClassName || o.type || 'Frame');
  cls = CLASS_ALIAS[cls.toLowerCase()] || (CLASSES[cls] ? cls : (Object.keys(CLASSES).find(c => c.toLowerCase() === cls.toLowerCase()) || 'Frame'));
  if (cls === 'ScreenGui') cls = 'Frame';
  const n = mk(cls, aiName(o.name) || cls);
  if (isGui(n)) { n.props.BorderSizePixel = 0; if (!('BackgroundColor3' in (o.props || {})) && CLASSES[cls].text && cls === 'TextLabel') n.props.BackgroundTransparency = 1; }
  aiSetProps(n, o.props || o.properties || {});
  const mods = o.mods || o.modifiers || {};
  const addMod = (c, props) => {
    c = Object.keys(CLASSES).find(x => x.toLowerCase() === String(c).toLowerCase()) || ('UI' + c in CLASSES ? 'UI' + c : null);
    if (!c || !isMod({ cls: c }) || !isGui(n)) return;
    if (n.children.some(x => x.cls === c)) return;
    if (CLASSES[c].layout && n.children.some(x => CLASSES[x.cls] && CLASSES[x.cls].layout)) return;
    const m = mk(c, c); aiSetProps(m, props === true ? {} : props); n.children.push(m);
  };
  if (Array.isArray(mods)) mods.forEach(m => typeof m === 'string' ? addMod(m, {}) : addMod(m.class || m.cls || m.type, m.props || m));
  else Object.keys(mods).forEach(k => addMod(k, mods[k]));
  if (isGui(n) && o.anim) n.anim = aiAnim(o.anim);
  (o.children || []).forEach(c => {
    const cc = aiNode(c, depth + 1); if (!cc) return;
    if (isMod(cc)) { if (isGui(n) && !n.children.some(x => x.cls === cc.cls)) n.children.push(cc); }
    else if (isGui(n)) n.children.push(cc);
  });
  return n;
}

/* ===================== وصف التصميم للذكاء ===================== */
function aiSchemaDoc() {
  const td = p => ({ udim2: '[xScale,xOffset,yScale,yOffset]', udim: '[scale,offset]', vec2: '[x,y]', color: '"#hex"', bool: 'bool', number: 'num', text: 'str', string: 'str', image: 'assetId', font: 'Font', colorseq: '["#hex",...] or [{t,c}]', numseq: '[0..1,...]', rect: '[x0,y0,x1,y1]', enum: (p.opts || []).join('|') })[p.type] || p.type;
  const base = new Set(GUI_BASE.map(p => p.k));
  const L = ['GuiObject common props: ' + GUI_BASE.map(p => `${p.k}(${td(p)})`).join(', ')];
  GUI_CLASSES.forEach(c => L.push(`${c} extra: ` + SCHEMA[c].filter(p => !base.has(p.k) && p.k[0] !== '_').map(p => `${p.k}(${td(p)})`).join(', ')));
  MOD_CLASSES.forEach(c => L.push(`${c}: ` + SCHEMA[c].map(p => `${p.k}(${td(p)})`).join(', ')));
  L.push('Font values: ' + FONT_LIST.join('|'));
  L.push('anim keys (all optional): ' + ANIM.map(a => `${a.k}(${a.type === 'enum' ? a.opts.join('|') : a.type === 'colors' ? '["#hex"]' : a.type})`).join(', '));
  return L.join('\n');
}
const AI_NODE_FORMAT = `Node JSON format:
{"class":"Frame|ScrollingFrame|CanvasGroup|TextLabel|TextButton|TextBox|ImageLabel|ImageButton","name":"PascalCaseUniqueName","props":{...},"mods":{"UICorner":{"CornerRadius":[0,12]},"UIStroke":{"Color":"#ffffff","Thickness":2,"Transparency":0.5,"ApplyStrokeMode":"Border"},"UIGradient":{"Color":["#7f5cff","#00c6ff"],"Rotation":90}},"anim":{...},"children":[...]}
Rules: colors are "#rrggbb". Positions/sizes are UDim2 arrays [xScale,xOffset,yScale,yOffset]. AnchorPoint [x,y]. Set BorderSizePixel 0.
TextLabels on top of buttons need BackgroundTransparency 1. UIGradient also tints the text of the SAME element, so put button text in a child TextLabel when using a gradient.
Images need uploaded Roblox asset ids — use emoji text (e.g. "⚔", "🛒", "⚙") as icons instead unless an id is given.
Close buttons: anim {"actionType":"close","actionTarget":"<WindowName>"}. Tabs: anim actionType "tab" with actionTarget page name (pages are siblings inside one container, only first Visible). Toggle switch: TextButton with a child Frame named "Knob" and anim actionType "toggleSwitch".`;
function designSummary() {
  const refs = {}; let i = 0; const L = [];
  const { w, h: H } = screenSize();
  L.push(`Screen ${w}x${H} (GUI area height ${H - guiInset()}), ScreenGui "${root().name}" IgnoreGuiInset=${root().props.IgnoreGuiInset} ResetOnSpawn=${root().props.ResetOnSpawn}`);
  const f2 = v => Math.round(v * 1000) / 1000;
  const u2 = u => `[${f2(u.xs)},${Math.round(u.xo)},${f2(u.ys)},${Math.round(u.yo)}]`;
  walkTree(root(), (n, d) => {
    if (n === root() || i > 260) return;
    const r = 'r' + (++i); refs[r] = n.id;
    const pad = '  '.repeat(d - 1);
    if (isMod(n)) { L.push(`${pad}${r} ${n.cls} ` + JSON.stringify(n.props).slice(0, 120)); return; }
    const p = n.props, info = S.map.get(n.id), a = n.anim || {};
    let s = `${pad}${r} ${n.cls} "${n.name}" size=${u2(p.Size)} pos=${u2(p.Position)} anchor=[${p.AnchorPoint.x},${p.AnchorPoint.y}]`;
    if (info) s += ` px=${Math.round(info.w)}x${Math.round(info.h)}`;
    s += ` bg=${p.BackgroundColor3}${p.BackgroundTransparency ? '@' + p.BackgroundTransparency : ''}`;
    if (!p.Visible) s += ' HIDDEN';
    if (p.ZIndex !== 1) s += ` z=${p.ZIndex}`;
    if (CLASSES[n.cls].text) s += ` text="${String(p.Text).slice(0, 40)}" font=${p.Font} ${p.TextScaled ? 'scaled' : 'size=' + p.TextSize} color=${p.TextColor3}`;
    if (CLASSES[n.cls].image) s += ` image=${imageId(p.Image) || 'NONE'}`;
    const an = Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(ANIM_DEF[k]));
    if (an.length) s += ' anim{' + an.map(k => `${k}:${JSON.stringify(a[k])}`).join(',').slice(0, 160) + '}';
    L.push(s);
  });
  return { text: L.join('\n'), refs };
}

/* ===================== المراجعة المحلية (بدون إنترنت) ===================== */
const lum = hex => { const c = hexRgb(hex).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function effectiveBg(n) {
  let x = n;
  while (x && x.cls !== 'ScreenGui') {
    const p = x.props;
    if (p && p.BackgroundTransparency < 0.5) {
      const g = modsOf(x).UIGradient;
      return g && g.props.Enabled ? rgbHex(mulRgb(hexRgb(p.BackgroundColor3), seqColorAt(g.props.Color, 0.5))) : p.BackgroundColor3;
    }
    x = parentOf(x.id);
  }
  return { sky: '#8fc7f7', dark: '#16182a', light: '#eceef6', checker: '#272838' }[settings().bg] || '#8fc7f7';
}
function textOf(n) { return CLASSES[n.cls].text ? stripRich(n.props.Text || '') : ''; }
function nodeText(n) { let t = textOf(n); if (!t) walkTree(n, x => { if (!t && x !== n && isGui(x)) t = textOf(x); }); return t; }
function isWindow(n) { const i = S.map.get(n.id); return n.cls === 'Frame' || n.cls === 'CanvasGroup' ? !!(i && i.w > 220 && i.h > 150 && !(n.props.Size.xs >= 0.99 && n.props.Size.ys >= 0.99)) : false; }
function isCloser(x) { const a = animOf(x); const t = textOf(x).trim(); return CLASSES[x.cls].button && (['close', 'closeParent', 'closeSelf', 'toggle'].includes(a.actionType) || /^(x|✕|✖|×|❌)$/i.test(t) || /close|إغلاق|اغلاق/i.test(x.name + ' ' + t)); }

function localReview() {
  const items = [], R = root(), all = [];
  walkTree(R, n => { if (isGui(n)) all.push(n); });
  const info = n => S.map.get(n.id) || { w: 0, h: 0 };
  const add = (sev, title, why, ops, manual, target) => items.push({ sev, title, why, ops: ops || [], manual, target, src: 'local' });
  if (!all.length) {
    add('high', 'التصميم فاضي', 'ما فيه أي عناصر بعد. ابدأ بقالب، أو روح لتبويب "صمّم لي" واكتب وش تبي.', [{ op: 'template', name: 'القائمة الرئيسية' }], 'افتح تبويب العناصر واختر قالب.');
    return items;
  }
  const { w: SW, h: SH } = screenSize(); const GH = SH - guiInset();
  const top = R.children.filter(isGui);
  const buttons = all.filter(n => CLASSES[n.cls].button);
  const texts = all.filter(n => CLASSES[n.cls].text);

  // نوافذ بدون زر إغلاق / عنوان / أنميشن
  top.filter(isWindow).forEach(win => {
    const hasClose = (() => { let f = false; walkTree(win, x => { if (!f && x !== win && isGui(x) && isCloser(x)) f = true; }); return f; })();
    if (!hasClose) add('high', `النافذة "${win.name}" ما فيها زر إغلاق`, 'اللاعب لازم يقدر يسكّر أي نافذة تفتح له، وإلا بتغطي على اللعبة.',
      [{ op: 'add', parent: win.id, node: { class: 'TextButton', name: 'CloseButton', props: { Size: [0, 38, 0, 38], Position: [1, -10, 0, 10], AnchorPoint: [1, 0], BackgroundColor3: '#ff4d6d', Text: '✕', TextSize: 20, Font: 'GothamBlack', TextColor3: '#ffffff', ZIndex: win.props.ZIndex + 5 }, mods: { UICorner: { CornerRadius: [0, 10] } }, anim: { hoverOn: true, hoverRotate: 90, hoverScale: 1.1, pressOn: true, actionType: 'close', actionTarget: win.name } } }],
      'أضف TextButton داخل النافذة بالزاوية العلوية، وفي تبويب الأنميشن اختر الإجراء "إغلاق عنصر" واكتب اسم النافذة.', win.id);
    const wr = (S.map.get(win.id) || {}).el ? elRectInArea(S.map.get(win.id).el) : null;
    let hasTitle = false;
    walkTree(win, (x, d) => { if (hasTitle || x === win || d > 3 || !isGui(x) || !CLASSES[x.cls].text || !textOf(x).trim()) return; const xi = S.map.get(x.id); if (!xi || !xi.el || !wr) return; const r = elRectInArea(xi.el); if (r.y - wr.y < wr.h * 0.3) hasTitle = true; });
    if (!hasTitle) add('medium', `النافذة "${win.name}" بدون عنوان`, 'العنوان يوضح للاعب وش هذي النافذة من أول نظرة.',
      [{ op: 'add', parent: win.id, node: { class: 'TextLabel', name: 'Title', props: { Size: [1, -80, 0, 44], Position: [0.5, 0, 0, 10], AnchorPoint: [0.5, 0], BackgroundTransparency: 1, Text: win.name.replace(/Frame|Window/i, '').toUpperCase() || 'TITLE', TextSize: 26, Font: 'GothamBlack', TextColor3: lum(effectiveBg(win)) > 0.4 ? '#111320' : '#ffffff' } } }],
      'أضف TextLabel أعلى النافذة بخط عريض.', win.id);
    if (animOf(win).enterType === 'none') add('low', `"${win.name}" تظهر بدون أنميشن`, 'أنميشن الظهور والإخفاء يخلي فتح النوافذ ناعم واحترافي.', [{ op: 'anim', target: win.id, anim: { enterType: 'pop', enterTime: 0.4, exitType: 'shrink' } }], 'تبويب الأنميشن ← الظهور والإخفاء ← اختر "انبثاق".', win.id);
  });

  // زوايا
  const noCorner = all.filter(n => n.props.BackgroundTransparency < 0.95 && !n.children.some(c => c.cls === 'UICorner') && Math.min(info(n).w, info(n).h) > 18 && !(n.props.Size.xs >= 0.99 && n.props.Size.ys >= 0.99));
  if (noCorner.length) add('medium', `${noCorner.length} عنصر بزوايا حادة`, 'UICorner يعطي الواجهة شكل حديث وناعم بدل الشكل القديم.',
    noCorner.map(n => ({ op: 'addMod', target: n.id, class: 'UICorner', props: { CornerRadius: [0, Math.max(6, Math.min(16, Math.round(Math.min(info(n).w, info(n).h) * 0.18)))] } })),
    'حدد العنصر ← الخصائص ← اضغط "Corner" في الإضافات.', noCorner[0].id);

  // أزرار بدون Hover / ضغط
  const flat = buttons.filter(b => { const a = animOf(b); return !a.hoverOn && !a.pressOn; });
  if (flat.length) add('medium', `${flat.length} زر بدون تفاعل مرور/ضغط`, 'الزر لازم يتحرك لما تمرر عليه أو تضغطه عشان اللاعب يحس إنه شغال.',
    flat.map(b => ({ op: 'anim', target: b.id, anim: { hoverOn: true, hoverScale: 1.05, pressOn: true, pressScale: 0.93 } })), 'حدد الزر ← الأنميشن ← ستايل "زر ناعم".', flat[0].id);
  const silent = buttons.filter(b => { const a = animOf(b); return a.clickFx === 'none' && a.clickMotion === 'none' && a.actionType === 'none'; });
  if (silent.length) add('low', `${silent.length} زر بدون تأثير عند النقر`, 'تأثير بسيط (تموج/نبضة) يعطي إحساس إن الضغطة انحسبت.',
    silent.map(b => ({ op: 'anim', target: b.id, anim: { clickFx: 'ripple', fxColors: ['#ffffff'] } })), 'الأنميشن ← عند النقر ← اختر تأثير.', silent[0].id);

  // أزرار صغيرة للجوال
  const tiny = buttons.filter(b => { const i = info(b); return i.h > 0 && i.h < 34 && b.props.Size.ys === 0; });
  if (tiny.length) add('medium', `${tiny.length} زر صغير على الجوال`, 'لاعبين الجوال يحتاجون أزرار ارتفاعها 40 بكسل أو أكثر عشان يقدرون يضغطونها.',
    tiny.map(b => ({ op: 'set', target: b.id, props: { Size: [b.props.Size.xs, Math.max(b.props.Size.xo, 44), 0, 44] } })), 'كبّر Size Y Offset للزر إلى 44.', tiny[0].id);

  // التجاوب مع الشاشات
  const fixed = top.filter(n => n.props.Size.xs === 0 && n.props.Size.ys === 0 && info(n).w > 160 && info(n).h > 60);
  if (fixed.length) add('high', `${fixed.length} عنصر رئيسي حجمه بالبكسل (Offset)`, 'على الجوال بيطلع ضخم وعلى الشاشات الكبيرة صغير. Scale + UIAspectRatioConstraint يخليه يتناسب مع كل الشاشات.',
    fixed.flatMap(n => { const i = info(n); return [{ op: 'set', target: n.id, props: { Size: [+(i.w / SW).toFixed(4), 0, +(i.h / GH).toFixed(4), 0] } }, { op: 'addMod', target: n.id, class: 'UIAspectRatioConstraint', props: { AspectRatio: +(i.w / i.h).toFixed(3) } }]; }),
    'حدد العنصر ← اضغط زر S في الشريط (تحويل إلى Scale) ← أضف AspectRatioConstraint.', fixed[0].id);

  // تباين النص
  const outlined = t => t.props.TextStrokeTransparency < 0.75 || (modsOf(t).UIStroke && modsOf(t).UIStroke.props.ApplyStrokeMode === 'Contextual');
  const lowC = texts.filter(t => t.props.Text && t.props.TextTransparency < 0.5 && !modsOf(t).UIGradient && !outlined(t) && contrast(t.props.TextColor3, effectiveBg(t)) < 2);
  if (lowC.length) add('high', `${lowC.length} نص صعب القراءة`, 'لون النص قريب من لون الخلفية، واللاعب ما بيقدر يقراه بسهولة.',
    lowC.map(t => { const bg = effectiveBg(t), light = lum(t.props.TextColor3) > 0.5; return lum(bg) > 0.3 && light ? { op: 'set', target: t.id, props: { TextStrokeTransparency: 0.35, TextStrokeColor3: '#000000' } } : { op: 'set', target: t.id, props: { TextColor3: lum(bg) > 0.3 ? '#111320' : '#ffffff' } }; }),
    'غيّر TextColor3 أو أضف حد للنص (TextStrokeTransparency أقل من 0.5).', lowC[0].id);

  // نص صغير
  const small = texts.filter(t => !t.props.TextScaled && t.props.TextSize < 14 && t.props.Text);
  if (small.length) add('low', `${small.length} نص حجمه أقل من 14`, 'النص الصغير ما ينقرى على الجوال.', small.map(t => ({ op: 'set', target: t.id, props: { TextSize: 14 } })), 'كبّر TextSize أو فعّل TextScaled.', small[0].id);

  // خارج الشاشة
  const out = top.filter(n => { const el = (S.map.get(n.id) || {}).el; if (!el || !n.props.Visible) return false; const r = elRectInArea(el); const vis = Math.max(0, Math.min(r.x + r.w, SW) - Math.max(r.x, 0)) * Math.max(0, Math.min(r.y + r.h, GH) - Math.max(r.y, 0)); return r.w * r.h > 0 && vis / (r.w * r.h) < 0.6; });
  if (out.length) add('high', `${out.length} عنصر طالع برا الشاشة`, 'جزء كبير منه ما بينشاف في اللعبة.', out.map(n => ({ op: 'set', target: n.id, props: { Position: [0.5, 0, 0.5, 0], AnchorPoint: [0.5, 0.5] } })), 'اسحبه لداخل الشاشة أو استخدم زر التوسيط.', out[0].id);

  // صور بدون ID
  const noImg = all.filter(n => CLASSES[n.cls].image && !imageId(n.props.Image) && !n.props._preview);
  if (noImg.length) add('medium', `${noImg.length} صورة بدون ID`, 'بتطلع فاضية في اللعبة. حط ID من التولبوكس أو صمّم أيقونة من تبويب الأيقونات 🎨.', [], 'حدد الصورة ← خانة Image ← حط الـ ID. أو استخدم مولد الأيقونات.', noImg[0].id);

  // TextBox بدون نص توضيحي
  const boxes = all.filter(n => n.cls === 'TextBox' && !n.props.PlaceholderText);
  if (boxes.length) add('low', 'مربع كتابة بدون نص توضيحي', 'PlaceholderText يقول للاعب وش يكتب.', boxes.map(b => ({ op: 'set', target: b.id, props: { PlaceholderText: 'اكتب هنا...' } })), 'عبّ PlaceholderText.', boxes[0].id);

  // ScrollingFrame
  all.filter(n => n.cls === 'ScrollingFrame').forEach(sf => {
    const m = modsOf(sf), kids = sf.children.filter(isGui);
    if (kids.length > 1 && !m.UIListLayout && !m.UIGridLayout) add('medium', `"${sf.name}" بدون ترتيب تلقائي`, 'UIListLayout يرتب العناصر داخل القائمة تلقائياً وما تحتاج تحركها يدوي.',
      [{ op: 'addMod', target: sf.id, class: 'UIListLayout', props: { Padding: [0, 8] } }, { op: 'set', target: sf.id, props: { AutomaticCanvasSize: 'Y', CanvasSize: [0, 0, 0, 0] } }], 'أضف UIListLayout داخل الـ ScrollingFrame.', sf.id);
    else if ((m.UIListLayout || m.UIGridLayout) && sf.props.AutomaticCanvasSize === 'None') add('medium', `"${sf.name}" التمرير ما يتمدد تلقائياً`, 'AutomaticCanvasSize = Y يخلي القائمة تطول حسب عدد العناصر.', [{ op: 'set', target: sf.id, props: { AutomaticCanvasSize: 'Y', CanvasSize: [0, 0, 0, 0] } }], 'غيّر AutomaticCanvasSize إلى Y.', sf.id);
  });

  // عناصر مخفية ما يفتحها شي
  const openers = new Set(); all.forEach(n => { const a = animOf(n); if (['toggle', 'open', 'tab'].includes(a.actionType)) openers.add(a.actionTarget); });
  const hiddenTop = top.filter(n => !n.props.Visible && !openers.has(n.name));
  hiddenTop.slice(0, 3).forEach((n, k) => add('medium', `"${n.name}" مخفي وما فيه زر يفتحه`, 'اللاعب ما بيقدر يوصل له أبداً.',
    [{ op: 'add', parent: R.id, node: { class: 'TextButton', name: 'Open' + n.name, props: { Size: [0, 140, 0, 46], Position: [0, 20, 0.5, k * 56], AnchorPoint: [0, 0.5], BackgroundColor3: '#6c5ce7', Text: nodeText(n).slice(0, 14) || n.name, TextSize: 18, TextColor3: '#ffffff' }, mods: { UICorner: { CornerRadius: [0, 12] } }, anim: { hoverOn: true, pressOn: true, actionType: 'toggle', actionTarget: n.name } } }],
    'أضف زر وخلّ إجراءه "إظهار/إخفاء عنصر" واكتب اسم العنصر.', n.id));

  // خطوط كثيرة
  const fonts = {}; texts.forEach(t => fonts[t.props.Font] = (fonts[t.props.Font] || 0) + 1);
  if (Object.keys(fonts).length > 3) { const main = Object.keys(fonts).sort((a, b) => fonts[b] - fonts[a])[0]; add('low', `${Object.keys(fonts).length} خطوط مختلفة`, 'خطين أو ثلاثة بالكثير يخلي التصميم متناسق.', texts.filter(t => !/Gotham|Builder/.test(t.props.Font) || true).filter(t => t.props.Font !== main && !['LuckiestGuy', 'Bangers', 'Creepster', 'FredokaOne'].includes(t.props.Font)).map(t => ({ op: 'set', target: t.id, props: { Font: main } })), 'وحّد الخط من الخصائص ← Font.'); }

  // أسماء افتراضية + مكررة
  const defaults = all.filter(n => n.name === n.cls);
  if (defaults.length > 2) add('low', `${defaults.length} عنصر باسم افتراضي`, 'أسماء واضحة (PlayButton بدل TextButton) تسهّل كتابة السكربتات بعدين.',
    defaults.map(n => { const t = (nodeText(n) || '').replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/).map(w => w[0] ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '').join('').slice(0, 20); const suf = n.cls.replace(/^Text|^Image/, '').replace('Label', 'Label'); return { op: 'rename', target: n.id, name: (t || ({ Frame: 'Panel', ScrollingFrame: 'List', CanvasGroup: 'Group' })[n.cls] || 'Item') + suf }; }), 'دبل كليك على العنصر في المستكشف وغيّر اسمه.');
  const dup = [];
  walkTree(R, n => { const seen = {}; (n.children || []).filter(isGui).forEach(c => { if (seen[c.name]) dup.push(c); seen[c.name] = 1; }); });
  if (dup.length) add('medium', `${dup.length} عنصر اسمه مكرر بنفس المكان`, 'الأسماء المكررة تخرب الإجراءات (فتح/إغلاق بالاسم) والسكربتات.', dup.map((n, k) => ({ op: 'rename', target: n.id, name: n.name + (k + 2) })), 'غيّر الأسماء المكررة.', dup[0].id);

  // أزرار متداخلة
  for (let i = 0; i < buttons.length && items.length < 40; i++) for (let j = i + 1; j < buttons.length; j++) {
    const a = buttons[i], b = buttons[j]; if (parentOf(a.id) !== parentOf(b.id)) continue;
    const ra = (S.map.get(a.id) || {}), rb = (S.map.get(b.id) || {}); if (!ra.el || !rb.el) continue;
    const ix = Math.max(0, Math.min(ra.x + ra.w, rb.x + rb.w) - Math.max(ra.x, rb.x)), iy = Math.max(0, Math.min(ra.y + ra.h, rb.y + rb.h) - Math.max(ra.y, rb.y));
    if (ix * iy > 0.3 * Math.min(ra.w * ra.h, rb.w * rb.h)) { add('medium', `"${a.name}" و "${b.name}" فوق بعض`, 'الأزرار المتداخلة تخلي اللاعب يضغط الزر الغلط.', [], 'اسحب واحد منهم لمكان ثاني أو استخدم UIListLayout.', b.id); i = buttons.length; break; }
  }
  if (R.props.ResetOnSpawn) add('low', 'ResetOnSpawn مفعّل', 'الواجهة بترجع لحالتها الأولى كل ما يموت اللاعب — غالباً ما تبي هذا.', [{ op: 'set', target: R.id, props: { ResetOnSpawn: false } }], 'حدد الـ ScreenGui وطفّ ResetOnSpawn.');
  const order = { high: 0, medium: 1, low: 2 };
  return items.sort((a, b) => order[a.sev] - order[b.sev]);
}
function reviewScore(items) { return Math.max(5, 100 - items.reduce((s, i) => s + ({ high: 14, medium: 7, low: 3 }[i.sev] || 5), 0)); }

/* ===================== تطبيق التعديلات ===================== */
function aiResolve(t, refs) {
  if (!t) return null;
  if (findNode(t)) return findNode(t);
  if (refs && refs[t]) return findNode(refs[t]);
  const s = String(t).replace(/^["']|["']$/g, '');
  if (/^screengui$|^root$/i.test(s) || s === root().name) return root();
  let f = null; walkTree(root(), n => { if (!f && n.name === s) f = n; }); return f;
}
function applyOps(ops, refs) {
  let ok = 0;
  (ops || []).forEach(o => {
    try {
      const op = String(o.op || o.type || '').toLowerCase();
      if (op === 'template') { const t = TEMPLATES.find(x => x.n === o.name) || TEMPLATES[6]; root().children.push(reId(t.f())); ok++; return; }
      if (op === 'add') {
        let par = aiResolve(o.parent, refs) || root();
        if (!isGui(par) && par.cls !== 'ScreenGui') par = parentOf(par.id) || root();
        const n = aiNode(o.node || o.element); if (!n) return;
        if (isMod(n)) { if (isGui(par) && !par.children.some(c => c.cls === n.cls)) par.children.push(n); else return; }
        else par.children.push(n);
        par.open = true; ok++; return;
      }
      const n = aiResolve(o.target, refs); if (!n) return;
      if (op === 'set') { aiSetProps(n, o.props); ok++; }
      else if (op === 'anim' && isGui(n)) { n.anim = Object.assign(n.anim || {}, aiAnim(o.anim)); ok++; }
      else if (op === 'addmod' && isGui(n)) {
        const cls = Object.keys(CLASSES).find(c => c.toLowerCase() === String(o.class || o.cls).toLowerCase());
        if (!cls || !isMod({ cls })) return;
        let m = n.children.find(c => c.cls === cls);
        if (!m) { if (CLASSES[cls].layout && n.children.some(c => CLASSES[c.cls].layout)) return; m = mk(cls, cls); n.children.push(m); }
        aiSetProps(m, o.props); ok++;
      }
      else if (op === 'rename') { const nm = aiName(o.name); if (nm) { n.name = nm; ok++; } }
      else if (op === 'remove' && n !== root()) { const p = parentOf(n.id); p.children.splice(p.children.indexOf(n), 1); ok++; }
    } catch (e) { console.warn('op failed', o, e); }
  });
  if (ok) changed(true);
  return ok;
}

/* ===================== التوليد المحلي (بدون إنترنت) ===================== */
const TPL_WORDS = [
  [/متجر|shop|store|بيع|شراء/i, 'نافذة متجر'], [/إعداد|اعداد|setting/i, 'لوحة إعدادات'], [/قائمة رئيسية|رئيسي|main ?menu|start|بداية/i, 'القائمة الرئيسية'],
  [/صحة|دم|health|hp/i, 'شريط الصحة'], [/تحميل|loading|load/i, 'شاشة تحميل'], [/إشعار|اشعار|notif/i, 'إشعار منبثق'], [/عمل(ة|ات)|coins?|فلوس|gems?/i, 'عداد العملات'],
  [/فوز|victory|win/i, 'شاشة الفوز'], [/خسار|game ?over|lose|موت/i, 'شاشة الخسارة'], [/يومي|daily/i, 'المكافأة اليومية'], [/متصدر|leader|ترتيب|rank/i, 'لوحة المتصدرين'],
  [/كود|code|redeem/i, 'إدخال كود'], [/تبويب|tabs?/i, 'تبويبات تعمل'], [/حوار|npc|dialog|كلام/i, 'حوار NPC'], [/مستوى|xp|level|خبرة/i, 'شريط المستوى XP'],
  [/مؤقت|وقت|timer|countdown/i, 'مؤقت'], [/مهام|مهمة|quest|mission/i, 'متتبع المهام'], [/hotbar|أدوات|ادوات|inventory|حقيبة/i, 'شريط الأدوات Hotbar'], [/جانبي|side/i, 'قائمة جانبية'],
  [/gamepass|vip|باس/i, 'بطاقة Gamepass'], [/تأكيد|تاكيد|confirm/i, 'نافذة تأكيد'], [/ملف|profile|بروفايل/i, 'بطاقة ملف شخصي'], [/toggle|مفتاح/i, 'مفتاح تشغيل'],
  [/صفحات|carousel|pages/i, 'صفحات بأسهم'], [/نقر|clicker|كليكر/i, 'عداد النقرات'], [/منسدل|dropdown/i, 'زر قائمة منسدلة'], [/إعلان|اعلان|banner/i, 'إعلان علوي'], [/مكافأة|مكافاة|reward/i, 'نافذة مكافأة']
];
const HUE_WORDS = [[/أحمر|احمر|red/i, 350], [/برتقالي|orange/i, 28], [/أصفر|اصفر|ذهبي|yellow|gold/i, 48], [/أخضر|اخضر|green/i, 150], [/أزرق|ازرق|blue/i, 210], [/سماوي|cyan/i, 188], [/بنفسجي|موف|purple|violet/i, 262], [/وردي|زهري|pink/i, 330]];
function rgbToHsl([r, g, b]) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function hslHex(h, s, l) { const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return rgbHex([f(0) * 255, f(8) * 255, f(4) * 255]); }
function recolorTree(node, hue) {
  const shift = c => { if (typeof c !== 'string' || !/^#[0-9a-f]{6}$/i.test(c)) return c; const [, s, l] = rgbToHsl(hexRgb(c)); return s > 0.35 && l > 0.15 && l < 0.9 ? hslHex(hue + (Math.random() * 16 - 8), s, l) : c; };
  walkTree(node, n => {
    Object.keys(n.props).forEach(k => { if (/Color3?$/.test(k) && k !== 'TextColor3' || k === 'Color' && typeof n.props[k] === 'string') n.props[k] = shift(n.props[k]); if (k === 'Color' && Array.isArray(n.props[k])) n.props[k] = n.props[k].map(kp => ({ t: kp.t, c: shift(kp.c) })); });
    if (n.anim) ['hoverColor', 'pressColor', 'activeColor', 'hoverStrokeColor'].forEach(k => { if (n.anim[k]) n.anim[k] = shift(n.anim[k]); });
  });
}
function localGenerate(prompt) {
  const found = []; TPL_WORDS.forEach(([re, name]) => { if (re.test(prompt) && !found.includes(name)) found.push(name); });
  const hue = (HUE_WORDS.find(([re]) => re.test(prompt)) || [])[1];
  const nodes = found.slice(0, 4).map(n => reId(TEMPLATES.find(t => t.n === n).f()));
  if (!nodes.length) {
    const title = prompt.replace(/صمم|سوي|ابي|أبي|لي|واجهة|نافذة|gui/gi, '').trim().slice(0, 24) || 'MY WINDOW';
    nodes.push(aiNode({
      class: 'Frame', name: 'MainWindow', props: { Size: [0, 420, 0, 300], Position: [0.5, 0, 0.5, 0], AnchorPoint: [0.5, 0.5], BackgroundColor3: '#171826' },
      mods: { UICorner: { CornerRadius: [0, 18] }, UIStroke: { Color: '#8b7bff', Thickness: 2, Transparency: 0.4 } }, anim: { enterType: 'pop', exitType: 'shrink' },
      children: [
        { class: 'TextLabel', name: 'Title', props: { Size: [1, -80, 0, 50], Position: [0.5, 0, 0, 12], AnchorPoint: [0.5, 0], BackgroundTransparency: 1, Text: title, TextSize: 26, Font: 'GothamBlack', TextColor3: '#ffffff' } },
        { class: 'TextButton', name: 'CloseButton', props: { Size: [0, 38, 0, 38], Position: [1, -12, 0, 12], AnchorPoint: [1, 0], BackgroundColor3: '#ff4d6d', Text: '✕', TextSize: 20, TextColor3: '#ffffff' }, mods: { UICorner: { CornerRadius: [0, 10] } }, anim: { hoverOn: true, hoverRotate: 90, pressOn: true, actionType: 'close', actionTarget: 'MainWindow' } },
        { class: 'TextButton', name: 'ActionButton', props: { Size: [0, 220, 0, 56], Position: [0.5, 0, 1, -24], AnchorPoint: [0.5, 1], BackgroundColor3: '#6c5ce7', Text: 'START', TextSize: 22, TextColor3: '#ffffff' }, mods: { UICorner: { CornerRadius: [0, 14] } }, anim: { hoverOn: true, pressOn: true, clickFx: 'confetti' } }
      ]
    }));
  }
  // أكثر من نافذة بالمنتصف: الأولى ظاهرة والباقي مخفية مع أزرار تفتحها
  const centered = nodes.filter(n => n.props.Position.xs === 0.5 && n.props.Position.ys === 0.5 && n.props.Size.xs < 0.99);
  centered.slice(1).forEach((n, k) => {
    n.props.Visible = false;
    nodes.push(aiNode({ class: 'TextButton', name: 'Open' + n.name, props: { Size: [0, 150, 0, 46], Position: [0, 20, 0.35, k * 56], BackgroundColor3: '#6c5ce7', Text: n.name.replace(/Frame|Window|Screen/g, ''), TextSize: 17, TextColor3: '#ffffff' }, mods: { UICorner: { CornerRadius: [0, 12] } }, anim: { hoverOn: true, pressOn: true, actionType: 'toggle', actionTarget: n.name, clickFx: 'ripple', fxColors: ['#ffffff'] } }));
  });
  if (hue != null) nodes.forEach(n => recolorTree(n, hue));
  return { elements: nodes, note: found.length ? '📴 تم التصميم محلياً من القوالب: ' + found.slice(0, 4).join('، ') : '📴 ما فهمت الطلب محلياً — سويت لك نافذة أساسية. فعّل ذكاء حقيقي من ⚙ لنتائج أفضل.' };
}

/* ===================== الأيقونات ===================== */
const ICON_WORDS = [
  [/سيف|sword|قتال|attack/i, '⚔'], [/درع|shield|دفاع/i, '🛡'], [/نار|fire|لهب/i, '🔥'], [/ماء|water|قطرة/i, '💧'], [/قلب|heart|حياة|love/i, '❤'], [/نجم|star/i, '⭐'],
  [/متجر|shop|store|سلة/i, '🛒'], [/إعداد|اعداد|setting|ترس/i, '⚙'], [/بيت|منزل|home/i, '🏠'], [/كأس|trophy|فوز|بطولة/i, '🏆'], [/هدي|gift|مكافأ/i, '🎁'],
  [/عمل|coin|فلوس/i, '🪙'], [/ألماس|الماس|diamond|gem|جوهر/i, '💎'], [/برق|صاعق|طاقة|lightning|energy|speed|سرعة/i, '⚡'], [/تاج|crown|vip|ملك/i, '👑'],
  [/قفل|lock/i, '🔒'], [/جمجم|skull|موت/i, '💀'], [/قوس|سهم|bow|arrow/i, '🏹'], [/جرعة|potion|سحر/i, '🧪'], [/كتاب|مهام|quest|book/i, '📜'], [/حقيب|bag|inventory/i, '🎒'],
  [/خريط|map/i, '🗺'], [/صوت|sound|music|موسيق/i, '🎵'], [/رسال|chat|message/i, '💬'], [/صديق|friends?|أصدقاء/i, '👥'], [/صاروخ|rocket|boost/i, '🚀'], [/ساعة|وقت|time|timer/i, '⏱'],
  [/قمر|ليل|moon|night/i, '🌙'], [/شمس|sun/i, '☀'], [/ثلج|snow|ice/i, '❄'], [/حيوان|pet|كلب|dog/i, '🐶'], [/قط|cat/i, '🐱'], [/تنين|dragon/i, '🐉'], [/فطر|mushroom/i, '🍄'],
  [/أكل|اكل|food|burger/i, '🍔'], [/مطرق|hammer|build|بناء/i, '🔨'], [/مفتاح|key/i, '🔑'], [/قنبل|bomb/i, '💣'], [/عين|eye|view/i, '👁'], [/مستخدم|لاعب|player|user/i, '👤'],
  [/إغلاق|اغلاق|close|خروج/i, '✖'], [/play|تشغيل|ابدأ|ابدا/i, '▶'], [/زائد|plus|add/i, '➕'], [/سحب|spin|عجلة|wheel/i, '🎡'], [/صندوق|crate|box|chest/i, '📦'], [/كرة|ball/i, '⚽']
];
const ICON_STYLES = { circle: '⚪ دائري متدرج', square: '🟪 مربع ناعم', neon: '💡 نيون', gold: '🥇 ذهبي فاخر', glass: '🧊 زجاجي', diamond: '🔷 معيّن (Badge)' };
const ICON_EFFECTS = { none: 'بدون', glow: 'توهج', spin: 'دوران الأيقونة', float: 'طفو', pulse: 'نبض قلب', shine: 'لمعة متكررة', rainbow: 'حدود قوس قزح', bounce: 'نطنطة', swing: 'تأرجح' };
function pickEmoji(desc) { const e = desc.match(/\p{Extended_Pictographic}/u); if (e) return e[0]; const f = ICON_WORDS.find(([re]) => re.test(desc)); return f ? f[1] : '✦'; }
function buildIconNode({ emoji, style, c1, c2, effect, name }) {
  const S0 = 96, txt = { class: 'TextLabel', name: 'Glyph', props: { Size: [0.62, 0, 0.62, 0], Position: [0.5, 0, 0.5, 0], AnchorPoint: [0.5, 0.5], BackgroundTransparency: 1, Text: emoji, TextScaled: true, Font: 'GothamBlack', TextColor3: style === 'neon' ? c1 : '#ffffff', ZIndex: 3 }, anim: {} };
  const node = { class: 'TextButton', name: name || 'IconButton', props: { Size: [0, S0, 0, S0], Position: [0.5, 0, 0.5, 0], AnchorPoint: [0.5, 0.5], Text: '', BackgroundColor3: '#ffffff', AutoButtonColor: false }, mods: {}, anim: { hoverOn: true, hoverScale: 1.1, pressOn: true, pressScale: 0.9, clickMotion: 'pop' }, children: [] };
  const corner = style === 'circle' || style === 'gold' ? [1, 0] : [0, 24];
  if (style === 'circle' || style === 'square') { node.mods = { UICorner: { CornerRadius: corner }, UIGradient: { Color: [c1, c2], Rotation: 45 }, UIStroke: { Color: '#ffffff', Thickness: 3, Transparency: 0.35 } }; }
  else if (style === 'gold') { node.mods = { UICorner: { CornerRadius: [1, 0] }, UIGradient: { Color: ['#fff3b0', '#ffd60a', '#ff9f1c'], Rotation: 60 }, UIStroke: { Color: '#fff3b0', Thickness: 4 } }; node.children.push({ class: 'Frame', name: 'Inner', props: { Size: [0.78, 0, 0.78, 0], Position: [0.5, 0, 0.5, 0], AnchorPoint: [0.5, 0.5], BackgroundColor3: c1, ZIndex: 2 }, mods: { UICorner: { CornerRadius: [1, 0] }, UIGradient: { Color: [c1, c2], Rotation: 120 } } }); }
  else if (style === 'neon') { node.props.BackgroundColor3 = '#0b0c14'; node.props.BackgroundTransparency = 0.1; node.mods = { UICorner: { CornerRadius: [0, 22] }, UIStroke: { Color: c1, Thickness: 3 } }; txt.mods = { UIStroke: { Color: c2, Thickness: 1.5, Transparency: 0.3, ApplyStrokeMode: 'Contextual' } }; if (effect === 'none') node.anim.idleType = 'glow'; }
  else if (style === 'glass') { node.props.BackgroundTransparency = 0.55; node.props.BackgroundColor3 = c1; node.mods = { UICorner: { CornerRadius: [0, 26] }, UIStroke: { Color: '#ffffff', Thickness: 2, Transparency: 0.3 }, UIGradient: { Color: ['#ffffff', c1], Transparency: [0.2, 0.7], Rotation: 90 } }; }
  else if (style === 'diamond') { node.props.BackgroundTransparency = 1; node.children.push({ class: 'Frame', name: 'Badge', props: { Size: [0.72, 0, 0.72, 0], Position: [0.5, 0, 0.5, 0], AnchorPoint: [0.5, 0.5], Rotation: 45, BackgroundColor3: '#ffffff', ZIndex: 2 }, mods: { UICorner: { CornerRadius: [0, 14] }, UIGradient: { Color: [c1, c2], Rotation: 45 }, UIStroke: { Color: '#ffffff', Thickness: 3, Transparency: 0.2 } } }); }
  const fx = { glow: { idleType: 'glow' }, rainbow: { idleType: 'strokeRainbow' }, shine: { idleType: 'shine' }, float: { idleType: 'float' }, pulse: { idleType: 'heartbeat' }, bounce: { idleType: 'bounce' } }[effect];
  if (fx) Object.assign(node.anim, fx);
  if (effect === 'spin') txt.anim.idleType = 'spin';
  if (effect === 'swing') txt.anim.idleType = 'swing';
  if ((effect === 'glow' || effect === 'rainbow') && !node.mods.UIStroke) node.mods.UIStroke = { Color: c1, Thickness: 2 };
  node.children.push(txt);
  return aiNode(node);
}
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
function drawIconPNG({ emoji, style, c1, c2, glow = true }, size = 512) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d'), m = size * 0.09, s = size - m * 2, cx = size / 2;
  const shape = () => {
    g.beginPath();
    if (style === 'circle' || style === 'gold') g.arc(cx, cx, s / 2, 0, Math.PI * 2);
    else if (style === 'diamond') { g.moveTo(cx, m); g.lineTo(size - m, cx); g.lineTo(cx, size - m); g.lineTo(m, cx); g.closePath(); }
    else { const r = s * 0.24; g.roundRect ? g.roundRect(m, m, s, s, r) : g.rect(m, m, s, s); }
  };
  const gold = style === 'gold';
  const gr = g.createLinearGradient(m, m, size - m, size - m);
  if (style === 'neon') { gr.addColorStop(0, '#12131f'); gr.addColorStop(1, '#0a0b12'); }
  else if (style === 'glass') { gr.addColorStop(0, c1 + 'cc'); gr.addColorStop(1, c2 + '88'); }
  else { gr.addColorStop(0, gold ? '#fff3b0' : c1); gr.addColorStop(gold ? 0.5 : 1, gold ? '#ffd60a' : c2); if (gold) gr.addColorStop(1, '#ff9f1c'); }
  if (glow) { g.save(); g.shadowColor = style === 'neon' ? c1 : c1 + 'aa'; g.shadowBlur = size * 0.07; shape(); g.fillStyle = gr; g.fill(); g.restore(); }
  shape(); g.fillStyle = gr; g.fill();
  if (gold) { g.beginPath(); g.arc(cx, cx, s * 0.39, 0, Math.PI * 2); const ig = g.createLinearGradient(0, 0, size, size); ig.addColorStop(0, c1); ig.addColorStop(1, c2); g.fillStyle = ig; g.fill(); }
  g.save(); shape(); g.clip();
  const hl = g.createLinearGradient(0, m, 0, cx); hl.addColorStop(0, 'rgba(255,255,255,.35)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hl; g.fillRect(0, 0, size, cx); g.restore();
  shape(); g.lineWidth = size * (style === 'neon' ? 0.035 : 0.028); g.strokeStyle = style === 'neon' ? c1 : gold ? '#fff3b0' : 'rgba(255,255,255,.75)';
  if (style === 'neon') { g.shadowColor = c1; g.shadowBlur = size * 0.05; }
  g.stroke(); g.shadowBlur = 0;
  g.font = `${Math.round(size * 0.5)}px ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = size * 0.04; g.shadowOffsetY = size * 0.02;
  g.fillStyle = style === 'neon' ? c1 : '#ffffff';
  g.fillText(emoji, cx, cx + size * 0.03);
  return cv.toDataURL('image/png');
}
function sanitizeSvg(txt) {
  const m = String(txt).match(/<svg[\s\S]*<\/svg>/i); if (!m) throw new Error('الذكاء ما رجع SVG');
  const doc = new DOMParser().parseFromString(m[0], 'image/svg+xml');
  if (doc.querySelector('parsererror')) throw new Error('الـ SVG فيه خطأ');
  doc.querySelectorAll('script,foreignObject,iframe,image,use[href^="http"]').forEach(e => e.remove());
  doc.querySelectorAll('*').forEach(e => [...e.attributes].forEach(a => { if (/^on/i.test(a.name) || (/href$/i.test(a.name) && !/^#/.test(a.value))) e.removeAttribute(a.name); }));
  const svg = doc.documentElement; if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', '0 0 512 512');
  svg.setAttribute('width', 512); svg.setAttribute('height', 512); svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return new XMLSerializer().serializeToString(svg);
}
function svgToPNG(svg, size = 512) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { const cv = document.createElement('canvas'); cv.width = cv.height = size; cv.getContext('2d').drawImage(img, 0, 0, size, size); res(cv.toDataURL('image/png')); };
    img.onerror = () => rej(new Error('تعذر رسم الـ SVG'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

/* ===================== نافذة الذكاء ===================== */
const AIUI = { tab: 'review', review: null, gen: null };
function aiBusy(btn, on, label) { if (!btn) return; btn.disabled = on; if (on) { btn.dataset.l = btn.innerHTML; btn.innerHTML = '<span class="spin"></span> ' + (label || 'جاري التفكير...'); } else if (btn.dataset.l) btn.innerHTML = btn.dataset.l; }
function previewNodes(nodes, host, W = 800, H = 450) {
  host.innerHTML = '';
  const inner = h('div', { class: 'tpl-host', style: { width: W + 'px', height: H + 'px' } });
  host.appendChild(inner);
  renderGui({ id: 'pv', cls: 'ScreenGui', props: defaultProps('ScreenGui'), children: nodes }, inner, { w: W, h: H, play: true });
  requestAnimationFrame(() => { const sc = (host.clientWidth || 300) / W; inner.style.transform = `scale(${sc})`; host.style.height = H * sc + 'px'; });
}
function openAI(tab) {
  if (S.play) togglePlay(false);
  AIUI.tab = tab || AIUI.tab;
  const body = h('div', { class: 'ai' });
  const tabs = h('div', { class: 'ai-tabs' });
  const pane = h('div', { class: 'ai-pane' });
  const T = { review: '🔍 وش الناقص؟', generate: '✨ صمّم لي', icons: '🎨 أيقونات', settings: '⚙ الإعدادات' };
  const draw = () => {
    tabs.innerHTML = '';
    Object.keys(T).forEach(k => tabs.appendChild(h('button', { class: AIUI.tab === k ? 'on' : '', onclick: () => { AIUI.tab = k; draw(); } }, T[k])));
    pane.innerHTML = '';
    ({ review: aiReviewPane, generate: aiGeneratePane, icons: aiIconsPane, settings: aiSettingsPane })[AIUI.tab](pane, draw);
  };
  body.append(h('div', { class: 'ai-provider' }, h('span', {}, '🤖 '), h('b', {}, AI.providerName()), h('button', { class: 'mini', onclick: () => { AIUI.tab = 'settings'; draw(); } }, 'تغيير')), tabs, pane);
  draw();
  openModal('🤖 مساعد الذكاء الاصطناعي', body, [], 'wide ai-modal');
}

/* ---- تبويب المراجعة ---- */
function aiReviewPane(pane, redraw) {
  const run = h('button', { class: 'btn primary big' }, '🔍 حلّل تصميمي وقلّي وش الناقص');
  const list = h('div', { class: 'rv-list' });
  const head = h('div', { class: 'rv-head' });
  pane.append(h('p', { class: 'ai-intro' }, 'خلّصت تصميمك؟ الذكاء يفحصه ويقولك وش الناقص (إغلاق، تجاوب مع الجوال، ألوان، أنميشنات...). كل ملاحظة تقدر تخليه يضيفها لك تلقائياً ✨ أو تضيفها بنفسك ✋.'), run, head, list);
  const drawList = () => {
    const r = AIUI.review; list.innerHTML = ''; head.innerHTML = '';
    if (!r) return;
    const left = r.items.filter(i => !i.done);
    const sc = r.score;
    head.append(
      h('div', { class: 'score', style: { '--p': sc, '--c': sc >= 80 ? '#06d6a0' : sc >= 55 ? '#ffd166' : '#ff4d6d' } }, h('b', {}, String(sc)), h('small', {}, '/100')),
      h('div', { class: 'rv-sum' }, h('b', {}, sc >= 85 ? '🔥 تصميم ممتاز!' : sc >= 60 ? '👍 تصميم جيد — فيه شوية تحسينات' : '🛠 التصميم يحتاج شغل'), h('p', {}, r.summary || `${left.length} ملاحظة`), r.aiError ? h('small', { class: 'err' }, '⚠ ' + r.aiError) : null),
      left.some(i => i.ops.length) ? h('button', { class: 'btn primary', onclick: () => { let n = 0; left.forEach(i => { if (i.ops.length) { n += applyOps(i.ops, r.refs) ? 1 : 0; i.done = true; } }); toast(`✨ تم تطبيق ${n} تحسين`, 1800, 'ok'); drawList(); } }, '✨ أضف الكل تلقائياً') : null);
    if (!r.items.length) list.appendChild(h('div', { class: 'empty big' }, '🎉 ما لقيت شي ناقص! تصميمك جاهز للتصدير.'));
    r.items.forEach(it => {
      const card = h('div', { class: 'rv-item sev-' + it.sev + (it.done ? ' done' : '') },
        h('div', { class: 'rv-top' }, h('span', { class: 'sev' }, { high: 'مهم', medium: 'متوسط', low: 'تحسين' }[it.sev] || it.sev), h('b', {}, it.title), h('small', { class: 'src' }, it.src === 'ai' ? '🤖 AI' : '⚡ فحص سريع')),
        h('p', {}, it.why),
        it.done ? h('div', { class: 'rv-done' }, '✔ تم') : h('div', { class: 'rv-acts' },
          it.ops.length ? h('button', { class: 'btn sm primary', onclick: () => { const n = applyOps(it.ops, r.refs); it.done = true; toast(n ? '✨ تمت الإضافة' : '⚠ ما قدرت أطبقها — جرب يدوي', 1500, n ? 'ok' : 'warn'); drawList(); } }, '✨ الذكاء يضيفها') : null,
          h('button', {
            class: 'btn sm', onclick: () => {
              closeModal(); const tId = it.target && (findNode(it.target) ? it.target : (r.refs && r.refs[it.target]));
              if (tId && findNode(tId)) { select(tId, true); setTab('right', /أنميشن|الأنميشن/.test(it.manual || '') ? 'anim' : 'props'); if (innerWidth < 900) setMobilePanel('props'); }
              toast('✋ ' + (it.manual || it.why), 6000);
            }
          }, '✋ أضيفها بنفسي'),
          /صورة|ID/.test(it.title) ? h('button', { class: 'btn sm', onclick: () => { AIUI.tab = 'icons'; redraw(); } }, '🎨 صمّم أيقونة') : null,
          h('button', { class: 'btn sm ghost', onclick: () => { it.done = true; drawList(); } }, 'تجاهل')));
      list.appendChild(card);
    });
  };
  run.onclick = async () => {
    const items = localReview();
    AIUI.review = { items, score: reviewScore(items), summary: `الفحص السريع لقى ${items.length} ملاحظة.`, refs: {} };
    drawList();
    if (AI.isLocal() || !root().children.length) return;
    aiBusy(run, true, 'الذكاء يراجع تصميمك...');
    try {
      const { text, refs } = designSummary();
      const sys = `You are a senior Roblox UI/UX designer reviewing a ScreenGui. Reply with ONLY JSON, no prose.
Format: {"score":0-100,"summary":"1-2 sentences in Arabic (Gulf dialect friendly)","items":[{"title":"short Arabic","why":"Arabic explanation","severity":"high|medium|low","target":"rN or null","manual":"Arabic steps to do it manually in the editor","ops":[...]}]}
Give at most 7 NEW items focused on what is MISSING or could be much better: UX flow (how player opens/closes things), visual hierarchy, consistency, missing feedback, missing elements a game GUI like this usually needs, mobile usability, polish (animations/effects).
Do NOT repeat these issues already found: ${items.map(i => i.title).join(' | ') || 'none'}.
Ops (auto-fix actions), target/parent use refs like "r3" or "ScreenGui":
{"op":"set","target":"r3","props":{...}} | {"op":"anim","target":"r3","anim":{...}} | {"op":"addMod","target":"r3","class":"UIStroke","props":{...}} | {"op":"add","parent":"r2","node":{NODE}} | {"op":"rename","target":"r3","name":"PlayButton"}
${AI_NODE_FORMAT}
${aiSchemaDoc()}`;
      const ans = AI.parseJSON(await AI.ask(sys, 'Current design:\n' + text));
      const ai = (ans.items || []).slice(0, 8).map(i => ({ sev: ['high', 'medium', 'low'].includes(i.severity) ? i.severity : 'medium', title: String(i.title || '').slice(0, 90), why: String(i.why || ''), manual: String(i.manual || ''), target: i.target, ops: Array.isArray(i.ops) ? i.ops : [], src: 'ai' })).filter(i => i.title);
      AIUI.review.items = items.concat(ai);
      AIUI.review.refs = refs;
      AIUI.review.score = Math.round(((+ans.score || reviewScore(items)) + reviewScore(AIUI.review.items)) / 2);
      if (ans.summary) AIUI.review.summary = String(ans.summary);
    } catch (e) { AIUI.review.aiError = 'ما قدر الذكاء يراجع: ' + e.message + ' — النتائج اللي فوق من الفحص السريع.'; }
    aiBusy(run, false); drawList();
  };
  drawList();
}

/* ---- تبويب صمّم لي ---- */
function aiGeneratePane(pane) {
  const ta = h('textarea', { class: 'ai-prompt', rows: 4, placeholder: 'اكتب الواجهة اللي تبيها بالتفصيل... مثال: متجر أسلحة بنفسجي فيه 6 أسلحة بأسعار وزر إغلاق، وزر يفتحه في يسار الشاشة' });
  ta.value = Store.get('rogui_ai_prompt', '');
  ta.addEventListener('input', () => Store.set('rogui_ai_prompt', ta.value));
  const ex = ['متجر أسلحة بنفسجي فيه 6 منتجات', 'قائمة رئيسية لعبة رعب بأزرار حمراء', 'شاشة إعدادات فيها مفاتيح تشغيل للصوت والموسيقى', 'HUD فيه صحة وطاقة وعملات', 'نافذة مكافأة يومية ذهبية', 'شاشة فوز مع نجوم وطراطيع', 'لوحة متصدرين زرقاء', 'نافذة شراء VIP Gamepass'];
  const style = h('select', {}, ...Object.entries({ auto: '🎨 ستايل: تلقائي', dark: '🌑 داكن حديث', light: '☀ فاتح', neon: '💡 نيون', cartoon: '🧸 كرتوني ملون', minimal: '◻ بسيط', luxury: '👑 فاخر ذهبي' }).map(([k, v]) => h('option', { value: k }, v)));
  const mode = h('select', {}, h('option', { value: 'add' }, '➕ أضف للتصميم الحالي'), h('option', { value: 'replace' }, '♻ استبدل التصميم كامل'));
  const go = h('button', { class: 'btn primary big' }, '🚀 صمّم');
  const out = h('div', { class: 'gen-out' });
  pane.append(h('p', { class: 'ai-intro' }, 'اكتب وصف الواجهة اللي تبيها والذكاء يبنيها كاملة: العناصر، الألوان، الزوايا، الأنميشنات، وأزرار الفتح والإغلاق.'), ta,
    h('div', { class: 'chips' }, ex.map(e => h('button', { class: 'chip', onclick: () => { ta.value = e; Store.set('rogui_ai_prompt', e); } }, e))),
    h('div', { class: 'gen-opts' }, style, mode), go, out);
  const showResult = (res) => {
    out.innerHTML = '';
    const prev = h('div', { class: 'gen-prev' });
    out.append(h('div', { class: 'gen-note' }, res.note || `✅ جاهز — ${res.elements.reduce((s, n) => s + countNodes(n), 0)} عنصر`), prev,
      h('div', { class: 'rv-acts' },
        h('button', { class: 'btn primary', onclick: () => { if (mode.value === 'replace') root().children = []; res.elements.forEach(n => root().children.push(reId(clone(n)))); S.sel = res.elements.length === 1 ? null : S.sel; changed(true); closeModal(); toast('✨ تمت إضافة التصميم — جرّبه بزر ▶', 2500, 'ok'); } }, mode.value === 'replace' ? '♻ استبدل وطبّق' : '✅ أضفه للتصميم'),
        h('button', { class: 'btn', onclick: () => go.click() }, '🔁 جرب تصميم ثاني')));
    previewNodes(res.elements, prev, ...screenSize().w > screenSize().h ? [960, 540] : [390, 844]);
  };
  go.onclick = async () => {
    const prompt = ta.value.trim(); if (!prompt) return toast('اكتب وصف الواجهة أول');
    if (AI.isLocal()) return showResult(localGenerate(prompt));
    aiBusy(go, true, 'الذكاء يصمم واجهتك... (ممكن ياخذ دقيقة)');
    try {
      const { w, h: H } = screenSize();
      const sys = `You are an expert Roblox GUI designer. Build a complete, polished, game-ready ScreenGui from the user's request.
Reply with ONLY JSON: {"elements":[NODE,...]} (top-level elements placed inside the ScreenGui; usually 1-4).
Design rules: target screen ${w}x${H - guiInset()}. Main windows: Scale-based Size or Offset with UIAspectRatioConstraint, AnchorPoint [0.5,0.5] at [0.5,0,0.5,0]. Use UICorner on almost everything, UIStroke for borders, UIGradient for buttons/headers, UIPadding and UIListLayout/UIGridLayout for lists. Consistent palette (3-4 colors), clear hierarchy, big readable text (Gotham/GothamBold/GothamBlack or a themed font), buttons at least 44px tall.
Make it alive: buttons get anim hover/press + a clickFx, windows get enterType + exitType, important things get idle effects. If a window starts hidden (Visible false), add an opener button (actionType "toggle"). Every window gets a close button. Use realistic sample content (names, prices, numbers). Text language: same as the user's request.
Style preference: ${style.value}.
${AI_NODE_FORMAT}
${aiSchemaDoc()}`;
      const ans = AI.parseJSON(await AI.ask(sys, prompt, 12000));
      const arr = Array.isArray(ans) ? ans : (ans.elements || ans.children || (ans.class ? [ans] : []));
      const els = arr.map(o => aiNode(o)).filter(n => n && isGui(n));
      if (!els.length) throw new Error('الذكاء ما رجع عناصر');
      showResult({ elements: els });
    } catch (e) {
      const fb = localGenerate(prompt);
      fb.note = '⚠ ' + e.message + ' — هذا تصميم من الذكاء المحلي بدلاً منه:';
      showResult(fb);
    }
    aiBusy(go, false);
  };
}

/* ---- تبويب الأيقونات ---- */
function aiIconsPane(pane) {
  const st = Object.assign({ desc: 'سيف ناري', style: 'circle', effect: 'glow', c1: '#ff5d8f', c2: '#7f5cff' }, Store.get('rogui_ai_icon', {}));
  const saveSt = () => Store.set('rogui_ai_icon', st);
  const desc = h('input', { type: 'text', class: 'ai-prompt', value: st.desc, placeholder: 'وش الأيقونة؟ مثال: متجر، سيف ناري، جوهرة زرقاء، إعدادات...' });
  desc.value = st.desc;
  desc.addEventListener('input', () => { st.desc = desc.value; saveSt(); });
  const selEl = (obj, k) => { const s = h('select', {}, ...Object.entries(obj).map(([v, l]) => h('option', { value: v }, l))); s.value = st[k]; s.onchange = () => { st[k] = s.value; saveSt(); }; return s; };
  const col = k => { const c = h('input', { type: 'color', value: st[k] }); c.oninput = () => { st[k] = c.value; saveSt(); }; return c; };
  const palettes = [['#ff5d8f', '#7f5cff'], ['#ff9f1c', '#ff4d6d'], ['#06d6a0', '#1b9aaa'], ['#4cc9f0', '#4361ee'], ['#ffd60a', '#ff9f1c'], ['#9b5de5', '#f15bb5'], ['#232526', '#414345']];
  const out = h('div', { class: 'icon-out' });
  const bGui = h('button', { class: 'btn primary' }, '🧩 أيقونة GUI بتأثير (تشتغل مباشرة)');
  const bPng = h('button', { class: 'btn' }, '🖼 صورة PNG (ترفعها على روبلوكس)');
  const bAiImg = h('button', { class: 'btn' }, '🌸 صورة بالذكاء (Pollinations)');
  pane.append(h('p', { class: 'ai-intro' }, 'صمّم أيقونات لأزرارك: إما أيقونة مبنية من عناصر GUI (بتأثيرات وأنميشن وتشتغل فوراً بدون رفع)، أو صورة PNG تحمّلها وترفعها على روبلوكس وتحط الـ ID.'),
    desc,
    h('div', { class: 'chips' }, ['متجر', 'إعدادات', 'سيف ناري', 'جوهرة', 'هدية', 'كأس', 'طاقة', 'تاج VIP', 'حقيبة', 'خريطة', 'مهام', 'إغلاق'].map(e => h('button', { class: 'chip', onclick: () => { desc.value = st.desc = e; saveSt(); } }, e))),
    h('div', { class: 'gen-opts' }, h('label', {}, 'الشكل ', selEl(ICON_STYLES, 'style')), h('label', {}, 'التأثير ', selEl(ICON_EFFECTS, 'effect')), h('label', { class: 'cols' }, 'الألوان ', col('c1'), col('c2'))),
    h('div', { class: 'chips' }, palettes.map(([a, b]) => h('button', { class: 'gp', style: { background: `linear-gradient(90deg,${a},${b})` }, onclick: () => { st.c1 = a; st.c2 = b; saveSt(); $$('.gen-opts input[type=color]', pane).forEach((c, i) => c.value = i ? b : a); } }))),
    h('div', { class: 'rv-acts' }, bGui, bPng, bAiImg), out);
  const target = () => { const n = sel(); return n && isGui(n) ? n : null; };
  const card = (title, prevEl, acts) => h('div', { class: 'icon-card' }, h('b', {}, title), prevEl, h('div', { class: 'rv-acts' }, acts));
  const resultGui = node => {
    const prev = h('div', { class: 'icon-prev gui' });
    const t = target();
    out.prepend(card('🧩 أيقونة GUI — ' + st.desc, prev, [
      h('button', { class: 'btn sm primary', onclick: () => { const n = reId(clone(node)); insertNode(n, rootOrContainer()); closeModal(); toast('✅ تمت إضافة الأيقونة — جرّبها بزر ▶', 2000, 'ok'); } }, '➕ أضفها كزر جديد'),
      t && CLASSES[t.cls].button ? h('button', {
        class: 'btn sm', onclick: () => {
          const n = reId(clone(node)); const gl = n.children.find(c => c.name === 'Glyph');
          STYLE_MODS.forEach(m => { const nm = n.children.find(c => c.cls === m); t.children = t.children.filter(c => c.cls !== m); if (nm) t.children.push(nm); });
          ['BackgroundColor3', 'BackgroundTransparency'].forEach(k => t.props[k] = n.props[k]);
          if (CLASSES[t.cls].text) t.props.Text = '';
          n.children.filter(c => isGui(c)).forEach(c => t.children.push(c));
          t.anim = Object.assign(t.anim || {}, n.anim); changed(true); closeModal(); toast('✅ تم تطبيق الأيقونة على "' + t.name + '"', 2000, 'ok');
        }
      }, '🎯 طبّقها على "' + t.name + '"') : null]));
    previewNodes([node], prev, 200, 200);
  };
  const resultPng = (url, label) => {
    const img = h('img', { src: url, alt: '' });
    const t = target();
    out.prepend(card('🖼 ' + label, h('div', { class: 'icon-prev' }, img), [
      h('a', { class: 'btn sm primary', href: url, download: (st.desc || 'icon').replace(/\s+/g, '_') + '.png', target: '_blank' }, '⬇ تحميل PNG'),
      t && CLASSES[t.cls].image ? h('button', { class: 'btn sm', onclick: () => { t.props._preview = url.length > 400000 ? '' : url; changed(true); toast('👁 معاينة في الموقع فقط — ارفع الصورة على روبلوكس وحط الـ ID في Image', 4500); } }, '👁 معاينة على "' + t.name + '"') : null,
      h('button', { class: 'btn sm ghost', onclick: () => openModal('📤 رفع الصورة على روبلوكس', h('ol', { class: 'up-steps' }, h('li', {}, 'حمّل الصورة PNG.'), h('li', {}, 'افتح create.roblox.com ← Creations ← Development Items ← Decals (أو من Studio: View ← Asset Manager ← Bulk Import).'), h('li', {}, 'ارفع الصورة وانتظر الموافقة.'), h('li', {}, 'انسخ الـ ID من رابط الصورة.'), h('li', {}, 'في الموقع: حدد ImageLabel/ImageButton وحط الـ ID في خانة Image — السكربت يحوّل Decal ID تلقائياً.')), [{ t: 'فهمت' }]) }, '❔ كيف أرفعها')]));
  };
  bGui.onclick = async () => {
    const emoji = pickEmoji(st.desc);
    if (AI.isLocal()) return resultGui(buildIconNode(Object.assign({}, st, { emoji, name: 'Icon' })));
    aiBusy(bGui, true, 'الذكاء يصمم الأيقونة...');
    try {
      const sys = `Design ONE Roblox icon button built only from GUI elements (no image assets). Reply ONLY JSON NODE.
Root: TextButton, Size [0,96,0,96], Text "", AnchorPoint [0.5,0.5], Position [0.5,0,0.5,0]. Build the icon from layered Frames (rotated squares, circles via UICorner [1,0]), UIGradient, UIStroke, and TextLabel children with emoji/symbols (TextScaled true, BackgroundTransparency 1). Make it look like a premium mobile-game icon. Colors: ${st.c1} and ${st.c2}. Shape style: ${st.style}. Effect: ${st.effect} — express it with anim (idleType glow/spin/float/heartbeat/shine/strokeRainbow/bounce/swing on root or on the symbol child). Root anim also gets hoverOn+pressOn+clickMotion.
${AI_NODE_FORMAT}
${aiSchemaDoc()}`;
      const n = aiNode(AI.parseJSON(await AI.ask(sys, 'Icon: ' + st.desc, 4000)));
      if (!n || !isGui(n)) throw new Error('رد غير صالح');
      resultGui(n);
    } catch (e) { toast('⚠ ' + e.message + ' — استخدمت المصمم المحلي', 3000, 'warn'); resultGui(buildIconNode(Object.assign({}, st, { emoji, name: 'Icon' }))); }
    aiBusy(bGui, false);
  };
  bPng.onclick = async () => {
    const emoji = pickEmoji(st.desc);
    if (AI.isLocal()) return resultPng(drawIconPNG(Object.assign({}, st, { emoji })), 'PNG — ' + st.desc);
    aiBusy(bPng, true, 'الذكاء يرسم الأيقونة...');
    try {
      const sys = `You are a game icon artist. Reply with ONLY one complete <svg> element (viewBox "0 0 512 512"), no explanation. Bold mobile-game style icon: centered subject, thick dark outline, vivid gradients (use <linearGradient>/<radialGradient>), soft highlight, slight drop shadow, background shape: ${st.style} using colors ${st.c1} and ${st.c2}. No text, no external images, no scripts.`;
      const svg = sanitizeSvg(await AI.ask(sys, 'Icon of: ' + st.desc, 6000));
      resultPng(await svgToPNG(svg), 'PNG بالذكاء — ' + st.desc);
    } catch (e) { toast('⚠ ' + e.message + ' — رسمتها محلياً', 3000, 'warn'); resultPng(drawIconPNG(Object.assign({}, st, { emoji })), 'PNG — ' + st.desc); }
    aiBusy(bPng, false);
  };
  bAiImg.onclick = () => {
    const c = AI.cfg(), key = (c.keys.free || '').trim();
    const prompt = `${st.desc}, game icon, mobile game style, centered, bold outline, vibrant ${st.c1} and ${st.c2} colors, glossy, plain background`;
    const seed = Math.floor(Math.random() * 1e6);
    const url = key ? `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux&width=512&height=512&nologo=true&seed=${seed}&key=${encodeURIComponent(key)}`
      : `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${seed}`;
    const img = h('img', { src: url, alt: '', crossorigin: 'anonymous' });
    const box = h('div', { class: 'icon-prev loading' }, img);
    const dl = h('button', { class: 'btn sm primary', disabled: true }, '⬇ تحميل PNG');
    img.onload = () => { box.classList.remove('loading'); dl.disabled = false; };
    img.onerror = () => { box.classList.remove('loading'); box.innerHTML = '<small>تعذر توليد الصورة — الخدمة المجانية مشغولة أو تحتاج مفتاح Pollinations</small>'; };
    dl.onclick = () => { try { const cv = document.createElement('canvas'); cv.width = cv.height = 512; cv.getContext('2d').drawImage(img, 0, 0, 512, 512); const a = h('a', { href: cv.toDataURL('image/png'), download: st.desc.replace(/\s+/g, '_') + '.png' }); document.body.appendChild(a); a.click(); a.remove(); } catch (e) { window.open(url, '_blank', 'noopener'); } };
    out.prepend(card('🌸 صورة Pollinations — ' + st.desc, box, [dl, h('button', { class: 'btn sm', onclick: () => window.open(url, '_blank', 'noopener') }, '↗ فتح')]));
    toast('🌸 جاري توليد الصورة... (10-30 ثانية)', 2500);
  };
}

/* ---- تبويب الإعدادات ---- */
function aiSettingsPane(pane, redraw) {
  const c = AI.cfg();
  const wrap = h('div', { class: 'ai-set' });
  const drawSet = () => {
    wrap.innerHTML = '';
    const P = AI.PROVIDERS[c.provider];
    wrap.append(h('div', { class: 'prov-grid' }, Object.entries(AI.PROVIDERS).map(([k, p]) => h('button', { class: 'prov' + (c.provider === k ? ' on' : ''), onclick: () => { c.provider = k; AI.save(c); drawSet(); $('.ai-provider b') && ($('.ai-provider b').textContent = AI.providerName()); } }, h('b', {}, p.n), h('small', {}, p.note)))));
    if (!P.local) {
      const key = h('input', { type: 'password', class: 'ai-prompt', value: c.keys[c.provider] || '', placeholder: P.keyOpt ? 'اختياري — مفتاح Pollinations لحدود أعلى' : 'الصق مفتاح API هنا', dir: 'ltr', autocomplete: 'off' });
      key.value = c.keys[c.provider] || '';
      key.oninput = () => { c.keys[c.provider] = key.value.trim(); AI.save(c); };
      const model = h('input', { type: 'text', class: 'ai-prompt', value: c.models[c.provider] || '', placeholder: 'الموديل (افتراضي: ' + P.model + ')', dir: 'ltr' });
      model.value = c.models[c.provider] || '';
      model.oninput = () => { c.models[c.provider] = model.value.trim(); AI.save(c); };
      const test = h('button', { class: 'btn' }, '🧪 اختبار الاتصال');
      test.onclick = async () => { aiBusy(test, true, 'جاري الاختبار...'); try { const r = await AI.ask('Reply with exactly: OK', 'ping', 20); toast('✅ الاتصال شغال: ' + String(r).slice(0, 30), 2500, 'ok'); } catch (e) { toast('❌ ' + e.message, 5000, 'err'); } aiBusy(test, false); };
      wrap.append(h('label', { class: 'set-row' }, h('b', {}, '🔑 المفتاح ' + (P.keyOpt ? '(اختياري)' : '')), key),
        h('label', { class: 'set-row' }, h('b', {}, '🧠 الموديل'), model),
        h('div', { class: 'rv-acts' }, test, h('a', { class: 'btn ghost', href: P.link, target: '_blank', rel: 'noopener' }, '🔗 احصل على مفتاح')));
    }
    wrap.append(h('div', { class: 'phint big' }, '🔒 المفتاح ينحفظ في متصفحك أنت فقط (localStorage) ويروح مباشرة لشركة الذكاء — ما ينرفع على GitHub ولا يشوفه أحد ثاني. لا تشارك مفتاحك مع أحد، ولو استخدمت جهاز عام امسحه بعد ما تخلص.'));
    if (c.keys[c.provider]) wrap.append(h('button', { class: 'btn sm danger', onclick: () => { delete c.keys[c.provider]; AI.save(c); drawSet(); toast('🗑 تم مسح المفتاح'); } }, '🗑 مسح المفتاح'));
  };
  drawSet();
  pane.append(h('p', { class: 'ai-intro' }, 'اختر مزوّد الذكاء. الخيار المجاني يشتغل بدون أي مفتاح (لكنه أبطأ)، والذكاء المحلي يشتغل حتى بدون إنترنت.'), wrap);
}

/* ===================== الربط بالواجهة ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const b = document.getElementById('btnAI'); if (b) b.onclick = () => openAI();
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openAI(); } });
});
