/* RoGUI Studio — app.js : الواجهة الرئيسية للمحرر */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c == null || c === false) return; el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c); });
  return el;
}

const SCREENS = { '1920x1080': '🖥 PC — 1920×1080', '1366x768': '💻 لابتوب — 1366×768', '1280x720': '📺 HD — 1280×720', '1024x768': '📱 تابلت — 1024×768', '844x390': '📱 جوال أفقي — 844×390', '390x844': '📱 جوال عمودي — 390×844' };
const BGS = { sky: '🌤 مشهد روبلوكس', dark: '🌑 داكن', light: '☀ فاتح', checker: '▦ شفافية' };
const DEFAULT_SETTINGS = { screen: '1920x1080', grid: 10, snap: true, units: 'offset', showHidden: true, showGrid: false, bg: 'sky' };

const S = {
  project: null, sel: null, clip: null, hist: [], fut: [], play: false, zoom: 1, autoFit: true,
  map: new Map(), propFilter: '', toolFilter: '', treeFilter: '', panelTab: { left: 'tools', right: 'props' }
};
const root = () => S.project.root;
const settings = () => S.project.settings;

/* ===================== أدوات الشجرة ===================== */
function findNode(id, n = root()) { if (!n) return null; if (n.id === id) return n; for (const c of n.children || []) { const r = findNode(id, c); if (r) return r; } return null; }
function parentOf(id) { return findParent(root(), id); }
function walkTree(n, f, depth = 0, parent = null) { f(n, depth, parent); (n.children || []).forEach(c => walkTree(c, f, depth + 1, n)); }
function reId(n) { n.id = uid(); (n.children || []).forEach(reId); return n; }
function countNodes(n) { let c = 0; walkTree(n, () => c++); return c; }
function isAncestor(aId, bId) { const a = findNode(aId); return !!(a && findNode(bId, a)); }
const sel = () => S.sel ? findNode(S.sel) : null;
function canHold(parent, child) {
  if (!parent) return false;
  if (isMod(child)) return isGui(parent);
  return parent.cls === 'ScreenGui' || isGui(parent);
}

/* ===================== التنبيهات ===================== */
function toast(msg, ms = 2200, type = '') {
  const t = h('div', { class: 'toast ' + type }, msg);
  $('#toasts').appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, ms);
}

/* ===================== السجل (تراجع/إعادة) ===================== */
let _histTimer = null, _lastSnap = null;
function snap() { return JSON.stringify({ name: S.project.name, root: S.project.root }); }
function pushHistory(now) {
  clearTimeout(_histTimer);
  const doit = () => {
    const s = snap();
    if (s === _lastSnap) return;
    if (_lastSnap) S.hist.push(_lastSnap);
    if (S.hist.length > 120) S.hist.shift();
    _lastSnap = s; S.fut = [];
    autosave();
    updateUndoButtons();
  };
  if (now) doit(); else _histTimer = setTimeout(doit, 350);
}
function restore(s) {
  const d = JSON.parse(s);
  S.project.name = d.name; S.project.root = d.root;
  _lastSnap = s;
  if (S.sel && !findNode(S.sel)) S.sel = root().id;
  $('#projName').value = S.project.name;
  renderAll(); autosave(); updateUndoButtons();
}
function undo() {
  clearTimeout(_histTimer);
  const cur = snap();
  if (cur !== _lastSnap) { if (_lastSnap) S.hist.push(_lastSnap); _lastSnap = cur; }
  if (!S.hist.length) return toast('لا يوجد شيء للتراجع');
  S.fut.push(cur); restore(S.hist.pop());
}
function redo() { if (!S.fut.length) return toast('لا يوجد شيء للإعادة'); S.hist.push(snap()); restore(S.fut.pop()); }
function updateUndoButtons() { $('#btnUndo').disabled = !S.hist.length; $('#btnRedo').disabled = !S.fut.length; }

/* ===================== التخزين ===================== */
const Store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast('⚠ مساحة التخزين ممتلئة — احذف بعض المشاريع', 3500, 'err'); return false; } }
};
let _autoTimer = null;
function autosave() { clearTimeout(_autoTimer); _autoTimer = setTimeout(() => Store.set('rogui_current', S.project), 500); }

/* ===================== التغيير والرسم ===================== */
function changed(full = true) {
  if (full) renderAll(); else { renderCanvas(); renderTree(); }
  pushHistory(true);
}
function renderAll() { renderCanvas(); renderTree(); renderProps(); }

function screenSize() { const [w, hh] = settings().screen.split('x').map(Number); return { w, h: hh }; }
function guiInset() { return root().props.IgnoreGuiInset ? 0 : TOPBAR_H; }

function renderCanvas() {
  const { w, h: H } = screenSize();
  const scr = $('#screen'), area = $('#guiArea');
  scr.style.width = w + 'px'; scr.style.height = H + 'px';
  scr.dataset.bg = settings().bg;
  const inset = guiInset();
  area.style.top = inset + 'px'; area.style.width = w + 'px'; area.style.height = (H - inset) + 'px';
  area.classList.toggle('show-grid', settings().showGrid && !S.play);
  area.style.setProperty('--grid', settings().grid + 'px');
  $('#topbarSim').classList.toggle('ignored', !!root().props.IgnoreGuiInset);
  if (Play.active) Play.stop();
  S.map = renderGui(root(), area, { w, h: H - inset, play: S.play, showHidden: settings().showHidden });
  if (!root().props.Enabled && !S.play) area.classList.add('disabled-gui'); else area.classList.remove('disabled-gui');
  if (S.play) Play.start(S.project, S.map, area, toast);
  fitZoom();
  updateSelection();
  $('#statCount').textContent = countNodes(root()) - 1;
}

function fitZoom(force) {
  const vp = $('#viewport'), { w, h: H } = screenSize();
  if (S.autoFit || force) {
    const r = vp.getBoundingClientRect();
    S.zoom = Math.max(0.05, Math.min((r.width - 32) / w, (r.height - 32) / H, 2));
    if (force) S.autoFit = true;
  }
  $('#screen').style.transform = `scale(${S.zoom})`;
  $('#screenWrap').style.width = w * S.zoom + 'px';
  $('#screenWrap').style.height = H * S.zoom + 'px';
  $('#zoomLabel').textContent = Math.round(S.zoom * 100) + '%';
}
function setZoom(z) { S.autoFit = false; S.zoom = Math.max(0.05, Math.min(4, z)); fitZoom(); updateSelection(); }

/* ---- مربع التحديد ---- */
function elRectInArea(el) {
  const a = $('#guiArea').getBoundingClientRect(), r = el.getBoundingClientRect();
  return { x: (r.left - a.left) / S.zoom, y: (r.top - a.top) / S.zoom, w: r.width / S.zoom, h: r.height / S.zoom };
}
function updateSelection() {
  const box = $('#selBox');
  const n = sel();
  if (S.play || !n || n.cls === 'ScreenGui' || isMod(n)) {
    box.style.display = 'none';
    $$('.rg-el.sel-parent').forEach(e => e.classList.remove('sel-parent'));
    if (n && isMod(n)) { const p = parentOf(n.id); const info = p && S.map.get(p.id); if (info && p.cls !== 'ScreenGui') { showBox(info, p, true); } }
    return;
  }
  const info = S.map.get(n.id);
  if (!info) { box.style.display = 'none'; return; }
  showBox(info, n, false);
}
function showBox(info, n, modOnly) {
  const box = $('#selBox');
  const r = elRectInArea(info.el);
  box.style.display = 'block';
  box.style.left = r.x + 'px'; box.style.top = (r.y + guiInset()) + 'px';
  box.style.width = r.w + 'px'; box.style.height = r.h + 'px';
  box.classList.toggle('mod-only', modOnly);
  box.classList.toggle('locked', !!n.locked);
  const inv = 1 / S.zoom;
  box.style.setProperty('--inv', inv);
  $('#selLabel').textContent = `${n.name} · ${Math.round(info.w)}×${Math.round(info.h)}`;
}

/* ===================== أحجام الأب ===================== */
function parentContent(parent) {
  const info = S.map.get(parent.id);
  let w = info ? info.w : 0, hh = info ? info.h : 0;
  if (parent.cls === 'ScrollingFrame' && info) {
    const cs = parent.props.CanvasSize;
    w = Math.max(info.w, cs.xs * info.w + cs.xo); hh = Math.max(info.h, cs.ys * info.h + cs.yo);
  }
  const m = modsOf(parent);
  let pl = 0, pt = 0, pr = 0, pb = 0;
  if (m.UIPadding) { const p = m.UIPadding.props; pl = udim(p.PaddingLeft, w); pr = udim(p.PaddingRight, w); pt = udim(p.PaddingTop, hh); pb = udim(p.PaddingBottom, hh); }
  return { w: Math.max(1, w - pl - pr), h: Math.max(1, hh - pt - pb), pl, pt, layout: !!(m.UIListLayout || m.UIGridLayout || m.UIPageLayout) };
}

/* ===================== تفاعل اللوحة ===================== */
let drag = null;
function onCanvasDown(e) {
  if (S.play) return;
  if (e.button === 2) return;
  const handle = e.target.closest('.h');
  const n0 = sel();
  if (handle && n0) { startResize(e, n0, handle.dataset.h); return; }
  const elx = e.target.closest('.rg-el');
  let node = elx ? findNode(elx.dataset.id) : root();
  if (!node) node = root();
  if (e.altKey && node !== root()) { const p = parentOf(node.id); if (p) node = p; }
  // لو الابن يغطي الأب بالكامل (مثل نص داخل زر) نحدد الأب أولاً — النقرة الثانية تحدد الابن
  while (node !== root() && S.sel !== node.id) {
    const par = parentOf(node.id);
    if (!par || !isGui(par) || S.sel === par.id) break;
    const a = S.map.get(node.id), b = S.map.get(par.id);
    if (!a || !b) break;
    const r1 = a.el.getBoundingClientRect(), r2 = b.el.getBoundingClientRect();
    if (Math.abs(r1.left - r2.left) > 3 || Math.abs(r1.top - r2.top) > 3 || Math.abs(r1.width - r2.width) > 3 || Math.abs(r1.height - r2.height) > 3) break;
    node = par;
  }
  select(node.id, true);
  if (node === root() || node.locked) return;
  const parent = parentOf(node.id), pc = parentContent(parent), info = S.map.get(node.id);
  if (pc.layout) { drag = { type: 'none' }; return; }
  drag = {
    type: 'move', node, sx: e.clientX, sy: e.clientY, pc, startPos: clone(node.props.Position),
    left: info.x - pc.pl, top: info.y - pc.pt, w: info.w, h: info.h, moved: false
  };
  e.preventDefault();
}
function startResize(e, node, dir) {
  e.preventDefault(); e.stopPropagation();
  if (node.locked) return;
  const parent = parentOf(node.id), pc = parentContent(parent), info = S.map.get(node.id);
  if (dir === 'rot') { const r = info.el.getBoundingClientRect(); drag = { type: 'rot', node, cx: r.left + r.width / 2, cy: r.top + r.height / 2, start: node.props.Rotation }; return; }
  drag = { type: 'resize', dir, node, sx: e.clientX, sy: e.clientY, pc, left: info.x - pc.pl, top: info.y - pc.pt, w: info.w, h: info.h, ratio: info.w / (info.h || 1), layout: pc.layout };
}
function snapV(v) { return settings().snap ? Math.round(v / settings().grid) * settings().grid : Math.round(v); }
function applyPx(node, pc, left, top, w, hh, setSize, setPos) {
  const p = node.props, ax = p.AnchorPoint.x, ay = p.AnchorPoint.y;
  const units = settings().units;
  if (setSize) {
    if (units === 'scale') { p.Size.xs = +((w - p.Size.xo) / pc.w).toFixed(4); p.Size.ys = +((hh - p.Size.yo) / pc.h).toFixed(4); }
    else { p.Size.xo = Math.round(w - p.Size.xs * pc.w); p.Size.yo = Math.round(hh - p.Size.ys * pc.h); }
  }
  if (setPos) {
    const px = left + ax * w, py = top + ay * hh;
    if (units === 'scale') { p.Position.xs = +((px - p.Position.xo) / pc.w).toFixed(4); p.Position.ys = +((py - p.Position.yo) / pc.h).toFixed(4); }
    else { p.Position.xo = Math.round(px - p.Position.xs * pc.w); p.Position.yo = Math.round(py - p.Position.ys * pc.h); }
  }
}
function onCanvasMove(e) {
  if (!drag || drag.type === 'none') return;
  const guide = $('#guides');
  if (drag.type === 'rot') {
    const a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI + 90;
    let r = Math.round(a); if (e.shiftKey || settings().snap) r = Math.round(r / 15) * 15;
    drag.node.props.Rotation = ((r + 540) % 360) - 180;
    drag.moved = true; liveUpdate(); return;
  }
  const dx = (e.clientX - drag.sx) / S.zoom, dy = (e.clientY - drag.sy) / S.zoom;
  if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
  drag.moved = true;
  const pc = drag.pc, th = 6 / S.zoom;
  guide.innerHTML = '';
  if (drag.type === 'move') {
    let left = drag.left + dx, top = drag.top + dy;
    const g = [];
    const cx = left + drag.w / 2, cy = top + drag.h / 2;
    if (Math.abs(cx - pc.w / 2) < th) { left = pc.w / 2 - drag.w / 2; g.push('v'); }
    else if (settings().snap) { left = snapV(left); }
    if (Math.abs(cy - pc.h / 2) < th) { top = pc.h / 2 - drag.h / 2; g.push('h'); }
    else if (settings().snap) { top = snapV(top); }
    applyPx(drag.node, pc, left, top, drag.w, drag.h, false, true);
    const parent = parentOf(drag.node.id), pinfo = S.map.get(parent.id);
    if (pinfo) {
      const pr = parent.cls === 'ScreenGui' ? { x: 0, y: 0, w: pc.w, h: pc.h } : elRectInArea(pinfo.el);
      g.forEach(t => guide.appendChild(h('div', {
        class: 'guide ' + t, style: t === 'v' ? { left: (pr.x + pc.pl + pc.w / 2) + 'px', top: (pr.y + guiInset()) + 'px', height: pr.h + 'px' } : { top: (pr.y + pc.pt + pc.h / 2 + guiInset()) + 'px', left: pr.x + 'px', width: pr.w + 'px' }
      })));
    }
  } else if (drag.type === 'resize') {
    let { left, top, w, h: hh } = drag; const d = drag.dir;
    if (d.includes('e')) w = drag.w + dx;
    if (d.includes('w')) { w = drag.w - dx; left = drag.left + dx; }
    if (d.includes('s')) hh = drag.h + dy;
    if (d.includes('n')) { hh = drag.h - dy; top = drag.top + dy; }
    if (settings().snap) { const ow = w, oh = hh; w = Math.max(1, snapV(w)); hh = Math.max(1, snapV(hh)); if (d.includes('w')) left += ow - w; if (d.includes('n')) top += oh - hh; }
    if (e.shiftKey) { if (d === 'n' || d === 's') w = hh * drag.ratio; else hh = w / drag.ratio; }
    w = Math.max(1, w); hh = Math.max(1, hh);
    applyPx(drag.node, pc, left, top, w, hh, true, !drag.layout);
  }
  liveUpdate();
}
function onCanvasUp() {
  if (drag && drag.moved) { renderTree(); renderProps(); pushHistory(true); }
  drag = null; $('#guides').innerHTML = '';
}
let _liveRaf = 0;
function liveUpdate() {
  cancelAnimationFrame(_liveRaf);
  _liveRaf = requestAnimationFrame(() => { renderCanvas(); syncPropInputs(); });
}

/* ===================== التحديد ===================== */
function select(id, fromCanvas) {
  S.sel = id;
  updateSelection(); renderTree(); renderProps();
  if (fromCanvas) { const row = $(`.tr-row[data-id="${id}"]`); if (row) row.scrollIntoView({ block: 'nearest' }); }
}

/* ===================== العمليات ===================== */
function insertNode(node, parentId, at) {
  let parent = findNode(parentId) || sel() || root();
  if (isMod(node)) {
    if (isMod(parent)) parent = parentOf(parent.id);
    if (!isGui(parent)) { toast('⚠ حدد عنصر (Frame / Button ...) أولاً عشان تضيف له ' + node.cls, 2800, 'warn'); return null; }
    const ex = parent.children.find(c => c.cls === node.cls);
    if (ex) { toast(`${node.cls} موجود مسبقاً في ${parent.name}`); select(ex.id); return null; }
    if (CLASSES[node.cls].layout) {
      const lay = parent.children.find(c => CLASSES[c.cls].layout);
      if (lay) { toast(`⚠ ${parent.name} فيه ${lay.cls} — احذفه أول (Layout واحد فقط)`, 2800, 'warn'); return null; }
    }
  } else {
    if (isMod(parent)) parent = parentOf(parent.id);
    if (parentId == null && (parent.cls === 'TextLabel' || parent.cls === 'TextBox')) parent = parentOf(parent.id) || root();
  }
  if (at != null) parent.children.splice(at, 0, node); else parent.children.push(node);
  parent.open = true;
  S.sel = node.id;
  changed(true);
  return node;
}
function addClass(cls, parentId) {
  const n = newNode(cls);
  if (insertNode(n, parentId)) toast(`✅ تمت إضافة ${cls}`, 1200);
}
function addTemplate(fn, parentId) {
  const n = reId(fn());
  if (insertNode(n, parentId == null ? rootOrContainer() : parentId)) toast(`✅ تمت إضافة القالب`, 1200);
}
function rootOrContainer() {
  const s = sel();
  if (s && (s.cls === 'Frame' || s.cls === 'ScrollingFrame' || s.cls === 'CanvasGroup')) return s.id;
  return root().id;
}
function deleteSel() {
  const n = sel(); if (!n || n === root()) return;
  const p = parentOf(n.id);
  const i = p.children.indexOf(n);
  p.children.splice(i, 1);
  S.sel = p.id; changed(true);
  toast(`🗑 تم حذف ${n.name}`, 1200);
}
function copySel(cut) {
  const n = sel(); if (!n || n === root()) return;
  S.clip = clone(n);
  try { localStorage.setItem('rogui_clip', JSON.stringify(S.clip)); } catch (e) { }
  if (cut) deleteSel(); else toast('📋 تم النسخ', 1000);
}
function paste() {
  const c = S.clip || Store.get('rogui_clip', null);
  if (!c) return toast('الحافظة فاضية');
  const n = reId(clone(c));
  const s = sel();
  let target = s && !isMod(s) ? s.id : root().id;
  if (isMod(n) && s && isMod(s)) target = parentOf(s.id).id;
  insertNode(n, target);
}
function duplicateSel() {
  const n = sel(); if (!n || n === root()) return;
  const p = parentOf(n.id);
  const c = reId(clone(n));
  c.name = n.name;
  if (isMod(c)) { toast('ما تقدر تكرر معدّل بنفس العنصر'); return; }
  if (!parentContent(p).layout) { c.props.Position.xo += 12; c.props.Position.yo += 12; }
  p.children.splice(p.children.indexOf(n) + 1, 0, c);
  S.sel = c.id; changed(true);
}
function moveSibling(dir) {
  const n = sel(); if (!n || n === root()) return;
  const p = parentOf(n.id), i = p.children.indexOf(n), j = i + dir;
  if (j < 0 || j >= p.children.length) return;
  [p.children[i], p.children[j]] = [p.children[j], p.children[i]];
  changed(true);
}
function reparent(id, newParentId, index) {
  const n = findNode(id), np = findNode(newParentId);
  if (!n || !np || n === root() || id === newParentId || isAncestor(id, newParentId)) return false;
  if (!canHold(np, n)) { toast('⚠ ما يصلح هنا', 1500, 'warn'); return false; }
  if (isMod(n) && np.children.some(c => c.cls === n.cls && c !== n)) { toast(`${np.name} فيه ${n.cls} مسبقاً`, 1800, 'warn'); return false; }
  const op = parentOf(id);
  const oi = op.children.indexOf(n);
  op.children.splice(oi, 1);
  if (index == null) np.children.push(n);
  else { if (op === np && oi < index) index--; np.children.splice(index, 0, n); }
  np.open = true;
  S.sel = id; changed(true);
  return true;
}
function toggleProp(id, k) { const n = findNode(id); if (!n) return; if (k === 'locked') n.locked = !n.locked; else n.props[k] = !n.props[k]; changed(true); }
function zSel(d) { const n = sel(); if (!n || !isGui(n)) return; n.props.ZIndex = Math.max(-100, n.props.ZIndex + d); changed(true); toast('ZIndex = ' + n.props.ZIndex, 900); }
function convertUnits(to) {
  const n = sel(); if (!n || !isGui(n)) return toast('حدد عنصر أولاً');
  const pc = parentContent(parentOf(n.id)), info = S.map.get(n.id), p = n.props;
  const posX = p.Position.xs * pc.w + p.Position.xo, posY = p.Position.ys * pc.h + p.Position.yo;
  if (to === 'scale') {
    p.Size = U2(+(info.w / pc.w).toFixed(4), 0, +(info.h / pc.h).toFixed(4), 0);
    p.Position = U2(+(posX / pc.w).toFixed(4), 0, +(posY / pc.h).toFixed(4), 0);
    toast('🔁 تم التحويل إلى Scale — يتجاوب مع كل الشاشات', 2200);
  } else {
    p.Size = U2(0, Math.round(info.w), 0, Math.round(info.h));
    p.Position = U2(0, Math.round(posX), 0, Math.round(posY));
    toast('🔁 تم التحويل إلى Offset (بكسل ثابت)', 2000);
  }
  changed(true);
}
function alignSel(kind) {
  const n = sel(); if (!n || !isGui(n)) return toast('حدد عنصر أولاً');
  const p = n.props;
  const X = { left: 0, centerX: 0.5, right: 1 }, Y = { top: 0, centerY: 0.5, bottom: 1 };
  if (kind in X) { p.AnchorPoint.x = X[kind]; p.Position.xs = X[kind]; p.Position.xo = 0; }
  if (kind in Y) { p.AnchorPoint.y = Y[kind]; p.Position.ys = Y[kind]; p.Position.yo = 0; }
  if (kind === 'fill') { p.AnchorPoint = V2(0, 0); p.Position = U2(0, 0, 0, 0); p.Size = U2(1, 0, 1, 0); }
  if (kind === 'center') { p.AnchorPoint = V2(0.5, 0.5); p.Position = U2(0.5, 0, 0.5, 0); }
  changed(true);
}
function nudge(dx, dy) {
  const n = sel(); if (!n || !isGui(n) || n.locked) return;
  n.props.Position.xo += dx; n.props.Position.yo += dy;
  liveUpdate(); pushHistory();
}
function saveAsMyTemplate() {
  const n = sel(); if (!n || !isGui(n)) return toast('حدد عنصر عشان تحفظه كقالب');
  const name = prompt('اسم القالب:', n.name); if (!name) return;
  const list = Store.get('rogui_mytemplates', []);
  list.push({ id: uid(), n: name, node: clone(n) });
  Store.set('rogui_mytemplates', list);
  renderToolbox(); toast('⭐ تم حفظ القالب في "قوالبي"');
}

/* ===================== الستايل / الظل / التغليف ===================== */
const STYLE_GROUPS = ['look', 'text', 'image', 'scroll', 'cgroup'];
const STYLE_MODS = ['UICorner', 'UIStroke', 'UIGradient', 'UIPadding'];
function copyStyle() {
  const n = sel(); if (!n || !isGui(n)) return toast('حدد عنصر');
  const props = {};
  (SCHEMA[n.cls] || []).forEach(p => { if (STYLE_GROUPS.includes(p.group) && !['Text', 'Image', 'PlaceholderText', 'CanvasSize'].includes(p.k)) props[p.k] = clone(n.props[p.k]); });
  S.styleClip = { props, mods: n.children.filter(c => STYLE_MODS.includes(c.cls)).map(clone), anim: clone(n.anim || {}) };
  toast('🎨 تم نسخ الستايل — حدد عنصر ثاني واضغط "لصق الستايل"', 2200);
}
function pasteStyle() {
  const n = sel(); if (!n || !isGui(n)) return toast('حدد عنصر');
  if (!S.styleClip) return toast('انسخ ستايل أولاً');
  const keys = new Set((SCHEMA[n.cls] || []).map(p => p.k));
  Object.keys(S.styleClip.props).forEach(k => { if (keys.has(k)) n.props[k] = clone(S.styleClip.props[k]); });
  n.children = n.children.filter(c => !STYLE_MODS.includes(c.cls)).concat(S.styleClip.mods.map(m => reId(clone(m))));
  n.anim = clone(S.styleClip.anim);
  changed(true); toast('🖌 تم لصق الستايل', 1200);
}
function addShadow() {
  const n = sel(); if (!n || !isGui(n)) return toast('حدد عنصر');
  const p = parentOf(n.id);
  if (parentContent(p).layout) return toast('⚠ العنصر داخل Layout — الظل بيصير عنصر بالقائمة. ضعه داخل Frame أولاً', 3000, 'warn');
  const sh = mk('Frame', n.name + 'Shadow', {
    Size: clone(n.props.Size), Position: U2(n.props.Position.xs, n.props.Position.xo + 4, n.props.Position.ys, n.props.Position.yo + 7),
    AnchorPoint: clone(n.props.AnchorPoint), Rotation: n.props.Rotation, BackgroundColor3: '#000000', BackgroundTransparency: 0.6, ZIndex: Math.max(0, n.props.ZIndex - 1), Visible: n.props.Visible
  });
  const cr = n.children.find(c => c.cls === 'UICorner'); if (cr) sh.children.push(reId(clone(cr)));
  if (n.props.ZIndex <= sh.props.ZIndex) n.props.ZIndex = sh.props.ZIndex + 1;
  p.children.splice(p.children.indexOf(n), 0, sh);
  changed(true); toast('🌑 تمت إضافة ظل (Frame أسود خلف العنصر)', 1800);
}
function wrapInFrame() {
  const n = sel(); if (!n || !isGui(n)) return toast('حدد عنصر');
  const p = parentOf(n.id), i = p.children.indexOf(n);
  const f = mk('Frame', n.name + 'Holder', { Size: clone(n.props.Size), Position: clone(n.props.Position), AnchorPoint: clone(n.props.AnchorPoint), LayoutOrder: n.props.LayoutOrder, BackgroundTransparency: 1 });
  n.props.Size = U2(1, 0, 1, 0); n.props.Position = U2(0, 0, 0, 0); n.props.AnchorPoint = V2(0, 0);
  p.children.splice(i, 1, f); f.children.push(n);
  S.sel = f.id; changed(true); toast('📦 تم التغليف داخل Frame', 1400);
}
function setAllOpen(v) { walkTree(root(), n => { if (n.children && n.children.length) n.open = v; }); root().open = true; renderTree(); }

/* ===================== صندوق الأدوات ===================== */
function renderToolbox() {
  const box = $('#toolList'); box.innerHTML = '';
  const q = S.toolFilter.trim().toLowerCase();
  const match = (...s) => !q || s.join(' ').toLowerCase().includes(q);
  const section = (title, items) => { if (!items.length) return; box.appendChild(h('div', { class: 'sec-title' }, title)); box.appendChild(h('div', { class: 'tool-grid' }, items)); };
  const item = (icon, name, sub, onclick, dragData, extraCls = '') => h('button', {
    class: 'tool ' + extraCls, title: sub, draggable: 'true', onclick,
    ondragstart: e => { e.dataTransfer.setData('text/rogui', JSON.stringify(dragData)); e.dataTransfer.effectAllowed = 'copy'; }
  }, h('span', { class: 'ti', html: icon }), h('span', { class: 'tn' }, name), h('small', {}, sub));
  section('🧱 العناصر', GUI_CLASSES.filter(c => match(c, CLASSES[c].ar, CLASSES[c].desc)).map(c => item(ICONS[c], c, CLASSES[c].ar, () => addClass(c), { cls: c })));
  section('🎛 إضافات UI (Modifiers)', MOD_CLASSES.filter(c => match(c, CLASSES[c].ar, CLASSES[c].desc)).map(c => item(ICONS[c], c.replace(/^UI/, 'UI '), CLASSES[c].ar, () => addClass(c), { cls: c }, 'mod')));
  const cat = S.tplCat || 'all';
  const tpls = TEMPLATES.map((t, i) => ({ t, i })).filter(({ t }) => match(t.n, t.d, 'template قالب', TPL_CATS[t.c] || '') && (q || cat === 'all' || t.c === cat));
  if (tpls.length || !q) {
    box.appendChild(h('div', { class: 'sec-title' }, `✨ قوالب جاهزة (${TEMPLATES.length})`));
    if (!q) box.appendChild(h('div', { class: 'cat-chips' }, Object.keys(TPL_CATS).map(k => h('button', { class: 'chip' + (cat === k ? ' have' : ''), onclick: () => { S.tplCat = k; renderToolbox(); } }, TPL_CATS[k] + (k === 'all' ? '' : ' ' + TEMPLATES.filter(t => t.c === k).length)))));
    const grid = h('div', { class: 'tpl-grid' });
    tpls.forEach(({ t, i }) => grid.appendChild(tplCard(t.n, t.d, t.f, { tpl: i })));
    box.appendChild(grid);
  }
  const mine = Store.get('rogui_mytemplates', []).filter(t => match(t.n, 'mine قوالبي'));
  if (mine.length) {
    box.appendChild(h('div', { class: 'sec-title' }, '⭐ قوالبي'));
    const grid = h('div', { class: 'tpl-grid' });
    mine.forEach(t => {
      const card = tplCard(t.n, 'قالب محفوظ', () => clone(t.node), { mine: t.id });
      card.appendChild(h('button', {
        class: 'tpl-del', title: 'حذف', onclick: e => {
          e.stopPropagation(); if (!confirm('حذف القالب؟')) return;
          Store.set('rogui_mytemplates', Store.get('rogui_mytemplates', []).filter(x => x.id !== t.id)); renderToolbox();
        }
      }, '✕'));
      grid.appendChild(card);
    });
    box.appendChild(grid);
  }
  if (!box.children.length) box.appendChild(h('div', { class: 'empty' }, '🔍 ما في نتائج لـ "' + S.toolFilter + '"'));
}
function tplCard(name, desc, fn, dragData) {
  const prev = h('div', { class: 'tpl-prev' });
  const card = h('div', {
    class: 'tpl', draggable: 'true', title: desc, onclick: () => addTemplate(fn),
    ondragstart: e => { e.dataTransfer.setData('text/rogui', JSON.stringify(dragData)); }
  }, prev, h('b', {}, name), h('small', {}, desc));
  requestAnimationFrame(() => {
    try {
      const node = fn(), W = 640, H = 400;
      const host = h('div', { class: 'tpl-host', style: { width: W + 'px', height: H + 'px' } });
      prev.appendChild(host);
      const fake = { id: 'tplroot', cls: 'ScreenGui', props: defaultProps('ScreenGui'), children: [node] };
      renderGui(fake, host, { w: W, h: H, play: true });
      const sc = (prev.clientWidth || 120) / W;
      host.style.transform = `scale(${sc})`;
      prev.style.height = H * sc + 'px';
    } catch (e) { console.warn(e); }
  });
  return card;
}

/* ===================== المستكشف (الشجرة) ===================== */
function renderTree() {
  const box = $('#tree'); box.innerHTML = '';
  const q = S.treeFilter.trim().toLowerCase();
  const visibleIds = new Set();
  if (q) walkTree(root(), (n) => {
    if (n.name.toLowerCase().includes(q) || n.cls.toLowerCase().includes(q) || (CLASSES[n.cls].ar || '').includes(q)) {
      let x = n; while (x) { visibleIds.add(x.id); x = parentOf(x.id); }
    }
  });
  const rowFor = (n, depth) => {
    const hasKids = n.children && n.children.length;
    const row = h('div', {
      class: 'tr-row' + (n.id === S.sel ? ' sel' : '') + (isMod(n) ? ' is-mod' : '') + (n.props && n.props.Visible === false ? ' is-hidden' : ''),
      'data-id': n.id, draggable: n === root() ? 'false' : 'true',
      style: { paddingInlineStart: (6 + depth * 14) + 'px' },
      onclick: () => select(n.id),
      ondblclick: e => { if (n !== root()) startRename(row, n); },
      oncontextmenu: e => { e.preventDefault(); select(n.id); showCtx(e.clientX, e.clientY); },
      ondragstart: e => { e.dataTransfer.setData('text/rogui-move', n.id); e.dataTransfer.effectAllowed = 'move'; row.classList.add('dragging'); },
      ondragend: () => row.classList.remove('dragging'),
      ondragover: e => {
        if (![...e.dataTransfer.types].some(t => t.startsWith('text/rogui'))) return;
        e.preventDefault();
        const r = row.getBoundingClientRect(), k = (e.clientY - r.top) / r.height;
        row.classList.remove('d-before', 'd-after', 'd-in');
        row.classList.add(n === root() ? 'd-in' : k < 0.25 ? 'd-before' : k > 0.75 ? 'd-after' : 'd-in');
      },
      ondragleave: () => row.classList.remove('d-before', 'd-after', 'd-in'),
      ondrop: e => {
        e.preventDefault(); e.stopPropagation();
        const mode = row.classList.contains('d-before') ? 'before' : row.classList.contains('d-after') ? 'after' : 'in';
        row.classList.remove('d-before', 'd-after', 'd-in');
        const mid = e.dataTransfer.getData('text/rogui-move');
        if (mid) {
          if (mode === 'in') reparent(mid, n.id);
          else { const p = parentOf(n.id); reparent(mid, p.id, p.children.indexOf(n) + (mode === 'after' ? 1 : 0)); }
          return;
        }
        const data = e.dataTransfer.getData('text/rogui');
        if (data) handleToolDrop(JSON.parse(data), mode === 'in' ? n.id : parentOf(n.id).id);
      }
    },
      h('span', { class: 'caret' + (hasKids ? '' : ' none') + (n.open ? ' open' : ''), onclick: e => { e.stopPropagation(); n.open = !n.open; renderTree(); } }, '▸'),
      h('span', { class: 'tr-ic c-' + (isMod(n) ? 'mod' : n.cls), html: ICONS[n.cls] || '' }),
      h('span', { class: 'tr-name' }, n.name),
      h('small', { class: 'tr-cls' }, n.cls !== n.name ? n.cls : ''),
      hasAnim(n) ? h('span', { class: 'tr-badge', title: 'فيه أنميشن' }, '✨') : null,
      isGui(n) ? h('span', { class: 'tr-act' + (n.locked ? ' on' : ''), title: 'قفل', onclick: e => { e.stopPropagation(); toggleProp(n.id, 'locked'); } }, n.locked ? '🔒' : '🔓') : null,
      isGui(n) ? h('span', { class: 'tr-act' + (!n.props.Visible ? ' on' : ''), title: 'إظهار/إخفاء', onclick: e => { e.stopPropagation(); toggleProp(n.id, 'Visible'); } }, n.props.Visible ? '👁' : '🚫') : null
    );
    bindLongPress(row, (x, y) => { select(n.id); showCtx(x, y); });
    return row;
  };
  walkTree(root(), (n, depth) => {
    if (q && !visibleIds.has(n.id)) return;
    let p = parentOf(n.id), hidden = false;
    while (p && !q) { if (!p.open) { hidden = true; break; } p = parentOf(p.id); }
    if (!hidden) box.appendChild(rowFor(n, depth));
  });
}
function startRename(row, n) {
  const name = row.querySelector('.tr-name');
  const inp = h('input', { class: 'tr-input', value: n.name });
  name.replaceWith(inp); inp.focus(); inp.select();
  const done = ok => { if (ok && inp.value.trim()) { n.name = inp.value.trim().replace(/\s+/g, ''); changed(true); } else renderTree(); };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); e.stopPropagation(); });
  inp.addEventListener('blur', () => done(true));
}
function bindLongPress(el, cb) {
  let t = null, sx = 0, sy = 0;
  el.addEventListener('touchstart', e => { const p = e.touches[0]; sx = p.clientX; sy = p.clientY; t = setTimeout(() => { t = null; cb(sx, sy); }, 550); }, { passive: true });
  el.addEventListener('touchmove', e => { const p = e.touches[0]; if (Math.abs(p.clientX - sx) + Math.abs(p.clientY - sy) > 10) { clearTimeout(t); t = null; } }, { passive: true });
  el.addEventListener('touchend', () => { clearTimeout(t); });
}

/* ===================== محرر الخصائص ===================== */
const num = (v, step) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
function numInput(val, onInput, o = {}) {
  const inp = h('input', { type: 'number', class: 'num', value: val, step: o.step || 'any', dir: 'ltr', title: o.title || '' });
  if (o.min != null) inp.min = o.min; if (o.max != null) inp.max = o.max;
  inp.addEventListener('input', () => onInput(num(inp.value)));
  inp.addEventListener('change', () => pushHistory(true));
  // سحب بالماوس على الحقل لتغيير القيمة
  inp.addEventListener('wheel', e => { if (document.activeElement !== inp) return; e.preventDefault(); const st = parseFloat(o.step) || 1; inp.value = +(num(inp.value) + (e.deltaY < 0 ? st : -st)).toFixed(4); onInput(num(inp.value)); }, { passive: false });
  return inp;
}
function colorInput(val, onInput) {
  const wrap = h('div', { class: 'colorf' });
  const c = h('input', { type: 'color', value: val });
  const t = h('input', { type: 'text', class: 'hex', value: val, dir: 'ltr', maxLength: 7 });
  const rgb = h('small', { class: 'rgbtxt', dir: 'ltr' }, hexRgb(val).join(', '));
  c.addEventListener('input', () => { t.value = c.value; rgb.textContent = hexRgb(c.value).join(', '); onInput(c.value); });
  c.addEventListener('change', () => pushHistory(true));
  t.addEventListener('change', () => { let v = t.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) { c.value = v; rgb.textContent = hexRgb(v).join(', '); onInput(v.toLowerCase()); pushHistory(true); } else t.value = c.value; });
  wrap.append(c, t, rgb);
  const recent = Store.get('rogui_recent', []);
  const holder = h('div', { class: 'colorbox' }, wrap);
  if (recent.length) holder.appendChild(h('div', { class: 'recent' }, recent.slice(0, 10).map(rc => h('button', { class: 'rsw', title: rc, style: { background: rc }, onclick: () => { c.value = rc; t.value = rc; rgb.textContent = hexRgb(rc).join(', '); onInput(rc); pushHistory(true); } }))));
  c.addEventListener('change', () => addRecent(c.value));
  t.addEventListener('change', () => addRecent(c.value));
  return holder;
}
function addRecent(v) {
  const r = Store.get('rogui_recent', []).filter(x => x !== v);
  r.unshift(v); Store.set('rogui_recent', r.slice(0, 10));
}
function sw(val, onChange) {
  const l = h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: !!val, onchange: e => onChange(e.target.checked) }), h('span'));
  return l;
}
function selectInput(opts, val, onChange, labels, fontPreview) {
  const s = h('select', { dir: 'ltr', onchange: e => onChange(e.target.value) });
  opts.forEach((o, i) => {
    const op = h('option', { value: o }, labels ? labels[i] : o);
    if (fontPreview) { const f = fontCss(o); op.style.fontFamily = f.family; op.style.fontWeight = f.weight; }
    if (o === val) op.selected = true;
    s.appendChild(op);
  });
  if (fontPreview) { const f = fontCss(val); s.style.fontFamily = f.family; s.style.fontWeight = f.weight; }
  return s;
}
const STORE_URL = { image: q => `https://create.roblox.com/store/decals?keyword=${encodeURIComponent(q || '')}`, sound: q => `https://create.roblox.com/store/audio?keyword=${encodeURIComponent(q || '')}` };

function fieldControl(p, get, set, rebuild, ctxNode) {
  const v = get(p.k);
  const upd = (val, re) => { set(p.k, val); if (re) rebuild(); };
  switch (p.type) {
    case 'bool': return sw(v, x => { upd(x, true); pushHistory(true); });
    case 'number': {
      const inp = numInput(v, x => { if (p.min != null) x = Math.max(p.min, x); if (p.max != null) x = Math.min(p.max, x); upd(x); if (rng) rng.value = x; }, p);
      let rng = null;
      if (p.slider) { rng = h('input', { type: 'range', min: p.min, max: p.max, step: 0.01, value: v, dir: 'ltr' }); rng.addEventListener('input', () => { inp.value = rng.value; upd(+rng.value); }); rng.addEventListener('change', () => pushHistory(true)); return h('div', { class: 'numslide' }, inp, rng); }
      return inp;
    }
    case 'color': return colorInput(v, x => upd(x));
    case 'enum': return selectInput(p.opts, v, x => { upd(x, true); pushHistory(true); }, p.labels);
    case 'font': return selectInput(FONT_LIST, v, x => { upd(x, true); pushHistory(true); }, null, true);
    case 'text': {
      const t = h('textarea', { rows: 2, value: v, dir: 'auto', 'data-k': p.k }); t.value = v;
      t.addEventListener('input', () => upd(t.value)); t.addEventListener('change', () => pushHistory(true));
      const ins = (a, b = '') => {
        const s0 = t.selectionStart, s1 = t.selectionEnd, val = t.value;
        t.value = val.slice(0, s0) + a + val.slice(s0, s1) + b + val.slice(s1);
        t.focus(); t.selectionStart = s0 + a.length; t.selectionEnd = s1 + a.length;
        upd(t.value);
        if (b && ctxNode && !ctxNode.props.RichText) { ctxNode.props.RichText = true; toast('✔ تم تفعيل RichText', 1200); rebuild(); }
        liveUpdate(); pushHistory(true);
      };
      const emojis = ['⭐', '🔥', '💎', '🪙', '💰', '❤', '✅', '❌', '⚔', '🛡', '🏆', '🎁', '🎉', '⚡', '🔒', '🔓', '⚙', '🛒', '🎒', '👑', '💀', '🌟', '➕', '➖', '▶', '⏸', '🔊', '🔇', '📜', '⏱', '🏠', '🎮', '🍀', '🌙', '☀', '❄', '🎵', '💬', '👤', '🚀'];
      const pop = h('div', { class: 'emoji-pop' }, emojis.map(e => h('button', { onclick: () => { ins(e); pop.classList.remove('on'); } }, e)));
      const color = h('input', { type: 'color', value: '#ffd166', class: 'rt-color', title: 'لون جزء من النص' });
      color.addEventListener('change', () => ins(`<font color="${color.value}">`, '</font>'));
      const bar = h('div', { class: 'rt-bar' },
        h('button', { title: 'إيموجي', onclick: () => pop.classList.toggle('on') }, '😀'),
        h('button', { title: 'عريض (RichText)', onclick: () => ins('<b>', '</b>') }, h('b', {}, 'B')),
        h('button', { title: 'مائل', onclick: () => ins('<i>', '</i>') }, h('i', {}, 'I')),
        h('button', { title: 'تحته خط', onclick: () => ins('<u>', '</u>') }, h('u', {}, 'U')),
        h('button', { title: 'يتوسطه خط', onclick: () => ins('<s>', '</s>') }, h('s', {}, 'S')),
        h('button', { title: 'حد للنص', onclick: () => ins('<stroke color="#000000" thickness="2">', '</stroke>') }, '✎'),
        h('button', { title: 'سطر جديد', onclick: () => ins('<br/>') }, '↵'),
        h('label', { class: 'rt-c', title: 'لون' }, '🎨', color));
      return h('div', { class: 'textf' }, bar, pop, t);
    }
    case 'string': case 'target': {
      const t = h('input', { type: 'text', value: v, dir: 'auto', placeholder: p.hint || '' });
      t.value = v;
      if (p.type === 'target') {
        const dl = h('datalist', { id: 'dl_' + p.k });
        walkTree(root(), n => { if (isGui(n)) dl.appendChild(h('option', { value: n.name })); });
        t.setAttribute('list', dl.id);
        t.addEventListener('input', () => upd(t.value)); t.addEventListener('change', () => pushHistory(true));
        return h('div', {}, t, dl);
      }
      t.addEventListener('input', () => upd(t.value)); t.addEventListener('change', () => pushHistory(true));
      return t;
    }
    case 'udim2': {
      const g = h('div', { class: 'udim2' });
      [['xs', 'X Scale'], ['xo', 'X Offset'], ['ys', 'Y Scale'], ['yo', 'Y Offset']].forEach(([k, l]) => {
        g.appendChild(h('label', {}, h('small', {}, l), numInput(v[k], x => { const nv = Object.assign({}, get(p.k)); nv[k] = x; upd(nv); }, { step: k.endsWith('s') ? 0.01 : 1, title: l })));
      });
      g.dataset.k = p.k;
      return g;
    }
    case 'udim': {
      const g = h('div', { class: 'udim' });
      [['s', 'Scale'], ['o', 'Offset']].forEach(([k, l]) => g.appendChild(h('label', {}, h('small', {}, l), numInput(v[k], x => { const nv = Object.assign({}, get(p.k)); nv[k] = x; upd(nv); }, { step: k === 's' ? 0.01 : 1 }))));
      return g;
    }
    case 'vec2': {
      const g = h('div', { class: 'udim' });
      [['x', 'X'], ['y', 'Y']].forEach(([k, l]) => g.appendChild(h('label', {}, h('small', {}, l), numInput(v[k], x => { const nv = Object.assign({}, get(p.k)); nv[k] = x; upd(nv); }, { step: p.step || 0.1 }))));
      if (p.anchor) {
        const pick = h('div', { class: 'anchor-pick', title: 'اختيار سريع لنقطة الارتكاز' });
        [0, 0.5, 1].forEach(y => [0, 0.5, 1].forEach(x => pick.appendChild(h('button', {
          class: (v.x === x && v.y === y) ? 'on' : '', onclick: () => {
            // المحافظة على مكان العنصر عند تغيير نقطة الارتكاز
            const n = ctxNode, info = S.map.get(n.id), pc = parentContent(parentOf(n.id));
            if (info && settings().units !== 'none') {
              const pos = n.props.Position, dx = (x - v.x) * info.w, dy = (y - v.y) * info.h;
              if (pos.xo !== 0 || pos.xs === 0) pos.xo = Math.round(pos.xo + dx); else pos.xs = +(pos.xs + dx / pc.w).toFixed(4);
              if (pos.yo !== 0 || pos.ys === 0) pos.yo = Math.round(pos.yo + dy); else pos.ys = +(pos.ys + dy / pc.h).toFixed(4);
            }
            upd({ x, y }, true); pushHistory(true);
          }
        }))));
        g.appendChild(pick);
      }
      return g;
    }
    case 'rect': {
      const g = h('div', { class: 'udim2' });
      [['x0', 'Min X'], ['y0', 'Min Y'], ['x1', 'Max X'], ['y1', 'Max Y']].forEach(([k, l]) => g.appendChild(h('label', {}, h('small', {}, l), numInput(v[k], x => { const nv = Object.assign({}, get(p.k)); nv[k] = x; upd(nv); }, { step: 1 }))));
      return g;
    }
    case 'image': case 'sound': {
      const wrap = h('div', { class: 'imgf' });
      const inp = h('input', { type: 'text', value: v, dir: 'ltr', placeholder: p.type === 'image' ? 'مثال: 6031075938 أو rbxassetid://...' : 'Sound ID' });
      inp.value = v;
      const th = h('div', { class: 'thumb' });
      const setThumb = id => {
        th.innerHTML = '';
        if (p.type !== 'image') { th.innerHTML = id ? '🔊' : '🔇'; return; }
        if (!id) { th.innerHTML = ICONS.ImageLabel; return; }
        th.classList.add('loading');
        Thumbs.resolve(id, u => { th.classList.remove('loading'); if (u) { const im = h('img', { src: u, alt: '' }); im.onerror = () => { th.innerHTML = '<b>?</b>'; th.title = 'تعذرت المعاينة — ستظهر في روبلوكس'; }; th.appendChild(im); } });
      };
      setThumb(imageId(v));
      inp.addEventListener('change', () => { const id = imageId(inp.value); inp.value = id; upd(id, false); setThumb(id); pushHistory(true); renderCanvas(); });
      inp.addEventListener('paste', () => setTimeout(() => inp.dispatchEvent(new Event('change')), 0));
      wrap.append(th, inp,
        h('button', { class: 'mini', title: 'ابحث في متجر روبلوكس (التولبوكس)', onclick: () => window.open(STORE_URL[p.type](ctxNode && ctxNode.name), '_blank', 'noopener') }, '🔍'),
        h('button', { class: 'mini', title: 'مسح', onclick: () => { inp.value = ''; upd('', false); setThumb(''); pushHistory(true); renderCanvas(); } }, '✕'));
      return wrap;
    }
    case 'colorseq': return seqEditor(p, v, upd, true, rebuild);
    case 'numseq': return seqEditor(p, v, upd, false, rebuild);
    case 'colors': {
      const wrap = h('div', { class: 'colors' });
      v.forEach((c, i) => {
        const inp = h('input', { type: 'color', value: c });
        inp.addEventListener('input', () => { const nv = [...get(p.k)]; nv[i] = inp.value; upd(nv); });
        inp.addEventListener('change', () => pushHistory(true));
        wrap.appendChild(h('div', { class: 'csw' }, inp, h('button', { class: 'x', onclick: () => { const nv = [...get(p.k)]; nv.splice(i, 1); upd(nv, true); pushHistory(true); } }, '×')));
      });
      wrap.appendChild(h('button', { class: 'mini add', onclick: () => { upd([...get(p.k), rgbHex([Math.random() * 255, Math.random() * 255, Math.random() * 255])], true); pushHistory(true); } }, '+'));
      const pal = { '🌈': ['#ff5d8f', '#ffd166', '#06d6a0', '#4cc9f0', '#9b5de5'], '🔥': ['#ff4800', '#ff9e00', '#ffd000'], '❄': ['#ffffff', '#a2d2ff', '#cdb4db'], '💰': ['#ffd60a', '#ffc300', '#fff3b0'], '💜': ['#7f5cff', '#b388ff', '#00c6ff'], '⚪': ['#ffffff'] };
      const pr = h('div', { class: 'palettes' }, Object.keys(pal).map(k => h('button', { class: 'mini', title: 'لوحة ألوان', onclick: () => { upd(clone(pal[k]), true); pushHistory(true); } }, k)));
      return h('div', {}, wrap, pr);
    }
  }
  return h('span', {}, '?');
}
function seqEditor(p, v, upd, isColor, rebuild) {
  const wrap = h('div', { class: 'seq' });
  const bar = h('div', { class: 'seq-bar' });
  const draw = () => {
    const cur = [...v].sort((a, b) => a.t - b.t);
    bar.style.background = isColor ? `linear-gradient(90deg, ${cur.map(k => `${k.c} ${k.t * 100}%`).join(',')})` : `linear-gradient(90deg, ${cur.map(k => `rgba(255,255,255,${1 - k.v}) ${k.t * 100}%`).join(',')}), repeating-conic-gradient(#555 0 25%, #333 0 50%) 0 0/12px 12px`;
  };
  draw(); wrap.appendChild(bar);
  v.forEach((k, i) => {
    const row = h('div', { class: 'seq-row' },
      h('small', {}, 'Time'), numInput(k.t, x => { v[i].t = Math.max(0, Math.min(1, x)); upd(v); draw(); }, { step: 0.05, min: 0, max: 1 }),
      isColor ? colorInput(k.c, x => { v[i].c = x; upd(v); draw(); }) : h('span', {}, h('small', {}, 'Value'), numInput(k.v, x => { v[i].v = Math.max(0, Math.min(1, x)); upd(v); draw(); }, { step: 0.05, min: 0, max: 1 })),
      v.length > 2 ? h('button', { class: 'mini', onclick: () => { v.splice(i, 1); upd(v, true); pushHistory(true); } }, '✕') : null);
    wrap.appendChild(row);
  });
  wrap.appendChild(h('button', { class: 'mini add', onclick: () => { v.push(isColor ? { t: 0.5, c: '#ffffff' } : { t: 0.5, v: 0.5 }); upd(v, true); pushHistory(true); } }, '+ نقطة'));
  if (isColor) {
    const presets = [['#7f5cff', '#00c6ff'], ['#ff5d8f', '#ffb347'], ['#06d6a0', '#1b9aaa'], ['#ffd60a', '#ff6b00'], ['#232526', '#414345'], ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'], ['#ffffff', '#ffffff']];
    wrap.appendChild(h('div', { class: 'grad-presets' }, presets.map(pr => h('button', {
      class: 'gp', style: { background: `linear-gradient(90deg, ${pr.join(',')})` },
      onclick: () => { upd(pr.map((c, i) => ({ t: +(i / (pr.length - 1)).toFixed(3), c })), true); pushHistory(true); }
    }))));
  } else {
    const presets = { 'ثابت': [{ t: 0, v: 0 }, { t: 1, v: 0 }], 'يختفي →': [{ t: 0, v: 0 }, { t: 1, v: 1 }], '← يختفي': [{ t: 0, v: 1 }, { t: 1, v: 0 }], 'أطراف': [{ t: 0, v: 1 }, { t: 0.5, v: 0 }, { t: 1, v: 1 }] };
    wrap.appendChild(h('div', { class: 'palettes' }, Object.keys(presets).map(k => h('button', { class: 'mini', onclick: () => { upd(clone(presets[k]), true); pushHistory(true); } }, k))));
  }
  return wrap;
}

function buildForm(container, schema, groupNames, get, set, opts = {}) {
  container.innerHTML = '';
  const q = (opts.filter || '').trim().toLowerCase();
  const rebuild = () => buildForm(container, schema, groupNames, get, set, opts);
  const groups = {};
  const obj = opts.whenObj ? opts.whenObj() : null;
  schema.forEach(p => {
    if (p.when && !p.when(obj)) return;
    const label = p.label || PROP_AR[p.k] || '';
    if (q && !(p.k.toLowerCase().includes(q) || label.includes(q))) return;
    (groups[p.group] = groups[p.group] || []).push(p);
  });
  Object.keys(groups).forEach(g => {
    const collapsed = (Store.get('rogui_collapsed', {}))[g];
    const sec = h('div', { class: 'pgroup' + (collapsed && !q ? ' collapsed' : '') });
    sec.appendChild(h('div', {
      class: 'pg-title', onclick: () => { const c = Store.get('rogui_collapsed', {}); c[g] = !sec.classList.contains('collapsed'); Store.set('rogui_collapsed', c); sec.classList.toggle('collapsed'); }
    }, h('span', {}, groupNames[g] || g), h('i', {}, '▾')));
    const body = h('div', { class: 'pg-body' });
    groups[g].forEach(p => {
      const lab = opts.anim ? h('div', { class: 'pl' }, h('b', {}, p.label)) : h('div', { class: 'pl' }, h('b', { dir: 'ltr' }, p.k.replace(/^_/, '')), h('small', {}, PROP_AR[p.k] || ''));
      const row = h('div', { class: 'prow t-' + p.type, 'data-k': p.k }, lab, h('div', { class: 'pc' }, fieldControl(p, get, set, rebuild, opts.node)));
      if (p.hint) row.appendChild(h('div', { class: 'phint' }, p.hint));
      body.appendChild(row);
    });
    sec.appendChild(body);
    container.appendChild(sec);
  });
  if (!container.children.length) container.appendChild(h('div', { class: 'empty' }, q ? '🔍 لا توجد خاصية تطابق البحث' : '—'));
}

function syncPropInputs() {
  const n = sel(); if (!n) return;
  ['Position', 'Size'].forEach(k => {
    const g = $(`#propForm .udim2[data-k="${k}"]`); if (!g || !n.props[k]) return;
    const ins = g.querySelectorAll('input'); const v = n.props[k];
    [v.xs, v.xo, v.ys, v.yo].forEach((x, i) => { if (document.activeElement !== ins[i]) ins[i].value = x; });
  });
  const r = $('#propForm .prow[data-k="Rotation"] input'); if (r && document.activeElement !== r) r.value = n.props.Rotation;
}

function hintsFor(n) {
  const out = [];
  if (!isGui(n)) return out;
  const m = modsOf(n), a = animOf(n);
  if (m.UIGradient && CLASSES[n.cls].text && n.props.Text) out.push({ t: 'ℹ UIGradient يلوّن النص والخلفية معاً. لو تبي النص أبيض ضع النص في TextLabel داخل العنصر.' });
  if ((a.hoverOn && a.hoverScale !== 1 || a.pressOn || a.idleType === 'pulse' || a.clickMotion === 'bounce') && (n.props.AnchorPoint.x !== 0.5 || n.props.AnchorPoint.y !== 0.5))
    out.push({ t: '💡 التكبير يصير من نقطة الارتكاز. للتكبير من المنتصف خلّ AnchorPoint = 0.5, 0.5', fix: () => { const info = S.map.get(n.id), p = n.props, pc = parentContent(parentOf(n.id)); if (info) { p.Position.xo = Math.round(p.Position.xo + (0.5 - p.AnchorPoint.x) * info.w); p.Position.yo = Math.round(p.Position.yo + (0.5 - p.AnchorPoint.y) * info.h); } p.AnchorPoint = V2(0.5, 0.5); changed(true); } });
  if (CLASSES[n.cls].button && n.props.AutoButtonColor && (a.hoverColorOn || a.pressColorOn)) out.push({ t: '⚠ AutoButtonColor شغال مع تغيير اللون — الأفضل تطفيه', fix: () => { n.props.AutoButtonColor = false; changed(true); } });
  if (a.clickFx === 'ripple' && !n.props.ClipsDescendants) out.push({ t: 'ℹ تأثير التموج يفعّل ClipsDescendants تلقائياً داخل اللعبة' });
  const par = parentOf(n.id);
  if (par && parentContent(par).layout && (a.hoverLift || a.idleType === 'float' || ['slideTop', 'slideBottom', 'slideLeft', 'slideRight', 'drop'].includes(a.enterType)))
    out.push({ t: '⚠ العنصر داخل Layout — حركات التحريك (رفع/طفو/انزلاق) ما تشتغل لأن الـ Layout يتحكم بالموقع. استخدم التكبير بدلها.' });
  if (TARGET_ACTIONS.includes(a.actionType) && a.actionTarget && !Play.findByName.call({ project: S.project }, a.actionTarget)) out.push({ t: `⚠ ما في عنصر اسمه "${a.actionTarget}"` });
  if (TARGET_ACTIONS.includes(a.actionType) && !a.actionTarget && !['pageNext', 'pagePrev'].includes(a.actionType)) out.push({ t: '✏ اكتب اسم العنصر المستهدف في تبويب الأنميشن ← إجراء عند النقر' });
  if (a.actionType === 'toggleSwitch' && !n.children.some(c => c.name === 'Knob')) out.push({ t: '⚠ مفتاح التشغيل يحتاج ابن اسمه "Knob" (الدائرة اللي تتحرك)', fix: () => { n.children.push(mk('Frame', 'Knob', { Size: U2(0, 24, 0, 24), Position: U2(0, 3, 0.5, 0), AnchorPoint: V2(0, 0.5), BackgroundColor3: '#ffffff' }, [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) })])); changed(true); } });
  if (a.actionType === 'tab') out.push({ t: 'ℹ التبويب يفتح العنصر المستهدف ويغلق كل إخوانه (العناصر اللي معه بنفس الأب) — حط الصفحات داخل Frame لحالها.' });
  if (a.hotkey) out.push({ t: `⌨ الاختصار "${a.hotkey}" — أسماء روبلوكس: E, Q, Tab, Space, One, Two, Left, Right, F1 ...` });
  return out;
}

function renderProps() {
  const n = sel() || root();
  const head = $('#propHead'), form = $('#propForm'), animBox = $('#animForm');
  head.innerHTML = '';
  head.appendChild(h('div', { class: 'ph-top' },
    h('span', { class: 'ph-ic c-' + (isMod(n) ? 'mod' : n.cls), html: ICONS[n.cls] }),
    h('input', {
      class: 'ph-name', value: n.name, dir: 'ltr', onchange: e => { n.name = e.target.value.trim().replace(/\s+/g, '') || n.cls; changed(true); }
    }),
    h('small', { class: 'ph-cls' }, n.cls),
    n !== root() ? h('button', { class: 'mini', title: 'تكرار (Ctrl+D)', onclick: duplicateSel }, '⧉') : null,
    n !== root() ? h('button', { class: 'mini danger', title: 'حذف (Delete)', onclick: deleteSel }, '🗑') : null));
  if (isGui(n) || n === root()) {
    const have = new Set(n.children.map(c => c.cls));
    const chips = h('div', { class: 'mod-chips' }, h('small', {}, isGui(n) ? '➕ إضافات:' : '➕ إضافة:'));
    if (isGui(n)) MOD_CLASSES.forEach(c => chips.appendChild(h('button', { class: 'chip' + (have.has(c) ? ' have' : ''), title: CLASSES[c].ar, onclick: () => { const ex = n.children.find(x => x.cls === c); if (ex) select(ex.id); else addClass(c, n.id); } }, h('span', { html: ICONS[c] }), c.replace(/^UI/, ''))));
    else GUI_CLASSES.forEach(c => chips.appendChild(h('button', { class: 'chip', onclick: () => addClass(c, n.id) }, h('span', { html: ICONS[c] }), c)));
    head.appendChild(chips);
  }
  const hints = hintsFor(n);
  if (hints.length) head.appendChild(h('div', { class: 'hints' }, hints.map(x => h('div', { class: 'hint' }, h('span', {}, x.t), x.fix ? h('button', { class: 'mini', onclick: x.fix }, 'إصلاح') : null))));
  if (n === root()) head.appendChild(h('div', { class: 'phint big' }, '🖥 هذا هو الـ ScreenGui (الجذر). كل العناصر تنضاف داخله. عند التصدير بيكون داخل Part في Workspace.'));
  buildForm(form, SCHEMA[n.cls] || [], GROUPS, k => n.props[k], (k, v) => { n.props[k] = v; liveUpdate(); }, { filter: S.propFilter, whenObj: () => n.props, node: n });
  // الأنميشن
  animBox.innerHTML = '';
  if (!isGui(n)) { animBox.appendChild(h('div', { class: 'empty big' }, '✨ الأنميشنات متاحة للعناصر (Frame, Button, Label, Image...)\nحدد عنصر من اللوحة أو المستكشف.')); return; }
  n.anim = n.anim || {};
  const presets = h('div', { class: 'anim-presets' }, h('small', {}, '⚡ ستايلات جاهزة (اضغط لتطبيقها):'), h('div', { class: 'chips' }, ANIM_PRESETS.map(pr => h('button', {
    class: 'chip' + (pr.a ? '' : ' danger'), onclick: () => { if (!pr.a) n.anim = {}; else Object.assign(n.anim, clone(pr.a)); changed(true); toast(pr.a ? '✨ تم تطبيق ' + pr.n : '🧹 تم مسح الأنميشن', 1200); }
  }, pr.n))));
  animBox.appendChild(presets);
  animBox.appendChild(h('button', { class: 'btn play-try', onclick: () => togglePlay(true) }, '▶ جرّب الأنميشن الحين'));
  const af = h('div', { class: 'anim-form' });
  animBox.appendChild(af);
  buildForm(af, ANIM, ANIM_GROUPS, k => animOf(n)[k], (k, v) => { n.anim[k] = v; pushHistory(); renderTreeLite(); }, { filter: S.propFilter, whenObj: () => animOf(n), anim: true, node: n });
}
let _tlTimer = 0;
function renderTreeLite() { clearTimeout(_tlTimer); _tlTimer = setTimeout(renderTree, 300); }

/* ===================== قائمة السياق ===================== */
function showCtx(x, y) {
  const n = sel(); const m = $('#ctxmenu'); m.innerHTML = '';
  const it = (label, fn, key, cls) => h('button', { class: 'ci ' + (cls || ''), onclick: () => { hideCtx(); fn(); } }, h('span', {}, label), key ? h('kbd', {}, key) : null);
  const items = [];
  if (n && n !== root()) {
    items.push(it('📋 نسخ', () => copySel(false), 'Ctrl+C'), it('✂ قص', () => copySel(true), 'Ctrl+X'));
  }
  items.push(it('📥 لصق', paste, 'Ctrl+V'));
  items.push(it('🤖 اسأل الذكاء: وش الناقص؟', () => openAI('review'), 'Ctrl+K'));
  if (n && isGui(n) && (CLASSES[n.cls].button || CLASSES[n.cls].image)) items.push(it('🎨 صمّم أيقونة بالذكاء', () => openAI('icons')));
  if (n && n !== root()) {
    items.push(it('⧉ تكرار', duplicateSel, 'Ctrl+D'), h('hr'));
    if (isGui(n)) items.push(it('⬆ تقديم (ZIndex +1)', () => zSel(1), ']'), it('⬇ تأخير (ZIndex -1)', () => zSel(-1), '['));
    items.push(it('↑ نقل لأعلى بالترتيب', () => moveSibling(-1)), it('↓ نقل لأسفل بالترتيب', () => moveSibling(1)));
    items.push(it('📦 نقل داخل...', () => moveIntoDialog()));
    if (isGui(n)) {
      items.push(h('hr'), it('🎯 توسيط', () => alignSel('center')), it('⛶ ملء الأب', () => alignSel('fill')), it('📐 تحويل إلى Scale', () => convertUnits('scale')), it('📏 تحويل إلى Offset', () => convertUnits('offset')));
      items.push(h('hr'), it('⭐ حفظ كقالب', saveAsMyTemplate), it(n.locked ? '🔓 فك القفل' : '🔒 قفل', () => toggleProp(n.id, 'locked')), it(n.props.Visible ? '🙈 إخفاء' : '👁 إظهار', () => toggleProp(n.id, 'Visible')));
    }
    if (isGui(n)) items.push(h('hr'), it('🎨 نسخ الستايل', copyStyle, 'Ctrl+Shift+C'), it('🖌 لصق الستايل', pasteStyle, 'Ctrl+Shift+V'), it('🌑 إضافة ظل', addShadow), it('📦 تغليف داخل Frame', wrapInFrame, 'Ctrl+G'), it('📜 سكربت هذا العنصر فقط', () => openExport(false, true)));
    items.push(h('hr'), it('🗑 حذف', deleteSel, 'Del', 'danger'));
  }
  items.forEach(i => m.appendChild(i));
  m.style.display = 'block';
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(4, Math.min(x, innerWidth - r.width - 4)) + 'px';
  m.style.top = Math.max(4, Math.min(y, innerHeight - r.height - 4)) + 'px';
}
function hideCtx() { $('#ctxmenu').style.display = 'none'; }
function moveIntoDialog() {
  const n = sel(); if (!n) return;
  const list = h('div', { class: 'move-list' });
  walkTree(root(), (x, d) => {
    if (x === n || isAncestor(n.id, x.id) || !canHold(x, n)) return;
    list.appendChild(h('button', { class: 'ml-item', style: { paddingInlineStart: (8 + d * 14) + 'px' }, onclick: () => { closeModal(); reparent(n.id, x.id); } }, h('span', { html: ICONS[x.cls] }), ' ' + x.name, h('small', {}, ' ' + x.cls)));
  });
  openModal('📦 نقل "' + n.name + '" داخل...', list, [{ t: 'إلغاء' }]);
}

/* ===================== النوافذ (Modals) ===================== */
function openModal(title, content, buttons = [], cls = '') {
  closeModal();
  const m = h('div', { class: 'modal-back', onclick: e => { if (e.target === m) closeModal(); } },
    h('div', { class: 'modal ' + cls },
      h('div', { class: 'm-head' }, h('h3', {}, title), h('button', { class: 'mini', onclick: closeModal }, '✕')),
      h('div', { class: 'm-body' }, content),
      buttons.length ? h('div', { class: 'm-foot' }, buttons.map(b => h('button', { class: 'btn ' + (b.cls || ''), onclick: () => { if (b.fn) b.fn(); if (!b.keep) closeModal(); } }, b.t))) : null));
  $('#modal-root').appendChild(m);
  requestAnimationFrame(() => m.classList.add('show'));
  return m;
}
function closeModal() { $('#modal-root').innerHTML = ''; }

/* ===================== الحفظ والمشاريع ===================== */
function saveProject(showScript = true) {
  const saves = Store.get('rogui_saves', []);
  S.project.name = $('#projName').value.trim() || 'مشروعي';
  const entry = { id: S.project.id || uid(), name: S.project.name, date: Date.now(), count: countNodes(root()) - 1, data: clone(S.project) };
  S.project.id = entry.id; entry.data.id = entry.id;
  const i = saves.findIndex(s => s.id === entry.id);
  if (i >= 0) saves[i] = entry; else saves.unshift(entry);
  if (Store.set('rogui_saves', saves)) toast('💾 تم الحفظ في "مشاريعي"', 1500, 'ok');
  autosave();
  if (showScript) openExport(true);
}
function openSaves() {
  const wrap = h('div', { class: 'saves' });
  const search = h('input', { type: 'search', class: 'search', placeholder: 'ابحث في مشاريعك...' });
  const list = h('div', { class: 'save-list' });
  const draw = () => {
    list.innerHTML = '';
    const q = search.value.trim().toLowerCase();
    const saves = Store.get('rogui_saves', []).filter(s => !q || s.name.toLowerCase().includes(q));
    if (!saves.length) { list.appendChild(h('div', { class: 'empty big' }, q ? 'لا توجد نتائج' : '📭 ما عندك مشاريع محفوظة بعد.\nاضغط "حفظ" لحفظ مشروعك الحالي.')); return; }
    saves.forEach(s => {
      const prev = h('div', { class: 'sv-prev' });
      const card = h('div', { class: 'sv-card' + (s.id === S.project.id ? ' current' : '') }, prev,
        h('div', { class: 'sv-info' }, h('b', {}, s.name), h('small', {}, `🧱 ${s.count} عنصر · ${new Date(s.date).toLocaleString('ar')}`)),
        h('div', { class: 'sv-acts' },
          h('button', { class: 'btn sm primary', onclick: () => { loadProject(clone(s.data)); closeModal(); toast('📂 تم فتح ' + s.name); } }, 'فتح'),
          h('button', { class: 'btn sm', onclick: () => { const g = Exporter.generate(s.data, exportOpts()); copyText(g); } }, '📋 السكربت'),
          h('button', { class: 'btn sm', onclick: () => { const nm = prompt('الاسم الجديد:', s.name); if (!nm) return; const all = Store.get('rogui_saves', []); const x = all.find(a => a.id === s.id); x.name = nm; x.data.name = nm; Store.set('rogui_saves', all); if (S.project.id === s.id) { S.project.name = nm; $('#projName').value = nm; } draw(); } }, '✏'),
          h('button', { class: 'btn sm', title: 'نسخة', onclick: () => { const all = Store.get('rogui_saves', []); const c = clone(s); c.id = uid(); c.data.id = c.id; c.name += ' (نسخة)'; c.data.name = c.name; c.date = Date.now(); all.unshift(c); Store.set('rogui_saves', all); draw(); } }, '⧉'),
          h('button', { class: 'btn sm', title: 'تحميل JSON', onclick: () => download(s.name + '.rogui.json', JSON.stringify(s.data, null, 1)) }, '⬇'),
          h('button', { class: 'btn sm danger', onclick: () => { if (!confirm('حذف "' + s.name + '" نهائياً؟')) return; Store.set('rogui_saves', Store.get('rogui_saves', []).filter(a => a.id !== s.id)); if (S.project.id === s.id) delete S.project.id; draw(); } }, '🗑')));
      list.appendChild(card);
      requestAnimationFrame(() => {
        try {
          const [W, H] = (s.data.settings && s.data.settings.screen || '1920x1080').split('x').map(Number);
          const host = h('div', { class: 'tpl-host', style: { width: W + 'px', height: H + 'px' } });
          prev.appendChild(host);
          renderGui(s.data.root, host, { w: W, h: H, play: true });
          const sc = prev.clientWidth / W; host.style.transform = `scale(${sc})`; prev.style.height = H * sc + 'px';
        } catch (e) { }
      });
    });
  };
  search.addEventListener('input', draw);
  wrap.append(search, list);
  draw();
  openModal('📂 مشاريعي المحفوظة', wrap, [{ t: '➕ مشروع جديد', fn: newProject }, { t: '📥 استيراد JSON', fn: importJson }, { t: 'إغلاق' }], 'wide');
}
function loadProject(p) {
  if (Play.active) togglePlay(false);
  p.settings = Object.assign({}, DEFAULT_SETTINGS, p.settings || {});
  S.project = p; S.sel = p.root.id; S.hist = []; S.fut = []; _lastSnap = snap();
  $('#projName').value = p.name;
  syncToolbar(); S.autoFit = true; renderAll(); updateUndoButtons(); autosave();
}
function newProject() {
  if (countNodes(root()) > 1 && !confirm('بدء مشروع جديد؟ (احفظ مشروعك الحالي أول لو تبيه)')) return;
  loadProject({ name: 'مشروع جديد', root: newRoot(), settings: clone(DEFAULT_SETTINGS) });
  toast('✨ مشروع جديد');
}
function importJson() {
  const inp = h('input', { type: 'file', accept: '.json,application/json' });
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    f.text().then(t => {
      try {
        const d = JSON.parse(t);
        if (!d.root || d.root.cls !== 'ScreenGui') throw 0;
        delete d.id; loadProject(d); closeModal(); toast('📥 تم الاستيراد');
      } catch (e) { toast('⚠ ملف غير صالح', 2500, 'err'); }
    });
  };
  inp.click();
}
function download(name, text, type = 'text/plain') {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' })), download: name });
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function copyText(t) {
  const fallback = () => { const ta = h('textarea', { style: { position: 'fixed', opacity: 0 } }); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('📋 تم نسخ السكربت!', 1800, 'ok'); } catch (e) { toast('⚠ انسخ يدوياً', 2000, 'err'); } ta.remove(); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(() => toast('📋 تم نسخ السكربت!', 1800, 'ok'), fallback); else fallback();
}

/* ===================== التصدير ===================== */
function exportOpts() { return Object.assign({ mode: 'model', runtime: true, decal: true, starterGui: false, label: true, modelName: '', partName: 'GuiHolder' }, Store.get('rogui_exportopts', {})); }
function selectedProject() {
  const n = sel();
  if (!n || !isGui(n)) return S.project;
  const r = clone(root()); r.children = [clone(n)]; r.name = n.name + 'Gui';
  return { name: S.project.name + ' — ' + n.name, root: r, settings: S.project.settings };
}
function hlLua(code) {
  const re = /(--\[(=*)\[[\s\S]*?\]\2\])|(--[^\n]*)|(\[(=*)\[[\s\S]*?\]\5\])|("(?:\\.|[^"\\\n])*")|\b(local|function|end|if|then|else|elseif|for|in|do|return|not|and|or|nil|true|false|while|repeat|until|break|continue)\b|(\b\d+(?:\.\d+)?\b)|\b(Instance|UDim2|UDim|Vector2|Vector3|Color3|ColorSequence|ColorSequenceKeypoint|NumberSequence|NumberSequenceKeypoint|Enum|Rect|game|workspace|script|TweenInfo|task|math|pcall)\b/g;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += escHtml(code.slice(last, m.index));
    const cls = m[1] || m[3] ? 'c' : m[4] ? 'ls' : m[6] ? 's' : m[7] ? 'k' : m[8] ? 'n' : 'g';
    out += `<span class="hl-${cls}">${escHtml(m[0])}</span>`;
    last = re.lastIndex;
  }
  return out + escHtml(code.slice(last));
}
function openExport(afterSave, onlySel) {
  const o = exportOpts();
  o.onlySel = !!onlySel && !!sel() && isGui(sel());
  const pre = h('pre', { class: 'code', dir: 'ltr' });
  const stats = h('div', { class: 'exp-stats' });
  const steps = h('div', { class: 'exp-steps' });
  let code = '';
  const gen = () => {
    const proj = o.onlySel ? selectedProject() : S.project;
    code = Exporter.generate(proj, Object.assign({}, o, { modelName: o.modelName || ('RoGUI_' + proj.root.name) }));
    const lines = code.split('\n');
    const shown = lines.length > 1600 ? lines.slice(0, 1600).join('\n') + '\n-- ... (السكربت كامل ينسخ بزر النسخ)' : code;
    pre.innerHTML = hlLua(shown);
    stats.innerHTML = '';
    stats.append(h('span', {}, `🧱 ${countNodes(proj.root) - 1} عنصر`), h('span', {}, `📄 ${lines.length} سطر`), h('span', {}, `💾 ${(new Blob([code]).size / 1024).toFixed(1)} KB`), h('span', {}, o.mode === 'local' ? '🧑‍💻 LocalScript' : '📦 Model ← Part ← ScreenGui'));
    steps.innerHTML = '';
    const st = o.mode === 'local'
      ? ['انسخ السكربت', 'StarterPlayer ← StarterPlayerScripts', 'أضف LocalScript والصق الكود', 'شغّل اللعبة ▶ — الواجهة تنبني تلقائياً']
      : ['انسخ السكربت', 'Roblox Studio ← View ← Command Bar', 'الصق واضغط Enter — يطلع Model في Workspace', 'افتح Model ← Part واسحب الـ ScreenGui إلى StarterGui'];
    st.forEach((t, i) => steps.appendChild(h('div', {}, h('i', {}, String(i + 1)), t)));
    const store = Object.assign({}, o); delete store.onlySel;
    Store.set('rogui_exportopts', store);
    modelRow.style.display = partRow.style.display = labelRow.style.display = decalRow.style.display = sgRow.style.display = o.mode === 'local' ? 'none' : '';
  };
  const opt = (k, label, desc) => h('label', { class: 'exp-opt' }, sw(o[k], v => { o[k] = v; gen(); }), h('div', {}, h('b', {}, label), h('small', {}, desc)));
  const modelInp = h('input', { type: 'text', value: o.modelName, dir: 'ltr', placeholder: 'RoGUI_' + root().name });
  modelInp.addEventListener('input', () => { o.modelName = modelInp.value.trim(); gen(); });
  const partInp = h('input', { type: 'text', value: o.partName, dir: 'ltr' });
  partInp.addEventListener('input', () => { o.partName = partInp.value.trim() || 'GuiHolder'; gen(); });
  const modeSel = h('div', { class: 'mode-sel' },
    ...[['model', '📦 Model + Part', 'يشتغل من Command Bar وتاخذ الواجهة من البارت'], ['local', '🧑‍💻 LocalScript', 'كود تحطه في LocalScript ويبني الواجهة وقت اللعب']].map(([k, t, d]) =>
      h('button', { class: 'mode-btn' + (o.mode === k ? ' on' : ''), onclick: e => { o.mode = k; $$('.mode-btn', modeSel).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); gen(); } }, h('b', {}, t), h('small', {}, d))));
  const modelRow = h('label', { class: 'exp-opt' }, h('div', {}, h('b', {}, '📦 اسم الموديل'), modelInp));
  const partRow = h('label', { class: 'exp-opt' }, h('div', {}, h('b', {}, '🧩 اسم البارت داخل الموديل'), partInp));
  const labelRow = opt('label', '🏷 لافتة فوق البارت', 'BillboardGui يوضح اسم الواجهة في Workspace');
  const decalRow = opt('decal', '🖼 تحويل Decal ID تلقائياً', 'لو حطيت ID من التولبوكس (Decal) يتحول للصورة الصحيحة');
  const sgRow = opt('starterGui', '📌 نسخة إضافية في StarterGui', 'بالإضافة للموديل، يحط نسخة جاهزة مباشرة');
  const selRow = sel() && isGui(sel()) ? h('label', { class: 'exp-opt' }, sw(o.onlySel, v => { o.onlySel = v; gen(); }), h('div', {}, h('b', {}, '🎯 العنصر المحدد فقط'), h('small', {}, 'يصدّر "' + sel().name + '" وأبناءه بس'))) : null;
  const body = h('div', { class: 'export' },
    afterSave ? h('div', { class: 'exp-banner' }, '✅ تم حفظ المشروع في قائمة "مشاريعي" — وهذا سكربت الواجهة كاملة:') : null,
    modeSel, steps,
    h('div', { class: 'exp-opts' }, modelRow, partRow,
      opt('runtime', '✨ تضمين سكربت الأنميشن', 'يشغّل Hover / الضغط / الطراطيع / الظهور / التبويبات ...'),
      labelRow, decalRow, sgRow, selRow),
    stats, pre);
  gen();
  openModal(afterSave ? '💾 تم الحفظ + سكربت الواجهة' : '📜 تصدير سكربت روبلوكس', body, [
    { t: '📋 نسخ السكربت', cls: 'primary', fn: () => copyText(code), keep: true },
    { t: '⬇ تحميل .lua', fn: () => download((root().name || 'gui') + '.lua', code), keep: true },
    { t: '⬇ تحميل .txt', fn: () => download((root().name || 'gui') + '.txt', code), keep: true },
    { t: 'إغلاق' }], 'wide');
}

/* ===================== وضع التجربة ===================== */
function togglePlay(on) {
  S.play = on == null ? !S.play : on;
  document.body.classList.toggle('playing', S.play);
  $('#btnPlay').innerHTML = S.play ? '⏹ <span>إيقاف</span>' : '▶ <span>تجربة</span>';
  if (!S.play && Play.active) Play.stop();
  renderCanvas();
  if (S.play) { toast('▶ وضع التجربة — مرّر واضغط على العناصر. (Esc للخروج)', 2600); if (window.innerWidth < 900) setMobilePanel('canvas'); }
}

/* ===================== الإسقاط على اللوحة ===================== */
function handleToolDrop(data, parentId, pt) {
  let node = null;
  if (data.cls) node = newNode(data.cls);
  else if (data.tpl != null) node = reId(TEMPLATES[data.tpl].f());
  else if (data.mine) { const t = Store.get('rogui_mytemplates', []).find(x => x.id === data.mine); if (t) node = reId(clone(t.node)); }
  if (!node) return;
  if (pt && isGui(node)) {
    const parent = findNode(parentId), pc = parentContent(parent);
    if (!pc.layout) {
      const info = S.map.get(parentId);
      const pr = parent.cls === 'ScreenGui' ? { x: 0, y: 0 } : elRectInArea(info.el);
      const lx = pt.x - pr.x - pc.pl, ly = pt.y - pr.y - pc.pt;
      node.props.Position = U2(0, snapV(lx), 0, snapV(ly));
      if (node.props.Size.xs || node.props.Size.ys) { /* حجم نسبي — نتركه */ }
    }
  }
  insertNode(node, parentId);
}
function onCanvasDrop(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData('text/rogui'); if (!data) return;
  const d = JSON.parse(data);
  const a = $('#guiArea').getBoundingClientRect();
  const pt = { x: (e.clientX - a.left) / S.zoom, y: (e.clientY - a.top) / S.zoom };
  let parentId = root().id;
  if (!(d.cls && CLASSES[d.cls].kind === 'mod')) {
    const els = document.elementsFromPoint(e.clientX, e.clientY).filter(x => x.classList && x.classList.contains('rg-el'));
    for (const el of els) { const n = findNode(el.dataset.id); if (n && !['TextLabel', 'TextBox'].includes(n.cls) && !n.locked) { parentId = n.id; break; } }
  } else {
    const el = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.classList && x.classList.contains('rg-el'));
    if (el) parentId = el.dataset.id; else return toast('أسقط المعدّل فوق عنصر', 1800, 'warn');
  }
  handleToolDrop(d, parentId, pt);
}

/* ===================== شريط الأدوات ===================== */
function syncToolbar() {
  const st = settings();
  $('#selScreen').value = st.screen; $('#selBg').value = st.bg; $('#selGrid').value = st.grid;
  $('#tgSnap').classList.toggle('on', st.snap); $('#tgGrid').classList.toggle('on', st.showGrid); $('#tgHidden').classList.toggle('on', st.showHidden);
  $('#tgUnits').textContent = st.units === 'scale' ? '📐 Scale' : '📏 Offset';
  $('#tgUnits').title = st.units === 'scale' ? 'السحب والتحجيم يعدل Scale (نسبي — يتجاوب مع كل الشاشات)' : 'السحب والتحجيم يعدل Offset (بكسل ثابت)';
}
function setMobilePanel(p) { document.body.dataset.mpanel = p; $$('.mobnav button').forEach(b => b.classList.toggle('on', b.dataset.p === p)); if (p === 'canvas') setTimeout(() => { S.autoFit = true; fitZoom(); updateSelection(); }, 50); }
function setTab(side, tab) {
  S.panelTab[side] = tab;
  $$(`.panel[data-side="${side}"] .tabs button`).forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $$(`.panel[data-side="${side}"] .tab-pane`).forEach(p => p.classList.toggle('on', p.dataset.tab === tab));
}

function showWelcome(force) {
  if (!force && Store.get('rogui_welcomed', false)) return;
  Store.set('rogui_welcomed', true);
  const body = h('div', { class: 'welcome' },
    h('div', { class: 'wl-hero' }, h('div', { class: 'wl-logo' }, '✦'), h('h2', {}, 'أهلاً في RoGUI Studio'), h('p', {}, 'صمّم واجهات روبلوكس بالسحب والإفلات، أضف أنميشنات وتأثيرات، وصدّرها كسكربت جاهز.')),
    h('div', { class: 'wl-grid' },
      [['🧱', 'أضف عناصر', 'من "العناصر" — أو اسحبها للوحة مباشرة'], ['🎛', 'إضافات UI', 'UICorner, UIStroke, UIGradient وكل المعدلات'], ['✨', 'أنميشنات', 'Hover، ضغط، طراطيع، قلوب، ظهور، حركة مستمرة'],
      ['🖼', 'صور بالـ ID', 'حط ID الصورة من التولبوكس وتظهر لك'], ['🤖', 'ذكاء اصطناعي', 'يراجع تصميمك ويقول وش الناقص، يصمم واجهات كاملة، ويرسم أيقونات'], ['💾', 'احفظ وصدّر', 'يحفظ بقائمة ويعطيك سكربت ينشئ Model ← Part ← الواجهة']].map(([i, t, d]) => h('div', { class: 'wl-card' }, h('i', {}, i), h('b', {}, t), h('small', {}, d)))),
    h('div', { class: 'wl-keys' }, h('b', {}, '⌨ اختصارات: '), 'Ctrl+Z تراجع · Ctrl+D تكرار · Delete حذف · الأسهم تحريك · Ctrl+S حفظ · Alt+نقر يحدد الأب · Shift للحفاظ على النسبة'));
  openModal('👋 مرحباً!', body, [{ t: '✨ ابدأ بقالب', fn: () => { addTemplate(TEMPLATES[6].f); } }, { t: 'ابدأ من الصفر', cls: 'primary' }], 'wide');
}
function showShortcuts() {
  const keys = [['Ctrl + S', 'حفظ + السكربت'], ['Ctrl + E', 'تصدير السكربت'], ['Ctrl + Z / Ctrl + Y', 'تراجع / إعادة'], ['Ctrl + C / X / V', 'نسخ / قص / لصق'], ['Ctrl + D', 'تكرار'], ['Delete', 'حذف'], ['الأسهم', 'تحريك 1px (Shift = 10px)'], ['[ / ]', 'ZIndex'], ['Esc', 'تحديد الأب / خروج من التجربة'], ['P', 'وضع التجربة'], ['Alt + نقر', 'تحديد الأب'], ['Shift + تحجيم', 'الحفاظ على النسبة'], ['F', 'ملاءمة الشاشة'], ['Ctrl + G', 'تغليف داخل Frame'], ['Ctrl + K', 'مساعد الذكاء 🤖'], ['Ctrl + Shift + C / V', 'نسخ / لصق الستايل']];
  openModal('⌨ الاختصارات', h('div', { class: 'keys' }, keys.map(([k, d]) => h('div', {}, h('kbd', { dir: 'ltr' }, k), h('span', {}, d)))), [{ t: 'تم' }]);
}

/* ===================== التهيئة ===================== */
function init() {
  const saved = Store.get('rogui_current', null);
  if (saved && saved.root && saved.root.cls === 'ScreenGui') { saved.settings = Object.assign({}, DEFAULT_SETTINGS, saved.settings || {}); S.project = saved; }
  else S.project = { name: 'مشروعي الأول', root: newRoot(), settings: clone(DEFAULT_SETTINGS) };
  S.sel = root().id;
  _lastSnap = snap();
  $('#projName').value = S.project.name;
  $('#projName').addEventListener('change', e => { S.project.name = e.target.value.trim() || 'مشروعي'; pushHistory(true); });

  // القوائم
  Object.entries(SCREENS).forEach(([k, v]) => $('#selScreen').appendChild(h('option', { value: k }, v)));
  Object.entries(BGS).forEach(([k, v]) => $('#selBg').appendChild(h('option', { value: k }, v)));
  [1, 2, 4, 5, 8, 10, 16, 20, 25, 50].forEach(g => $('#selGrid').appendChild(h('option', { value: g }, 'شبكة ' + g + 'px')));
  $('#selScreen').onchange = e => { settings().screen = e.target.value; S.autoFit = true; renderCanvas(); autosave(); };
  $('#selBg').onchange = e => { settings().bg = e.target.value; renderCanvas(); autosave(); };
  $('#selGrid').onchange = e => { settings().grid = +e.target.value; renderCanvas(); autosave(); };
  $('#tgSnap').onclick = () => { settings().snap = !settings().snap; syncToolbar(); autosave(); toast(settings().snap ? '🧲 المحاذاة للشبكة: تشغيل' : '🧲 المحاذاة للشبكة: إيقاف', 1000); };
  $('#tgGrid').onclick = () => { settings().showGrid = !settings().showGrid; syncToolbar(); renderCanvas(); autosave(); };
  $('#tgHidden').onclick = () => { settings().showHidden = !settings().showHidden; syncToolbar(); renderCanvas(); autosave(); };
  $('#tgUnits').onclick = () => { settings().units = settings().units === 'scale' ? 'offset' : 'scale'; syncToolbar(); autosave(); toast(settings().units === 'scale' ? '📐 السحب الحين يعدّل Scale' : '📏 السحب الحين يعدّل Offset', 1500); };
  $('#zoomIn').onclick = () => setZoom(S.zoom * 1.2);
  $('#zoomOut').onclick = () => setZoom(S.zoom / 1.2);
  $('#zoomFit').onclick = () => { fitZoom(true); updateSelection(); };
  $$('[data-align]').forEach(b => b.onclick = () => alignSel(b.dataset.align));
  $('#toScale').onclick = () => convertUnits('scale');
  $('#toOffset').onclick = () => convertUnits('offset');

  // الأزرار العلوية
  $('#btnNew').onclick = newProject;
  $('#btnOpen').onclick = openSaves;
  $('#btnSave').onclick = () => saveProject(true);
  $('#btnExport').onclick = () => openExport(false);
  $('#btnUndo').onclick = undo;
  $('#btnRedo').onclick = redo;
  $('#btnPlay').onclick = () => togglePlay();
  $('#btnMore').onclick = e => {
    e.stopPropagation();
    const m = $('#ctxmenu'); m.innerHTML = '';
    const it = (l, f) => h('button', { class: 'ci', onclick: () => { hideCtx(); f(); } }, h('span', {}, l));
    [it('📥 استيراد مشروع JSON', importJson), it('📤 تصدير المشروع JSON', () => download((S.project.name || 'project') + '.rogui.json', JSON.stringify(S.project, null, 1), 'application/json')),
    it('⌨ الاختصارات', showShortcuts), it('👋 شاشة الترحيب', () => showWelcome(true)), it('🧹 مسح كل العناصر', () => { if (confirm('مسح كل العناصر؟')) { root().children = []; S.sel = root().id; changed(true); } })].forEach(x => m.appendChild(x));
    const r = e.currentTarget.getBoundingClientRect();
    m.style.display = 'block'; const mr = m.getBoundingClientRect();
    m.style.left = Math.max(4, Math.min(r.left, innerWidth - mr.width - 4)) + 'px'; m.style.top = (r.bottom + 6) + 'px';
  };

  // التبويبات
  $$('.panel .tabs button').forEach(b => b.onclick = () => setTab(b.closest('.panel').dataset.side, b.dataset.tab));
  $$('.mobnav button').forEach(b => b.onclick = () => {
    const p = b.dataset.p; setMobilePanel(p);
    if (p === 'tools' || p === 'tree') setTab('left', p);
    if (p === 'props' || p === 'anim') setTab('right', p);
  });

  // البحث
  $('#toolSearch').addEventListener('input', e => { S.toolFilter = e.target.value; renderToolbox(); });
  $('#treeSearch').addEventListener('input', e => { S.treeFilter = e.target.value; renderTree(); });
  $('#treeExpand').onclick = () => setAllOpen(true);
  $('#treeCollapse').onclick = () => setAllOpen(false);
  $('#propSearch').addEventListener('input', e => { S.propFilter = e.target.value; renderProps(); });
  $('#animSearch').addEventListener('input', e => { S.propFilter = e.target.value; $('#propSearch').value = e.target.value; renderProps(); });

  // اللوحة
  const vp = $('#viewport');
  vp.addEventListener('pointerdown', e => { if (e.target.closest('#screen')) onCanvasDown(e); else if (!S.play) select(root().id); });
  window.addEventListener('pointermove', onCanvasMove);
  window.addEventListener('pointerup', onCanvasUp);
  vp.addEventListener('contextmenu', e => {
    if (S.play) return;
    e.preventDefault();
    const elx = e.target.closest('.rg-el'); if (elx) select(elx.dataset.id);
    showCtx(e.clientX, e.clientY);
  });
  bindLongPress(vp, (x, y) => { if (!S.play && !(drag && drag.moved)) { drag = null; showCtx(x, y); } });
  vp.addEventListener('dblclick', e => {
    const elx = e.target.closest('.rg-el'); if (!elx || S.play) return;
    const n = findNode(elx.dataset.id);
    if (n && CLASSES[n.cls].text) { setTab('right', 'props'); if (innerWidth < 900) setMobilePanel('props'); setTimeout(() => { const t = $('#propForm textarea[data-k="Text"]'); if (t) { t.focus(); t.select(); } }, 60); }
  });
  vp.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(S.zoom * (e.deltaY < 0 ? 1.1 : 0.9)); } }, { passive: false });
  vp.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  vp.addEventListener('drop', onCanvasDrop);
  document.addEventListener('click', e => { if (!e.target.closest('#ctxmenu') && !e.target.closest('#btnMore')) hideCtx(); });
  window.addEventListener('resize', () => { fitZoom(); updateSelection(); });

  // لوحة المفاتيح
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (mod && k === 's') { e.preventDefault(); saveProject(true); return; }
    if (mod && k === 'e') { e.preventDefault(); openExport(false); return; }
    if (typing) return;
    if (e.key === 'Escape') { if ($('#modal-root').children.length) return closeModal(); if (S.play) return togglePlay(false); hideCtx(); const n = sel(); if (n && n !== root()) select(parentOf(n.id).id); return; }
    if (S.play) return;
    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && k === 'y') { e.preventDefault(); redo(); }
    else if (mod && e.shiftKey && k === 'c') { e.preventDefault(); copyStyle(); }
    else if (mod && e.shiftKey && k === 'v') { e.preventDefault(); pasteStyle(); }
    else if (mod && k === 'g') { e.preventDefault(); wrapInFrame(); }
    else if (mod && k === 'c') { e.preventDefault(); copySel(false); }
    else if (mod && k === 'x') { e.preventDefault(); copySel(true); }
    else if (mod && k === 'v') { e.preventDefault(); paste(); }
    else if (mod && k === 'd') { e.preventDefault(); duplicateSel(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSel(); }
    else if (e.key.startsWith('Arrow')) { e.preventDefault(); const s = e.shiftKey ? 10 : 1; nudge(e.key === 'ArrowLeft' ? -s : e.key === 'ArrowRight' ? s : 0, e.key === 'ArrowUp' ? -s : e.key === 'ArrowDown' ? s : 0); }
    else if (e.key === ']') zSel(1);
    else if (e.key === '[') zSel(-1);
    else if (k === 'p') togglePlay();
    else if (k === 'f') { fitZoom(true); updateSelection(); }
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => renderCanvas());

  syncToolbar(); setTab('left', 'tools'); setTab('right', 'props'); setMobilePanel('canvas');
  renderToolbox(); renderAll(); updateUndoButtons();
  showWelcome(false);
}
document.addEventListener('DOMContentLoaded', init);
