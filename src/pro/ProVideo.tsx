import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Sequence, continueRender, delayRender, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Backdrop, Scene, Stepper} from './ui';
import {Timeline} from './tokens';

const fonts: [string, string][] = [
  ['500', 'fonts/inter-latin-500-normal.woff2'], ['600', 'fonts/inter-latin-600-normal.woff2'],
  ['700', 'fonts/inter-latin-700-normal.woff2'], ['800', 'fonts/inter-latin-800-normal.woff2'],
];
// Montaje: fondo continuo + escenas solapadas 12 fotogramas + barra de capítulos fija
export const ProVideo: React.FC<{tl: Timeline; render: (i: number, dur: number) => React.ReactNode}> = ({tl, render}) => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(fonts.map(([weight, url]) => loadFont({family: 'Inter', url: staticFile(url), weight}))).then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill>
      <Backdrop scenes={tl.scenes} total={tl.total} />
      {tl.scenes.map((s, i) => {
        const from = Math.max(0, s.from - 6), end = Math.min(tl.total, s.to + 6);
        return <Sequence key={s.key} from={from} durationInFrames={end - from}><Scene bg={s.bg} dur={end - from}>{render(i, end - from)}</Scene></Sequence>;
      })}
      <Stepper steps={tl.steps} scenes={tl.scenes} total={tl.total} />
    </AbsoluteFill>
  );
};
