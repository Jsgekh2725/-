import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  continueRender,
  delayRender,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import '@fontsource/lalezar/arabic-400.css';
import '@fontsource/lalezar/latin-400.css';

const FONT = 'Lalezar';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const src = (p) => (/^https?:/.test(p) ? p : staticFile(p));

// Thick dark outline + hard drop shadow, built from stacked text-shadows.
const outline = (px, color = '#000') => {
  const s = [];
  for (let a = 0; a < 16; a++) {
    const r = (a / 16) * Math.PI * 2;
    s.push(`${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${color}`);
  }
  return s;
};

const useFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    document.fonts.load(`100px ${FONT}`, 'شرح 123').then(() => continueRender(handle));
  }, [handle]);
};

// Placeholder for gameplay footage: dark room swept by one coloured torch.
const Placeholder = ({accent}) => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 23) * 24;
  const y = 44 + Math.cos(f / 31) * 14;
  return (
    <AbsoluteFill style={{background: '#07060a'}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(#ffffff0d 2px, transparent 2px), linear-gradient(90deg, #ffffff0d 2px, transparent 2px)',
          backgroundSize: '135px 135px',
          transform: 'perspective(900px) rotateX(58deg) scale(2.2) translateY(18%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${x}% ${y}%, ${accent}cc 0%, ${accent}55 14%, transparent 34%)`,
          mixBlendMode: 'screen',
          filter: 'blur(12px)',
        }}
      />
    </AbsoluteFill>
  );
};

// Footage layer: slow push-in that snaps back harder on every cut.
const Footage = ({video, accent, cuts}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cutFrames = [0, ...cuts.map((c) => Math.round(c * fps))];
  const last = cutFrames.filter((c) => c <= f).pop();
  const idx = cutFrames.indexOf(last);
  const since = f - last;
  const punch = interpolate(since, [0, 5], [0.07, 0], clamp);
  const scale = 1.04 + (idx % 2) * 0.1 + since * 0.0006 + punch;
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`}}>
      {video ? (
        <OffthreadVideo src={src(video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      ) : (
        <Placeholder accent={accent} />
      )}
    </AbsoluteFill>
  );
};

const TitleWord = ({text, at, out, style, accent}) => {
  const f = useCurrentFrame();
  if (f < at || f > out + 5) return null;
  const inP = interpolate(f, [at, at + 5], [0, 1], clamp);
  const outP = interpolate(f, [out, out + 5], [0, 1], clamp);
  const scale = interpolate(inP, [0, 1], [3.2, 1]) + outP * 2.2;
  const blur = interpolate(inP, [0, 1], [26, 0]) + outP * 26;
  const split = outP * 14;
  return (
    <div
      style={{
        position: 'absolute',
        fontFamily: FONT,
        fontSize: 250,
        lineHeight: 1,
        color: '#fff',
        direction: 'rtl',
        whiteSpace: 'nowrap',
        opacity: interpolate(inP, [0, 0.4], [0, 1], clamp) * (1 - outP * 0.6),
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        textShadow: `10px 10px 0 ${accent}, ${-split}px 0 0 #00e5ff99, ${split}px 0 0 #ff003c99, 0 0 50px #000`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

const Title = ({lines, end, accent}) => {
  const {fps} = useVideoConfig();
  const out = Math.round(end * fps) - 6;
  const spots = [
    {top: 260, right: 80},
    {top: 540, left: 80},
    {top: 830, left: 0, right: 0, textAlign: 'center'},
  ];
  return (
    <AbsoluteFill>
      {lines.map((t, i) => (
        <TitleWord key={i} text={t} at={3 + i * 11} out={out} accent={accent} style={spots[i % spots.length]} />
      ))}
    </AbsoluteFill>
  );
};

// Three-frame slice glitch that hides the hand-over from title to body.
const Glitch = ({at, accent}) => {
  const f = useCurrentFrame();
  const d = f - at;
  if (d < -1 || d > 2) return null;
  return (
    <AbsoluteFill>
      {Array.from({length: 14}).map((_, i) => {
        const h = 40 + random(`h${i}${f}`) * 190;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: random(`t${i}${f}`) * 1920,
              height: h,
              background: i % 3 === 0 ? accent : i % 3 === 1 ? '#fff' : '#000',
              opacity: 0.25 + random(`o${i}${f}`) * 0.6,
              transform: `translateX(${(random(`x${i}${f}`) - 0.5) * 300}px)`,
              mixBlendMode: i % 3 === 2 ? 'normal' : 'screen',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Caption = ({words, accent}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const w = words.find((x) => t >= x.t && t < x.t + x.d);
  if (!w) return null;
  const age = f - Math.round(w.t * fps);
  const p = interpolate(age, [0, 3], [0, 1], clamp);
  const pop = w.hot ? interpolate(age, [0, 3, 7], [1.25, 1.06, 1], clamp) : 1;
  const grey = Math.round(interpolate(p, [0, 1], [120, 255]));
  return (
    <AbsoluteFill style={{top: '66%', height: 'auto', alignItems: 'center'}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: w.hot ? 190 : 165,
          lineHeight: 1.2,
          direction: 'rtl',
          color: w.hot && p === 1 ? accent : `rgb(${grey},${grey},${grey})`,
          opacity: interpolate(p, [0, 1], [0.35, 1]),
          filter: `blur(${(1 - p) * 5}px)`,
          transform: `scale(${pop})`,
          textShadow: [...outline(9), '7px 13px 0 #000', '0 0 34px #000c'].join(','),
        }}
      >
        {w.text}
      </div>
    </AbsoluteFill>
  );
};

export const Explainer = ({title, titleEnd, words, accent, video, audio, cuts = []}) => {
  useFont();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage video={video} accent={accent} cuts={cuts} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 38%, #000000e6 100%)'}} />
      <Title lines={title} end={titleEnd} accent={accent} />
      <Glitch at={Math.round(titleEnd * fps)} accent={accent} />
      <Caption words={words} accent={accent} />
      {audio ? <Audio src={src(audio)} /> : null}
    </AbsoluteFill>
  );
};
