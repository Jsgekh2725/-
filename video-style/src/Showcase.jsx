import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Item showcase for videos whose footage is a still screen: the item floats over an animated backdrop and
// each "phase" (pinned to a voice line) plays its own effect. Times are seconds from build_from_config.py.
//   showcase: [{t, end, img, bg, color}]
//   phases:   [{t, end?, kind: slam|sparkle|price|shrink|photo|stamp|limited, text?}]

const FONT = 'Lalezar';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const src = (p) => (/^https?:/.test(p) ? p : staticFile(p));
const outline = (px, color = '#000') =>
  Array.from({length: 16}, (_, a) => {
    const r = (a / 16) * Math.PI * 2;
    return `${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${color}`;
  }).join(',');

// Default layout; a showcase entry can override cy/size, and set transparent to sit over footage.
const DEFAULT = {cx: 540, cy: 800, size: 760};

const Sparks = ({age, color, count = 26, seed = 's', CX, CY, K = 1}) => (
  <>
    {Array.from({length: count}).map((_, i) => {
      const a = (i / count) * Math.PI * 2 + random(`${seed}a${i}`) * 0.4;
      const speed = 16 + random(`${seed}v${i}`) * 18;
      const d = age * speed * (1 - age / 60);
      const life = interpolate(age, [0, 6, 26], [0, 1, 0], clamp);
      const s = 18 + random(`${seed}s${i}`) * 26;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: CX + Math.cos(a) * (120 * K + d) - s / 2,
            top: CY + Math.sin(a) * (120 * K + d) - s / 2,
            width: s,
            height: s,
            background: i % 3 ? color : '#fff',
            clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
            opacity: life,
            transform: `rotate(${age * 9 + i * 20}deg)`,
          }}
        />
      );
    })}
  </>
);

const phaseAge = (phases, kind, f, fps) => {
  const p = phases.filter((x) => x.kind === kind && f >= Math.round(x.t * fps)).pop();
  if (!p) return null;
  const end = p.end != null ? Math.round(p.end * fps) : Infinity;
  if (f >= end) return null;
  return {age: f - Math.round(p.t * fps), left: end - f, p};
};

export const Showcase = ({showcase = [], phases = []}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sc = showcase[0];
  if (!sc) return null;
  const start = Math.round(sc.t * fps);
  const stop = Math.round(sc.end * fps);
  if (f < start || f >= stop) return null;
  const color = sc.color || '#ffc531';
  const t = f - start;
  const CX = DEFAULT.cx;
  const CY = sc.cy ?? DEFAULT.cy;
  const SIZE = sc.size ?? DEFAULT.size;
  const K = SIZE / DEFAULT.size;

  const slam = phaseAge(phases, 'slam', f, fps);
  const sparkle = phaseAge(phases, 'sparkle', f, fps);
  const price = phaseAge(phases, 'price', f, fps);
  const shrink = phaseAge(phases, 'shrink', f, fps);
  const photo = phaseAge(phases, 'photo', f, fps);
  const stamp = phaseAge(phases, 'stamp', f, fps);
  const limited = phaseAge(phases, 'limited', f, fps);

  // Key transform: idle float, slam-in, shrink-away-and-back.
  let scale = 1;
  let opacity = 1;
  let shake = 0;
  if (slam) {
    const s = spring({frame: slam.age, fps, config: {damping: 12, stiffness: 180, mass: 0.8}});
    scale *= interpolate(s, [0, 1], [2.6, 1]);
    opacity *= interpolate(slam.age, [0, 3], [0, 1], clamp);
    shake = slam.age > 2 && slam.age < 12 ? (12 - slam.age) * 1.8 : 0;
  }
  if (shrink) {
    const dur = shrink.age + shrink.left;
    scale *= interpolate(shrink.age, [6, 34], [1, 0.1], clamp);
    opacity *= interpolate(shrink.age, [dur * 0.62, dur * 0.72], [1, 0], clamp);
    const back = spring({frame: shrink.age - (dur - 10), fps, config: {damping: 10}});
    if (shrink.age > dur - 10) {
      scale = interpolate(back, [0, 1], [0.1, 1]);
      opacity = back;
    }
  }
  if (sparkle) scale *= 1 + 0.06 * Math.sin(sparkle.age / 3) * interpolate(sparkle.age, [0, 30], [1, 0], clamp);
  const bob = Math.sin(t / 16) * 16;
  const tilt = Math.sin(t / 38) * 7 - 4;
  const sx = (random(`kx${f}`) - 0.5) * shake;
  const sy = (random(`ky${f}`) - 0.5) * shake;
  const flash = slam ? interpolate(slam.age, [0, 1, 5], [0, 0.7, 0], clamp) : photo ? interpolate(photo.age, [0, 1, 6], [0, 0.85, 0], clamp) : 0;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* Backdrop: the blurred source screen under a navy wash and turning gold rays. */}
      {sc.transparent ? (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% ${(CY / 1920) * 100}%, #000a 0%, #0006 ${SIZE * 0.05}%, transparent ${SIZE * 0.06}%)`}} />
      ) : (
        <>
          <AbsoluteFill style={{transform: `scale(${1.25 + t * 0.0006})`}}>
            <Img src={src(sc.bg)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(26px) brightness(0.35) saturate(1.3)'}} />
          </AbsoluteFill>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #0b1240cc 0%, #160b38aa 55%, #050510ee 100%)'}} />
        </>
      )}
      <div
        style={{
          position: 'absolute',
          left: CX - 1100,
          top: CY - 1100,
          width: 2200,
          height: 2200,
          background: `repeating-conic-gradient(from ${t * 0.6}deg, ${color}55 0deg 8deg, transparent 8deg 20deg)`,
          WebkitMaskImage: `radial-gradient(circle, #000 0%, #0007 ${32 * K}%, transparent ${60 * K}%)`,
          maskImage: `radial-gradient(circle, #000 0%, #0007 ${32 * K}%, transparent ${60 * K}%)`,
          opacity: sc.transparent ? 0.75 : 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: CX - 330 * K,
          top: CY - 330 * K,
          width: 660 * K,
          height: 660 * K,
          borderRadius: 330 * K,
          background: `radial-gradient(circle, ${color}66 0%, transparent 65%)`,
          transform: `scale(${1 + Math.sin(t / 12) * 0.05})`,
        }}
      />
      {/* Ambient twinkles. */}
      {sc.transparent ? null : Array.from({length: 18}).map((_, i) => {
        const x = random(`tx${i}`) * 1080;
        const y = 300 + random(`ty${i}`) * 1100;
        const tw = Math.max(0, Math.sin(t / (8 + (i % 5)) + i * 1.7));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 26,
              height: 26,
              background: '#fff6c8',
              clipPath: 'polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)',
              opacity: tw * 0.8,
              transform: `scale(${0.5 + tw})`,
            }}
          />
        );
      })}

      {sparkle ? <Sparks age={sparkle.age} color={color} CX={CX} CY={CY} K={K} /> : null}
      {slam ? <Sparks age={slam.age} color={color} count={16} seed="sl" CX={CX} CY={CY} K={K} /> : null}

      {/* The item. */}
      <div
        style={{
          position: 'absolute',
          left: CX - SIZE / 2 + sx,
          top: CY - SIZE / 2 + bob + sy,
          width: SIZE,
          height: SIZE,
          opacity,
          transform: `scale(${scale}) rotate(${tilt}deg)`,
          filter: `drop-shadow(0 0 ${sparkle ? 60 : 34}px ${color}) drop-shadow(0 26px 30px #000c)`,
        }}
      >
        <Img src={src(sc.img)} style={{width: '100%', height: '100%', imageRendering: 'pixelated'}} />
      </div>

      {/* Shrink guides: arrows pointing in while the item gets smaller. */}
      {shrink && shrink.age < (shrink.age + shrink.left) * 0.7
        ? [0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const r = interpolate(shrink.age, [0, 30], [420, 200], clamp) * K;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: CX + Math.cos(a) * r - 50,
                  top: CY + Math.sin(a) * r - 50,
                  width: 100,
                  height: 100,
                  fontFamily: '"Noto Color Emoji"',
                  fontSize: 90,
                  lineHeight: 1,
                  transform: `rotate(${(a * 180) / Math.PI + 180}deg)`,
                  opacity: interpolate(shrink.age, [0, 6], [0, 1], clamp),
                }}
              >
                ➡️
              </div>
            );
          })
        : null}

      {/* Photo viewfinder corners. */}
      {photo
        ? [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([dx, dy], i) => {
            const k = spring({frame: photo.age, fps, config: {damping: 14}});
            const r = interpolate(k, [0, 1], [560, 400]) * K;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: CX + dx * r - 60,
                  top: CY + dy * r - 60,
                  width: 120,
                  height: 120,
                  borderColor: '#fff',
                  borderStyle: 'solid',
                  borderWidth: `${dy < 0 ? 14 : 0}px ${dx > 0 ? 14 : 0}px ${dy > 0 ? 14 : 0}px ${dx < 0 ? 14 : 0}px`,
                  borderRadius: 10,
                  filter: 'drop-shadow(0 0 0 #000) drop-shadow(0 6px 0 #000)',
                }}
              />
            );
          })
        : null}

      {/* Price tag. */}
      {price
        ? (() => {
            const k = spring({frame: price.age, fps, config: {damping: 10, stiffness: 170}});
            return (
              <div
                style={{
                  position: 'absolute',
                  left: CX + 30,
                  top: CY + 210 * K,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '10px 40px 0 22px',
                  background: '#141218',
                  border: `10px solid ${color}`,
                  borderRadius: 34,
                  boxShadow: `0 12px 0 #000, 0 0 50px ${color}88`,
                  transform: `scale(${k}) rotate(${-8 + (1 - k) * 30}deg)`,
                  transformOrigin: '20% 50%',
                }}
              >
                <svg viewBox="0 0 100 100" width="110" height="110">
                  <polygon points="50,4 92,28 92,72 50,96 8,72 8,28" fill={color} stroke="#111" strokeWidth="7" />
                  <text x="50" y="66" textAnchor="middle" fontFamily={FONT} fontSize="40" fill="#111">R$</text>
                </svg>
                <span style={{fontFamily: FONT, fontSize: 150, lineHeight: 1, color: '#fff', textShadow: outline(6)}}>{price.p.text}</span>
              </div>
            );
          })()
        : null}

      {/* OFF SALE stamp. */}
      {stamp
        ? (() => {
            const k = spring({frame: stamp.age, fps, config: {damping: 9, stiffness: 240}});
            return (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: CY - 120 * K,
                  display: 'flex',
                  justifyContent: 'center',
                  transform: `scale(${interpolate(k, [0, 1], [3, 1])}) rotate(-14deg)`,
                  opacity: interpolate(stamp.age, [0, 3], [0, 1], clamp),
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 170,
                    lineHeight: 1.15,
                    color: '#ff2340',
                    padding: '6px 50px 0',
                    border: '16px solid #ff2340',
                    borderRadius: 30,
                    background: '#ffffffd9',
                    boxShadow: '0 0 0 8px #111, 0 18px 0 #000',
                    direction: 'rtl',
                  }}
                >
                  {stamp.p.text || 'اوف سيل'}
                </div>
              </div>
            );
          })()
        : null}

      {/* LIMITED ribbon. */}
      {limited
        ? (() => {
            const k = spring({frame: limited.age, fps, config: {damping: 11}});
            return (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: CY + 230 * K + (1 - k) * 200,
                  display: 'flex',
                  justifyContent: 'center',
                  opacity: k,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 120,
                    lineHeight: 1.2,
                    color: '#111',
                    padding: '6px 60px 0',
                    background: `linear-gradient(180deg, #fff3a8, ${color})`,
                    border: '10px solid #111',
                    borderRadius: 18,
                    boxShadow: `0 12px 0 #000, 0 0 60px ${color}`,
                    direction: 'rtl',
                  }}
                >
                  {limited.p.text || 'ليمتد'}
                </div>
              </div>
            );
          })()
        : null}

      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
