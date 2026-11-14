import React from 'react';

// Hand-made sticker icons for words that have no fitting emoji. Referenced from edit configs as "@name".
// Drawn as inline SVG (not <img>) so the Arabic text uses the page's Lalezar font.
const FONT = 'Lalezar';
const STROKE = {stroke: '#fff', strokeWidth: 10, strokeLinejoin: 'round', paintOrder: 'stroke'};

// White ghost wearing a red-and-white shmagh and black agal, for horror.
const GhostShmagh = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <defs>
      <pattern id="shmagh" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="22" height="22" fill="#fff" />
        <rect width="11" height="11" fill="#d71f2c" />
        <rect x="11" y="11" width="11" height="11" fill="#d71f2c" />
      </pattern>
    </defs>
    <path
      d="M50 220 V118 C50 66 82 40 120 40 C158 40 190 66 190 118 V220 L170 202 L150 220 L130 202 L110 220 L90 202 L70 220 Z"
      fill="#f6f6fa"
      stroke="#111"
      strokeWidth="9"
      strokeLinejoin="round"
    />
    <path
      d="M30 200 C26 110 52 26 120 26 C188 26 214 110 210 200 L176 176 C178 118 160 78 120 78 C80 78 62 118 64 176 Z"
      fill="url(#shmagh)"
      stroke="#111"
      strokeWidth="8"
      strokeLinejoin="round"
    />
    <ellipse cx="120" cy="40" rx="60" ry="11" fill="none" stroke="#111" strokeWidth="8" />
    <ellipse cx="120" cy="54" rx="66" ry="12" fill="none" stroke="#111" strokeWidth="8" />
    <ellipse cx="100" cy="128" rx="12" ry="17" fill="#111" />
    <ellipse cx="140" cy="128" rx="12" ry="17" fill="#111" />
    <circle cx="100" cy="124" r="5" fill="#ff2340" />
    <circle cx="140" cy="124" r="5" fill="#ff2340" />
    <ellipse cx="120" cy="170" rx="13" ry="16" fill="#111" />
  </svg>
);

// Speech bubble with the letter ع, for "Arabic".
const Arabic = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <path d="M40 40 H200 A24 24 0 0 1 224 64 V156 A24 24 0 0 1 200 180 H112 L64 222 L72 180 H40 A24 24 0 0 1 16 156 V64 A24 24 0 0 1 40 40 Z" fill="#14a44d" stroke="#111" strokeWidth="9" strokeLinejoin="round" />
    <text x="120" y="150" textAnchor="middle" fontFamily={FONT} fontSize="128" fill="#fff" stroke="#111" strokeWidth="8" paintOrder="stroke">ع</text>
  </svg>
);

// Clapperboard with a star, for a studio.
const Studio = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <g transform="rotate(-14 120 80)">
      <rect x="28" y="52" width="184" height="40" rx="6" fill="#fff" stroke="#111" strokeWidth="9" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${44 + i * 44} 56 L${70 + i * 44} 56 L${52 + i * 44} 88 L${26 + i * 44} 88 Z`} fill="#111" />
      ))}
    </g>
    <rect x="28" y="96" width="184" height="118" rx="10" fill="#1d1d24" stroke="#111" strokeWidth="9" />
    <rect x="28" y="96" width="184" height="26" fill="#fff" stroke="#111" strokeWidth="9" />
    <path d="M120 132 L131 156 L157 158 L137 174 L144 200 L120 186 L96 200 L103 174 L83 158 L109 156 Z" fill="#ffc531" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
  </svg>
);

// Starburst badge reading "جديد", for "new game".
const New = () => {
  const pts = Array.from({length: 28}, (_, i) => {
    const r = i % 2 ? 84 : 112;
    const a = (i / 28) * Math.PI * 2;
    return `${120 + Math.cos(a) * r},${120 + Math.sin(a) * r}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 240 240" width="100%" height="100%">
      <polygon points={pts} fill="#ffd21f" stroke="#111" strokeWidth="9" strokeLinejoin="round" />
      <text x="120" y="146" textAnchor="middle" fontFamily={FONT} fontSize="78" fill="#ff2340" stroke="#111" strokeWidth="7" paintOrder="stroke">جديد</text>
    </svg>
  );
};

// Calendar page for the Thursday release.
const Calendar = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <rect x="30" y="40" width="180" height="176" rx="18" fill="#fff" stroke="#111" strokeWidth="9" />
    <path d="M30 58 A18 18 0 0 1 48 40 H192 A18 18 0 0 1 210 58 V100 H30 Z" fill="#ff2340" stroke="#111" strokeWidth="9" strokeLinejoin="round" />
    <rect x="66" y="22" width="16" height="40" rx="8" fill="#111" />
    <rect x="158" y="22" width="16" height="40" rx="8" fill="#111" />
    <text x="120" y="92" textAnchor="middle" fontFamily={FONT} fontSize="40" fill="#fff">يوم</text>
    <text x="120" y="176" textAnchor="middle" fontFamily={FONT} fontSize="50" fill="#111">الخميس</text>
  </svg>
);

export const CUSTOM_ICONS = {
  'ghost-shmagh': GhostShmagh,
  arabic: Arabic,
  studio: Studio,
  new: New,
  calendar: Calendar,
};
