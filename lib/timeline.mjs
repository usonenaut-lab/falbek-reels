// Calcula la línea de tiempo a partir de la duración (s) de la voz de cada escena.
// Igual que tts/build_pro_timeline.py: la voz va desplazada 0,4 s y cada escena entra 0,25 s antes de su frase.
export const FPS = 30, OFF = 0.4, GAP = 0.25, TAIL = 2.6;
const DEFAULT_BG = {hook: 'dark', problem: 'dark-problem', chat: 'dark', bignumber: 'dark', cta: 'accent'};
export function buildTimeline(specs, durs, steps) {
  const starts = []; let t = 0;
  durs.forEach((d, i) => { starts.push(t); t += d + GAP; });
  const froms = starts.map((s, i) => (i === 0 ? 0 : Math.round((s + OFF - 0.25) * FPS)));
  const total = Math.round((starts[starts.length - 1] + durs[durs.length - 1] + OFF + TAIL) * FPS);
  const scenes = specs.map((s, i) => ({
    key: `s${i + 1}`, from: froms[i], to: i < specs.length - 1 ? froms[i + 1] : total,
    bg: s.bg || DEFAULT_BG[s.type] || 'light', step: Number.isInteger(s.step) ? s.step : null,
  }));
  return {tl: {total, steps, scenes}, voiceStarts: starts.map((s) => s + OFF)};
}
