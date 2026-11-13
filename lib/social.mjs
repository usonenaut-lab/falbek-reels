import fs from 'fs';
import path from 'path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const env = process.env;
export const STILL_FRAME = 130;
const browserExe = () => env.CHROMIUM_PATH || (fs.existsSync('/tmp/chromium') ? '/tmp/chromium' : undefined);
const browserOpts = () => ({...(browserExe() ? {browserExecutable: browserExe()} : {}), chromiumOptions: {gl: 'swangle'}});

// Renderiza historias (1080x1920) y las diapositivas de una publicación (1080x1350) como JPEG.
// stories: [spec]; post: {slides:[slide]} | null. Devuelve {stories:[ruta], post:[ruta]}
export async function renderSocial({stories = [], post = null, outDir, serveUrl}) {
  fs.mkdirSync(outDir, {recursive: true});
  serveUrl ||= await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
  const out = {stories: [], post: []};
  const one = async (id, inputProps, file) => {
    const composition = await selectComposition({serveUrl, id, inputProps, ...browserOpts()});
    await renderStill({composition, serveUrl, frame: STILL_FRAME, inputProps, output: file, imageFormat: 'jpeg', jpegQuality: 92, ...browserOpts()});
    return file;
  };
  for (const [i, spec] of stories.entries()) out.stories.push(await one('Story', {spec}, path.join(outDir, `story${i + 1}.jpg`)));
  const slides = post?.slides || [];
  for (const [i, slide] of slides.entries()) out.post.push(await one('Post', {slide, index: i, total: slides.length}, path.join(outDir, `post${i + 1}.jpg`)));
  return out;
}
