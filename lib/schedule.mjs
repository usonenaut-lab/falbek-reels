import fs from 'fs';
const cfg = JSON.parse(fs.readFileSync(new URL('../config/schedule.json', import.meta.url)));
const TZ = cfg.timezone;
const pad = (n) => String(n).padStart(2, '0');
const parts = (d) => Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23'}).formatToParts(d).map((p) => [p.type, p.value]));
const ISO = {Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7};
export function madridNow(d = new Date()) { const p = parts(d); return {day: ISO[p.weekday], date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute)}; }
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const fmt = (date, min) => `${date}T${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}:00`;

// Devuelve las horas (hora de Madrid, sin zona) de cada pieza del día. Si una hora ya pasó, se programa unos minutos después de ahora.
export function planToday({hasPost, nStories, test = false, now = new Date()}) {
  const t = madridNow(now);
  const ig = cfg.instagram[t.day], tt = toMin(cfg.tiktok[t.day]);
  const [s1, s2, s3] = ig.map(toMin);
  const slots = {reel_ig: s1, reel_tt: tt, post: s2};
  const stories = [];
  const first = s2 + (hasPost ? 20 : 0), last = s3, mid = Math.round((first + last) / 2);
  const base = nStories >= 3 ? [first, mid, last] : nStories === 2 ? [first, last] : [last];
  base.slice(0, nStories).forEach((m) => stories.push(m));
  let late = 0;
  const place = (m) => {
    if (test) return `2027-12-31T${pad(8 + (late++))}:00:00`;
    if (m > t.minutes + 5) return fmt(t.date, m);
    return fmt(t.date, Math.min(t.minutes + 8 + 7 * late++, 23 * 60 + 50)); // ya pasó: salir pronto, escalonado
  };
  return {day: t.day, postDay: cfg.postDays.includes(t.day), reel_ig: place(slots.reel_ig), reel_tt: place(slots.reel_tt), post: place(slots.post), stories: stories.map(place)};
}
