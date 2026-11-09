import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ProVideo} from './ProVideo';
import {Chip, FullCta, Headline, Orbit, Phone, Shell, Sub, Tablet, Word} from './ui';
import {AdminUI, BookingUI, BrowserUI, ChatBubble, CardList, CompareCols, ReminderUI} from './mocks';
import {ACCENT, BgKey, StepDef, Timeline, ease} from './tokens';

export type SceneType = 'hook' | 'problem' | 'phone-booking' | 'phone-reminder' | 'tablet-admin' | 'browser-site' | 'chat' | 'checklist' | 'compare' | 'bignumber' | 'cta';
export type SceneSpec = {
  type: SceneType;
  h: string;               // titular: líneas separadas por | y palabra de acento entre *asteriscos*
  sub?: string;
  chips?: {text: string; icon?: string; tone?: 'neutral' | 'good' | 'bad'}[];
  name?: string;           // nombre ficticio del negocio en las pantallas
  chat?: string; reply?: string;
  big?: string;            // cifra grande (bignumber)
  url?: string;
  site_title?: string; site_cta?: string;
  items?: {icon?: string; title: string; sub?: string}[];
  left?: {title: string; items: string[]}; right?: {title: string; items: string[]};
};
export type DynProps = {tl: Timeline; scenes: SceneSpec[]};

export const parseHeadline = (h: string): Word[][] =>
  h.split('|').map((ln) => {
    const out: Word[] = [];
    const re = /\*([^*]+)\*|([^*]+)/g; let m: RegExpExecArray | null;
    while ((m = re.exec(ln))) { const t = (m[1] ?? m[2]).trim(); if (t) out.push({t, a: m[1] !== undefined}); }
    return out;
  }).filter((l) => l.length);
const maxChars = (lines: Word[][]) => Math.max(...lines.map((l) => l.map((w) => w.t).join(' ').length), 1);
const autoSize = (lines: Word[][], max: number) => Math.max(56, Math.min(max, Math.floor(950 / (0.56 * maxChars(lines)))));

const chipsFor = (s: SceneSpec, spots: {x?: number; right?: number; y: number; rot?: number}[], delay0 = 40) =>
  (s.chips || []).slice(0, spots.length).map((c, i) => <Chip key={i} text={c.text} icon={c.icon} tone={c.tone} {...spots[i]} delay={delay0 + i * 12} seed={i * 2 + 1} />);

export const SceneView: React.FC<{s: SceneSpec; dur: number; steps: StepDef[]}> = ({s, dur, steps}) => {
  const f = useCurrentFrame();
  const lines = parseHeadline(s.h);
  const sub = s.sub ? (top: number) => <Sub text={s.sub as string} delay={34} top={top} /> : () => null;
  const name = s.name || 'Tu restaurante';
  switch (s.type) {
    case 'hook': {
      const size = autoSize(lines, 116);
      return <>
        <Orbit cy={900} r={400} />
        {chipsFor(s, [{x: 90, y: 400}, {right: 60, y: 1330}, {right: 90, y: 520}], 30)}
        <Headline lines={lines} delay={10} size={size} top={Math.round(900 - lines.length * size * 0.55)} />
      </>;
    }
    case 'problem': {
      const size = autoSize(lines, 112);
      const top = 520;
      return <>
        <Headline lines={lines} delay={10} size={size} top={top} />
        {sub(top + Math.round(lines.length * size * 1.1) + 50)}
        {chipsFor(s, [{x: 80, y: 1230, rot: -2}, {right: 70, y: 1340, rot: 2}], 46)}
      </>;
    }
    case 'phone-booking':
    case 'phone-reminder': {
      const size = autoSize(lines, 100);
      return <>
        <Headline lines={lines} delay={10} size={size} top={320} />
        {sub(560)}
        <Phone y={660}>
          {s.type === 'phone-booking' ? <BookingUI sel={Math.round(dur * 0.3)} press={Math.round(dur * 0.5)} done={Math.round(dur * 0.62)} name={name} /> : <ReminderUI notif={Math.round(dur * 0.22)} tap={Math.round(dur * 0.62)} name={name} />}
        </Phone>
        {chipsFor(s, [{x: 14, y: 800, rot: -3}, {right: 30, y: 1500, rot: 3}], 40)}
      </>;
    }
    case 'tablet-admin': {
      const size = autoSize(lines, 100);
      return <>
        <Headline lines={lines} delay={10} size={size} top={320} />
        {sub(560)}
        <Tablet y={760}><AdminUI newAt={Math.round(dur * 0.35)} /></Tablet>
        {chipsFor(s, [{right: 60, y: 690}, {x: 60, y: 1470}], 60)}
      </>;
    }
    case 'browser-site': {
      const size = autoSize(lines, 100);
      return <>
        <Headline lines={lines} delay={10} size={size} top={320} />
        {sub(560)}
        <Shell x={90} y={690} w={900} h={820} r={34} bezel={10} delay={14} rot={0}><BrowserUI name={name} title={s.site_title} cta={s.site_cta} /></Shell>
        {chipsFor(s, [{right: 40, y: 640}, {x: 40, y: 1480}], 56)}
      </>;
    }
    case 'chat': {
      const size = autoSize(lines, 100);
      return <>
        <Headline lines={lines} delay={8} size={size} top={300} />
        {sub(300 + Math.round(lines.length * size * 1.1) + 40)}
        <ChatBubble text={s.chat || 'Hola, quiero una web'} delay={14} y={820} reply={s.reply} dur={dur} />
        {chipsFor(s, [{x: 80, y: 1380}, {right: 80, y: 1460}], 70)}
      </>;
    }
    case 'checklist': {
      const size = autoSize(lines, 100);
      return <>
        <Headline lines={lines} delay={10} size={size} top={320} />
        {sub(560)}
        <CardList items={s.items || []} top={700} />
      </>;
    }
    case 'compare': {
      const size = autoSize(lines, 100);
      return <>
        <Headline lines={lines} delay={10} size={size} top={320} />
        {sub(560)}
        <CompareCols left={s.left || {title: 'Plataforma', items: []}} right={s.right || {title: 'Tu web', items: []}} top={700} />
      </>;
    }
    case 'bignumber': {
      const p = ease(f, 8, 26);
      const size = autoSize(lines, 96);
      return <>
        <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontWeight: 800, fontSize: 400, letterSpacing: '-0.06em', color: '#fff', opacity: p, transform: `scale(${0.9 + 0.1 * p})`, lineHeight: 1}}>{(s.big || '0 %').replace('%', '')}<span style={{color: ACCENT.dark}}>{(s.big || '0 %').includes('%') ? '%' : ''}</span></div>
        <Headline lines={lines} delay={26} size={size} top={880} />
        {chipsFor(s, [{x: 80, y: 1250}, {right: 80, y: 1330}], 50)}
      </>;
    }
    case 'cta':
      return <FullCta lines={lines} sub={s.sub || ''} url={s.url || 'falbek.com'} steps={steps} />;
    default:
      return null;
  }
};

export const Dynamic: React.FC<DynProps> = ({tl, scenes}) => (
  <ProVideo tl={tl} render={(i, dur) => <SceneView s={scenes[i]} dur={dur} steps={tl.steps} />} />
);
