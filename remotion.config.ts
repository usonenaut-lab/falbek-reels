import {Config} from '@remotion/cli/config';
Config.setConcurrency(1);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setCodec('h264');
Config.setChromiumOpenGlRenderer('swangle');
