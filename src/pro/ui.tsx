import React, {useContext} from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {ACCENT, BgCtx, BgKey, FONT, SUB, SceneDef, StepDef, T, TEXT, W, H, bgColors, clampX, ease, inOut, isLight, lightMix, smooth} from './tokens';

export const Icon: React.FC<{name: string; size?: number; color?: string; sw?: number}> = ({name, size = 28, color = 'currentColor', sw = 2}) => {
  const p: Record<string, React.ReactNode> = {
    cal: <><rect x={3} y={5} width={18} height={16} rx={3} /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    bell: <path d="M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21a2 2 0 0 0 4 0" />,
    chat: <path d="M4 5h16v11H10l-5 4v-4H4z" />,
    card: <><rect x={3} y={5} width={18} height={14} rx={3} /><path d="M3 10h18M7 15h4" /></>,
    star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z" />,
    users: <><circle cx={9} cy={8} r={3.5} /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" /></>,
    chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
    check: <path d="M5 12.5l4.5 4.5L19 7" />,
    spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />,
    globe: <><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></>,
    table: <><circle cx={12} cy={12} r={4} /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" /></>,
    cross: <path d="M6 6l12 12M18 6L6 18" />,
    arrow: <path d="M4 12h15m0 0l-6-6m6 6l-6 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{p[name] || p.check}</svg>;
};

export const Backdrop: React.FC<{scenes: SceneDef[]; total: number}> = ({scenes, total}) => {
  const f = useCurrentFrame();
  const c = bgColors(f, scenes, total);
  return (
    <AbsoluteFill style={{background: c.base}}>
      <div style={{position: 'absolute', width: 1500, height: 1500, left: -560 + Math.sin(f / 70) * 120, top: -200 + Math.cos(f / 85) * 140, borderRadius: '50%', background: `radial-gradient(circle, ${c.g1} 0%, rgba(0,0,0,0) 62%)`}} />
      <div style={{position: 'absolute', width: 1500, height: 1500, left: 200 + Math.cos(f / 90) * 120, top: 700 + Math.sin(f / 75) * 140, borderRadius: '50%', background: `radial-gradient(circle, ${c.g2} 0%, rgba(0,0,0,0) 62%)`}} />
    </AbsoluteFill>
  );
};

export const Scene: React.FC<{bg: BgKey; dur: number; children?: React.ReactNode}> = ({bg, dur, children}) => {
  const f = useCurrentFrame();
  const OV = 12;
  const inn = ease(f, 0, OV, inOut), out = ease(f, dur - OV, OV, inOut);
  const sc = interpolate(inn, [0, 1], [0.96, 1]) * interpolate(out, [0, 1], [1, 1.1]);
  return (
    <BgCtx.Provider value={bg}>
      <AbsoluteFill style={{opacity: inn * (1 - out), transform: `scale(${sc})`, fontFamily: FONT}}>{children}</AbsoluteFill>
    </BgCtx.Provider>
  );
};

export type Word = {t: string; a?: boolean};
export const Headline: React.FC<{lines: Word[][]; delay?: number; size?: number; top?: number}> = ({lines, delay = 8, size = 100, top = 300}) => {
  const f = useCurrentFrame();
  const bg = useContext(BgCtx);
  let n = 0;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center'}}>
      {lines.map((ln, li) => (
        <div key={li} style={{display: 'flex', justifyContent: 'center', gap: size * 0.26, flexWrap: 'nowrap', lineHeight: 1.04}}>
          {ln.flatMap((seg) => seg.t.split(' ').map((w) => ({w, a: seg.a}))).map((o, wi) => {
            const p = ease(f, delay + (n++) * 3.5, 18);
            return <span key={wi} style={{display: 'inline-block', fontWeight: 800, fontSize: size, letterSpacing: '-0.035em', color: o.a ? ACCENT[bg] : TEXT[bg], opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: p < 1 ? `blur(${(1 - p) * 9}px)` : undefined}}>{o.w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};
export const Sub: React.FC<{text: string; delay?: number; top?: number; size?: number}> = ({text, delay = 30, top = 560, size = 38}) => {
  const f = useCurrentFrame();
  const bg = useContext(BgCtx);
  const p = ease(f, delay, 20);
  return <div style={{position: 'absolute', left: 80, right: 80, top, textAlign: 'center', fontWeight: 500, fontSize: size, color: SUB[bg], opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>{text}</div>;
};

export const Chip: React.FC<{text: string; icon?: string; x?: number; right?: number; y: number; delay?: number; rot?: number; seed?: number; tone?: 'neutral' | 'good' | 'bad'}> = ({text, icon, x, right, y, delay = 20, rot = 0, seed = 0, tone = 'neutral'}) => {
  const f = useCurrentFrame();
  const bg = useContext(BgCtx);
  const p = ease(f, delay, 20);
  const light = isLight(bg);
  const dot = tone === 'good' ? T.green : tone === 'bad' ? T.warm : ACCENT[bg] === '#ffffff' ? T.blue : ACCENT[bg];
  return (
    <div style={{position: 'absolute', ...(right !== undefined ? {right} : {left: x ?? 0}), top: y + Math.sin(f / 22 + seed) * 7, opacity: p, transform: `translateY(${(1 - p) * 30}px) rotate(${rot}deg) scale(${0.92 + 0.08 * p})`, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 26px 14px 16px', borderRadius: 999, background: light ? '#fff' : 'rgba(255,255,255,0.1)', border: light ? '1px solid rgba(15,23,42,0.06)' : '1px solid rgba(255,255,255,0.18)', boxShadow: light ? '0 14px 36px rgba(15,23,42,0.13)' : 'none', fontWeight: 600, fontSize: 30, color: light ? T.ink : '#fff', whiteSpace: 'nowrap'}}>
      <div style={{width: 40, height: 40, borderRadius: '50%', background: dot, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={icon || 'check'} size={22} color="#fff" sw={2.6} /></div>
      {text}
    </div>
  );
};

export const Stepper: React.FC<{steps: StepDef[]; scenes: SceneDef[]; total: number}> = ({steps, scenes, total}) => {
  const f = useCurrentFrame();
  const stepped = scenes.filter((s) => s.step !== null);
  if (!stepped.length) return null;
  const pts: number[] = [], vals: number[] = [];
  stepped.forEach((s) => { pts.push(s.from + 6, s.to - 6); vals.push(s.step as number, s.step as number); });
  const pos = interpolate(f, pts, vals, {...clampX, easing: inOut});
  let vis = 0;
  stepped.forEach((s) => { vis = Math.max(vis, ease(f, s.from - 4, 12) * (1 - ease(f, s.to - 12, 10))); });
  const mix = lightMix(f, scenes, total);
  const acc = interpolateColors(mix, [0, 1], [T.blue3, T.blue]);
  const idle = interpolateColors(mix, [0, 1], ['rgba(255,255,255,0.14)', 'rgba(15,23,42,0.07)']);
  const idleIcon = interpolateColors(mix, [0, 1], ['rgba(255,255,255,0.55)', 'rgba(15,23,42,0.4)']);
  const lab = interpolateColors(mix, [0, 1], ['rgba(255,255,255,0.55)', 'rgba(15,23,42,0.45)']);
  const labOn = interpolateColors(mix, [0, 1], ['#ffffff', T.ink]);
  const gap = (W - 160) / steps.length;
  return (
    <div style={{position: 'absolute', left: 80, top: 170, width: W - 160, height: 130, opacity: vis, fontFamily: FONT}}>
      {steps.map((s, i) => {
        const a = Math.max(0, 1 - Math.abs(pos - i));
        return (
          <div key={i} style={{position: 'absolute', left: i * gap, width: gap, textAlign: 'center'}}>
            <div style={{margin: '0 auto', width: 64, height: 64, borderRadius: '50%', background: a > 0.01 ? interpolateColors(a, [0, 1], [idle, acc]) : idle, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.12 * a})`}}>
              <Icon name={s.icon} size={30} color={a > 0.5 ? '#fff' : idleIcon} sw={2.2} />
            </div>
            <div style={{marginTop: 12, fontSize: 21, fontWeight: a > 0.5 ? 700 : 500, color: a > 0.5 ? labOn : lab}}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Shell: React.FC<{x: number; y: number; w: number; h: number; r: number; bezel: number; delay: number; rot: number; children?: React.ReactNode; island?: boolean}> = ({x, y, w, h, r, bezel, delay, rot, children, island}) => {
  const f = useCurrentFrame();
  const p = ease(f, delay, 26);
  const drift = Math.sin(f / 38) * 9;
  const zoom = 1 + Math.min(f, 200) * 0.00012;
  return (
    <div style={{position: 'absolute', left: x, top: y + (1 - p) * 140 + drift, width: w, height: h, borderRadius: r, background: '#0d0f14', border: '2px solid #2b3040', boxShadow: '0 50px 90px rgba(15,23,42,0.28)', opacity: Math.min(1, p * 2), transform: `rotate(${rot * (1 - p * 0.6)}deg) scale(${(0.95 + 0.05 * p) * zoom})`}}>
      <div style={{position: 'absolute', left: bezel, top: bezel, right: bezel, bottom: bezel, borderRadius: r - bezel, overflow: 'hidden', background: '#fff'}}>{children}</div>
      {island && <div style={{position: 'absolute', left: w / 2 - 62, top: bezel + 12, width: 124, height: 34, borderRadius: 17, background: '#05060a'}} />}
    </div>
  );
};
export const Phone: React.FC<{x?: number; y?: number; delay?: number; rot?: number; children?: React.ReactNode}> = ({x = 290, y = 620, delay = 14, rot = 0, children}) => (
  <Shell x={x} y={y} w={500} h={1040} r={76} bezel={12} delay={delay} rot={rot} island>{children}</Shell>
);
export const Tablet: React.FC<{x?: number; y?: number; delay?: number; rot?: number; children?: React.ReactNode}> = ({x = 90, y = 760, delay = 14, rot = 0, children}) => (
  <Shell x={x} y={y} w={900} h={640} r={46} bezel={14} delay={delay} rot={rot}>{children}</Shell>
);

export const Orbit: React.FC<{cx?: number; cy?: number; r?: number}> = ({cx = 540, cy = 900, r = 400}) => {
  const f = useCurrentFrame();
  const p = ease(f, 0, 30);
  const a = f / 36;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: p}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="6 14" style={{transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${f * 0.25}deg)`}} />
      <circle cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={9} fill={T.blue3} />
      <circle cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={22} fill={T.blue3} opacity={0.25} />
    </svg>
  );
};

export const FullCta: React.FC<{lines: Word[][]; sub: string; url: string; steps: StepDef[]}> = ({lines, sub, url, steps}) => {
  const f = useCurrentFrame();
  const btn = ease(f, 50, 22);
  const pulse = 1 + 0.015 * Math.sin(f / 5);
  const ico = ease(f, 70, 20);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontWeight: 800, fontSize: 60, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.85)', opacity: ease(f, 6, 18)}}>Falbek<span style={{color: '#fff'}}>.</span></div>
      <Headline lines={lines} delay={14} size={128} top={480} />
      <Sub text={sub} delay={44} top={880} size={44} />
      <div style={{position: 'absolute', left: 190, top: 1030, width: 700, height: 150, borderRadius: 75, background: '#fff', color: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, fontWeight: 800, fontSize: 70, letterSpacing: '-0.02em', opacity: btn, transform: `translateY(${(1 - btn) * 40}px) scale(${pulse})`, boxShadow: '0 30px 60px rgba(7,40,120,0.35)'}}>{url}<Icon name="arrow" size={58} color={T.blue} sw={2.6} /></div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 1300, display: 'flex', justifyContent: 'space-between', opacity: ico}}>
        {steps.map((s, i) => <div key={i} style={{width: 92, height: 92, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name={s.icon} size={42} color="#fff" sw={2} /></div>)}
      </div>
    </AbsoluteFill>
  );
};
