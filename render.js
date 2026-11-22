/* RoGUI Studio — render.js : رسم الواجهة في المتصفح بنفس منطق روبلوكس (UDim2 + المعدلات) */
'use strict';

const hexRgb = h => { h = (h || '#ffffff').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgbHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const rgba = (rgb, t) => `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${Math.max(0, Math.min(1, 1 - t)).toFixed(3)})`;
const mulRgb = (a, b) => [a[0] * b[0] / 255, a[1] * b[1] / 255, a[2] * b[2] / 255];
const lerp = (a, b, t) => a + (b - a) * t;
const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function modsOf(node) {
  const m = {};
  (node.children || []).forEach(c => { if (isMod(c) && !m[c.cls]) m[c.cls] = c; });
  return m;
}
function fontCss(name) { const f = FONT_MAP[name] || FONT_MAP.GothamBold; return { family: f[0] + ', "Cairo", sans-serif', weight: f[1], style: f[2] || 'normal' }; }

/* ---- تقييم التسلسلات ---- */
function seqColorAt(seq, t) {
  const s = [...seq].sort((a, b) => a.t - b.t);
  if (t <= s[0].t) return hexRgb(s[0].c);
  for (let i = 0; i < s.length - 1; i++) {
    if (t >= s[i].t && t <= s[i + 1].t) { const k = (t - s[i].t) / ((s[i + 1].t - s[i].t) || 1); const a = hexRgb(s[i].c), b = hexRgb(s[i + 1].c); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
  }
  return hexRgb(s[s.length - 1].c);
}
function seqNumAt(seq, t) {
  const s = [...seq].sort((a, b) => a.t - b.t);
  if (t <= s[0].t) return s[0].v;
  for (let i = 0; i < s.length - 1; i++) if (t >= s[i].t && t <= s[i + 1].t) return lerp(s[i].v, s[i + 1].v, (t - s[i].t) / ((s[i + 1].t - s[i].t) || 1));
  return s[s.length - 1].v;
}
function gradientCss(g, baseRgb, baseT) {
  const gp = g.props;
  const times = [...new Set([...gp.Color.map(k => k.t), ...gp.Transparency.map(k => k.t), 0, 1])].sort((a, b) => a - b);
  const rot = gp.Rotation || 0, rad = rot * Math.PI / 180;
  const shift = (gp.Offset.x * Math.cos(rad) + gp.Offset.y * Math.sin(rad));
  const stops = times.map(t => {
    const c = mulRgb(baseRgb, seqColorAt(gp.Color, t));
    const tr = 1 - (1 - baseT) * (1 - seqNumAt(gp.Transparency, t));
    return `${rgba(c, tr)} ${((t + shift) * 100).toFixed(2)}%`;
  });
  return `linear-gradient(${90 + rot}deg, ${stops.join(', ')})`;
}
function bgCss(node, colorOverride, transpOverride) {
  const p = node.props, mods = modsOf(node);
  const rgb = colorOverride || hexRgb(p.BackgroundColor3);
  const t = transpOverride != null ? transpOverride : p.BackgroundTransparency;
  if (t >= 1) return 'transparent';
  const g = mods.UIGradient;
  if (g && g.props.Enabled) return gradientCss(g, rgb, t);
  return rgba(rgb, t);
}
function strokeShadow(st, r, colorOverride, thickOverride) {
  const t = thickOverride != null ? thickOverride : st.props.Thickness;
  if (!st.props.Enabled || t <= 0) return '';
  return `0 0 0 ${t}px ${rgba(colorOverride || hexRgb(st.props.Color), st.props.Transparency)}`;
}
function textStrokeShadows(t, color) {
  if (t <= 0) return [];
  const out = [], n = Math.max(8, Math.ceil(t * 6));
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; out.push(`${(Math.cos(a) * t).toFixed(2)}px ${(Math.sin(a) * t).toFixed(2)}px 0 ${color}`); }
  return out;
}
function isTextNode(n) { return CLASSES[n.cls] && CLASSES[n.cls].text; }
function strokeIsBorder(node, st) { return st.props.ApplyStrokeMode === 'Border' || !isTextNode(node); }

/* ---- النص المنسق RichText ---- */
function richHtml(s) {
  let h = escHtml(s);
  h = h.replace(/&lt;(\/?)(b|i|u|s|sup|sub)&gt;/gi, '<$1$2>')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/&lt;\/(font|stroke|mark|uppercase|smallcaps)&gt;/gi, '</span>')
    .replace(/&lt;uppercase&gt;/gi, '<span style="text-transform:uppercase">')
    .replace(/&lt;smallcaps&gt;/gi, '<span style="font-variant:small-caps">')
    .replace(/&lt;font([^&]*?)&gt;/gi, (m, attrs) => {
      attrs = attrs.replace(/&quot;|&#39;/g, '"');
      let st = '';
      const c = attrs.match(/color="([^"]+)"/i); if (c) { let v = c[1]; const rg = v.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i); st += `color:${rg ? `rgb(${rg[1]},${rg[2]},${rg[3]})` : v.replace(/[^#\w]/g, '')};`; }
      const sz = attrs.match(/size="(\d+)"/i); if (sz) st += `font-size:${sz[1]}px;`;
      const tr = attrs.match(/transparency="([\d.]+)"/i); if (tr) st += `opacity:${1 - parseFloat(tr[1])};`;
      const w = attrs.match(/weight="(\w+)"/i); if (w) st += `font-weight:${({ thin: 100, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, heavy: 900 })[w[1].toLowerCase()] || w[1]};`;
      return `<span style="${st}">`;
    })
    .replace(/&lt;stroke([^&]*?)&gt;/gi, (m, attrs) => {
      attrs = attrs.replace(/&quot;|&#39;/g, '"');
      const c = (attrs.match(/color="(#[0-9a-f]{3,6})"/i) || [])[1] || '#000';
      const t = parseFloat((attrs.match(/thickness="([\d.]+)"/i) || [])[1] || 1);
      return `<span style="text-shadow:${textStrokeShadows(t, c).join(',')}">`;
    })
    .replace(/&lt;mark([^&]*?)&gt;/gi, (m, attrs) => { attrs = attrs.replace(/&quot;|&#39;/g, '"'); const c = (attrs.match(/color="(#[0-9a-f]{3,6})"/i) || [])[1] || '#ff0'; return `<span style="background:${c}">`; });
  return h;
}
const stripRich = s => String(s).replace(/<[^>]+>/g, '');

/* ---- قياس النص (TextScaled) ---- */
const _mctx = document.createElement('canvas').getContext('2d');
function measure(text, size, f) { _mctx.font = `${f.style} ${f.weight} ${size}px ${f.family}`; return _mctx.measureText(text).width; }
function fitTextSize(text, f, w, h, wrap, min = 1, max = 100) {
  text = stripRich(text) || ' ';
  const lines = text.split('\n');
  let s = Math.min(max, 100, Math.floor(h / (lines.length * 1.0)));
  for (; s > min; s--) {
    if (!wrap) {
      const mw = Math.max(...lines.map(l => measure(l, s, f)));
      if (mw <= w - 2 && s * lines.length * 1.05 <= h) break;
    } else {
      let count = 0;
      for (const l of lines) {
        const words = l.split(' '); let cur = 0; count++;
        for (const wd of words) { const ww = measure(wd + ' ', s, f); if (cur + ww > w && cur > 0) { count++; cur = ww; } else cur += ww; }
      }
      if (count * s * 1.1 <= h) break;
    }
  }
  return Math.max(min, s);
}

/* ---- صور روبلوكس عبر الـ ID ---- */
const Thumbs = {
  cache: (() => { try { return JSON.parse(localStorage.getItem('rogui_thumbs') || '{}'); } catch (e) { return {}; } })(),
  pending: {},
  legacy: id => `https://www.roblox.com/asset-thumbnail/image?assetId=${id}&width=420&height=420&format=png`,
  resolve(id, cb) {
    id = String(id).replace(/\D/g, '');
    if (!id) return cb(null);
    if (this.cache[id]) return cb(this.cache[id]);
    if (this.pending[id]) return this.pending[id].push(cb);
    this.pending[id] = [cb];
    const done = url => { const l = this.pending[id] || []; delete this.pending[id]; l.forEach(f => f(url)); };
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => ctl && ctl.abort(), 6000);
    fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${id}&returnPolicy=PlaceHolder&size=420x420&format=Png&isCircular=false`, ctl ? { signal: ctl.signal } : {})
      .then(r => r.json()).then(j => {
        clearTimeout(timer);
        const d = j && j.data && j.data[0];
        if (d && d.imageUrl && d.state === 'Completed') {
          this.cache[id] = d.imageUrl;
          try { localStorage.setItem('rogui_thumbs', JSON.stringify(this.cache)); } catch (e) { }
          done(d.imageUrl);
        } else done(this.legacy(id));
      }).catch(() => { clearTimeout(timer); done(this.legacy(id)); });
  }
};
const _tintFilters = {};
function tintFilter(hex) {
  hex = hex.toLowerCase();
  if (hex === '#ffffff') return '';
  const id = 'tint' + hex.slice(1);
  if (!_tintFilters[id]) {
    let svg = document.getElementById('rg-filters');
    if (!svg) { svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.id = 'rg-filters'; svg.setAttribute('width', 0); svg.setAttribute('height', 0); svg.style.position = 'absolute'; document.body.appendChild(svg); }
    const [r, g, b] = hexRgb(hex).map(v => (v / 255).toFixed(3));
    svg.insertAdjacentHTML('beforeend', `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${r} 0 0 0 0 0 ${g} 0 0 0 0 0 ${b} 0 0 0 0 0 1 0"/></filter>`);
    _tintFilters[id] = 1;
  }
  return `url(#${id})`;
}
function imageId(v) { return String(v || '').replace(/\D/g, ''); }

/* ---- حساب الأحجام ---- */
function udim(u, size) { return u.s * size + u.o; }
function sizeOf(node, cw, ch) {
  const p = node.props, m = modsOf(node);
  let w = p.Size.xs * cw + p.Size.xo, h = p.Size.ys * ch + p.Size.yo;
  const sc = m.UISizeConstraint;
  if (sc) { const a = sc.props.MinSize, b = sc.props.MaxSize; w = Math.min(Math.max(w, a.x), b.x); h = Math.min(Math.max(h, a.y), b.y); }
  const ar = m.UIAspectRatioConstraint;
  if (ar) {
    const r = Math.max(0.0001, ar.props.AspectRatio);
    if (ar.props.AspectType === 'FitWithinMaxSize') { if (w / h > r) w = h * r; else h = w / r; }
    else if (ar.props.DominantAxis === 'Width') h = w / r; else w = h * r;
  }
  return { w: Math.max(0, w), h: Math.max(0, h) };
}
function sortKids(items, order) {
  return [...items].sort((a, b) => order === 'Name' ? a.node.name.localeCompare(b.node.name) : (a.node.props.LayoutOrder - b.node.props.LayoutOrder));
}
const alignOff = (al, free) => (al === 'Center' ? free / 2 : (al === 'Right' || al === 'Bottom') ? free : 0);

function listLayout(items, L, cw, ch) {
  const vert = L.FillDirection === 'Vertical';
  const sorted = sortKids(items, L.SortOrder);
  const n = sorted.length; if (!n) return;
  const gap = udim(L.Padding, vert ? ch : cw);
  const mainAvail = vert ? ch : cw, crossAvail = vert ? cw : ch;
  const M = it => vert ? 'h' : 'w', C = it => vert ? 'w' : 'h';
  let total = sorted.reduce((s, it) => s + it[M()], 0) + gap * (n - 1);
  let free = mainAvail - total;
  const mainFlex = vert ? L.VerticalFlex : L.HorizontalFlex, crossFlex = vert ? L.HorizontalFlex : L.VerticalFlex;
  const flexers = sorted.filter(it => it.flex && it.flex.props.FlexMode !== 'None');
  if (free > 0 && flexers.length) {
    const grow = flexers.filter(f => f.flex.props.FlexMode !== 'Shrink');
    const sum = grow.reduce((s, f) => s + (f.flex.props.FlexMode === 'Fill' ? 1 : f.flex.props.GrowRatio), 0) || 1;
    grow.forEach(f => { f[M()] += free * (f.flex.props.FlexMode === 'Fill' ? 1 : f.flex.props.GrowRatio) / sum; });
    if (grow.length) free = 0;
  } else if (free < 0 && flexers.length) {
    const sh = flexers.filter(f => ['Shrink', 'Fill', 'Custom'].includes(f.flex.props.FlexMode));
    const sum = sh.reduce((s, f) => s + (f.flex.props.ShrinkRatio || 1), 0) || 1;
    sh.forEach(f => { f[M()] = Math.max(0, f[M()] + free * (f.flex.props.ShrinkRatio || 1) / sum); });
    if (sh.length) free = 0;
  }
  let start = 0, between = gap;
  if (mainFlex === 'Fill' && free !== 0) { sorted.forEach(it => { it[M()] = Math.max(0, it[M()] + free / n); }); free = 0; }
  else if (mainFlex === 'SpaceBetween' && free > 0 && n > 1) { between = gap + free / (n - 1); free = 0; }
  else if (mainFlex === 'SpaceAround' && free > 0) { const e = free / n; start = e / 2; between = gap + e; free = 0; }
  else if (mainFlex === 'SpaceEvenly' && free > 0) { const e = free / (n + 1); start = e; between = gap + e; free = 0; }
  start += alignOff(vert ? L.VerticalAlignment : L.HorizontalAlignment, free);
  const crossAl = vert ? L.HorizontalAlignment : L.VerticalAlignment;
  sorted.forEach(it => {
    if (crossFlex === 'Fill') it[C()] = crossAvail;
    const cross = alignOff(crossAl, crossAvail - it[C()]);
    if (vert) { it.x = cross; it.y = start; } else { it.x = start; it.y = cross; }
    start += it[M()] + between;
  });
}
function gridLayout(items, L, cw, ch) {
  const sorted = sortKids(items, L.SortOrder);
  const n = sorted.length; if (!n) return;
  const cwid = L.CellSize.xs * cw + L.CellSize.xo, chei = L.CellSize.ys * ch + L.CellSize.yo;
  const px = L.CellPadding.xs * cw + L.CellPadding.xo, py = L.CellPadding.ys * ch + L.CellPadding.yo;
  const horiz = L.FillDirection === 'Horizontal';
  let per = horiz ? Math.floor((cw + px) / (cwid + px || 1)) : Math.floor((ch + py) / (chei + py || 1));
  per = Math.max(1, per); if (L.FillDirectionMaxCells > 0) per = Math.min(per, L.FillDirectionMaxCells);
  const cols = horiz ? Math.min(n, per) : Math.ceil(n / per), rows = horiz ? Math.ceil(n / per) : Math.min(n, per);
  const bw = cols * cwid + (cols - 1) * px, bh = rows * chei + (rows - 1) * py;
  const x0 = alignOff(L.HorizontalAlignment, cw - bw), y0 = alignOff(L.VerticalAlignment, ch - bh);
  sorted.forEach((it, i) => {
    let c = horiz ? i % per : Math.floor(i / per), r = horiz ? Math.floor(i / per) : i % per;
    if (L.StartCorner.includes('Right')) c = cols - 1 - c;
    if (L.StartCorner.includes('Bottom')) r = rows - 1 - r;
    it.w = cwid; it.h = chei; it.x = x0 + c * (cwid + px); it.y = y0 + r * (chei + py);
  });
  return { w: bw, h: bh };
}
function pageLayout(items, L, cw, ch, pageIndex = 0) {
  const sorted = sortKids(items, L.SortOrder);
  sorted.forEach((it, i) => {
    it.x = (cw - it.w) / 2; it.y = (ch - it.h) / 2;
    if (i !== pageIndex) it.hiddenPage = true;
  });
}

/* ---- الرسم ---- */
function renderGui(root, host, ctx) {
  host.innerHTML = '';
  const map = new Map();
  map.set(root.id, { el: host, node: root, w: ctx.w, h: ctx.h });
  drawChildren(root, host, ctx.w, ctx.h, map, ctx);
  return map;
}

function drawChildren(node, el, w, h, map, ctx, contentEl) {
  const mods = modsOf(node);
  const pd = mods.UIPadding ? mods.UIPadding.props : null;
  let pl = 0, pr = 0, pt = 0, pb = 0;
  if (pd) { pl = udim(pd.PaddingLeft, w); pr = udim(pd.PaddingRight, w); pt = udim(pd.PaddingTop, h); pb = udim(pd.PaddingBottom, h); }
  const cw = Math.max(0, w - pl - pr), ch = Math.max(0, h - pt - pb);
  const kids = (node.children || []).filter(isGui);
  const items = kids.map(k => Object.assign({ node: k, flex: modsOf(k).UIFlexItem }, sizeOf(k, cw, ch)));
  let layoutInfo = null, layout = null;
  if (mods.UIListLayout) { layout = 'list'; listLayout(items.filter(i => i.node.props.Visible || !ctx.play), mods.UIListLayout.props, cw, ch); }
  else if (mods.UIGridLayout) { layout = 'grid'; layoutInfo = gridLayout(items.filter(i => i.node.props.Visible || !ctx.play), mods.UIGridLayout.props, cw, ch); }
  else if (mods.UIPageLayout) { layout = 'page'; pageLayout(items, mods.UIPageLayout.props, cw, ch, ctx.pages && ctx.pages[node.id] || 0); }
  items.forEach(it => {
    if (it.x == null) {
      const p = it.node.props;
      it.x = p.Position.xs * cw + p.Position.xo - p.AnchorPoint.x * it.w;
      it.y = p.Position.ys * ch + p.Position.yo - p.AnchorPoint.y * it.h;
    }
    it.x += pl; it.y += pt;
    drawNode(it.node, contentEl || el, it, map, ctx, layout);
  });
  return items;
}

function drawNode(node, parentEl, rect, map, ctx, layout) {
  const p = node.props, mods = modsOf(node), C = CLASSES[node.cls];
  const el = document.createElement('div');
  el.className = 'rg-el';
  el.dataset.id = node.id;
  const st = el.style;
  st.left = rect.x + 'px'; st.top = rect.y + 'px'; st.width = rect.w + 'px'; st.height = rect.h + 'px';
  st.zIndex = Math.max(0, p.ZIndex + 1000);
  const uiScale = mods.UIScale ? mods.UIScale.props.Scale : 1;
  st.transformOrigin = `${p.AnchorPoint.x * 100}% ${p.AnchorPoint.y * 100}%`;
  st.transform = `rotate(${p.Rotation}deg) scale(${uiScale})`;
  if (!p.Visible || rect.hiddenPage) { if (ctx.play || !ctx.showHidden) st.display = 'none'; else el.classList.add('rg-hidden'); }
  if (node.locked) el.classList.add('rg-locked');
  // الخلفية والزوايا
  st.background = bgCss(node);
  const minS = Math.min(rect.w, rect.h);
  let radius = 0;
  if (mods.UICorner) { radius = Math.min(minS / 2, udim(mods.UICorner.props.CornerRadius, minS)); st.borderRadius = Math.max(0, radius) + 'px'; }
  const shadows = [];
  if (p.BorderSizePixel > 0 && !mods.UICorner && p.BackgroundTransparency < 1) shadows.push(`0 0 0 ${p.BorderSizePixel}px ${rgba(hexRgb(p.BorderColor3), p.BackgroundTransparency)}`);
  const sk = mods.UIStroke;
  if (sk && strokeIsBorder(node, sk)) { const s = strokeShadow(sk); if (s) shadows.push(s); }
  if (shadows.length) st.boxShadow = shadows.join(',');
  if (p.ClipsDescendants || C.scroll) st.overflow = 'hidden';
  if (C.group) st.opacity = 1 - p.GroupTransparency;
  const info = { el, node, w: rect.w, h: rect.h, x: rect.x, y: rect.y, layout, radius };
  map.set(node.id, info);

  // الصورة
  if (C.image) {
    const id = imageId(p.Image);
    const box = document.createElement('div'); box.className = 'rg-img';
    if (radius) box.style.borderRadius = radius + 'px';
    box.style.opacity = 1 - p.ImageTransparency;
    if (!id && !p._preview) { box.classList.add('rg-img-empty'); box.innerHTML = ICONS.ImageLabel; }
    else {
      const img = document.createElement('img');
      img.draggable = false; img.alt = '';
      const fit = { Stretch: 'fill', Fit: 'contain', Crop: 'cover', Tile: 'fill', Slice: 'fill' }[p.ScaleType] || 'fill';
      img.style.objectFit = fit;
      const f = tintFilter(p.ImageColor3); if (f) img.style.filter = f;
      img.onerror = () => { box.classList.add('rg-img-fail'); box.innerHTML = `<span>${ICONS.ImageLabel}<b>${id || ''}</b><small>المعاينة غير متاحة — ستظهر في روبلوكس</small></span>`; };
      if (p.ScaleType === 'Tile') {
        const tw = p.TileSize.xs * rect.w + p.TileSize.xo, th = p.TileSize.ys * rect.h + p.TileSize.yo;
        const setTile = u => { box.style.backgroundImage = `url("${u}")`; box.style.backgroundSize = `${tw}px ${th}px`; box.style.backgroundRepeat = 'repeat'; if (f) box.style.filter = f; };
        if (p._preview) setTile(p._preview); else Thumbs.resolve(id, u => u && setTile(u));
      } else {
        box.appendChild(img);
        if (p._preview) img.src = p._preview; else Thumbs.resolve(id, u => { if (u) img.src = u; });
      }
      info.img = img;
    }
    el.appendChild(box);
  }
  // النص
  if (C.text) {
    const wrap = document.createElement('div'); wrap.className = 'rg-textwrap';
    const tx = p.TextXAlignment, ty = p.TextYAlignment;
    wrap.style.justifyContent = tx === 'Left' ? 'flex-start' : tx === 'Right' ? 'flex-end' : 'center';
    wrap.style.alignItems = ty === 'Top' ? 'flex-start' : ty === 'Bottom' ? 'flex-end' : 'center';
    wrap.style.textAlign = tx.toLowerCase();
    const span = document.createElement('span'); span.className = 'rg-text';
    let text = p.Text, placeholder = false;
    if (C.box && !text) { text = p.PlaceholderText; placeholder = true; }
    const f = fontCss(p.Font);
    span.style.fontFamily = f.family; span.style.fontWeight = f.weight; span.style.fontStyle = f.style;
    const tsc = mods.UITextSizeConstraint;
    let size = p.TextSize;
    if (p.TextScaled) size = fitTextSize(text, f, rect.w, rect.h, p.TextWrapped, tsc ? tsc.props.MinTextSize : 1, tsc ? tsc.props.MaxTextSize : 100);
    span.style.fontSize = size + 'px';
    span.style.lineHeight = (p.LineHeight * 1.15).toFixed(2);
    span.style.whiteSpace = (p.TextWrapped || p.TextScaled && p.TextWrapped) ? 'pre-wrap' : 'pre';
    if (p.TextWrapped) span.style.maxWidth = '100%';
    const tColor = placeholder ? hexRgb(p.PlaceholderColor3) : hexRgb(p.TextColor3);
    const g = mods.UIGradient;
    if (g && g.props.Enabled && !placeholder) {
      span.style.backgroundImage = gradientCss(g, tColor, p.TextTransparency);
      span.style.webkitBackgroundClip = 'text'; span.style.backgroundClip = 'text'; span.style.color = 'transparent';
    } else span.style.color = rgba(tColor, p.TextTransparency);
    const ts = [];
    if (p.TextStrokeTransparency < 1) ts.push(...textStrokeShadows(1.2, rgba(hexRgb(p.TextStrokeColor3), Math.max(p.TextStrokeTransparency, p.TextTransparency))));
    if (sk && !strokeIsBorder(node, sk) && sk.props.Enabled) ts.push(...textStrokeShadows(sk.props.Thickness, rgba(hexRgb(sk.props.Color), Math.max(sk.props.Transparency, p.TextTransparency))));
    if (ts.length) {
      if (g && g.props.Enabled) {
        const useSk = sk && !strokeIsBorder(node, sk) && sk.props.Enabled;
        const t = useSk ? sk.props.Thickness : 1.2, c = useSk ? rgba(hexRgb(sk.props.Color), sk.props.Transparency) : rgba(hexRgb(p.TextStrokeColor3), p.TextStrokeTransparency);
        span.style.filter = [[t, 0], [-t, 0], [0, t], [0, -t]].map(([a, b]) => `drop-shadow(${a}px ${b}px 0 ${c})`).join(' ');
      } else span.style.textShadow = ts.join(',');
    }
    if (p.RichText && !placeholder) span.innerHTML = richHtml(text); else span.textContent = text;
    wrap.appendChild(span); el.appendChild(wrap);
    info.text = span; info.fullText = text;
  }
  parentEl.appendChild(el);

  // الأبناء
  if (C.scroll) {
    const content = document.createElement('div'); content.className = 'rg-scroll';
    const sbw = p.ScrollBarThickness;
    content.style.setProperty('--sbw', sbw + 'px');
    content.style.setProperty('--sbc', rgba(hexRgb(p.ScrollBarImageColor3), p.ScrollBarImageTransparency));
    const dir = p.ScrollingDirection;
    content.style.overflowX = (dir === 'X' || dir === 'XY') ? 'auto' : 'hidden';
    content.style.overflowY = (dir === 'Y' || dir === 'XY') ? 'auto' : 'hidden';
    if (radius) content.style.borderRadius = radius + 'px';
    el.appendChild(content);
    const inner = document.createElement('div'); inner.className = 'rg-canvas';
    content.appendChild(inner);
    let cvw = Math.max(rect.w, p.CanvasSize.xs * rect.w + p.CanvasSize.xo);
    let cvh = Math.max(rect.h, p.CanvasSize.ys * rect.h + p.CanvasSize.yo);
    const kids = drawChildren(node, el, cvw, cvh, map, ctx, inner);
    if (p.AutomaticCanvasSize !== 'None') {
      const m = modsOf(node), pb = m.UIPadding ? udim(m.UIPadding.props.PaddingBottom, cvh) : 0, prr = m.UIPadding ? udim(m.UIPadding.props.PaddingRight, cvw) : 0;
      kids.forEach(k => {
        if (p.AutomaticCanvasSize.includes('Y')) cvh = Math.max(cvh, k.y + k.h + pb);
        if (p.AutomaticCanvasSize.includes('X')) cvw = Math.max(cvw, k.x + k.w + prr);
      });
    }
    inner.style.width = cvw + 'px'; inner.style.height = cvh + 'px';
    info.content = content;
  } else drawChildren(node, el, rect.w, rect.h, map, ctx);
  return el;
}
