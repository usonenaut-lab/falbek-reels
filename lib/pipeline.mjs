import fs from 'fs';
import path from 'path';
import {execFile} from 'child_process';
import {promisify} from 'util';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {buildTimeline, OFF} from './timeline.mjs';

const run = promisify(execFile);
const ROOT = path.resolve(process.cwd());
const env = process.env;

// ---------- Voz (ElevenLabs) ----------
let voiceIdCache = env.ELEVEN_VOICE_ID || null;
async function resolveVoice() {
  if (voiceIdCache) return voiceIdCache;
  const name = (env.ELEVEN_VOICE_NAME || 'Brian').toLowerCase();
  const r = await fetch('https://api.elevenlabs.io/v1/voices', {headers: {'xi-api-key': env.ELEVEN_API_KEY}});
  if (!r.ok) throw new Error(`ElevenLabs voces ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const v = (j.voices || []).find((x) => (x.name || '').toLowerCase().includes(name));
  if (!v) throw new Error(`No encuentro la voz "${env.ELEVEN_VOICE_NAME || 'Brian'}" en tu cuenta de ElevenLabs; define ELEVEN_VOICE_ID`);
  return (voiceIdCache = v.voice_id);
}
const xmlEsc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
async function ttsLine(text, i, lines, file) {
  const provider = env.TTS_PROVIDER || (env.TTS_MODE === 'mock' ? 'mock' : 'edge');
  if (provider === 'mock') {                // solo para pruebas: tono sintético
    const secs = Math.max(1.2, text.split(/\s+/).length * 0.36 + 0.4);
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `sine=frequency=${180 + (i % 3) * 30}:duration=${secs}`, '-ar', '44100', '-ac', '1', '-b:a', '128k', file]);
    return;
  }
  if (provider === 'edge') {                // Microsoft Edge TTS (gratis, sin registro, no oficial)
    const voice = env.EDGE_VOICE || 'es-ES-AlvaroNeural';
    const args = ['--voice', voice, `--rate=${env.EDGE_RATE || '+0%'}`, '--text', text, '--write-media', file];
    for (let k = 0; k < 3; k++) {
      try { await run('edge-tts', args); if (fs.existsSync(file) && fs.statSync(file).size > 2000) return; } catch (e) { if (k === 2) throw new Error('Edge TTS: ' + String(e.stderr || e.message).slice(0, 300)); }
      await new Promise((r) => setTimeout(r, 3000 * (k + 1)));
    }
    throw new Error('Edge TTS no devolvió audio');
  }
  if (provider === 'azure') {               // Azure Speech, nivel gratuito F0 (oficial)
    const region = env.AZURE_SPEECH_REGION, voice = env.AZURE_VOICE || 'es-ES-AlvaroNeural';
    const ssml = `<speak version="1.0" xml:lang="es-ES"><voice name="${voice}">${xmlEsc(text)}</voice></speak>`;
    const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {method: 'POST', headers: {'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3', 'User-Agent': 'falbek-reels'}, body: ssml});
    if (!r.ok) throw new Error(`Azure TTS ${r.status}: ${(await r.text()).slice(0, 200)}`);
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    return;
  }
  // ElevenLabs (de pago para uso comercial)
  const voice = await resolveVoice();
  const settings = env.ELEVEN_VOICE_SETTINGS ? JSON.parse(env.ELEVEN_VOICE_SETTINGS) : {stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true};
  const body = {text, model_id: env.ELEVEN_MODEL || 'eleven_multilingual_v2', voice_settings: settings};
  if (i > 0) body.previous_text = lines[i - 1];
  if (i < lines.length - 1) body.next_text = lines[i + 1];
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST', headers: {'xi-api-key': env.ELEVEN_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg'}, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`ElevenLabs voz ${r.status}: ${(await r.text()).slice(0, 300)}`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}
async function duration(file) {
  const {stdout} = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  return parseFloat(stdout);
}

// ---------- Render ----------
let serveUrlP = null;
const getServeUrl = () => (serveUrlP ||= bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public')}));
const browserExe = () => env.CHROMIUM_PATH || (fs.existsSync('/tmp/chromium') ? '/tmp/chromium' : undefined);
const browserOpts = () => ({...(browserExe() ? {browserExecutable: browserExe()} : {}), chromiumOptions: {gl: 'swangle'}});

export async function makeVideo(job, log = () => {}) {
  const dir = path.join(ROOT, 'work', job.id); fs.mkdirSync(dir, {recursive: true});
  const specs = job.scenes.map(({voice, ...spec}) => spec);
  const lines = job.scenes.map((s) => s.voice);
  const steps = job.steps || [];
  // 1. Voz por escena
  log('voz');
  const clips = [];
  for (let i = 0; i < lines.length; i++) { const f = path.join(dir, `v${i}.mp3`); await ttsLine(lines[i], i, lines, f); clips.push(f); }
  const durs = []; for (const c of clips) durs.push(await duration(c));
  const {tl, voiceStarts} = buildTimeline(specs, durs, steps);
  // 2. Voz continua: cada frase en su sitio de la línea de tiempo
  const inputs = clips.flatMap((c) => ['-i', c]);
  const fc = clips.map((_, i) => `[${i}]adelay=${Math.round((voiceStarts[i] - OFF) * 1000)}:all=1[a${i}]`).join(';') + ';' + clips.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${clips.length}:normalize=0[out]`;
  await run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fc, '-map', '[out]', '-ar', '44100', '-ac', '1', path.join(dir, 'voz.wav')]);
  // 3. Render mudo
  log('render');
  const input = {tl, scenes: specs};
  const serveUrl = await getServeUrl();
  const comp = await selectComposition({serveUrl, id: 'Dynamic', inputProps: input, ...browserOpts()});
  const conc = Number(env.RENDER_CONCURRENCY || 1);
  await renderMedia({composition: comp, serveUrl, codec: 'h264', outputLocation: path.join(dir, 'silent.mp4'), inputProps: input, imageFormat: 'jpeg', jpegQuality: 90, concurrency: conc, ...browserOpts(),
    onProgress: ({progress}) => { job.progress = Math.round(progress * 100); }});
  // 4. Audio y codificación compatible con Instagram/TikTok
  log('audio');
  fs.writeFileSync(path.join(dir, 'tl.json'), JSON.stringify(tl));
  await run('python3', [path.join(ROOT, 'tts/mix_pro.py'), 'tl.json', 'voz.wav', 'mix.mp3', String(OFF)], {cwd: dir});
  log('codificar');
  const out = path.join(ROOT, 'files', `${job.id}.mp4`); fs.mkdirSync(path.dirname(out), {recursive: true});
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, 'silent.mp4'), '-i', path.join(dir, 'mix.mp3'),
    '-vf', 'scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-profile:v', 'main', '-level:v', '4.0', '-pix_fmt', 'yuv420p', '-r', '30', '-g', '60', '-keyint_min', '60', '-sc_threshold', '0', '-bf', '2', '-maxrate', '6M', '-bufsize', '12M',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv', '-tag:v', 'avc1',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-ac', '2', '-map_metadata', '-1', '-movflags', '+faststart', '-shortest', out + '.tmp.mp4']);
  // 5. Verificación: el archivo se lee y se decodifica entero
  const secs = await duration(out + '.tmp.mp4');
  await run('ffmpeg', ['-v', 'error', '-i', out + '.tmp.mp4', '-f', 'null', '-']);
  fs.renameSync(out + '.tmp.mp4', out);
  fs.rmSync(dir, {recursive: true, force: true});
  return {file: out, seconds: Math.round(secs * 10) / 10, frames: tl.total};
}
