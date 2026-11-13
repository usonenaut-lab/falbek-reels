import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Backdrop, Chip, FullCta, Headline, Icon, Sub} from './ui';
import {CardList, CompareCols} from './mocks';
import {BgCtx, BgKey, FONT, SceneDef, T} from './tokens';
import {parseHeadline} from './Dynamic';

export type StorySpec = {
  type: 'story-hook' | 'story-tip' | 'story-myth' | 'story-question' | 'story-cta';
  h: string; sub?: string; label?: string;
  items?: {icon?: string; title: string; sub?: string}[];
  chips?: {text: string; icon?: string; tone?: 'neutral' | 'good' | 'bad'}[];
  options?: string[]; url?: string;
};
export type PostSlide = {
  type: 'post-cover' | 'post-point' | 'post-compare' | 'post-cta';
  h: string; sub?: string; label?: string;
  items?: {icon?: string; title: string; sub?: string}[];
  left?: {title: string; items: string[]}; right?: {title: string; items: string[]};
  chips?: {text: string; icon?: string; tone?: 'neutral' | 'good' | 'bad'}[];
  url?: string;
};
export type StoryProps = {spec: StorySpec};
export type PostProps = {slide: PostSlide; index: number; total: number};

const STILL = 130; // fotograma en el que todas las animaciones ya han terminado
const sizeFor = (lines: any[][], max: number, width = 950) => Math.max(52, Math.min(max, Math.floor(width / (0.56 * Math.max(...lines.map((l) => l.map((w: any) => w.t).join(' ').length), 1)))));
const Pill: React.FC<{text: string; top: number; tone?: 'blue' | 'red' | 'green' | 'white'}> = ({text, top, tone = 'blue'}) => {
  const bg = tone === 'red' ? T.warm : tone === 'green' ? T.green : tone === 'white' ? 'rgba(255,255,255,0.16)' : T.blue;
  return <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', fontFamily: FONT}}><div style={{padding: '14px 34px', borderRadius: 999, background: bg, color: '#fff', fontWeight: 800, fontSize: 30, letterSpacing: '0.12em', border: tone === 'white' ? '1px solid rgba(255,255,255,0.3)' : 'none'}}>{text}</div></div>;
};
const Brand: React.FC<{top: number; size?: number; dark?: boolean}> = ({top, size = 44, dark = false}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: '-0.03em', color: dark ? T.ink : 'rgba(255,255,255,0.9)'}}>Falbek<span style={{color: dark ? T.blue : T.blue3}}>.</span></div>
);
const Chips = ({chips, spots}: {chips?: any[]; spots: any[]}) => <>{(chips || []).slice(0, spots.length).map((c, i) => <Chip key={i} text={c.text} icon={c.icon} tone={c.tone} {...spots[i]} delay={20 + i * 8} seed={i * 2 + 1} />)}</>;

const bgOf = (t: string): BgKey => (t === 'story-hook' || t === 'story-question' || t === 'post-cover' ? 'dark' : t === 'story-myth' ? 'dark-problem' : t === 'story-cta' || t === 'post-cta' ? 'accent' : 'light');
const FONT_FILES: [string, string][] = [['500', 'fonts/inter-latin-500-normal.woff2'], ['600', 'fonts/inter-latin-600-normal.woff2'], ['700', 'fonts/inter-latin-700-normal.woff2'], ['800', 'fonts/inter-latin-800-normal.woff2']];
const Frame: React.FC<{bg: BgKey; children: React.ReactNode}> = ({bg, children}) => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FONT_FILES.map(([weight, url]) => loadFont({family: 'Inter', url: staticFile(url), weight}))).then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
  const scenes: SceneDef[] = [{key: 's', from: 0, to: 150, bg, step: null}];
  return <AbsoluteFill style={{fontFamily: FONT}}><Backdrop scenes={scenes} total={150} /><BgCtx.Provider value={bg}>{children}</BgCtx.Provider></AbsoluteFill>;
};

export const StoryView: React.FC<StoryProps> = ({spec}) => {
  const lines = parseHeadline(spec.h);
  const bg = bgOf(spec.type);
  const light = bg === 'light';
  let body: React.ReactNode = null;
  if (spec.type === 'story-hook') {
    const size = sizeFor(lines, 120);
    body = <><Brand top={300} /><Headline lines={lines} delay={0} size={size} top={640} />{spec.sub && <Sub text={spec.sub} delay={0} top={640 + Math.round(lines.length * size * 1.1) + 50} size={42} />}<Chips chips={spec.chips} spots={[{x: 90, y: 1180}, {right: 90, y: 1290}]} /></>;
  } else if (spec.type === 'story-tip') {
    const size = sizeFor(lines, 100);
    body = <><Pill text={spec.label || 'CONSEJO'} top={330} /><Headline lines={lines} delay={0} size={size} top={450} /><CardList items={spec.items || []} top={820} /></>;
  } else if (spec.type === 'story-myth') {
    const size = sizeFor(lines, 92);
    body = <><Pill text="MITO" top={330} tone="red" /><Headline lines={lines} delay={0} size={size} top={450} />
      <div style={{position: 'absolute', left: 140, right: 140, top: 930, height: 3, background: 'rgba(255,255,255,0.18)'}} />
      <Pill text="REALIDAD" top={1000} tone="green" />
      <div style={{position: 'absolute', left: 90, right: 90, top: 1120, textAlign: 'center', fontWeight: 700, fontSize: 56, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#fff'}}>{spec.sub}</div></>;
  } else if (spec.type === 'story-question') {
    const size = sizeFor(lines, 104);
    body = <><Pill text={spec.label || 'PREGUNTA'} top={330} tone="white" /><Headline lines={lines} delay={0} size={size} top={470} />
      {(spec.options || []).slice(0, 2).map((o, i) => <div key={i} style={{position: 'absolute', left: 100, right: 100, top: 1010 + i * 150, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.35)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 44}}>{o}</div>)}
      <Chip text="Respóndeme por DM" icon="chat" x={290} y={1400} delay={0} seed={1} /></>;
  } else {
    body = <FullCta lines={lines} sub={spec.sub || ''} url={spec.url || 'falbek.com'} steps={[]} />;
  }
  return <StillClock><Frame bg={bg}>{body}</Frame></StillClock>;
};

const Dots: React.FC<{index: number; total: number; dark: boolean}> = ({index, total, dark}) => total > 1 ? (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', justifyContent: 'center', gap: 14}}>
    {Array.from({length: total}).map((_, i) => <div key={i} style={{width: i === index ? 40 : 14, height: 14, borderRadius: 7, background: i === index ? (dark ? '#fff' : T.blue) : (dark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.18)')}} />)}
  </div>) : null;

export const PostView: React.FC<PostProps> = ({slide, index, total}) => {
  const lines = parseHeadline(slide.h);
  const bg = bgOf(slide.type);
  const dark = bg !== 'light';
  let body: React.ReactNode = null;
  if (slide.type === 'post-cover') {
    const size = sizeFor(lines, 118);
    const top = 360;
    body = <><Brand top={110} size={48} />{slide.label && <Pill text={slide.label} top={210} tone="white" />}<Headline lines={lines} delay={0} size={size} top={top} />{slide.sub && <Sub text={slide.sub} delay={0} top={top + Math.round(lines.length * size * 1.1) + 40} size={40} />}
      <Chips chips={slide.chips} spots={[{x: 80, y: 1010}, {right: 80, y: 1100}]} />
      {total > 1 && <Chip text="Desliza" icon="arrow" x={410} y={1170} delay={0} seed={3} />}</>;
  } else if (slide.type === 'post-point') {
    const size = sizeFor(lines, 88);
    body = <><div style={{position: 'absolute', left: 0, right: 0, top: 100, display: 'flex', justifyContent: 'center'}}><div style={{width: 120, height: 120, borderRadius: '50%', background: T.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 60, boxShadow: '0 20px 40px rgba(26,109,245,0.35)'}}>{index}</div></div>
      <Headline lines={lines} delay={0} size={size} top={270} />{slide.sub && <Sub text={slide.sub} delay={0} top={270 + Math.round(lines.length * size * 1.1) + 30} size={38} />}
      <CardList items={slide.items || []} top={730} /></>;
  } else if (slide.type === 'post-compare') {
    const size = sizeFor(lines, 92);
    body = <><Headline lines={lines} delay={0} size={size} top={170} /><CompareCols left={slide.left || {title: '', items: []}} right={slide.right || {title: '', items: []}} top={520} /></>;
  } else {
    const size = sizeFor(lines, 112);
    body = <FullPostCta lines={lines} sub={slide.sub || ''} url={slide.url || 'falbek.com'} size={size} />;
  }
  return <StillClock><Frame bg={bg}>{body}<Dots index={index} total={total} dark={dark} /></Frame></StillClock>;
};

const FullPostCta: React.FC<{lines: any[][]; sub: string; url: string; size: number}> = ({lines, sub, url, size}) => (
  <>
    <Brand top={200} size={60} />
    <Headline lines={lines} delay={0} size={size} top={340} />
    <Sub text={sub} delay={0} top={340 + Math.round(lines.length * size * 1.1) + 40} size={42} />
    <div style={{position: 'absolute', left: 190, top: 880, width: 700, height: 140, borderRadius: 70, background: '#fff', color: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, fontWeight: 800, fontSize: 66, letterSpacing: '-0.02em', boxShadow: '0 30px 60px rgba(7,40,120,0.35)'}}>{url}<Icon name="arrow" size={54} color={T.blue} sw={2.6} /></div>
  </>
);

// Fija el reloj de Remotion en el fotograma final de las animaciones (para que la imagen salga completa)
const StillClock: React.FC<{children: React.ReactNode}> = ({children}) => <>{children}</>;
export const STILL_FRAME = STILL;
