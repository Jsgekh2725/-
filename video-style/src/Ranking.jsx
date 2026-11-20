import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Overlays for ranking videos: one slam-in square card per entry, a closing podium, and timed sound effects.
// Times come from build_from_config.py ("t" start, "end" stop, in seconds).

const FONT = 'Lalezar';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const src = (p) => (/^https?:/.test(p) ? p : staticFile(p));
const outline = (px, color = '#000') =>
  Array.from({length: 16}, (_, a) => {
    const r = (a / 16) * Math.PI * 2;
    return `${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${color}`;
  }).join(',');

const useWindow = (item) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = Math.round(item.t * fps);
  const end = Math.round(item.end * fps);
  return {f, fps, start, end, age: f - start, active: f >= start && f < end};
};

const Backdrop = ({age, left, color}) => (
  <AbsoluteFill
    style={{
      backdropFilter: 'blur(18px) brightness(0.42) saturate(1.2)',
      background: `radial-gradient(circle at 50% 42%, ${color}33 0%, #00000088 70%)`,
      opacity: interpolate(age, [0, 4], [0, 1], clamp) * interpolate(left, [0, 4], [0, 1], clamp),
    }}
  />
);

const Rays = ({age, color, y = 760}) => (
  <div
    style={{
      position: 'absolute',
      left: 540 - 1100,
      top: y - 1100,
      width: 2200,
      height: 2200,
      background: `repeating-conic-gradient(from ${age * 0.8}deg, ${color}66 0deg 9deg, transparent 9deg 22deg)`,
      WebkitMaskImage: 'radial-gradient(circle, #000 0%, #0008 30%, transparent 62%)',
      maskImage: 'radial-gradient(circle, #000 0%, #0008 30%, transparent 62%)',
      opacity: interpolate(age, [2, 10], [0, 1], clamp),
    }}
  />
);

const Confetti = ({age, colors}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: 46}).map((_, i) => {
      const x = random(`cx${i}`) * 1080;
      const delay = random(`cd${i}`) * 10;
      const a = Math.max(0, age - 4 - delay);
      if (a <= 0) return null;
      const y = -60 + a * (16 + random(`cv${i}`) * 14);
      const sway = Math.sin(a / 5 + i) * 40;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + sway,
            top: y,
            width: 22,
            height: 38,
            borderRadius: 5,
            background: colors[i % colors.length],
            transform: `rotate(${a * (8 + i % 7)}deg) scaleX(${Math.cos(a / 3 + i)})`,
            border: '3px solid #0006',
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const Card = ({card}) => {
  const {fps, age, end, f, active} = useWindow(card);
  if (!active) return null;
  const left = end - f;
  const slam = spring({frame: age, fps, config: {damping: 13, stiffness: 190, mass: 0.7}});
  const scale = interpolate(slam, [0, 1], [2.4, 1]) * interpolate(left, [0, 4], [0.85, 1], clamp);
  const shake = age > 2 && age < 12 ? (12 - age) * 1.6 : 0;
  const sx = (random(`sx${age}`) - 0.5) * shake;
  const sy = (random(`sy${age}`) - 0.5) * shake;
  const badge = spring({frame: age - 6, fps, config: {damping: 9, stiffness: 220}});
  const label = interpolate(age, [8, 16], [0, 1], clamp);
  const shine = interpolate(age, [9, 24], [-120, 220], clamp);
  const SIZE = 640;
  const TOP = 430;
  return (
    <AbsoluteFill style={{opacity: interpolate(left, [0, 3], [0, 1], clamp)}}>
      <Backdrop age={age} left={left} color={card.color} />
      <Rays age={age} color={card.color} y={TOP + SIZE / 2} />
      {card.rank === 1 ? <Confetti age={age} colors={['#ffc531', '#ff2340', '#19b35a', '#2f7bff', '#ffffff']} /> : null}
      <div
        style={{
          position: 'absolute',
          left: 540 - SIZE / 2 + sx,
          top: TOP + sy,
          width: SIZE,
          height: SIZE,
          transform: `scale(${scale}) rotate(${interpolate(slam, [0, 1], [-12, -3])}deg)`,
          filter: `blur(${interpolate(slam, [0, 0.6], [16, 0], clamp)}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 44,
            overflow: 'hidden',
            border: `18px solid ${card.color}`,
            boxShadow: `0 0 0 9px #111, 0 34px 70px #000c, 0 0 90px ${card.color}88`,
          }}
        >
          <Img src={src(card.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${shine}%`,
              width: '38%',
              background: 'linear-gradient(100deg, transparent, #ffffff88, transparent)',
              transform: 'skewX(-18deg)',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            right: -70,
            top: -70,
            width: 200,
            height: 200,
            borderRadius: 100,
            background: `radial-gradient(circle at 35% 30%, #fff8, ${card.color} 45%)`,
            border: '11px solid #111',
            boxShadow: '0 12px 0 #111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${badge}) rotate(${12 - badge * 4}deg)`,
          }}
        >
          <span style={{fontFamily: FONT, fontSize: 150, lineHeight: 1, color: '#111', marginTop: 24}}>{card.rank}</span>
        </div>
        {card.rank === 1 ? (
          <div
            style={{
              position: 'absolute',
              right: -60,
              top: -190,
              fontFamily: '"Noto Color Emoji"',
              fontSize: 130,
              transform: `scale(${badge}) rotate(14deg)`,
              filter: 'drop-shadow(0 8px 0 #000)',
            }}
          >
            👑
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: TOP + SIZE + 40 + (1 - label) * 70,
          display: 'flex',
          justifyContent: 'center',
          opacity: label,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 104,
            lineHeight: 1.25,
            color: '#fff',
            direction: 'rtl',
            padding: '4px 54px 0',
            borderRadius: 26,
            background: '#141218',
            border: `8px solid ${card.color}`,
            boxShadow: `0 10px 0 #000, 0 0 40px ${card.color}66`,
            textShadow: outline(5),
          }}
        >
          {card.name}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RankCards = ({cards = []}) => (
  <AbsoluteFill>
    {cards.map((c, i) => (
      <Card key={i} card={c} />
    ))}
  </AbsoluteFill>
);

const PODIUM = {
  1: {cx: 540, size: 330, top: 470, delay: 18},
  2: {cx: 222, size: 270, top: 600, delay: 12},
  3: {cx: 858, size: 270, top: 660, delay: 6},
};
const BASE = 1250;

export const Podium = ({podium = []}) => {
  const items = podium[0];
  const {fps, age, end, f, active} = useWindow(items || {t: 0, end: 0});
  if (!items || f < Math.round(items.t * fps)) return null; // stays up to the end of the video
  const left = end - f;
  return (
    <AbsoluteFill>
      <Backdrop age={age} left={99} color="#ffc531" />
      <Rays age={age} color="#ffc531" y={640} />
      {items.items.map((it) => {
        const p = PODIUM[it.rank];
        const pop = spring({frame: age - p.delay, fps, config: {damping: 11, stiffness: 200}});
        const rise = interpolate(pop, [0, 1], [260, 0]);
        return (
          <div key={it.rank} style={{opacity: interpolate(pop, [0, 0.2], [0, 1], clamp)}}>
            <div
              style={{
                position: 'absolute',
                left: p.cx - p.size / 2,
                top: p.top + p.size + rise,
                width: p.size,
                height: BASE - p.top - p.size,
                background: `linear-gradient(180deg, ${it.color}, ${it.color}aa)`,
                border: '8px solid #111',
                borderRadius: '18px 18px 0 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: 'inset 0 -30px 0 #0003',
              }}
            >
              <span style={{fontFamily: FONT, fontSize: 140, lineHeight: 1.1, color: '#111', marginTop: 12}}>{it.rank}</span>
              <span style={{fontFamily: FONT, fontSize: it.name.length > 6 ? 44 : 56, color: '#fff', direction: 'rtl', textShadow: outline(4)}}>{it.name}</span>
            </div>
            <div
              style={{
                position: 'absolute',
                left: p.cx - p.size / 2,
                top: p.top + rise - 18,
                width: p.size,
                height: p.size,
                borderRadius: 30,
                overflow: 'hidden',
                border: `11px solid ${it.color}`,
                boxShadow: '0 0 0 7px #111, 0 22px 40px #000b',
                transform: `scale(${0.6 + pop * 0.4})`,
              }}
            >
              <Img src={src(it.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            {it.rank === 1 ? (
              <div
                style={{
                  position: 'absolute',
                  left: p.cx - 70,
                  top: p.top - 150 + rise,
                  fontFamily: '"Noto Color Emoji"',
                  fontSize: 120,
                  transform: `scale(${pop}) rotate(-8deg)`,
                  filter: 'drop-shadow(0 8px 0 #000)',
                }}
              >
                👑
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Sfx = ({sfx = []}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {sfx.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.t * fps))} durationInFrames={Math.round(3 * fps)} layout="none">
          <Audio src={src(s.src)} volume={s.volume ?? 1} />
        </Sequence>
      ))}
    </>
  );
};
