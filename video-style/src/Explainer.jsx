import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
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
import '@fontsource/noto-color-emoji/emoji-400.css';
import {CUSTOM_ICONS} from './icons';

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

const useFont = (icons) => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`100px ${FONT}`, 'شرح 123'),
      document.fonts.load('100px "Noto Color Emoji"', icons || '🎸'),
    ]).then(() => continueRender(handle));
  }, [handle, icons]);
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

// One source clip framed for 9:16: "fill" crops full-bleed, "fit" shows a wider area over a blurred copy.
// `seg.src` overrides the composition video; `seg.audio` ({src, from, volume}) plays a separate sound,
// e.g. a voice recorded on its own over other footage.
const Clip = ({video, seg, zoom}) => {
  const {fps} = useVideoConfig();
  const source = seg.src || video;
  const startFrom = Math.round(seg.from * fps);
  const fill = {height: 1920, width: (1920 * 16) / 9};
  const at = (box, x, cy) => ({
    position: 'absolute',
    width: box.width,
    height: box.height,
    left: 540 - (x / 1280) * box.width,
    top: cy - box.height / 2,
    maxWidth: 'none',
  });
  const legacyAudio = seg.clip && !('audio' in seg) ? {src: video, from: seg.from, volume: seg.volume} : null;
  const a = seg.audio || legacyAudio;
  const sound = a ? <Audio src={src(a.src)} startFrom={Math.round(a.from * fps)} volume={a.volume} /> : null;
  if (seg.mode !== 'fit') {
    return (
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        {seg.clip ? (
          <OffthreadVideo src={src(seg.clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <OffthreadVideo src={src(source)} startFrom={startFrom} volume={seg.volume} style={at(fill, seg.x, 960)} />
        )}
        {sound}
      </AbsoluteFill>
    );
  }
  const h = seg.h || (720 * 1080) / seg.w;
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={src(source)}
        startFrom={startFrom}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(28px) brightness(0.45) saturate(1.3)', transform: 'scale(1.15)'}}
      />
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 44%'}}>
        {seg.clip ? (
          <OffthreadVideo
            src={src(seg.clip)}
            muted
            style={{position: 'absolute', left: 0, width: 1080, top: 850 - h / 2, boxShadow: '0 0 90px #000'}}
          />
        ) : (
          <OffthreadVideo
            src={src(source)}
            startFrom={startFrom}
            volume={seg.volume}
            style={{...at({width: (1280 * 1080) / seg.w, height: h}, seg.x, 850), boxShadow: '0 0 90px #000'}}
          />
        )}
        {sound}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SegmentClip = ({video, seg, index}) => {
  const f = useCurrentFrame();
  const punch = interpolate(f, [0, 5], [0.06, 0], clamp);
  const base = seg.mode === 'fit' ? 1 : 1 + (index % 2) * 0.09;
  return <Clip video={video} seg={seg} zoom={base + f * 0.0005 + punch} />;
};

// Footage layer. With `segments` it plays a cut list; otherwise one clip with punch-ins on `cuts`.
const Footage = ({video, accent, cuts, segments}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (segments) {
    return (
      <AbsoluteFill>
        {segments.map((seg, i) => (
          <Sequence key={i} from={Math.round(seg.at * fps)} durationInFrames={Math.round(seg.dur * fps)}>
            <SegmentClip video={video} seg={seg} index={i} />
          </Sequence>
        ))}
      </AbsoluteFill>
    );
  }
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
    <AbsoluteFill style={{top: '70%', height: 'auto', alignItems: 'center'}}>
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

// Emoji sticker that pops in beside the subject when its word is spoken.
const CustomIcon = ({name}) => {
  const C = CUSTOM_ICONS[name];
  return C ? <div style={{width: 230, height: 230, display: 'inline-block'}}><C /></div> : null;
};

const Icons = ({words, stickers = []}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const list = [...words.filter((w) => w.icon), ...stickers].sort((x, y) => x.t - y.t);
  return (
    <AbsoluteFill>
      {list.map((w, i) => {
        const start = Math.round(w.t * fps);
        const next = list[i + 1] ? Math.round(list[i + 1].t * fps) : Infinity;
        const end = Math.min(start + 30, next);
        if (f < start || f >= end) return null;
        const age = f - start;
        const scale = interpolate(age, [0, 4, 8], [0.2, 1.22, 1], clamp) * interpolate(f, [end - 4, end], [1, 0.6], clamp);
        const side = i % 2 ? 1 : -1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 470 + (i % 3) * 50,
              left: 540 + side * 280 - 120,
              width: 240,
              textAlign: 'center',
              fontFamily: '"Noto Color Emoji"',
              fontSize: 200,
              lineHeight: 1,
              opacity: interpolate(age, [0, 2], [0, 1], clamp) * interpolate(f, [end - 4, end], [1, 0], clamp),
              transform: `scale(${scale}) rotate(${side * interpolate(age, [0, 8], [26, 9], clamp)}deg)`,
              filter: 'drop-shadow(0 10px 0 #000) drop-shadow(0 0 26px #000a)',
            }}
          >
            {w.icon.startsWith('@') ? <CustomIcon name={w.icon.slice(1)} /> : w.icon}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// House music bed, used by every edit unless a composition passes `music: null` or another file.
export const DEFAULT_MUSIC = 'music/default.m4a';

export const Explainer = ({title, titleEnd, words, accent, video, audio, music = DEFAULT_MUSIC, musicVolume = 0.12, segments, stickers = [], cuts = []}) => {
  const {durationInFrames} = useVideoConfig();
  useFont([...words, ...stickers].map((w) => (w.icon && !w.icon.startsWith('@') ? w.icon : '')).join(''));
  const {fps} = useVideoConfig();
  // Lower the music under segments that carry their own soundtrack (kind "outro").
  const ducked = (segments || []).filter((g) => g.kind === 'outro').map((g) => [g.at * fps, (g.at + g.dur) * fps]);
  const duck = (f) =>
    ducked.reduce((v, [a, b]) => v * (1 - 0.8 * interpolate(f, [a - 8, a + 8], [0, 1], clamp) * interpolate(f, [b - 8, b + 8], [1, 0], clamp)), 1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage video={video} accent={accent} cuts={cuts} segments={segments} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 38%, #000000e6 100%)'}} />
      <Title lines={title} end={titleEnd} accent={accent} />
      <Glitch at={Math.round(titleEnd * fps)} accent={accent} />
      <Icons words={words} stickers={stickers} />
      <Caption words={words} accent={accent} />
      {audio ? <Audio src={src(audio)} /> : null}
      {music ? (
        <Audio
          src={src(music)}
          loop
          volume={(f) => musicVolume * duck(f) * interpolate(f, [durationInFrames - 30, durationInFrames], [1, 0], clamp)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
