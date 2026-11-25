// Edit plan (seconds on the output timeline). Speech is pre-cut; see data/timeline.json.
export const FPS = 30;
export const DURATION_S = 22.9;

export type Shot = { from: number; to: number; src: number; z0: number; z1: number; dark?: boolean };
export const SHOTS: Shot[] = [
  { from: 0.0, to: 1.0, src: 45.55, z0: 1.22, z1: 1.3 }, // hook: jump in front of the Thanksgiving booth
  { from: 1.0, to: 3.25, src: 0.5, z0: 1.08, z1: 1.16 }, // "أفضل ماب" lobby
  { from: 3.25, to: 5.8, src: 18.0, z0: 1.1, z1: 1.14 }, // followers card
  { from: 5.8, to: 7.8, src: 21.5, z0: 1.2, z1: 1.24 }, // punch-in
  { from: 7.8, to: 9.05, src: 6.6, z0: 1.18, z1: 1.26 }, // like & follow (jump)
  { from: 9.05, to: 10.9, src: 33.3, z0: 1.1, z1: 1.18 }, // walk to the event
  { from: 10.9, to: 13.5, src: 37.5, z0: 1.12, z1: 1.16 }, // hotel / annoying people
  { from: 13.5, to: 15.75, src: 40.0, z0: 1.15, z1: 1.22 }, // rating down
  { from: 15.75, to: 17.0, src: 42.5, z0: 1.3, z1: 1.34 }, // balance up (punch)
  { from: 17.0, to: 18.62, src: 44.8, z0: 1.1, z1: 1.16 }, // hiding places
  { from: 18.62, to: 19.8, src: 48.5, z0: 1.22, z1: 1.28 }, // wardrobe (punch)
  { from: 19.8, to: 22.9, src: 51.0, z0: 1.15, z1: 1.2, dark: true }, // outro: map card
];

export type Icon = { at: number; until: number; name: string; x?: number; y?: number; size?: number };
// y = centre as fraction of height; x = offset from centre in px
export const ICONS: Icon[] = [
  { at: 1.35, until: 2.55, name: 'trophy.svg' },
  { at: 6.8, until: 7.8, name: 'clapper-board.svg', y: 0.24 },
  { at: 8.08, until: 9.0, name: 'red-heart.svg', x: -150 },
  { at: 8.32, until: 9.0, name: 'custom-follow.svg', x: 150 },
  { at: 10.94, until: 11.85, name: 'hotel.svg' },
  { at: 11.9, until: 13.45, name: 'smiling-face-with-horns.svg', x: -260, y: 0.4, size: 200 },
  { at: 12.14, until: 13.45, name: 'busts-in-silhouette.svg', x: 260, y: 0.4, size: 200 },
  { at: 14.5, until: 15.75, name: 'custom-rating-down.svg', size: 260 },
  { at: 15.78, until: 17.0, name: 'custom-money-up.svg', y: 0.3, size: 230 },
  { at: 17.91, until: 19.1, name: 'face-with-peeking-eye.svg' },
  { at: 19.13, until: 19.85, name: 'custom-wardrobe.svg', size: 260 },
];

export type Card = { at: number; until: number; src: string; w: number; h: number; cy: number; scroll?: number };
export const CARDS: Card[] = [
  { at: 4.0, until: 7.8, src: 'followers.png', w: 760, h: 980, cy: 0.57, scroll: 1 },
  { at: 11.85, until: 13.45, src: 'card_knock.png', w: 330, h: 495, cy: 0.6 },
  { at: 16.12, until: 17.45, src: 'card_balance.png', w: 760, h: 462, cy: 0.62 },
  { at: 19.85, until: 99, src: 'map_card.png', w: 900, h: 677, cy: 0.57 },
];

export const HOOK = { until: 1.0, text: 'أفضل ماب بروبلوكس!!' };
export const CALLBACK = { at: 20.2, text: 'اسم الماب!!' };
export const SWIPE = { at: 8.8, dur: 0.5 }; // cut at SWIPE.at + dur/2
