// Orquestador diario: pide el guion a Make, renderiza, publica el mp4 en GitHub Pages y avisa a Make para publicar.
// Variables: MAKE_SCRIPT_URL, MAKE_PUBLISH_URL, GITHUB_REPOSITORY, JOB_JSON (opcional: salta la petición a Make), DRY_RUN=1 (no avisa a Make)
import fs from 'fs';
import crypto from 'crypto';
import {execFile} from 'child_process';
import {promisify} from 'util';
import {makeVideo} from '../lib/pipeline.mjs';

const run = promisify(execFile);
const env = process.env;
const parseJson = (t) => JSON.parse(String(t).replace(/^[\s\S]*?(\{)/, '$1').replace(/```[\s\S]*$/, '').trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (env.PUBLISH_TEST === '1') {          // prueba del escenario de publicación: programa una publicación de mentira para 2027
  const payload = {video_url: env.TEST_VIDEO_URL, tema: 'PRUEBA', caption: 'Prueba de publicación automática de Falbek', hashtags: '#falbek', test: '1'};
  const r = await fetch(env.MAKE_PUBLISH_URL, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
  console.log('Make respondió', r.status, await r.text());
  process.exit(r.ok ? 0 : 1);
}

async function getScript() {
  if (env.JOB_JSON) return parseJson(env.JOB_JSON);
  let last;
  for (let k = 1; k <= 3; k++) {
    try {
      const r = await fetch(env.MAKE_SCRIPT_URL, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({date: new Date().toISOString()})});
      const t = await r.text();
      if (!r.ok) throw new Error(`Make ${r.status}: ${t.slice(0, 200)}`);
      const j = parseJson(t.trim().startsWith('{') && t.includes('"scenes"') ? t : (JSON.parse(t).result ?? t));
      if (!Array.isArray(j.scenes) || j.scenes.length < 5) throw new Error('el guion no trae escenas suficientes');
      for (const [i, s] of j.scenes.entries()) if (!s.type || !s.h || !s.voice) throw new Error(`escena ${i + 1} incompleta`);
      return j;
    } catch (e) { last = e; console.log(`Intento ${k} de guion fallido:`, e.message); await sleep(8000 * k); }
  }
  throw new Error('No se pudo obtener un guion válido: ' + last.message);
}

async function publishToPages(file, id) {
  const repo = env.GITHUB_REPOSITORY, owner = repo.split('/')[0], name = repo.split('/')[1];
  const dir = 'pages'; fs.rmSync(dir, {recursive: true, force: true});
  const remote = `https://x-access-token:${env.GITHUB_TOKEN}@github.com/${repo}.git`;
  let exists = true;
  try { await run('git', ['clone', '--depth', '1', '--branch', 'gh-pages', remote, dir]); } catch { exists = false; }
  if (!exists) {
    fs.mkdirSync(dir, {recursive: true});
    await run('git', ['init', '-b', 'gh-pages'], {cwd: dir}); await run('git', ['remote', 'add', 'origin', remote], {cwd: dir});
    fs.writeFileSync(`${dir}/index.html`, '<!doctype html><title>Falbek reels</title>');
  }
  fs.mkdirSync(`${dir}/videos`, {recursive: true});
  fs.copyFileSync(file, `${dir}/videos/${id}.mp4`);
  fs.writeFileSync(`${dir}/.nojekyll`, '');
  for (const f of fs.readdirSync(`${dir}/videos`)) { const p = `${dir}/videos/${f}`; if (Date.now() - fs.statSync(p).mtimeMs > 14 * 864e5) fs.rmSync(p); }
  await run('git', ['config', 'user.name', 'falbek-bot'], {cwd: dir}); await run('git', ['config', 'user.email', 'bot@falbek.com'], {cwd: dir});
  await run('git', ['add', '-A'], {cwd: dir}); await run('git', ['commit', '-m', `reel ${id}`], {cwd: dir});
  await run('git', ['push', 'origin', 'gh-pages'], {cwd: dir});
  const url = `https://${owner}.github.io/${name}/videos/${id}.mp4`;
  for (let k = 0; k < 40; k++) {              // espera a que Pages lo sirva (hasta ~10 min)
    try { const r = await fetch(url, {method: 'HEAD'}); if (r.ok) { console.log('Disponible:', url, r.headers.get('content-type'), r.headers.get('content-length')); return url; } } catch {}
    await sleep(15000);
  }
  throw new Error('GitHub Pages no sirvió el vídeo a tiempo: ' + url);
}

const script = await getScript();
console.log('Tema:', script.tema, '| escenas:', script.scenes.length);
const id = crypto.randomBytes(8).toString('hex');
const res = await makeVideo({id, scenes: script.scenes, steps: script.steps || []}, (s) => console.log('paso:', s));
console.log('Vídeo listo:', res);
if (env.DRY_RUN === '1' && !env.PUBLISH_PAGES) { console.log('DRY_RUN: no se publica'); fs.copyFileSync(res.file, 'reel.mp4'); process.exit(0); }
const videoUrl = await publishToPages(res.file, id);
if (env.DRY_RUN === '1') { console.log('DRY_RUN: no se avisa a Make'); process.exit(0); }
const payload = {video_url: videoUrl, tema: script.tema, caption: script.caption, hashtags: script.hashtags, seconds: res.seconds};
for (let k = 0; k < 4; k++) {
  const r = await fetch(env.MAKE_PUBLISH_URL, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
  if (r.ok) { console.log('Make avisado'); process.exit(0); }
  console.log('Make respondió', r.status); await sleep(10000 * (k + 1));
}
throw new Error('No se pudo avisar a Make para publicar');
