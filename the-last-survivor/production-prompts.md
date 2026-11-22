# THE LAST SURVIVOR: shot-by-shot video prompts

**Target model:** Kling 3.0 Omni (multi-shot, up to 15 s per generation, a separate character element for each person, native audio).
**Format:** 16:9 · 1080p or 4K · 10 clips · about 2 min total · `cfg_scale` 0.6
**Order:** generate the clips in the order below. When two clips run straight into each other, use the last frame of one as the start frame of the next.

---

## 0. Setup (do this once)

### Character elements
Create **four separate character elements** in Kling Omni (Elements → Character), each from four stills in `references/`.

| Element | Front | Three-quarter | Side | Back |
|---|---|---|---|---|
| `@Char1` | char1-front.png | char1-three-quarter.png | char1-side-right.png | char1-back.png |
| `@Char2` | char2-front.png | char2-three-quarter.png | char2-side-right.png | char2-back.png |
| `@Char3` | char3-front.png | char3-three-quarter.png | char3-side-right.png | char3-back.png |
| `@Char4` | char4-front.png | char4-three-quarter.png | char4-side-right.png | char4-back.png |

`charN-face.png` is a close-up of each face. Use it where a tool takes a separate face reference.

> ⚠️ **Character 4:** his face is pixelated in the source sheet, so the model will invent one. If you want him to look like himself, swap in an unblurred front photo of his face.

### Story anchors (the five fixed points everything is written around)
- **Emotion:** exhausted victory, then dread, then awe
- **Visual motif:** warm orange sunset dust against cold white supernatural light. The light takes over the frame as the angel rises.
- **Anchor object:** Character 2's sword. It falls beside his hand, trembles, floats, glows, and delivers the final blow.
- **Break:** Character 2's lifeless body lifts off the ground
- **Final image:** the angel is the only bright point in a vast ruined battlefield, fading to black

### Screen geography (keep it fixed in every clip)
- Team 1 (`@Char1`, `@Char2`) is always on **screen-right**. Team 2 (`@Char3`, `@Char4`) is always on **screen-left**.
- The sun sits low on the horizon at **frame-left**, so long shadows stretch to the right.
- Duel A (`@Char1` vs `@Char3`) happens in the foreground. Duel B (`@Char2` vs `@Char4`) happens in the background, by a broken concrete pillar.

### Negative prompt field (paste into every clip)
```
cartoon, anime, illustration, extra people, crowd, duplicate person, twins, face blending, outfit swap, clothing change, blood, gore, wounds, dismemberment, distorted hands, extra fingers, melted face, bent sword, warped blade, subtitles, on-screen text, watermark, jitter
```

---

## SHARED BLOCK: paste at the top of every clip

The model has no memory between clips, so this block goes into every prompt unchanged.

```
[Character 1 = @Char1: teen boy, dark brown skin, short black hair, plain white crew-neck T-shirt with a small navy chest logo, loose dark-blue straight-leg jeans, white socks, no shoes.]
[Character 2 = @Char2: teen boy, light olive skin, messy curly dark-brown hair, clear transparent round glasses, dark-navy over-ear headphones around his neck, oversized black T-shirt, baggy black cargo pants, white sneakers.]
[Character 3 = @Char3: teen boy, fair skin, black baseball cap worn forward with a colorful flower crown of pink, white and yellow daisies on top, dark rectangular sunglasses, gray camouflage T-shirt with a white swoosh, black cargo pants with side pockets, white sneakers.]
[Character 4 = @Char4: slim teen boy, tan skin, short dark-brown hair, dark glasses, shirtless, black knee-length athletic shorts, barefoot.]
Each character element defines only that person's face, body, hair and clothing; ignore the reference backgrounds. Exactly four people exist in this world. Faces and outfits never blend, swap, or duplicate. All swords are plain steel longswords with black grips.
World: an abandoned battlefield at sunset. Cracked concrete slabs, twisted rebar, hollow bombed-out buildings, low ground fog, dust drifting left to right. Sun low on the horizon at frame-left: hard orange key light, long shadows stretching right, teal-gray shadow side. Palette: burnt orange, ash gray, desaturated teal.
Look: live-action feature film, ARRI Alexa, anamorphic 40mm, natural skin texture, realistic weight and inertia on every sword swing, volumetric fog in the sun shafts. 16:9.
```

---

## CLIP 01: Scene 1, the battlefield (12 s)

```
[SHARED BLOCK]

Master intent: an empty battlefield slowly reveals two teams already facing each other. Silent tension before anyone speaks.

Shot 1 (0-4s). Extreme wide, high angle, slow dolly forward through a gap in a collapsed concrete wall. Fog rolls across the empty ground; a loose sheet of corrugated metal rattles in the wind. Four tiny figures stand far away in the haze.
Shot 2 (4-8s). Wide, eye level, 24mm, locked frame. Team 2 (Character 3 and Character 4) stands on screen-left, Team 1 (Character 1 and Character 2) on screen-right, fifteen meters of cracked concrete between them. Each holds a longsword point-down. A sheet of dust blows across the gap between them.
Shot 3 (8-12s). Slow lateral tracking shot at waist height, moving left to right along the gap: Character 3's sword tip scrapes a line in the concrete; Character 4's bare toes curl into the dust; Character 2's knuckles whiten on his grip; ends on a close-up of Character 1, jaw clenched, eyes fixed screen-left.

Audio: wind whistling through rebar, metal sheet creaking, a low sustained cello drone. No dialogue.
```

## CLIP 02: Scene 1, the words before the fight (15 s)

> If Kling's Arabic lip-sync comes out poor, see **Audio plan** at the end.

```
[SHARED BLOCK]

Master intent: four short lines, each colder than the last, then all four raise their swords at once. Shot-reverse-shot across the gap between the teams.

Shot 1 (0-4s). Medium close-up of Character 2 on screen-right, 50mm, sun on his face. He pushes his glasses up with one knuckle, then says:
[Character 2, teen male voice, Saudi Gulf Arabic, dry and tired]: "يعني خلاص؟ ما فيه كلام؟"
Shot 2 (4-7s). Reverse: medium close-up of Character 3 on screen-left, backlit, the sun rimming the flower crown. A small smile drains from his face. Immediately,
[Character 3, calm cold voice, Saudi Gulf Arabic]: "الكلام انتهى من زمان."
Shot 3 (7-10s). Close-up of Character 1, low angle. He rolls his shoulders once and narrows his eyes. Then,
[Character 1, low flat voice, Saudi Gulf Arabic]: "خلّصوها."
Shot 4 (10-12.5s). Close-up of Character 4, the low sun flaring in his dark glasses. He tilts his neck to one side. Immediately,
[Character 4, cocky relaxed voice, Saudi Gulf Arabic]: "على كيفك."
Shot 5 (12.5-15s). Wide, low angle from the ground: all four raise their swords at the same instant; the blades catch the orange sun; dust kicks up around their feet.

Audio: wind under the dialogue; the cello drone climbs, and a single heavy drum hit lands as the swords go up.
```

## CLIP 03: Scene 2, the charge and the first clash (12 s)

```
[SHARED BLOCK]

Master intent: the two teams collide and split into two clear duels: Character 1 vs Character 3 in the foreground, Character 2 vs Character 4 in the background by a broken concrete pillar.

Shot 1 (0-3s). Wide, ground-level 24mm: both teams sprint toward each other across the cracked concrete, dust trailing behind them. Character 3 angles toward Character 1; Character 4 angles toward Character 2.
Shot 2 (3-6s). Medium, slow motion: Character 1's and Character 3's blades meet overhead; sparks spray; both lean their full weight into the bind, teeth gritted.
Shot 3 (6-9s). Medium tracking shot: by the broken pillar, Character 2 and Character 4 trade three fast strikes; Character 4 ducks a horizontal swing; Character 2 steps back over loose rubble.
Shot 4 (9-12s). Wide, high angle: both duels at once, Duel A in the foreground, Duel B behind it by the pillar; fog swirls through the sun shafts.

Audio: steel clanging, grunts, grit scraping underfoot, driving war drums.
```

## CLIP 04: Scene 2, Character 3 defeats Character 1 (10 s)

```
[SHARED BLOCK]

Master intent: Character 3 wins Duel A. Character 1 goes down and stays down.

Shot 1 (0-3s). Close-up on the locked blades: Character 1's fingers whiten on the grip; Character 3 presses forward, flower petals trembling with the strain.
Shot 2 (3-6s). Medium, 50mm: Character 3 twists his wrist and flicks Character 1's blade wide, then pivots and drives his sword's pommel into Character 1's chest.
Shot 3 (6-10s). Ultra slow motion, low angle: Character 1 falls backward into the dust; his sword slides away across the concrete; he lies still on his back, arms open. Character 3 stands over him, chest heaving. Final frame: Character 1 motionless; Character 3's long shadow falls across him.

Audio: a dull impact, the sword scraping across concrete, then only Character 3's ragged breathing and the wind. No blood.
```

## CLIP 05: Scene 2, Character 4 defeats Character 2 (10 s)

```
[SHARED BLOCK]

Master intent: Duel B ends. Character 2 falls with his sword beside him. This is the image the angel rises from later.

Shot 1 (0-3s). Medium handheld: Character 2 attacks in a furious combination; Character 4 blocks each strike while backing toward the broken pillar, his glasses knocked crooked.
Shot 2 (3-6s). Close-up: Character 4 sidesteps; Character 2's blade bites into the concrete pillar, spraying chips; Character 2's eyes widen behind his clear glasses.
Shot 3 (6-10s). Slow motion, medium wide: Character 4 sweeps Character 2's legs with the flat of his sword; Character 2 falls onto his back; his sword clatters down beside his open right hand; his headphones are still around his neck. He lies still. Character 4 stands, breathing hard, sword tip dragging in the dust. Final frame: Character 2's sword lying beside his hand in the orange light.

Audio: metallic ring as the sword lands, then the wind. No blood.
```

## CLIP 06: Scene 3, the last two survivors (15 s)

```
[SHARED BLOCK]

Master intent: the winners exhale. The music dies, total silence falls, then something wrong sounds behind them.

Shot 1 (0-3s). Wide, locked frame: Character 3 and Character 4 stand mid-frame, swords lowered; behind them on screen-right, Character 1 and Character 2 lie motionless on the ground. Dust is settling.
Shot 2 (3-6s). Medium close-up: Character 4 lets his sword tip sink into the dust, shoulders sagging. Character 3 slowly scans the battlefield, then says:
[Character 3, exhausted quiet voice, Saudi Gulf Arabic]: "أخيرًا… خلصنا."
Shot 3 (6-9s). Medium close-up of Character 4 wiping sweat from his forehead with his forearm. Immediately,
[Character 4, breathless half-laugh, Saudi Gulf Arabic]: "كنت أحسب ما راح نطلع منها."
Shot 4 (9-12s). Two-shot, slow push-in on both faces. Then,
[Character 3, soft voice, Saudi Gulf Arabic]: "كل شيء له نهاية."
The wind stops. Total silence.
Shot 5 (12-15s). Close-up of Character 4: a low resonant hum rises from behind him; his eyes flick sideways; he turns his head over his right shoulder toward screen-right. Final frame: his face half-turned, frozen.

Audio: music fades out completely by 9s; one full second of silence; then a deep, unnatural resonant hum.
```

## CLIP 07: Scene 4, the dead begin to rise (15 s)

*Start frame: the last frame of Clip 05 (Character 2 lying beside his sword).*

```
[SHARED BLOCK]

Master intent: Character 2's lifeless body floats up and transforms into an angel. Slow, heavy, inevitable.

Shot 1 (0-4s). Low wide shot from ground level: Character 2 lies on his back; grains of dust around him begin lifting upward; a faint white glow seeps from beneath his body; the sword beside his hand trembles against the concrete.
Shot 2 (4-8s). Medium, slow push-in: his body rises horizontally, limbs hanging, until it floats one meter above the ground; small pebbles and dust float up around him; cold white light overpowers the orange sun on his skin.
Shot 3 (8-11s). Close-up of his face: his eyes snap open, glowing pure white behind his clear glasses; the navy headphones around his neck disintegrate into drifting motes of light.
Shot 4 (11-15s). Medium-wide, slow orbit: his body swings upright; his black T-shirt and cargo pants ripple and turn into flowing white robes over white armor, from the collar downward; two large white feathered wings unfold from his back; his sword rises off the ground and floats beside his right hand.

Audio: the hum swells into a wordless choir over low strings; a heavy whoosh of air as the wings open.
```

## CLIP 08: Scene 5, the angel reveal (12 s)

*Start frame: the last frame of Clip 07.*

```
[SHARED BLOCK]
[Character 2 is now transformed: same face, same messy curly dark-brown hair, same clear glasses, no headphones, eyes glowing pure white, white flowing robes over polished white armor, huge white feathered wings, sword glowing white.]

Master intent: the survivors look up at something that should not exist. Character 4 breaks.

Shot 1 (0-4s). Low angle, slow crane up: the angel floats four meters above the battlefield, wings spread wide, sword glowing; white light floods the ground and flips the shadows away from him.
Shot 2 (4-7s). Medium two-shot of Character 3 and Character 4 looking up, faces lit cold white; Character 4 stumbles one step backward, his sword wobbling. Immediately,
[Character 4, panicked voice cracking, Saudi Gulf Arabic]: "وش ذا؟!"
Shot 3 (7-10s). Close-up of Character 4, lips trembling, glasses reflecting the glow. Then,
[Character 4, high shaky voice, Saudi Gulf Arabic]: "أنت… المفروض إنك مت!"
Shot 4 (10-12s). Close-up of the angel, high angle looking down as if from Character 4's view: silent, he slowly tilts his head down toward camera. Final frame: glowing white eyes, still.

Audio: the choir holds one long note; Character 4's fast breathing; the angel makes no sound.
```

## CLIP 09: Scene 6, the final blow (10 s)

```
[SHARED BLOCK]
[Character 2 is now transformed: same face, same messy curly dark-brown hair, same clear glasses, eyes glowing pure white, white flowing robes over polished white armor, huge white feathered wings, sword glowing white.]

Master intent: one strike and one flash of light. Character 4 is defeated. Non-graphic.

Shot 1 (0-2.5s). Wide: the angel dives toward Character 4 on a steep diagonal, wings tucked, leaving a streak of light.
Shot 2 (2.5-5s). Medium: Character 4 raises his sword horizontally above his head to block, arms shaking.
Shot 3 (5-7.5s). Ultra slow motion close-up: the glowing blade meets the steel; sparks and a ring-shaped shockwave of dust burst outward.
Shot 4 (7.5-8.5s). A blinding white flash fills the entire frame.
Shot 5 (8.5-10s). Wide, as the light fades: Character 4 lies still on his back in the dust, his sword beside him; the angel stands on the ground alone, wings half-open. No blood.

Audio: rising whoosh, a deep impact boom, then dead silence after the flash with a faint high ringing tone.
```

## CLIP 10: Scene 7, the ending (12 s)

```
[SHARED BLOCK]
[Character 2 is now transformed: same face, same messy curly dark-brown hair, same clear glasses, eyes glowing pure white, white flowing robes over polished white armor, huge white feathered wings.]

Master intent: the angel stands alone; the world pulls away from him into darkness.

Shot 1 (0-4s). Medium shot from behind: the angel turns his face up toward the sky; his wings slowly lift and settle; feathers stir in the returning wind.
Shot 2 (4-12s). One continuous crane shot, pulling back and rising: the three defeated characters lie far apart on the ground; the angel is the only bright point in a vast ruined battlefield; fog drifts between the broken buildings; the sun slips below the horizon; the whole image slowly dims to black.

Audio: the wind returns; a sparse, melancholic piano-and-strings theme; fades to silence on the black.
```

### Title cards (add in editing, not in the generator)
Generators garble on-screen text, so add these over black in the edit:
1. **THE LAST SURVIVOR** (about 3 s, white serif, slow fade in and out)
2. **TO BE CONTINUED…** (about 2 s)

---

## Audio plan

Kling 3.0's native lip-sync is strongest in English and Chinese. **Test Clip 02 first.** If the Arabic is weak, pick one of these:
- **Best:** the four boys record their own lines on a phone, and you lip-sync those recordings onto the clips. Their real voices also make their identities stronger.
- **Generated voices:** ElevenLabs text-to-speech in Arabic, with a different voice for each character, then lip-sync. The installed `text-to-speech` skill can do this once you've added an ElevenLabs API key.
- **Score:** the installed `music` skill (ElevenLabs Music) can write a dark orchestral cue with a choir swell for Clip 07.

## Assembly order
01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → fade to black → title cards. About 2:05.
