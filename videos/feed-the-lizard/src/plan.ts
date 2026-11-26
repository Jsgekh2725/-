// Edit plan (seconds on the output timeline). Speech is pre-cut; see data/timeline.json.
export const FPS = 30;
export const DURATION_S = 24.3;

// map card image (map_card.jpg, 1080x695): where to circle for the hook and for the name callback (source px)
export const MAP = {
  src: 'map_card.jpg', w: 1080, h: 695, bgX: 50,
  hook: { x: 330, y: 470, rx: 300, ry: 135 }, // big title on the banner
  name: { x: 425, y: 95, rx: 170, ry: 50 }, // map name next to the thumbnail
};

export type Shot = { from: number; to: number; src: number; z0: number; z1: number; dark?: boolean; video: string };
// g2 = main gameplay (throw run, legendary, lizard pens, desert market), g3 = throw meter, g4 = food shop, g5/g6 = lobby
export const SHOTS: Shot[] = [
  // 0–4.2 s: map-card opening (Opening in Main.tsx)
  { from: 4.2, to: 6.8, src: 1.2, z0: 1.08, z1: 1.14, video: 'g5.mp4' }, // lobby, followers card on top
  { from: 6.8, to: 8.8, src: 3.0, z0: 1.2, z1: 1.26, video: 'g6.mp4' }, // punch-in
  { from: 8.8, to: 10.25, src: 6.0, z0: 1.12, z1: 1.2, video: 'g6.mp4' }, // like & follow
  { from: 10.25, to: 11.9, src: 0.7, z0: 1.1, z1: 1.18, video: 'g3.mp4' }, // "فكرة الماب" — throw power meter
  { from: 11.9, to: 13.25, src: 2.62, z0: 1.12, z1: 1.2, video: 'g3.mp4' }, // food flying down the track
  { from: 13.25, to: 14.7, src: 33.0, z0: 1.1, z1: 1.16, video: 'g2.mp4' }, // "بنسخة عربية" — desert market
  { from: 14.7, to: 15.55, src: 3.0, z0: 1.15, z1: 1.25, video: 'g2.mp4' }, // "ترمي" — throw
  { from: 15.55, to: 16.55, src: 35.5, z0: 1.12, z1: 1.16, video: 'g2.mp4' }, // "الأكل" — shop card on top
  { from: 16.55, to: 17.65, src: 7.05, z0: 1.12, z1: 1.2, video: 'g2.mp4' }, // "أقوى الضبان" — legendary reveal
  { from: 17.65, to: 19.1, src: 17.15, z0: 1.12, z1: 1.18, video: 'g2.mp4' }, // lizard pens, "فوق الـ16"
  { from: 19.1, to: 24.3, src: 40.5, z0: 1.15, z1: 1.2, dark: true, video: 'g2.mp4' }, // outro: map card
];

export type Icon = { at: number; until: number; name: string; x?: number; y?: number; size?: number };
// y = centre as fraction of height; x = offset from centre in px
export const ICONS: Icon[] = [
  { at: 1.9, until: 3.0, name: 'crossed-swords.svg', y: 0.2 },
  { at: 3.36, until: 4.2, name: 'paw-prints.svg', y: 0.2 },
  { at: 8.32, until: 8.8, name: 'clapper-board.svg', y: 0.3 },
  { at: 9.1, until: 10.0, name: 'red-heart.svg', x: -150 },
  { at: 9.32, until: 10.0, name: 'custom-follow.svg', x: 150 },
  { at: 10.98, until: 11.9, name: 'light-bulb.svg' },
  { at: 12.83, until: 13.25, name: 'custom-dates.svg' },
  { at: 13.59, until: 14.7, name: 'custom-arabic.svg', size: 240 },
  { at: 15.27, until: 15.55, name: 'custom-dates.svg', size: 200 },
  { at: 16.69, until: 17.65, name: 'flexed-biceps.svg', x: -250, y: 0.36, size: 190 },
  { at: 16.93, until: 17.65, name: 'lizard.svg', x: 250, y: 0.36, size: 200 },
  { at: 18.5, until: 19.1, name: 'custom-age16.svg', size: 240 },
  { at: 21.13, until: 21.9, name: 'red-heart.svg', x: -150, y: 0.2 },
  { at: 21.43, until: 21.9, name: 'custom-follow.svg', x: 150, y: 0.2 },
  { at: 21.91, until: 23.6, name: 'waving-hand.svg', y: 0.2 },
];

export type Card = { at: number; until: number; src: string; w: number; h: number; cy: number; scroll?: number; aspect?: number };
export const CARDS: Card[] = [
  { at: 5.1, until: 8.8, src: 'followers.jpg', w: 780, h: 866, cy: 0.57 },
  { at: 15.61, until: 16.55, src: 'card_shop.png', w: 860, h: 563, cy: 0.62 },
  { at: 17.7, until: 18.48, src: 'card_collection.png', w: 560, h: 710, cy: 0.6 },
  { at: 19.1, until: 99, src: 'map_card.jpg', w: 900, h: 579, cy: 0.69 },
];

export const HOOK = { until: 1.0, text: 'منافس ألقِ الطعام!!' };
export const OPENING_END = 4.2; // map card + hook, then cut to gameplay
export const CALLBACK = { at: 19.45, text: 'اسم الماب!!' };
export const SWIPE = { at: 10.0, dur: 0.5 }; // "ويلا نبدأ" — cut at SWIPE.at + dur/2

// Visual hits synced with the big sound effects: shake (px), punch (zoom), flash colour.
export type Impact = { at: number; shake?: number; punch?: number; flash?: string };
export const IMPACTS: Impact[] = [
  { at: 0.0, shake: 18, punch: 1.08, flash: '#ffffff' }, // vine boom on the hook
  { at: 1.9, shake: 10 }, // "ينافس"
  { at: 5.1, punch: 1.04 }, // followers card
  { at: 9.32, punch: 1.04 }, // follow
  { at: 10.98, punch: 1.05, flash: '#FFF3A0' }, // "فكرة" 💡
  { at: 13.59, punch: 1.05 }, // "عربية"
  { at: 15.27, shake: 10 }, // "ترمي"
  { at: 16.8, shake: 18, punch: 1.07, flash: '#ffffff' }, // legendary reveal
  { at: 18.5, shake: 10 }, // 16+
  { at: 19.1, punch: 1.06, flash: '#ffffff' }, // map reveal
  { at: 19.45, shake: 8 }, // callback circle
];

// caption words drawn in yellow
export const HIGHLIGHT = ['ينافس', 'ألقِ', 'لايك', 'وفولو', 'فكرة', 'عربية', 'ترمي', 'أقوى', 'الضبان', 'الـ16'];
