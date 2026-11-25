// Edit plan (seconds on the output timeline). Speech is pre-cut; see data/timeline.json.
export const FPS = 30;
export const DURATION_S = 24.0;

export type Shot = { from: number; to: number; src: number; z0: number; z1: number; dark?: boolean; video?: string };
// gameplay.mp4 = lobby / event recording, gameplay2.mp4 = in-hotel gameplay (knocking, hiding, earnings)
export const SHOTS: Shot[] = [
  // 0–3.25 s is the map-image opening (see Opening in Main.tsx)
  { from: 3.25, to: 5.8, src: 18.0, z0: 1.1, z1: 1.14 }, // followers card
  { from: 5.8, to: 7.8, src: 21.5, z0: 1.2, z1: 1.24 }, // punch-in
  { from: 7.8, to: 9.05, src: 6.6, z0: 1.18, z1: 1.26 }, // like & follow (jump)
  { from: 9.05, to: 10.9, src: 21.4, z0: 1.08, z1: 1.15, video: 'gameplay2.mp4' }, // hotel hallway with turkeys
  { from: 10.9, to: 13.5, src: 0.9, z0: 1.1, z1: 1.15, video: 'gameplay2.mp4' }, // knocking on a door
  { from: 13.5, to: 15.75, src: 12.8, z0: 1.15, z1: 1.2, video: 'gameplay2.mp4' }, // more doors → rating down
  { from: 15.75, to: 17.0, src: 17.3, z0: 1.22, z1: 1.28, video: 'gameplay2.mp4' }, // red door tag, earnings up (punch)
  { from: 17.0, to: 18.62, src: 6.3, z0: 1.1, z1: 1.16, video: 'gameplay2.mp4' }, // run to the wardrobe
  { from: 18.62, to: 19.8, src: 8.2, z0: 1.12, z1: 1.18, video: 'gameplay2.mp4' }, // inside the wardrobe
  { from: 19.8, to: 24.0, src: 24.0, z0: 1.15, z1: 1.2, dark: true, video: 'gameplay2.mp4' }, // outro: map card
];

export type Icon = { at: number; until: number; name: string; x?: number; y?: number; size?: number };
// y = centre as fraction of height; x = offset from centre in px
export const ICONS: Icon[] = [
  { at: 1.35, until: 2.7, name: 'trophy.svg', y: 0.2 },
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
  { at: 11.85, until: 13.45, src: 'card_quest.png', w: 760, h: 216, cy: 0.62 },
  { at: 16.12, until: 17.45, src: 'card_money.mp4', w: 742, h: 420, cy: 0.62 },
  { at: 19.85, until: 99, src: 'map_card.png', w: 900, h: 677, cy: 0.57 },
];

export const HOOK = { until: 1.0, text: 'أفضل ماب بروبلوكس!!' };
export const OPENING_END = 3.25; // map image + hook, then cut to gameplay
export const CALLBACK = { at: 20.2, text: 'اسم الماب!!' };
export const SWIPE = { at: 8.8, dur: 0.5 }; // cut at SWIPE.at + dur/2
