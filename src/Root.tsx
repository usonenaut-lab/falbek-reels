import React from 'react';
import {Composition} from 'remotion';
import {Dynamic} from './pro/Dynamic';
import {PostView, StoryView} from './pro/Social';
import {FPS, H, W} from './pro/tokens';
import sample from './sample.json';

const storyDemo = {spec: {type: 'story-tip', h: 'Tu web,|*tus reglas.*', label: 'CONSEJO', items: [{icon: 'users', title: 'Tus clientes', sub: 'Con sus datos'}, {icon: 'card', title: 'Sin comisión', sub: 'Por cada reserva'}, {icon: 'bell', title: 'Recordatorio', sub: 'Menos plantones'}]}};
const postDemo = {index: 0, total: 6, slide: {type: 'post-cover', h: '3 errores al|*reservar online*', sub: 'Y cómo evitarlos', label: 'GUÍA RÁPIDA'}};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Dynamic" component={Dynamic as any} width={W} height={H} fps={FPS} durationInFrames={(sample as any).tl.total} defaultProps={sample as any} calculateMetadata={({props}: any) => ({durationInFrames: props.tl.total})} />
    <Composition id="Story" component={StoryView as any} width={1080} height={1920} fps={FPS} durationInFrames={150} defaultProps={storyDemo as any} />
    <Composition id="Post" component={PostView as any} width={1080} height={1350} fps={FPS} durationInFrames={150} defaultProps={postDemo as any} />
  </>
);
