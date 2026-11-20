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

// Gulf istikana tea glass on a saucer, for tea.
const Istikana = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <path d="M96 22 C86 34 106 42 96 56 M122 16 C112 30 132 38 122 54 M148 22 C138 34 158 42 148 56" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
    <ellipse cx="120" cy="208" rx="92" ry="18" fill="#fff" stroke="#111" strokeWidth="9" />
    <ellipse cx="120" cy="204" rx="50" ry="8" fill="#e8e3da" />
    <path d="M70 66 H170 C170 104 140 118 140 136 C140 156 168 168 166 200 H74 C72 168 100 156 100 136 C100 118 70 104 70 66 Z" fill="#ffffffcc" stroke="#111" strokeWidth="9" strokeLinejoin="round" />
    <path d="M80 92 H160 C154 110 134 120 134 136 C134 156 158 166 158 192 H82 C82 166 106 156 106 136 C106 120 86 110 80 92 Z" fill="#c4410f" />
    <path d="M88 100 C92 108 100 114 104 122" stroke="#ffb07a" strokeWidth="7" strokeLinecap="round" fill="none" />
    <rect x="66" y="60" width="108" height="12" rx="6" fill="#f2c230" stroke="#111" strokeWidth="6" />
  </svg>
);

// Orange teapot with a stack of coins, for the tea trader.
const TeaTrader = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <path d="M150 112 C186 96 206 70 214 56 C218 70 206 112 168 144" fill="#ff8a1f" stroke="#111" strokeWidth="9" strokeLinejoin="round" />
    <path d="M58 104 C30 104 26 158 64 160" fill="none" stroke="#111" strokeWidth="22" strokeLinecap="round" />
    <path d="M58 104 C30 104 26 158 64 160" fill="none" stroke="#ff8a1f" strokeWidth="10" strokeLinecap="round" />
    <path d="M56 96 H164 C176 130 172 176 150 196 H70 C48 176 44 130 56 96 Z" fill="#ff8a1f" stroke="#111" strokeWidth="9" strokeLinejoin="round" />
    <path d="M70 96 C74 70 146 70 150 96 Z" fill="#ffa64d" stroke="#111" strokeWidth="9" strokeLinejoin="round" />
    <circle cx="110" cy="66" r="11" fill="#ffa64d" stroke="#111" strokeWidth="8" />
    <path d="M74 118 C72 140 76 160 84 176" stroke="#ffc58f" strokeWidth="8" strokeLinecap="round" fill="none" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <ellipse cx="184" cy={212 - i * 18} rx="40" ry="13" fill="#f6c431" stroke="#111" strokeWidth="7" />
      </g>
    ))}
    <text x="184" y="184" textAnchor="middle" fontFamily={FONT} fontSize="22" fill="#8a5a00">$</text>
  </svg>
);

// Purple badge with a big question mark over hidden digits, for the "unknown number" puzzle.
const Mystery = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <rect x="34" y="20" width="172" height="204" rx="30" fill="#6b2fd6" stroke="#111" strokeWidth="9" />
    <rect x="54" y="168" width="132" height="38" rx="10" fill="#1d1238" stroke="#111" strokeWidth="5" />
    <text x="120" y="197" textAnchor="middle" fontFamily={FONT} fontSize="30" fill="#ffd21f" letterSpacing="6">* * *</text>
    <text x="120" y="150" textAnchor="middle" fontFamily={FONT} fontSize="150" fill="#fff" stroke="#111" strokeWidth="9" paintOrder="stroke">؟</text>
  </svg>
);

// Wooden letter tile, shared by the word-game icons.
const Tile = ({x, y, size = 80, letter, hot = false}) => (
  <g>
    <rect x={x} y={y + 6} width={size} height={size} rx="12" fill="#7a4a17" />
    <rect x={x} y={y} width={size} height={size} rx="12" fill={hot ? '#ffcc00' : '#f3d29a'} stroke="#111" strokeWidth="7" />
    <text x={x + size / 2} y={y + size * 0.74} textAnchor="middle" fontFamily={FONT} fontSize={size * 0.7} fill="#111">{letter}</text>
  </g>
);

// "Last letter" chain: the word's last letter starts the next word.
const LastLetter = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <Tile x={128} y={22} letter="ق" />
    <Tile x={40} y={22} letter="م" hot />
    <path d="M70 116 C60 150 80 172 112 176" fill="none" stroke="#fff" strokeWidth="18" strokeLinecap="round" />
    <path d="M70 116 C60 150 80 172 112 176" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="round" />
    <path d="M100 160 L124 178 L100 196" fill="none" stroke="#111" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    <Tile x={132} y={136} letter="م" hot />
  </svg>
);

// Green refresh badge reading "تحديث".
const Update = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <circle cx="120" cy="120" r="102" fill="#19b35a" stroke="#111" strokeWidth="9" />
    <path d="M58 104 A66 66 0 0 1 176 88" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
    <path d="M182 136 A66 66 0 0 1 64 152" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
    <path d="M160 66 L182 90 L150 98 Z" fill="#fff" />
    <path d="M80 174 L58 150 L90 142 Z" fill="#fff" />
    <text x="120" y="138" textAnchor="middle" fontFamily={FONT} fontSize="52" fill="#fff" stroke="#111" strokeWidth="7" paintOrder="stroke">تحديث</text>
  </svg>
);

// "برا السالفة": two chatting bubbles and one lost "؟" bubble left outside.
const BaraSalfa = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <path d="M24 30 H124 A14 14 0 0 1 138 44 V92 A14 14 0 0 1 124 106 H60 L40 126 L44 106 H24 A14 14 0 0 1 10 92 V44 A14 14 0 0 1 24 30 Z" fill="#fff" stroke="#111" strokeWidth="7" />
    <circle cx="48" cy="68" r="8" fill="#111" /><circle cx="74" cy="68" r="8" fill="#111" /><circle cx="100" cy="68" r="8" fill="#111" />
    <path d="M150 50 H218 A12 12 0 0 1 230 62 V98 A12 12 0 0 1 218 110 H206 L210 126 L190 110 H150 A12 12 0 0 1 138 98 V62 A12 12 0 0 1 150 50 Z" fill="#fff" stroke="#111" strokeWidth="7" />
    <circle cx="164" cy="80" r="7" fill="#111" /><circle cx="184" cy="80" r="7" fill="#111" /><circle cx="204" cy="80" r="7" fill="#111" />
    <path d="M86 140 H190 A16 16 0 0 1 206 156 V206 A16 16 0 0 1 190 222 H86 A16 16 0 0 1 70 206 V156 A16 16 0 0 1 86 140 Z" fill="#ff2340" stroke="#111" strokeWidth="8" />
    <text x="138" y="208" textAnchor="middle" fontFamily={FONT} fontSize="78" fill="#fff" stroke="#111" strokeWidth="6" paintOrder="stroke">؟</text>
  </svg>
);

// A single tile with the letter و.
const WawTile = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <Tile x={40} y={34} size={160} letter="و" hot />
  </svg>
);

// Three-step podium with 1, 2, 3, for ranking.
const PodiumIcon = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <rect x="86" y="70" width="68" height="150" rx="6" fill="#ffc531" stroke="#111" strokeWidth="8" />
    <rect x="18" y="116" width="70" height="104" rx="6" fill="#cfd8e3" stroke="#111" strokeWidth="8" />
    <rect x="152" y="146" width="70" height="74" rx="6" fill="#e0863a" stroke="#111" strokeWidth="8" />
    <text x="120" y="140" textAnchor="middle" fontFamily={FONT} fontSize="66" fill="#111">1</text>
    <text x="53" y="182" textAnchor="middle" fontFamily={FONT} fontSize="56" fill="#111">2</text>
    <text x="187" y="206" textAnchor="middle" fontFamily={FONT} fontSize="50" fill="#111">3</text>
    <path d="M100 52 L108 24 L120 42 L132 24 L140 52 Z" fill="#ffc531" stroke="#111" strokeWidth="6" strokeLinejoin="round" />
  </svg>
);

// Stop sign reading "قف" with a big green X over it: "don't stop".
const DontStop = () => {
  const oct = Array.from({length: 8}, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    return `${120 + Math.cos(a) * 100},${120 + Math.sin(a) * 100}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 240 240" width="100%" height="100%">
      <polygon points={oct} fill="#e3202b" stroke="#111" strokeWidth="9" strokeLinejoin="round" />
      <polygon points={oct} fill="none" stroke="#fff" strokeWidth="6" transform="translate(120 120) scale(0.86) translate(-120 -120)" />
      <text x="120" y="152" textAnchor="middle" fontFamily={FONT} fontSize="96" fill="#fff" stroke="#111" strokeWidth="5" paintOrder="stroke">قف</text>
      <path d="M30 30 L210 210" stroke="#111" strokeWidth="26" strokeLinecap="round" />
      <path d="M30 30 L210 210" stroke="#22d36b" strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
};

// Square maze with a red dot finding its way out.
const Maze = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <rect x="20" y="20" width="200" height="200" rx="22" fill="#2a2440" stroke="#111" strokeWidth="9" />
    <path
      d="M44 44 H196 V120 M44 44 V196 H150 M76 76 H164 V164 H76 V108 M108 108 H132 V132 M196 152 V196 H182 M44 120 H60"
      fill="none"
      stroke="#b9a7ff"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="120" cy="120" r="12" fill="#ff3b30" stroke="#111" strokeWidth="5" />
    <path d="M166 196 L180 180" stroke="#22d36b" strokeWidth="10" strokeLinecap="round" />
  </svg>
);

// Green radar screen with a sweep and a red blip.
const Radar = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <defs>
      <radialGradient id="radarbg">
        <stop offset="0" stopColor="#0f5a2e" />
        <stop offset="1" stopColor="#062312" />
      </radialGradient>
    </defs>
    <circle cx="120" cy="120" r="104" fill="url(#radarbg)" stroke="#111" strokeWidth="9" />
    {[34, 64, 94].map((r) => (
      <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="#2bff88" strokeOpacity="0.45" strokeWidth="4" />
    ))}
    <path d="M120 24 V216 M24 120 H216" stroke="#2bff88" strokeOpacity="0.35" strokeWidth="4" />
    <path d="M120 120 L120 26 A94 94 0 0 1 200 72 Z" fill="#2bff88" fillOpacity="0.45" />
    <path d="M120 120 L200 72" stroke="#b6ffd5" strokeWidth="6" strokeLinecap="round" />
    <circle cx="160" cy="70" r="12" fill="#ff3b30" stroke="#111" strokeWidth="4" />
    <circle cx="86" cy="156" r="8" fill="#2bff88" />
  </svg>
);

// Little café storefront: striped awning and a coffee-cup sign.
const CoffeeShop = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <rect x="34" y="96" width="172" height="120" rx="8" fill="#f3e2c7" stroke="#111" strokeWidth="8" />
    <rect x="58" y="128" width="62" height="56" rx="6" fill="#8fd3ff" stroke="#111" strokeWidth="6" />
    <rect x="136" y="128" width="46" height="88" rx="6" fill="#8a4b22" stroke="#111" strokeWidth="6" />
    <circle cx="172" cy="174" r="5" fill="#ffc531" />
    <path d="M24 64 H216 L206 104 H34 Z" fill="#fff" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M${24 + i * 38.4 + 19} 64 h19 l-3 40 h-18 z`} fill="#d7262f" />
    ))}
    <path d="M24 64 H216 L206 104 H34 Z" fill="none" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
    <rect x="70" y="14" width="100" height="44" rx="12" fill="#5a2e12" stroke="#111" strokeWidth="6" />
    <path d="M100 26 H134 V40 A14 14 0 0 1 120 52 H114 A14 14 0 0 1 100 40 Z" fill="#fff" />
    <path d="M134 30 A7 7 0 0 1 134 44" fill="none" stroke="#fff" strokeWidth="4" />
  </svg>
);

// Small café growing into a big one, for "make it bigger".
const Grow = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <rect x="18" y="160" width="56" height="56" rx="6" fill="#f3e2c7" stroke="#111" strokeWidth="7" />
    <path d="M12 160 H80 L74 142 H18 Z" fill="#d7262f" stroke="#111" strokeWidth="6" strokeLinejoin="round" />
    <rect x="112" y="74" width="112" height="142" rx="8" fill="#f3e2c7" stroke="#111" strokeWidth="8" />
    <path d="M104 74 H232 L222 44 H114 Z" fill="#d7262f" stroke="#111" strokeWidth="7" strokeLinejoin="round" />
    <rect x="128" y="100" width="32" height="30" rx="4" fill="#8fd3ff" stroke="#111" strokeWidth="5" />
    <rect x="176" y="100" width="32" height="30" rx="4" fill="#8fd3ff" stroke="#111" strokeWidth="5" />
    <rect x="150" y="150" width="36" height="66" rx="5" fill="#8a4b22" stroke="#111" strokeWidth="5" />
    <path d="M44 126 C52 84 76 66 100 60" fill="none" stroke="#111" strokeWidth="18" strokeLinecap="round" />
    <path d="M44 126 C52 84 76 66 100 60" fill="none" stroke="#22d36b" strokeWidth="10" strokeLinecap="round" />
    <path d="M86 44 L112 58 L88 78" fill="none" stroke="#111" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Hand reaching for water, crossed out: "don't touch the water".
const NoTouchWater = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <circle cx="120" cy="120" r="104" fill="#e9f8ff" stroke="#111" strokeWidth="9" />
    <path d="M30 150 Q52 134 74 150 T118 150 T162 150 T210 150 V170 Q200 210 120 222 Q40 210 30 170 Z" fill="#2fa8ff" stroke="#111" strokeWidth="6" strokeLinejoin="round" />
    <path d="M40 176 Q60 164 80 176 T120 176 T160 176 T200 176" fill="none" stroke="#bfe9ff" strokeWidth="6" strokeLinecap="round" />
    <path d="M104 132 V64 A9 9 0 0 1 122 64 V104 M122 100 V56 A9 9 0 0 1 140 56 V104 M140 102 V64 A9 9 0 0 1 158 64 V110 M104 112 V88 A9 9 0 0 0 86 88 V126 C86 140 98 148 112 148 H140 C152 148 158 136 158 124 V108"
      fill="#ffd2a6" stroke="#111" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx="120" cy="120" r="96" fill="none" stroke="#e3202b" strokeWidth="18" />
    <path d="M52 52 L188 188" stroke="#e3202b" strokeWidth="18" strokeLinecap="round" />
  </svg>
);

// Pale bald monster head peeking out of the water.
const WaterMonster = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%">
    <path d="M70 160 C60 100 80 40 120 40 C160 40 180 100 170 160 Z" fill="#b9a6c9" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
    <ellipse cx="98" cy="104" rx="20" ry="24" fill="#fff" stroke="#111" strokeWidth="6" />
    <ellipse cx="142" cy="104" rx="20" ry="24" fill="#fff" stroke="#111" strokeWidth="6" />
    <circle cx="101" cy="110" r="8" fill="#111" />
    <circle cx="139" cy="110" r="8" fill="#111" />
    <path d="M96 140 Q120 156 144 140" fill="none" stroke="#111" strokeWidth="7" strokeLinecap="round" />
    <path d="M14 158 Q38 142 62 158 T110 158 T158 158 T206 158 T230 154 V226 H14 Z" fill="#2fa8ff" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
    <path d="M30 186 Q50 174 70 186 T110 186 T150 186 T190 186" fill="none" stroke="#bfe9ff" strokeWidth="6" strokeLinecap="round" />
    <circle cx="60" cy="140" r="7" fill="#bfe9ff" stroke="#111" strokeWidth="3" />
    <circle cx="186" cy="132" r="5" fill="#bfe9ff" stroke="#111" strokeWidth="3" />
  </svg>
);

export const CUSTOM_ICONS = {
  'ghost-shmagh': GhostShmagh,
  arabic: Arabic,
  studio: Studio,
  new: New,
  calendar: Calendar,
  istikana: Istikana,
  'tea-trader': TeaTrader,
  mystery: Mystery,
  'last-letter': LastLetter,
  update: Update,
  'bara-salfa': BaraSalfa,
  'waw-tile': WawTile,
  podium: PodiumIcon,
  'dont-stop': DontStop,
  maze: Maze,
  radar: Radar,
  'coffee-shop': CoffeeShop,
  grow: Grow,
  'no-touch-water': NoTouchWater,
  'water-monster': WaterMonster,
};
