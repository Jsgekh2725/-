import React from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo, Sequence, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import { CALLBACK, CARDS, Card, DURATION_S, FPS, HIGHLIGHT, HOOK, ICONS, IMPACTS, Icon, MAP, OPENING_END, SHOTS, SWIPE } from './plan';
import { WORDS } from './words';
import { SR } from './sr';

const W = 1080, H = 1920;
const RED = '#F80304';
const f = (s: number) => Math.round(s * FPS);

// ---------- font ----------
const fontHandle = delayRender('font');
const face = new FontFace('Tajawal', `url(${staticFile('fonts/tajawal-arabic-900-normal.woff2')})`, { weight: '900' });
face.load().then((ff) => { (document as any).fonts.add(ff); continueRender(fontHandle); });

// ---------- background shots ----------
const Shots: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {SHOTS.map((s, i) => {
        const len = f(s.to) - f(s.from);
        const local = frame - f(s.from);
        const z = interpolate(local, [0, len], [s.z0, s.z1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        // hook → story: 3-frame dissolve into shot 1
        const fadeIn = false ? interpolate(local, [-3, 0], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
        const from = false ? f(s.from) - 3 : f(s.from);
        return (
          <Sequence key={i} from={from} durationInFrames={f(s.to) - from} layout="none">
            <AbsoluteFill style={{ opacity: fadeIn, overflow: 'hidden' }}>
              <OffthreadVideo
                src={staticFile(SR[i] ?? s.video)}
                startFrom={SR[i] ? 0 : f(s.src) - (f(s.from) - from)}
                muted
                style={{
                  width: W, height: H, transform: `scale(${z})`,
                  filter: s.dark ? `brightness(${interpolate(local, [0, 8], [1, 0.42], { extrapolateRight: 'clamp' })}) blur(${interpolate(local, [0, 8], [0, 7], { extrapolateRight: 'clamp' })}px)` : undefined,
                }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};

// ---------- one-word captions ----------
const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const w = WORDS.find((x) => t >= x.start && t < x.show_until);
  if (!w) return null;
  const local = frame - f(w.start);
  const sc = interpolate(local, [0, 3], [1.12, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        fontFamily: 'Tajawal', fontWeight: 900, fontSize: 64, color: (HIGHLIGHT as readonly string[]).includes(w.word) ? '#FFD400' : '#fff', direction: 'rtl',
        transform: `scale(${sc})`, lineHeight: 1.2, whiteSpace: 'nowrap',
        textShadow: '3px 4px 4px rgba(0,0,0,0.78), 0 0 10px rgba(0,0,0,0.45)',
      }}>{w.word}</div>
    </AbsoluteFill>
  );
};

// ---------- icons (sticker style, pop in / out) ----------
const IconSticker: React.FC<{ icon: Icon }> = ({ icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = f(icon.until) - f(icon.at);
  const inS = spring({ frame, fps, config: { damping: 9, stiffness: 180, mass: 0.6 } });
  const out = interpolate(frame, [len - 5, len], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const wobble = Math.sin(frame / 6) * 4;
  const size = icon.size ?? 220;
  const cy = (icon.y ?? 0.34) * H;
  const outline = 'drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 10px 14px rgba(0,0,0,0.55))';
  return (
    <div style={{
      position: 'absolute', left: W / 2 + (icon.x ?? 0) - size / 2, top: cy - size / 2, width: size, height: size,
      transform: `scale(${inS * out}) rotate(${(1 - inS) * -25 + wobble}deg)`, filter: outline,
    }}>
      <Img src={staticFile(`icons/${icon.name}`)} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

// ---------- proof cards ----------
const ProofCard: React.FC<{ card: Card }> = ({ card }) => {
  const frame = useCurrentFrame();
  const len = f(card.until) - f(card.at);
  const sc = interpolate(frame, [0, 3, 6], [0.88, 1.05, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const op = Math.min(interpolate(frame, [0, 2], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [len - 6, len], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  let inner: React.ReactNode = card.src.endsWith('.mp4')
    ? <OffthreadVideo src={staticFile(card.src)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <Img src={staticFile(card.src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  if (card.scroll) {
    // tall screenshot: show it in a window and scroll down slowly
    const imgH = card.w * (card.aspect ?? 1);
    const y = interpolate(frame, [12, len - 10], [0, -(imgH - card.h)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
    inner = <Img src={staticFile(card.src)} style={{ width: card.w, height: imgH, transform: `translateY(${y}px)` }} />;
  }
  return (
    <div style={{
      position: 'absolute', left: (W - card.w) / 2, top: card.cy * H - card.h / 2, width: card.w, height: card.h,
      borderRadius: 34, overflow: 'hidden', transform: `scale(${sc})`, opacity: op,
      boxShadow: '0 18px 50px rgba(0,0,0,0.6)', background: '#111',
    }}>{inner}</div>
  );
};

// ---------- red hook graphic (circle + arrow + text) ----------
const HookMark: React.FC<{ cx: number; cy: number; rx: number; ry: number; text: string; tx: number; ty: number; arrow: string; textSize?: number }> = (p) => {
  const frame = useCurrentFrame();
  const circ = 2 * Math.PI * Math.sqrt((p.rx * p.rx + p.ry * p.ry) / 2);
  const draw = interpolate(frame, [0, 6], [circ, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const arrowDraw = interpolate(frame, [3, 9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const txt = interpolate(frame, [0, 3, 5], [0.6, 1.1, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }}>
        <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="none" stroke={RED} strokeWidth={20}
          strokeDasharray={circ} strokeDashoffset={draw} strokeLinecap="round" />
        <path d={p.arrow} fill="none" stroke={RED} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={arrowDraw} />
      </svg>
      <div style={{
        position: 'absolute', left: 0, width: W, top: p.ty, textAlign: 'center', direction: 'rtl',
        fontFamily: 'Tajawal', fontWeight: 900, fontSize: p.textSize ?? 104, color: RED, whiteSpace: 'nowrap',
        WebkitTextStroke: '3px #fff', paintOrder: 'stroke fill', transform: `translateX(${p.tx}px) scale(${txt})`,
        textShadow: '0 6px 10px rgba(0,0,0,0.55)',
      }}>{p.text}</div>
    </AbsoluteFill>
  );
};

// arrow path helper: curved shaft from (x1,y1) to (x2,y2) with a head at the end
const arrowPath = (x1: number, y1: number, cx: number, cy: number, x2: number, y2: number) => {
  const a = Math.atan2(y2 - cy, x2 - cx), L = 46, s = 0.55;
  const h1 = [x2 - L * Math.cos(a - s), y2 - L * Math.sin(a - s)], h2 = [x2 - L * Math.cos(a + s), y2 - L * Math.sin(a + s)];
  return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2} M${h1[0]} ${h1[1]} L${x2} ${y2} L${h2[0]} ${h2[1]}`;
};

// ---------- our own swipe transition: warm diagonal streaks ----------
const Swipe: React.FC = () => {
  const frame = useCurrentFrame();
  const len = f(SWIPE.dur);
  const bands = [0, 1, 2, 3, 4];
  const colors = ['#FF3D00', '#FF7A00', '#FFB300', '#FF5500', '#FFD54F'];
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {bands.map((b) => {
        const delay = b * 1.2;
        const x = interpolate(frame, [delay, delay + len - 4], [W * 1.6, -W * 1.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
        return (
          <div key={b} style={{
            position: 'absolute', top: -400, left: x, width: W * 1.05, height: H + 800,
            transform: 'skewX(-24deg)', background: `linear-gradient(90deg, transparent, ${colors[b]} 18%, ${colors[b]} 82%, transparent)`,
            opacity: 0.96, boxShadow: `0 0 60px ${colors[b]}`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- opening: the map card (hook 0–1 s, then the first sentence) ----------
const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const len = f(OPENING_END);
  const cw = 1000, k = cw / MAP.w, ch = Math.round(MAP.h * k);
  const left = (W - cw) / 2, top = 0.53 * H - ch / 2;
  const pop = interpolate(frame, [0, 3, 6], [0.86, 1.05, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const drift = interpolate(frame, [0, len], [1, 1.07]);
  const bgZoom = interpolate(frame, [0, len], [1.0, 1.12]);
  const t = MAP.hook;
  const hx = W / 2 + (left + t.x * k - W / 2) * drift, hy = 0.53 * H + (top + t.y * k - 0.53 * H) * drift;
  return (
    <AbsoluteFill style={{ background: '#0b0806' }}>
      <AbsoluteFill style={{ transform: `scale(${bgZoom})`, overflow: 'hidden' }}>
        <Img src={staticFile(MAP.src)} style={{ position: 'absolute', height: H, left: '50%', transform: `translateX(-${MAP.bgX}%)`, filter: 'blur(26px) brightness(0.5) saturate(1.2)' }} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', left, top, width: cw, height: ch, borderRadius: 36, overflow: 'hidden',
        transform: `scale(${pop * drift})`, boxShadow: '0 24px 70px rgba(0,0,0,0.7)' }}>
        <Img src={staticFile(MAP.src)} style={{ width: '100%', height: '100%' }} />
      </div>
      <Sequence from={0} durationInFrames={f(HOOK.until)} layout="none">
        <HookMark cx={hx} cy={hy} rx={t.rx} ry={t.ry} text={HOOK.text} tx={0} ty={top - 300} textSize={92}
          arrow={arrowPath(W / 2 + 230, top - 160, W / 2 + 330, top - 40, hx + t.rx * 0.55, hy - t.ry * 0.85)} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------- shake / punch / flash on big hits ----------
const useImpact = (frame: number) => {
  let dx = 0, dy = 0, sc = 1, flash = 0, color = '#fff';
  for (const im of IMPACTS) {
    const t = frame - f(im.at);
    if (t < 0 || t > 12) continue;
    if (im.shake) { const a = im.shake * Math.exp(-t / 3.5); dx += a * Math.sin(t * 2.7); dy += a * Math.cos(t * 3.3); }
    if (im.punch) sc *= 1 + (im.punch - 1) * Math.exp(-t / 3);
    if (im.flash) { const o = interpolate(t, [0, 1, 5], [0, 0.55, 0], { extrapolateRight: 'clamp' }); if (o > flash) { flash = o; color = im.flash; } }
  }
  return { dx, dy, sc, flash, color };
};

export const Main: React.FC = () => {
  // map name position on the outro card (last card = the map card)
  const mc = CARDS[CARDS.length - 1];
  const k = mc.w / MAP.w;
  const cardLeft = (W - mc.w) / 2, cardTop = mc.cy * H - mc.h / 2;
  const nameCx = cardLeft + MAP.name.x * k, nameCy = cardTop + MAP.name.y * k;
  const frame = useCurrentFrame();
  const im = useImpact(frame);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
     <AbsoluteFill style={{ transform: `translate(${im.dx}px, ${im.dy}px) scale(${im.sc * 1.035})` }}>
      <Shots />
      {CARDS.map((c, i) => (
        <Sequence key={i} from={f(c.at)} durationInFrames={Math.min(f(c.until), f(DURATION_S)) - f(c.at)} layout="none">
          <ProofCard card={c} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={f(OPENING_END)} layout="none">
        <Opening />
      </Sequence>
      <Sequence from={f(CALLBACK.at)} layout="none">
        <HookMark cx={nameCx} cy={nameCy} rx={MAP.name.rx} ry={MAP.name.ry} text={CALLBACK.text} tx={0} ty={cardTop - 340} textSize={92}
          arrow={arrowPath(nameCx + 230, cardTop - 215, nameCx + 330, cardTop - 60, nameCx + MAP.name.rx * 0.75, nameCy - MAP.name.ry * 0.8)} />
      </Sequence>
      {ICONS.map((ic, i) => (
        <Sequence key={i} from={f(ic.at)} durationInFrames={f(ic.until) - f(ic.at)} layout="none">
          <IconSticker icon={ic} />
        </Sequence>
      ))}
      <Caption />
     </AbsoluteFill>
      <AbsoluteFill style={{ background: im.color, opacity: im.flash, pointerEvents: 'none' }} />
      <Sequence from={f(SWIPE.at)} durationInFrames={f(SWIPE.dur) + 6} layout="none">
        <Swipe />
      </Sequence>
    </AbsoluteFill>
  );
};
