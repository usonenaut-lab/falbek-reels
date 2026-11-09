import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT, T, ease, smooth, clampX} from './tokens';
import {Icon} from './ui';

// Todos los datos son ficticios (ejemplos), nunca casos reales.
const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const f = useCurrentFrame();
  const p = ease(f, at, 14);
  if (f < at || f > at + 18) return null;
  return <div style={{position: 'absolute', left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(15,23,42,0.18)', transform: `scale(${0.4 + 0.8 * p})`, opacity: 1 - p}} />;
};

export const BookingUI: React.FC<{sel?: number; press?: number; done?: number; name?: string}> = ({sel = 50, press = 85, done = 100, name = 'Tu restaurante'}) => {
  const f = useCurrentFrame();
  const times = ['20:30', '21:00', '21:30', '22:00', '22:30', '23:00'];
  const s = ease(f, sel, 10);
  const days = [['L', 19], ['M', 20], ['X', 21], ['J', 22], ['V', 23]];
  const d = ease(f, done, 20);
  const bt = f >= press && f < press + 8 ? 0.96 : 1;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: FONT, color: T.ink}}>
      <div style={{padding: '74px 36px 0'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><div style={{width: 38, height: 38, borderRadius: 12, background: T.blue}} /><div style={{fontWeight: 700, fontSize: 26}}>{name}</div></div>
        <div style={{fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em', marginTop: 34}}>Reserva tu mesa</div>
        <div style={{fontWeight: 500, fontSize: 22, color: T.gray, marginTop: 8}}>Elige día, hora y comensales</div>
        <div style={{display: 'flex', gap: 12, marginTop: 30}}>
          {days.map(([l, n], i) => <div key={i} style={{flex: 1, height: 96, borderRadius: 22, background: i === 2 ? T.blue : '#f1f3f8', color: i === 2 ? '#fff' : T.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}><div style={{fontSize: 18, opacity: 0.7}}>{l}</div><div style={{fontSize: 30}}>{n}</div></div>)}
        </div>
        <div style={{fontWeight: 700, fontSize: 22, marginTop: 34, color: T.gray}}>HORA</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14}}>
          {times.map((t, i) => {
            const on = i === 2 ? s : 0;
            return <div key={i} style={{width: 124, height: 70, borderRadius: 20, background: on > 0.5 ? T.blue : '#f1f3f8', color: on > 0.5 ? '#fff' : T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 28, transform: `scale(${1 + 0.05 * on * (1 - s)})`}}>{t}</div>;
          })}
        </div>
        <div style={{fontWeight: 700, fontSize: 22, marginTop: 34, color: T.gray}}>PERSONAS</div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, height: 84, borderRadius: 24, background: '#f1f3f8', padding: '0 30px', fontWeight: 800, fontSize: 36}}><span style={{color: T.gray}}>−</span>4<span style={{color: T.blue}}>+</span></div>
        <div style={{marginTop: 40, height: 94, borderRadius: 28, background: T.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 32, transform: `scale(${bt})`, boxShadow: '0 16px 30px rgba(26,109,245,0.35)'}}>Reservar mesa</div>
      </div>
      <Tap x={238} y={808} at={press} />
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: d, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, pointerEvents: 'none'}}>
        <div style={{width: 150, height: 150, borderRadius: '50%', background: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * d})`}}><Icon name="check" size={84} color="#fff" sw={3} /></div>
        <div style={{fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', marginTop: 12}}>Reserva confirmada</div>
        <div style={{fontWeight: 500, fontSize: 26, color: T.gray}}>Mesa para 4 · 21:30</div>
      </div>
    </div>
  );
};

export const ReminderUI: React.FC<{notif?: number; tap?: number; name?: string}> = ({notif = 30, tap = 95, name = 'Tu restaurante'}) => {
  const f = useCurrentFrame();
  const n = ease(f, notif, 22);
  const ok = ease(f, tap, 8);
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg,#243a73,#0e1530 70%)', fontFamily: FONT, color: '#fff'}}>
      <div style={{textAlign: 'center', paddingTop: 120, fontSize: 28, fontWeight: 600, opacity: 0.8}}>Lunes 19</div>
      <div style={{textAlign: 'center', fontSize: 150, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1}}>20:00</div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 420, borderRadius: 34, background: 'rgba(255,255,255,0.94)', color: T.ink, padding: '26px 28px', opacity: n, transform: `translateY(${(1 - n) * -60}px)`, boxShadow: '0 24px 50px rgba(0,0,0,0.35)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 52, height: 52, borderRadius: 15, background: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="cal" size={30} color="#fff" /></div>
          <div style={{flex: 1, fontWeight: 700, fontSize: 28}}>{name}</div><div style={{fontSize: 22, color: T.gray}}>ahora</div>
        </div>
        <div style={{fontWeight: 600, fontSize: 30, marginTop: 18, lineHeight: 1.25}}>Recordatorio: mañana 21:30 · Mesa para 4</div>
        <div style={{display: 'flex', gap: 14, marginTop: 24}}>
          <div style={{flex: 1, height: 74, borderRadius: 22, background: ok > 0.5 ? T.green : T.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 28, gap: 10}}>{ok > 0.5 ? <Icon name="check" size={34} color="#fff" sw={3} /> : 'Confirmo'}</div>
          <div style={{flex: 1, height: 74, borderRadius: 22, background: '#e9ecf3', color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 28}}>Cancelo</div>
        </div>
      </div>
      <Tap x={150} y={717} at={tap - 6} />
    </div>
  );
};

export const AdminUI: React.FC<{newAt?: number}> = ({newAt = 60}) => {
  const f = useCurrentFrame();
  const n = ease(f, newAt, 22);
  const rows: [string, string, string, string][] = [
    ['20:30', 'Ane G.', '2', 'ok'], ['21:00', 'Iker M.', '6', 'ok'], ['21:30', 'Maite O.', '4', 'wait'], ['22:00', 'Jon A.', '3', 'ok'], ['22:30', 'Leire P.', '2', 'ok'],
  ];
  const badge = (k: string) => k === 'ok' ? {bg: '#d9f6ea', c: '#0a8f64', t: 'Confirmada'} : k === 'new' ? {bg: '#dbe8ff', c: T.blue, t: 'Nueva'} : {bg: '#fdf0d2', c: '#b97a05', t: 'Pendiente'};
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f6f7fb', fontFamily: FONT, color: T.ink, display: 'flex'}}>
      <div style={{width: 84, background: '#fff', borderRight: '1px solid #e8ebf2', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, paddingTop: 36}}>
        <div style={{width: 42, height: 42, borderRadius: 13, background: T.blue}} />
        <Icon name="cal" size={32} color={T.blue} /><Icon name="users" size={32} color={T.gray2} /><Icon name="chart" size={32} color={T.gray2} />
      </div>
      <div style={{flex: 1, padding: '34px 40px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div style={{fontWeight: 800, fontSize: 38, letterSpacing: '-0.03em'}}>Reservas de hoy</div><div style={{fontWeight: 600, fontSize: 22, color: T.gray}}>Lunes 19</div></div>
        <div style={{marginTop: 26, borderRadius: 24, background: '#fff', boxShadow: '0 8px 24px rgba(15,23,42,0.06)', overflow: 'hidden'}}>
          <div style={{height: 82 * n, overflow: 'hidden', opacity: n}}>
            <div style={{height: 82, display: 'flex', alignItems: 'center', padding: '0 28px', background: '#eef4ff', borderBottom: '1px solid #e8ebf2', fontWeight: 600, fontSize: 26}}>
              <div style={{width: 120, fontWeight: 800}}>21:30</div><div style={{flex: 1}}>Nuevo cliente</div><div style={{width: 110, color: T.gray, whiteSpace: 'nowrap'}}>4 pers.</div>
              <div style={{padding: '8px 18px', borderRadius: 999, background: badge('new').bg, color: badge('new').c, fontWeight: 700, fontSize: 22}}>{badge('new').t}</div>
            </div>
          </div>
          {rows.map(([t, nm, g, k], i) => (
            <div key={i} style={{height: 82, display: 'flex', alignItems: 'center', padding: '0 28px', borderBottom: i < rows.length - 1 ? '1px solid #eef0f5' : 'none', fontWeight: 600, fontSize: 26}}>
              <div style={{width: 120, fontWeight: 800}}>{t}</div><div style={{flex: 1}}>{nm}</div><div style={{width: 110, color: T.gray, whiteSpace: 'nowrap'}}>{g} pers.</div>
              <div style={{padding: '8px 18px', borderRadius: 999, background: badge(k).bg, color: badge(k).c, fontWeight: 700, fontSize: 22}}>{badge(k).t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Ventana de navegador con una web de ejemplo (contenido 872 × 812 aprox.)
export const BrowserUI: React.FC<{name?: string; title?: string; accentWord?: string; cta?: string}> = ({name = 'Tu restaurante', title = 'Cocina de siempre, en tu mesa.', cta = 'Reservar mesa'}) => {
  const f = useCurrentFrame();
  const h = ease(f, 14, 24), b = ease(f, 34, 22), sc = ease(f, 0, 240) * 60;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: FONT, color: T.ink}}>
      <div style={{height: 64, background: '#eef0f6', display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px'}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: '50%', background: c}} />)}
        <div style={{marginLeft: 20, flex: 1, height: 36, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 20, fontWeight: 600, color: T.gray}}>tunegocio.com</div>
      </div>
      <div style={{transform: `translateY(${-sc}px)`}}>
        <div style={{padding: '30px 40px 0', display: 'flex', alignItems: 'center', gap: 12}}><div style={{width: 40, height: 40, borderRadius: 12, background: T.blue}} /><div style={{fontWeight: 800, fontSize: 28}}>{name}</div></div>
        <div style={{padding: '50px 40px 0', display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{flex: 1, opacity: h, transform: `translateY(${(1 - h) * 24}px)`}}>
            <div style={{fontWeight: 800, fontSize: 64, lineHeight: 1.03, letterSpacing: '-0.04em'}}>{title}</div>
            <div style={{marginTop: 30, display: 'inline-block', padding: '20px 34px', borderRadius: 18, background: T.blue, color: '#fff', fontWeight: 700, fontSize: 26, opacity: b, transform: `scale(${0.9 + 0.1 * b})`}}>{cta}</div>
          </div>
          <div style={{width: 220, height: 220, borderRadius: '50%', background: `linear-gradient(135deg, ${T.blue3}, ${T.green})`, opacity: h}} />
        </div>
        <div style={{padding: '56px 40px 0', display: 'flex', gap: 18}}>
          {[T.amber, T.blue, T.green].map((c, i) => <div key={i} style={{flex: 1, height: 260, borderRadius: 26, background: `linear-gradient(180deg, ${c}, #ffffff)`, opacity: ease(f, 50 + i * 8, 20)}} />)}
        </div>
      </div>
    </div>
  );
};

// Burbuja de chat que se escribe sola
export const ChatBubble: React.FC<{text: string; delay?: number; y?: number; reply?: string; dur?: number}> = ({text, delay = 10, y = 700, reply, dur = 120}) => {
  const f = useCurrentFrame();
  const p = ease(f, delay, 16);
  // La escritura ocupa como mucho el 40 % de la escena para que la respuesta llegue a verse
  const rate = Math.max(0.8, Math.min(2.2, (dur * 0.4 - delay) / Math.max(1, text.length)));
  const n = Math.max(0, Math.min(text.length, Math.floor((f - delay - 10) / rate)));
  const typing = n < text.length;
  const caret = typing || Math.floor(f / 10) % 2 === 0 ? 1 : 0;
  const r = ease(f, delay + 10 + text.length * rate + 12, 18);
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: y, fontFamily: FONT}}>
      <div style={{marginLeft: 'auto', maxWidth: 820, width: 'fit-content', padding: '34px 44px', borderRadius: 48, borderBottomRightRadius: 14, background: T.blue, color: '#fff', fontWeight: 600, fontSize: 52, lineHeight: 1.2, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, boxShadow: '0 30px 60px rgba(26,109,245,0.35)'}}>
        {text.slice(0, n)}<span style={{opacity: caret}}>|</span>
      </div>
      {reply && <div style={{marginTop: 26, width: 'fit-content', maxWidth: 760, padding: '30px 40px', borderRadius: 48, borderBottomLeftRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: 46, lineHeight: 1.2, opacity: r, transform: `translateY(${(1 - r) * 30}px)`}}>{reply}</div>}
    </div>
  );
};

// Tarjetas apiladas (lista rápida)
export const CardList: React.FC<{items: {icon?: string; title: string; sub?: string}[]; top?: number; light?: boolean}> = ({items, top = 720, light = true}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top, fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: 26}}>
      {items.slice(0, 3).map((it, i) => {
        const p = ease(f, 22 + i * 14, 22);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 28, padding: '34px 38px', borderRadius: 40, background: light ? '#fff' : 'rgba(255,255,255,0.1)', border: light ? '1px solid rgba(15,23,42,0.06)' : '1px solid rgba(255,255,255,0.18)', boxShadow: light ? '0 24px 50px rgba(15,23,42,0.12)' : 'none', opacity: p, transform: `translateY(${(1 - p) * 50}px)`}}>
            <div style={{width: 96, height: 96, borderRadius: 30, background: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Icon name={it.icon || 'check'} size={52} color="#fff" sw={2.2} /></div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 800, fontSize: 46, letterSpacing: '-0.03em', color: light ? T.ink : '#fff', lineHeight: 1.1}}>{it.title}</div>
              {it.sub && <div style={{fontWeight: 500, fontSize: 30, color: light ? T.gray : '#b6bfd6', marginTop: 8}}>{it.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Comparativa: plataforma frente a web propia
export const CompareCols: React.FC<{left: {title: string; items: string[]}; right: {title: string; items: string[]}; top?: number}> = ({left, right, top = 720}) => {
  const f = useCurrentFrame();
  const col = (c: {title: string; items: string[]}, good: boolean, at: number) => {
    const p = ease(f, at, 22);
    return (
      <div style={{flex: 1, borderRadius: 40, background: good ? T.blue : '#fff', color: good ? '#fff' : T.ink, padding: '36px 30px', boxShadow: good ? '0 30px 60px rgba(26,109,245,0.35)' : '0 24px 50px rgba(15,23,42,0.12)', opacity: p, transform: `translateY(${(1 - p) * 60}px)`}}>
        <div style={{fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', marginBottom: 26}}>{c.title}</div>
        {c.items.slice(0, 4).map((t, i) => {
          const q = ease(f, at + 18 + i * 10, 16);
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, opacity: q}}>
            <div style={{width: 44, height: 44, borderRadius: '50%', background: good ? 'rgba(255,255,255,0.22)' : '#fde4df', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Icon name={good ? 'check' : 'cross'} size={26} color={good ? '#fff' : T.warm} sw={2.8} /></div>
            <div style={{fontWeight: 600, fontSize: 31, lineHeight: 1.15}}>{t}</div>
          </div>;
        })}
      </div>
    );
  };
  return <div style={{position: 'absolute', left: 50, right: 50, top, display: 'flex', gap: 24, fontFamily: FONT}}>{col(left, false, 20)}{col(right, true, 34)}</div>;
};
