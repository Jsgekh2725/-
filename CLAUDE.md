# Video editing in this repo

- `video-style/` is the Remotion template for the owner's short-form style (word-by-word Arabic captions,
  zoom-in title, emoji stickers, silence-cut footage). `tools/setup-tools.sh --models` reinstalls the toolchain
  in a fresh container.
- **Music:** every edit uses the owner's house track `video-style/public/music/default.m4a` as the music bed
  (it is the template default, looped, low under the voice). Do not synthesize or pick other music unless asked.
  Exception: the Scorm clip (`src/edit.json`) has `music: null` because the owner asked for no music on it.
- Captions: the map/creature name is spelled «سكورم».
