import React from 'react';
import {AbsoluteFill} from 'remotion';
import '@fontsource/lalezar/arabic-400.css';
import {CUSTOM_ICONS} from './icons';

// Preview of every hand-made icon: `npx remotion still src/index.jsx IconSheet out/icons.png`
export const IconSheet = () => (
  <AbsoluteFill style={{background: '#3a3f4a', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 40}}>
    {Object.entries(CUSTOM_ICONS).map(([name, C]) => (
      <div key={name} style={{width: 300, height: 300}}>
        <C />
      </div>
    ))}
  </AbsoluteFill>
);
