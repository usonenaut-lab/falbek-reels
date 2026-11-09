import React from 'react';
import {Composition} from 'remotion';
import {Dynamic, DynProps} from './pro/Dynamic';
import {FPS, H, W} from './pro/tokens';
import sample from './sample.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Dynamic"
    component={Dynamic as any}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={(sample as any).tl.total}
    defaultProps={sample as any}
    calculateMetadata={({props}: any) => ({durationInFrames: props.tl.total})}
  />
);
