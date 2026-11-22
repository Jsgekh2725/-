/* RoGUI Studio — preview.js : وضع التجربة ▶ (نفس منطق سكربت روبلوكس لكن داخل المتصفح) */
'use strict';

const Ease = (() => {
  const B = t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; };
  const IN = {
    Linear: t => t, Sine: t => 1 - Math.cos(t * Math.PI / 2), Quad: t => t * t, Cubic: t => t ** 3, Quart: t => t ** 4, Quint: t => t ** 5,
    Exponential: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)), Circular: t => 1 - Math.sqrt(1 - t * t),
    Back: t => { const s = 1.70158; return t * t * ((s + 1) * t - s); }, Bounce: t => 1 - B(1 - t),
    Elastic: t => t === 0 || t === 1 ? t : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.075) * 2 * Math.PI / 0.3)
  };
  return (style, dir) => {
    const f = IN[style] || IN.Quad;
    if (dir === 'In') return f;
    if (dir === 'InOut') return t => t < 0.5 ? f(t * 2) / 2 : 1 - f(2 - 2 * t) / 2;
    return t => 1 - f(1 - t);
  };
})();

const Tw = {
  list: [],
  to(obj, key, to, dur, style = 'Quad', dir = 'Out') {
    this.list = this.list.filter(t => !(t.obj === obj && t.key === key));
    return new Promise(res => {
      if (dur <= 0) { obj[key] = Array.isArray(to) ? [...to] : to; obj._dirty = true; return res(); }
      this.list.push({ obj, key, from: Array.isArray(obj[key]) ? [...obj[key]] : obj[key], to, t: 0, dur, ease: Ease(style, dir), res });
    });
  },
  async seq(obj, key, vals, dur, style) { for (const v of vals) await this.to(obj, key, v, dur, style, 'Out'); },
  step(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const t = this.list[i]; t.t += dt;
      const k = Math.min(1, t.t / t.dur), e = t.ease(k);
      t.obj[t.key] = Array.isArray(t.to) ? t.to.map((v, j) => lerp(t.from[j], v, e)) : lerp(t.from, t.to, e);
      t.obj._dirty = true;
      if (k >= 1) { t.obj[t.key] = Array.isArray(t.to) ? [...t.to] : t.to; this.list.splice(i, 1); t.res(); }
    }
  },
  clear() { this.list = []; }
};

const Play = {
  active: false, states: new Map(), parts: [], raf: 0,
  start(project, map, host, toast) {
    this.stop();
    this.active = true; this.project = project; this.map = map; this.host = host; this.toast = toast || (() => { });
    this.fx = document.createElement('div'); this.fx.className = 'rg-fx'; host.appendChild(this.fx);
    this.tipEl = null; this.tipOwner = null;
    this.t0 = performance.now(); this.last = this.t0;
    const walk = n => { if (isGui(n) && hasAnim(n)) this.setup(n); (n.children || []).forEach(walk); };
    walk(project.root);
    this._click = e => this.onClick(e);
    this._down = e => this.onDown(e);
    this._up = () => this.onUp();
    this._move = e => this.onMove(e);
    host.addEventListener('click', this._click);
    host.addEventListener('pointerdown', this._down);
    window.addEventListener('pointerup', this._up);
    window.addEventListener('pointermove', this._move);
    // مربعات الكتابة تصير قابلة للكتابة
    map.forEach(info => {
      if (info.node && CLASSES[info.node.cls] && CLASSES[info.node.cls].box && info.text && info.node.props.TextEditable) {
        info.text.contentEditable = 'true'; info.text.spellcheck = false;
        info.text.addEventListener('focus', () => { if (!info.node.props.Text || info.node.props.ClearTextOnFocus) { info.text.textContent = ''; info.text.style.color = rgba(hexRgb(info.node.props.TextColor3), info.node.props.TextTransparency); } });
      }
    });
    const loop = now => { if (!this.active) return; const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.step(dt, (now - this.t0) / 1000); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  },
  stop() {
    this.active = false; cancelAnimationFrame(this.raf); Tw.clear();
    if (this.host) {
      this.host.removeEventListener('click', this._click);
      this.host.removeEventListener('pointerdown', this._down);
      window.removeEventListener('pointerup', this._up);
      window.removeEventListener('pointermove', this._move);
    }
    this.states.clear(); this.parts = [];
  },
  findByName(name) {
    if (!name) return null;
    let found = null;
    const walk = n => { if (found) return; if (n.name === name && isGui(n)) found = n; else (n.children || []).forEach(walk); };
    walk(this.project.root);
    return found;
  },
  getState(node) {
    if (this.states.has(node.id)) return this.states.get(node.id);
    const info = this.map.get(node.id); if (!info) return null;
    const p = node.props, mods = modsOf(node), cfg = animOf(node);
    const st = {
      node, info, el: info.el, cfg, hs: 1, es: 1, ms: 1, lift: 0, ox: 0, oy: 0, rot: 0, mx: 0, mr: 0, sx: 1, sy: 1, op: 1,
      baseRot: p.Rotation, baseScale: mods.UIScale ? mods.UIScale.props.Scale : 1, baseOp: CLASSES[node.cls].group ? 1 - p.GroupTransparency : 1,
      baseBg: hexRgb(p.BackgroundColor3), bg: hexRgb(p.BackgroundColor3), bgT: p.BackgroundTransparency, baseBgT: p.BackgroundTransparency,
      baseText: CLASSES[node.cls].text ? hexRgb(p.TextColor3) : null, text: CLASSES[node.cls].text ? hexRgb(p.TextColor3) : null,
      stroke: mods.UIStroke, strokeC: mods.UIStroke ? hexRgb(mods.UIStroke.props.Color) : hexRgb(cfg.hoverStrokeColor),
      strokeT: mods.UIStroke ? mods.UIStroke.props.Thickness : 0, baseStrokeC: null, baseStrokeT: 0,
      dragX: 0, dragY: 0, visible: p.Visible, colorTouched: false
    };
    st.baseStrokeC = [...st.strokeC]; st.baseStrokeT = st.strokeT;
    info.el.style.transformOrigin = `${p.AnchorPoint.x * 100}% ${p.AnchorPoint.y * 100}%`;
    this.states.set(node.id, st);
    return st;
  },
  setup(node) {
    const st = this.getState(node); if (!st) return;
    const c = st.cfg, el = st.el;
    el.addEventListener('mouseenter', () => {
      st.hover = true; if (c.hoverOn) this.refresh(st);
      if (c.hoverSound) this.sound(c.hoverSound, 'مرور');
      if (c.tooltip) this.showTip(c.tooltip, st);
    });
    el.addEventListener('mouseleave', () => { st.hover = false; st.press = false; if (c.hoverOn || c.pressOn) this.refresh(st); this.hideTip(st); });
    if (c.draggable) el.classList.add('rg-draggable');
    if (c.enterType !== 'none' && st.visible) this.playEnter(st);
  },
  hasClick(st) { const c = st.cfg; return c.clickFx !== 'none' || c.clickMotion !== 'none' || c.actionType !== 'none' || c.clickSound || c.pressOn || c.draggable; },
  targetState(e) {
    let el = e.target.closest('.rg-el');
    while (el && this.host.contains(el)) {
      const node = this.map.get(el.dataset.id) && this.map.get(el.dataset.id).node;
      if (node) {
        const st = this.states.get(node.id);
        const btn = CLASSES[node.cls].button;
        if (st && (btn || this.hasClick(st))) return st;
        if (btn) return null;
      }
      el = el.parentElement && el.parentElement.closest('.rg-el');
    }
    return null;
  },
  localPos(e) {
    const r = this.host.getBoundingClientRect(), z = r.width / this.host.offsetWidth || 1;
    return { x: (e.clientX - r.left) / z, y: (e.clientY - r.top) / z, z };
  },
  onDown(e) {
    const st = this.targetState(e); if (!st) return;
    st.press = true; st.lastPos = this.localPos(e);
    if (st.cfg.pressOn) this.refresh(st);
    if (st.cfg.pressSound) this.sound(st.cfg.pressSound, 'ضغط');
    if (st.cfg.draggable) { this.drag = { st, sx: e.clientX, sy: e.clientY, bx: st.dragX, by: st.dragY, moved: false }; }
  },
  onMove(e) {
    if (this.drag) {
      const z = this.localPos(e).z;
      const dx = (e.clientX - this.drag.sx) / z, dy = (e.clientY - this.drag.sy) / z;
      if (Math.abs(dx) + Math.abs(dy) > 3) this.drag.moved = true;
      this.drag.st.dragX = this.drag.bx + dx; this.drag.st.dragY = this.drag.by + dy; this.drag.st._dirty = true;
    }
    if (this.tipEl && this.tipOwner) { const p = this.localPos(e); this.tipEl.style.left = (p.x + 14) + 'px'; this.tipEl.style.top = (p.y + 18) + 'px'; }
  },
  onUp() {
    this.states.forEach(st => { if (st.press) { st.press = false; if (st.cfg.pressOn) this.refresh(st); } });
    setTimeout(() => { this.drag = null; }, 0);
  },
  onClick(e) {
    const st = this.targetState(e); if (!st) return;
    if (this.drag && this.drag.moved) return;
    const c = st.cfg, now = performance.now() / 1000;
    if (c.clickCooldown > 0 && st.lastClick && now - st.lastClick < c.clickCooldown) return;
    st.lastClick = now;
    if (c.clickSound) this.sound(c.clickSound, 'نقر');
    const pos = this.localPos(e);
    let p = pos;
    if (c.fxOrigin === 'center') { const r = st.el.getBoundingClientRect(), h = this.host.getBoundingClientRect(); p = { x: (r.left + r.width / 2 - h.left) / pos.z, y: (r.top + r.height / 2 - h.top) / pos.z }; }
    if (c.clickFx !== 'none') this.burst(st, c, p, pos.z);
    if (c.clickMotion !== 'none') this.motion(st, c.clickMotion);
    this.action(st);
  },
  sound(id, kind) { this.toast(`🔊 صوت ${kind}: ${imageId(id)} (يشتغل داخل روبلوكس)`, 1200); },

  refresh(st) {
    const c = st.cfg, d = c.tweenTime, s = c.easeStyle, dr = c.easeDir;
    const h = st.hover && c.hoverOn, p = st.press && c.pressOn;
    let sc = 1; if (h) sc *= c.hoverScale; if (p) sc *= c.pressScale;
    Tw.to(st, 'hs', sc, d, s, dr);
    Tw.to(st, 'lift', h ? c.hoverLift : 0, d, s, dr);
    Tw.to(st, 'rot', h ? c.hoverRotate : 0, d, s, dr);
    if ((c.hoverOn && c.hoverColorOn) || (c.pressOn && c.pressColorOn)) {
      let bg = st.baseBg;
      if (h && c.hoverColorOn) bg = hexRgb(c.hoverColor);
      if (p && c.pressColorOn) bg = hexRgb(c.pressColor);
      st.colorTouched = true; Tw.to(st, 'bg', bg, d, s, dr);
    }
    if (c.hoverOn && c.hoverTextOn && st.baseText) { st.colorTouched = true; Tw.to(st, 'text', h ? hexRgb(c.hoverTextColor) : st.baseText, d, s, dr); }
    if (c.hoverOn && c.hoverTranspOn) { st.colorTouched = true; Tw.to(st, 'bgT', h ? c.hoverTransp : st.baseBgT, d, s, dr); }
    if (c.hoverOn && c.hoverStrokeOn) {
      st.colorTouched = true;
      Tw.to(st, 'strokeC', h ? hexRgb(c.hoverStrokeColor) : st.baseStrokeC, d, s, dr);
      Tw.to(st, 'strokeT', h ? c.hoverStrokeThick : st.baseStrokeT, d, s, dr);
    }
  },
  applyColors(st) {
    const n = st.node, el = st.el;
    el.style.background = bgCss(n, st.bg, st.bgT);
    if (st.text && st.info.text && !modsOf(n).UIGradient) st.info.text.style.color = rgba(st.text, n.props.TextTransparency);
    const mods = modsOf(n), sh = [];
    const sk = mods.UIStroke;
    if (sk && strokeIsBorder(n, sk)) { const v = strokeShadow(sk, 0, st.strokeC, st.strokeT); if (v) sh.push(v); }
    else if (!sk && st.strokeT > 0) sh.push(`0 0 0 ${st.strokeT}px ${rgba(st.strokeC, 0)}`);
    if (sk && !strokeIsBorder(n, sk) && st.info.text) st.info.text.style.textShadow = textStrokeShadows(st.strokeT, rgba(st.strokeC, sk.props.Transparency)).join(',');
    el.style.boxShadow = sh.join(',');
  },
  playEnter(st, kind, delay) {
    const c = st.cfg; kind = kind || c.enterType; delay = delay == null ? c.enterDelay : delay;
    if (kind === 'none') return;
    const t = c.enterTime, S = c.enterStyle, D = c.enterDir;
    const fade = !['typewriter', 'pop', 'drop'].includes(kind);
    ({ pop: () => st.es = 0, zoom: () => st.es = 1.6, slideTop: () => st.oy = -160, slideBottom: () => st.oy = 160, slideLeft: () => st.ox = -220, slideRight: () => st.ox = 220, spinIn: () => { st.es = 0; st.mr = -180; }, drop: () => st.oy = -260 }[kind] || (() => { }))();
    if (fade) st.op = 0;
    if (kind === 'typewriter' && st.info.text) st.info.text.textContent = '';
    st._dirty = true;
    setTimeout(async () => {
      if (!this.active) return;
      if (kind === 'typewriter') {
        const full = Array.from(stripRich(st.info.fullText || '')); const span = st.info.text; if (!span) return;
        for (let i = 1; i <= full.length; i++) { if (!this.active) return; span.textContent = full.slice(0, i).join(''); await new Promise(r => setTimeout(r, t * 1000 / full.length)); }
        if (st.node.props.RichText) span.innerHTML = richHtml(st.info.fullText);
        return;
      }
      ['es', 'ox', 'oy', 'mr'].forEach(k => Tw.to(st, k, k === 'es' ? 1 : 0, t, S, D));
      if (fade) Tw.to(st, 'op', 1, Math.max(0.05, t * 0.8), 'Quad', 'Out');
    }, delay * 1000);
  },
  setVisible(st, v) { st.visible = v; st.el.style.display = v ? '' : 'none'; },
  open(node) {
    const st = this.getState(node); if (!st) return;
    if (st.visible && !st.closing) return;
    st.closing = false; this.setVisible(st, true);
    if (st.cfg.enterType !== 'none') this.playEnter(st, null, 0);
    else { st.es = 0.8; st.op = 0; Tw.to(st, 'es', 1, 0.3, 'Back', 'Out'); Tw.to(st, 'op', 1, 0.2); }
  },
  close(node) {
    const st = this.getState(node); if (!st || !st.visible || st.closing) return;
    st.closing = true;
    Tw.to(st, 'es', 0.85, 0.18, 'Quad', 'In'); Tw.to(st, 'op', 0, 0.18, 'Quad', 'In');
    setTimeout(() => { if (st.closing) { this.setVisible(st, false); st.op = 1; st.es = 1; st.closing = false; st._dirty = true; } }, 200);
  },
  action(st) {
    const c = st.cfg, a = c.actionType;
    if (a === 'none') return;
    if (a === 'closeSelf') return this.close(st.node);
    if (a === 'closeParent') { const par = findParent(this.project.root, st.node.id); if (par && isGui(par)) this.close(par); return; }
    const t = this.findByName(c.actionTarget);
    if (!t) { this.toast(`⚠ ما لقيت عنصر اسمه "${c.actionTarget}"`); return; }
    const ts = this.getState(t);
    if (a === 'open') this.open(t); else if (a === 'close') this.close(t);
    else if (a === 'toggle') { if (ts.visible && !ts.closing) this.close(t); else this.open(t); }
  },
  motion(st, m) {
    if (m === 'shake') Tw.seq(st, 'mx', [9, -9, 7, -7, 4, -4, 0], 0.04);
    else if (m === 'bounce') Tw.seq(st, 'ms', [0.82, 1.12, 0.96, 1], 0.09);
    else if (m === 'pulse') Tw.seq(st, 'ms', [1.15, 1], 0.12);
    else if (m === 'pop') Tw.seq(st, 'ms', [1.25, 1], 0.08, 'Back');
    else if (m === 'wobble') Tw.seq(st, 'mr', [12, -10, 7, -4, 0], 0.07);
    else if (m === 'spin') Tw.to(st, 'mr', 360, 0.5, 'Back', 'Out').then(() => { st.mr = 0; st._dirty = true; });
    else if (m === 'jelly') (async () => { for (const [a, b] of [[1.2, 0.8], [0.88, 1.12], [1.06, 0.94], [1, 1]]) { Tw.to(st, 'sy', b, 0.09); await Tw.to(st, 'sx', a, 0.09); } })();
    else if (m === 'flash') (async () => { st.colorTouched = true; await Tw.to(st, 'bg', [255, 255, 255], 0.06); await Tw.to(st, 'bg', st.baseBg, 0.3); this.refresh(st); })();
  },
  showTip(text, st) {
    if (!this.tipEl) { this.tipEl = document.createElement('div'); this.tipEl.className = 'rg-tip'; this.fx.appendChild(this.tipEl); }
    this.tipEl.textContent = text; this.tipEl.style.display = 'block'; this.tipOwner = st;
  },
  hideTip(st) { if (this.tipEl && this.tipOwner === st) { this.tipEl.style.display = 'none'; this.tipOwner = null; } },

  burst(st, c, pos) {
    const kind = c.clickFx;
    const colors = (c.fxColors && c.fxColors.length ? c.fxColors : ['#ffffff']);
    const rc = () => colors[Math.floor(Math.random() * colors.length)];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const n = Math.max(1, Math.min(150, Math.floor(c.fxCount)));
    const size = c.fxSize, sp = c.fxSpread, g = c.fxGravity, life = c.fxLife;
    const { x, y } = pos;
    const cone = spr => { const a = (-90 + rnd(-spr, spr)) * Math.PI / 180, v = sp * rnd(0.55, 1.15); return [Math.cos(a) * v, Math.sin(a) * v]; };
    const mkEl = (cls) => { const d = document.createElement('div'); d.className = 'rg-p ' + (cls || ''); this.fx.appendChild(d); return d; };
    const add = (el, x, y, vx, vy, w, h, o = {}) => this.parts.push(Object.assign({ el, x, y, vx, vy, w, h, g: 0, drag: 0, t: 0, life: 1, rot: 0, vr: 0, s0: 1, s1: 1, a0: 0 }, o));
    const GL = { sparkles: ['✦', '✧'], stars: ['★'], hearts: ['❤'], snow: ['❄', '❅'], coins: ['🪙'] };
    if (kind === 'confetti') {
      for (let i = 0; i < n; i++) { const e = mkEl(); e.style.background = rc(); const s = size * rnd(0.7, 1.3); const [vx, vy] = cone(60); add(e, x, y, vx, vy, s, s * 0.55, { g, drag: 1.1, life: life * rnd(0.8, 1.3), rot: rnd(0, 360), vr: rnd(-720, 720) }); }
    } else if (kind === 'fireworks') {
      for (let i = 1; i <= n; i++) { const e = mkEl('round'); e.style.background = rc(); const a = i / n * Math.PI * 2 + rnd(-0.1, 0.1), v = sp * rnd(0.8, 1.1); add(e, x, y, Math.cos(a) * v, Math.sin(a) * v, size * 0.7, size * 0.7, { g: g * 0.35, drag: 2.2, life, s0: 1.2, s1: 0.2 }); }
    } else if (GL[kind] || kind === 'emoji') {
      let list = GL[kind];
      if (kind === 'emoji') { list = String(c.fxEmoji).split(/\s+/).filter(Boolean); if (!list.length) list = ['🎉']; }
      for (let i = 0; i < n; i++) {
        const e = mkEl('glyph'); e.textContent = list[Math.floor(Math.random() * list.length)];
        if (kind !== 'emoji' && kind !== 'coins') e.style.color = rc();
        const s = size * rnd(1.2, 2); let vx, vy, o;
        if (kind === 'sparkles') { const a = rnd(0, Math.PI * 2), v = sp * rnd(0.2, 0.6); vx = Math.cos(a) * v; vy = Math.sin(a) * v; o = { drag: 2.5, life: life * rnd(0.6, 1), s0: 1.3, s1: 0, vr: rnd(-200, 200) }; }
        else if (kind === 'hearts') { vx = rnd(-60, 60); vy = -sp * rnd(0.35, 0.7); o = { g: -40, drag: 0.6, life: life * rnd(0.9, 1.4), s0: 0.5, s1: 1.2, wob: rnd(2, 4) }; }
        else if (kind === 'snow') { vx = rnd(-1, 1) * sp * 0.4; vy = -sp * rnd(0.2, 0.5); o = { g: 120, drag: 1.5, life: life * rnd(1, 1.6), vr: rnd(-90, 90), wob: rnd(1, 3) }; }
        else { [vx, vy] = cone(kind === 'coins' ? 35 : 55); o = { g, drag: 0.8, life: life * rnd(0.8, 1.2), vr: rnd(-360, 360) }; }
        o.glyph = true; add(e, x, y, vx, vy, s, s, o);
      }
    } else if (kind === 'bubbles') {
      for (let i = 0; i < n; i++) { const e = mkEl('round'); e.style.background = rc(); const s = size * rnd(0.8, 1.8); add(e, x + rnd(-10, 10), y, rnd(-50, 50), -sp * rnd(0.25, 0.6), s, s, { g: -60, drag: 0.8, life: life * rnd(0.9, 1.5), a0: 0.5, wob: rnd(2, 5) }); }
    } else if (kind === 'image') {
      const id = imageId(c.fxImage);
      for (let i = 0; i < n; i++) {
        const e = mkEl('img'); const s = size * rnd(1.4, 2.2); const [vx, vy] = cone(55);
        if (id) Thumbs.resolve(id, u => { if (u) e.style.backgroundImage = `url("${u}")`; }); else e.textContent = '🖼';
        add(e, x, y, vx, vy, s, s, { g, drag: 0.8, life: life * rnd(0.8, 1.2), vr: rnd(-360, 360) });
      }
    } else if (kind === 'ring') {
      const e = mkEl('ring'); e.style.borderColor = rc(); e.style.borderWidth = Math.max(2, size * 0.3) + 'px';
      e.style.left = x + 'px'; e.style.top = y + 'px';
      e.animate([{ width: '4px', height: '4px', opacity: 1 }, { width: size * 10 + 'px', height: size * 10 + 'px', opacity: 0, borderWidth: '0px' }], { duration: life * 700, easing: 'cubic-bezier(.25,.46,.45,.94)' }).onfinish = () => e.remove();
    } else if (kind === 'text') {
      const e = mkEl('ftext'); e.textContent = c.fxText; e.style.color = rc();
      const s = size * 3; add(e, x, y, rnd(-20, 20), -sp * 0.45, s * 2, s, { drag: 1.6, life, s0: 0.6, s1: 1.15, glyph: true, fs: s * 0.8 });
    } else if (kind === 'ripple') {
      const el = st.el; el.style.overflow = 'hidden';
      const r = el.getBoundingClientRect(), h = this.host.getBoundingClientRect();
      const hz = h.width / (this.host.offsetWidth || 1), ez = r.width / (st.info.w || 1) || 1;
      const lx = (h.left + x * hz - r.left) / ez, ly = (h.top + y * hz - r.top) / ez;
      const e = document.createElement('div'); e.className = 'rg-ripple'; e.style.background = rc(); e.style.left = lx + 'px'; e.style.top = ly + 'px';
      el.appendChild(e);
      const d = Math.max(st.info.w, st.info.h) * 2.4;
      e.animate([{ width: '0px', height: '0px', opacity: 0.4 }, { width: d + 'px', height: d + 'px', opacity: 0 }], { duration: life * 600, easing: 'cubic-bezier(.25,.46,.45,.94)' }).onfinish = () => e.remove();
    }
  },
  step(dt, now) {
    Tw.step(dt);
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i]; p.t += dt;
      const k = p.t / p.life;
      if (k >= 1) { p.el.remove(); this.parts.splice(i, 1); continue; }
      const dr = Math.max(0, 1 - p.drag * dt); p.vx *= dr; p.vy *= dr; p.vy += p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const s = p.s0 + (p.s1 - p.s0) * k, wx = p.wob ? Math.sin(p.t * p.wob * 3) * 6 : 0;
      const w = p.w * s, h = p.h * s;
      const es = p.el.style;
      es.width = w + 'px'; es.height = h + 'px';
      es.transform = `translate(${p.x + wx - w / 2}px,${p.y - h / 2}px) rotate(${p.rot}deg)`;
      if (p.glyph) es.fontSize = (p.fs ? p.fs * s : h * 0.85) + 'px';
      const f = k < 0.55 ? 0 : (k - 0.55) / 0.45;
      es.opacity = 1 - (p.a0 + (1 - p.a0) * f);
    }
    this.states.forEach(st => {
      const c = st.cfg;
      let ix = 0, iy = 0, ir = 0, is = 1;
      const it = c.idleType;
      if (it !== 'none' && st.visible) {
        const sp = c.idleSpeed, am = c.idleAmount;
        if (it === 'float') iy = Math.sin(now * 2 * sp) * 6 * am;
        else if (it === 'pulse') is = 1 + Math.sin(now * 4 * sp) * 0.04 * am;
        else if (it === 'breath') is = 1 + (Math.sin(now * 2 * sp) * 0.5 + 0.5) * 0.06 * am;
        else if (it === 'heartbeat') { const x = (now * sp) % 1.2; is = 1 + (x < 0.15 ? Math.sin(x / 0.15 * Math.PI) * 0.08 : (x > 0.25 && x < 0.4) ? Math.sin((x - 0.25) / 0.15 * Math.PI) * 0.06 : 0) * am; }
        else if (it === 'spin') ir = (now * 90 * sp) % 360;
        else if (it === 'swing') ir = Math.sin(now * 2.5 * sp) * 10 * am;
        else if (it === 'shake') { ix = Math.sin(now * 47 * sp) * 1.5 * am; iy = Math.cos(now * 39 * sp) * 1.5 * am; }
        else if (it === 'rainbow') { st.bg = hsv((now * 0.15 * sp) % 1, 0.7, 1); st.colorTouched = true; st._dirty = true; }
        else if (it === 'rainbowText' && st.info.text) st.info.text.style.color = rgbCss(hsv((now * 0.15 * sp) % 1, 0.7, 1));
        else if (it === 'gradientSpin') { const g = modsOf(st.node).UIGradient; if (g) { st.el.style.background = bgCss(Object.assign({}, st.node, { children: st.node.children.map(ch => ch === g ? Object.assign({}, g, { props: Object.assign({}, g.props, { Rotation: (now * 120 * sp) % 360 }) }) : ch) }), st.bg, st.bgT); } }
        else if (it === 'glow' && !st.hover) { st.strokeT = st.baseStrokeT + (Math.sin(now * 3 * sp) * 0.5 + 0.5) * 3 * am; st.colorTouched = true; st._dirty = true; }
      }
      const x = st.ox + st.mx + ix + st.dragX, y = st.oy - st.lift + iy + st.dragY;
      const r = st.baseRot + st.rot + st.mr + ir, s = st.baseScale * st.hs * st.es * st.ms * is;
      st.el.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${s * st.sx},${s * st.sy})`;
      st.el.style.opacity = st.baseOp * st.op;
      if (st._dirty && st.colorTouched) { this.applyColors(st); }
      st._dirty = false;
    });
  }
};
function hsv(h, s, v) { const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s); const m = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6]; return m.map(x => x * 255); }
function rgbCss(a) { return `rgb(${a.map(v => v | 0).join(',')})`; }
function findParent(root, id) {
  let res = null;
  const walk = n => { (n.children || []).forEach(c => { if (c.id === id) res = n; else if (!res) walk(c); }); };
  walk(root); return res;
}
