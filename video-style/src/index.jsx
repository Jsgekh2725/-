import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Explainer} from './Explainer';
import {IconSheet} from './IconSheet';
import demo from './demo.json';
import edit from './edit.json';
import mafqood from './edit-mafqood.json';
import teatrader from './edit-teatrader.json';
import akharharf from './edit-akharharf.json';

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
  <Composition
    id="Mafqood"
    component={Explainer}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={mafqood}
    durationInFrames={Math.round(mafqood.duration * FPS)}
  />
  <Composition
    id="TeaTrader"
    component={Explainer}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={teatrader}
    durationInFrames={Math.round(teatrader.duration * FPS)}
  />
  <Composition
    id="AkharHarf"
    component={Explainer}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={akharharf}
    durationInFrames={Math.round(akharharf.duration * FPS)}
  />
  <Composition id="IconSheet" component={IconSheet} fps={30} width={3000} height={1000} durationInFrames={1} />
  </>
);

registerRoot(Root);
