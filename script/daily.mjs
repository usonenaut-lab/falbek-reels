// Orquestador diario: pide el guion a Make, renderiza, publica el mp4 en GitHub Pages y avisa a Make para publicar.
// Variables: MAKE_SCRIPT_URL, MAKE_PUBLISH_URL, GITHUB_REPOSITORY, JOB_JSON (opcional: salta la petición a Make), DRY_RUN=1 (no avisa a Make)
import fs from 'fs';
import crypto from 'crypto';
import {execFile} from 'child_process';
import {promisify} from 'util';
import path from 'path';
import {makeVideo} from '../lib/pipeline.mjs';
import {renderSocial} from '../lib/social.mjs';
import {planToday} from '../lib/schedule.mjs';

const run = promisify(execFile);
const env = process.env;
const parseJson = (t) => JSON.parse(String(t).replace(/^[\s\S]*?(\{)/, '$1').replace(/```[\s\S]*$/, '').trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (env.PUBLISH_TEST === '1') {          // prueba del escenario de publicación: programa una publicación de mentira para 2027
  const payload = {kind: 'reel', media: [{type: 'video', url: env.TEST_VIDEO_URL}], tema: 'PRUEBA', caption: 'Prueba de publicación automática de Falbek', hashtags: '#falbek', at: '2027-12-31T08:00:00', at_tiktok: '2027-12-31T09:00:00', test: '1'};
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

async function publishToPages(files) {
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
  for (const f of files) { fs.mkdirSync(path.dirname(`${dir}/${f.name}`), {recursive: true}); fs.copyFileSync(f.src, `${dir}/${f.name}`); }
  fs.writeFileSync(`${dir}/.nojekyll`, '');
  const old = (p) => Date.now() - fs.statSync(p).mtimeMs > 14 * 864e5;
  if (fs.existsSync(`${dir}/videos`)) for (const f of fs.readdirSync(`${dir}/videos`)) if (old(`${dir}/videos/${f}`)) fs.rmSync(`${dir}/videos/${f}`);
  if (fs.existsSync(`${dir}/media`)) for (const f of fs.readdirSync(`${dir}/media`)) if (old(`${dir}/media/${f}`)) fs.rmSync(`${dir}/media/${f}`, {recursive: true});
  await run('git', ['config', 'user.name', 'falbek-bot'], {cwd: dir}); await run('git', ['config', 'user.email', 'bot@falbek.com'], {cwd: dir});
  await run('git', ['add', '-A'], {cwd: dir}); await run('git', ['commit', '-m', `contenido ${new Date().toISOString()}`], {cwd: dir});
  await run('git', ['push', 'origin', 'gh-pages'], {cwd: dir});
  const urls = Object.fromEntries(files.map((f) => [f.name, `https://${owner}.github.io/${name}/${f.name}`]));
  for (const f of files) {
    let okk = false;
    for (let k = 0; k < 40 && !okk; k++) { try { const r = await fetch(urls[f.name], {method: 'HEAD'}); okk = r.ok; if (okk) console.log('Disponible:', urls[f.name], r.headers.get('content-type'), r.headers.get('content-length')); } catch {} if (!okk) await sleep(15000); }
    if (!okk) throw new Error('GitHub Pages no sirvió a tiempo: ' + urls[f.name]);
  }
  return urls;
}

const script = await getScript();
console.log('Tema:', script.tema, '| escenas:', script.scenes.length, '| historias:', (script.stories || []).length, '| post:', script.post ? script.post.slides?.length + ' diapositivas' : 'no');
const id = crypto.randomBytes(8).toString('hex');
const res = await makeVideo({id, scenes: script.scenes, steps: script.steps || []}, (s) => console.log('paso:', s));
console.log('Vídeo listo:', res);

// Imágenes: historias y publicación de foto
let social = {stories: [], post: []};
const stories = Array.isArray(script.stories) ? script.stories.slice(0, 3) : [];
const post = script.post && Array.isArray(script.post.slides) && script.post.slides.length ? {...script.post, slides: script.post.slides.slice(0, 8)} : null;
if (stories.length || post) {
  try { social = await renderSocial({stories, post, outDir: `work/social-${id}`}); console.log('Imágenes listas:', social.stories.length, 'historias,', social.post.length, 'diapositivas'); }
  catch (e) { console.log('Error al crear las imágenes (se sigue solo con el reel):', e.message); }
}
if (env.DRY_RUN === '1' && !env.PUBLISH_PAGES) { console.log('DRY_RUN: no se publica'); fs.copyFileSync(res.file, 'reel.mp4'); process.exit(0); }

const files = [{src: res.file, name: `videos/${id}.mp4`}];
social.stories.forEach((f, i) => files.push({src: f, name: `media/${id}/story${i + 1}.jpg`}));
social.post.forEach((f, i) => files.push({src: f, name: `media/${id}/post${i + 1}.jpg`}));
const urls = await publishToPages(files);
const U = (n) => urls[n];
if (env.DRY_RUN === '1') { console.log('DRY_RUN: no se avisa a Make'); process.exit(0); }

const test = env.TEST_PUBLISH === '1';
const plan = planToday({hasPost: !!post && social.post.length > 0, nStories: social.stories.length, test});
console.log('Plan de hoy:', JSON.stringify(plan));
const items = [{kind: 'reel', media: [{type: 'video', url: U(`videos/${id}.mp4`)}], caption: script.caption, hashtags: script.hashtags, tema: script.tema, at: plan.reel_ig, at_tiktok: plan.reel_tt}];
if (post && social.post.length) items.push({kind: 'post', media: social.post.map((_, i) => ({type: 'image', url: U(`media/${id}/post${i + 1}.jpg`)})), caption: post.caption || script.caption, hashtags: post.hashtags || script.hashtags, tema: script.tema, at: plan.post});
social.stories.forEach((_, i) => items.push({kind: 'story', media: [{type: 'image', url: U(`media/${id}/story${i + 1}.jpg`)}], caption: '', hashtags: '', tema: script.tema, at: plan.stories[i]}));
let failed = 0;
for (const it of items) {
  let ok = false;
  for (let k = 0; k < 4 && !ok; k++) {
    try { const r = await fetch(env.MAKE_PUBLISH_URL, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...it, test: test ? '1' : ''})}); ok = r.ok; if (!ok) console.log(it.kind, 'Make respondió', r.status); } catch (e) { console.log(it.kind, 'error de red', e.message); }
    if (!ok) await sleep(8000 * (k + 1));
  }
  console.log(ok ? 'Enviado a Make:' : 'FALLÓ el envío:', it.kind, it.at); if (!ok) failed++;
  await sleep(2500);
}
if (failed) throw new Error(`${failed} piezas no se pudieron enviar a Make`);
console.log('Todo enviado a Make');
