import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Explainer} from './Explainer';
import {IconSheet} from './IconSheet';
import demo from './demo.json';
import edit from './edit.json';
import mafqood from './edit-mafqood.json';
import teatrader from './edit-teatrader.json';
import akharharf from './edit-akharharf.json';
import rank3 from './edit-rank3.json';
import dontstop from './edit-dontstop.json';
import coffee from './edit-coffee.json';
import water from './edit-water.json';

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
  <Composition
    id="Rank3"
    component={Explainer}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={rank3}
    durationInFrames={Math.round(rank3.duration * FPS)}
  />
  <Composition
    id="DontStop"
    component={Explainer}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={dontstop}
    durationInFrames={Math.round(dontstop.duration * FPS)}
  />
  <Composition
    id="Coffee"
    component={Explainer}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={coffee}
    durationInFrames={Math.round(coffee.duration * FPS)}
  />
  <Composition
    id="Water"
    component={Explainer}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={water}
    durationInFrames={Math.round(water.duration * FPS)}
  />
  <Composition id="IconSheet" component={IconSheet} fps={30} width={3000} height={1500} durationInFrames={1} />
  </>
);

registerRoot(Root);
