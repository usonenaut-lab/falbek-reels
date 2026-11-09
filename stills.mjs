import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
const input = JSON.parse(fs.readFileSync(process.argv[2] || 'src/sample.json'));
const fr = (process.argv[3] || '0.55').split(',').map(Number);
const only = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
const serveUrl = await bundle({entryPoint: 'src/index.ts', publicDir: 'public'});
const opts = {browserExecutable: process.env.CHROMIUM_PATH || '/tmp/chromium', chromiumOptions: {gl: 'swangle'}};
const comp = await selectComposition({serveUrl, id: 'Dynamic', inputProps: input, ...opts});
fs.mkdirSync('out/stills', {recursive: true});
for (const [i, s] of input.tl.scenes.entries()) {
  if (only && !only.includes(i + 1)) continue;
  for (const [j, f] of fr.entries()) {
    const frame = Math.min(input.tl.total - 1, s.from + Math.round((s.to - s.from) * f));
    await renderStill({composition: comp, serveUrl, frame, inputProps: input, output: `out/stills/s${i + 1}_${j}.jpg`, imageFormat: 'jpeg', ...opts});
    console.log('s' + (i + 1), frame);
  }
}
