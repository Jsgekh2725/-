import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Explainer} from './Explainer';
import demo from './demo.json';
import edit from './edit.json';

const FPS = 30;

const Root = () => (
  <>
  <Composition
    id="Explainer"
    component={Explainer}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={demo}
    calculateMetadata={({props}) => {
      const last = props.words[props.words.length - 1];
      return {durationInFrames: Math.ceil((last.t + last.d + 0.4) * FPS)};
    }}
  />
  <Composition
    id="Scorb"
    component={Explainer}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={edit}
    durationInFrames={Math.round(edit.duration * FPS)}
  />
  </>
);

registerRoot(Root);
