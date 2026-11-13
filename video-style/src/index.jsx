import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Explainer} from './Explainer';
import demo from './demo.json';

const FPS = 30;

const Root = () => (
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
);

registerRoot(Root);
