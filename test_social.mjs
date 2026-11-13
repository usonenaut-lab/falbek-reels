import {renderSocial} from './lib/social.mjs';
const stories = [
  {type: 'story-hook', h: '¿Cuánto te cobran|por cada reserva?', sub: 'Mira lo que pasa con tus clientes', chips: [{text: 'Comisión', icon: 'card', tone: 'bad'}, {text: 'Sin datos', icon: 'users', tone: 'bad'}]},
  {type: 'story-tip', h: 'Reservas|*sin llamadas*', label: 'CONSEJO', items: [{icon: 'globe', title: 'Web propia', sub: 'Reservan a cualquier hora'}, {icon: 'bell', title: 'Recordatorio', sub: 'Menos plantones'}, {icon: 'card', title: 'Fianza opcional', sub: 'Cuando encaje'}]},
  {type: 'story-myth', h: 'Las plataformas|son gratis', sub: 'Cobran comisión por cada reserva que te traen.'},
  {type: 'story-question', h: '¿Cuántas llamadas|pierdes al día?', options: ['Ninguna', 'Unas cuantas'], label: 'PREGUNTA'},
  {type: 'story-cta', h: 'Tu web,|con tus reglas.', sub: 'Escríbenos por DM', url: 'falbek.com'},
];
const post = {slides: [
  {type: 'post-cover', h: '3 errores al|*reservar online*', sub: 'Y cómo evitarlos', label: 'GUÍA RÁPIDA', chips: [{text: 'Sin comisión', icon: 'check', tone: 'good'}]},
  {type: 'post-point', h: 'Depender de|*una plataforma*', sub: 'Tus clientes no son tuyos', items: [{icon: 'users', title: 'Sin datos del cliente', sub: 'No puedes volver a escribirle'}, {icon: 'card', title: 'Comisión por reserva', sub: 'Se come tu margen'}]},
  {type: 'post-compare', h: 'Plataforma|o *tu web*', left: {title: 'Plataforma', items: ['Comisión', 'Cliente ajeno', 'Sus reglas']}, right: {title: 'Tu web', items: ['0 % comisión', 'Cliente tuyo', 'Tus reglas']}},
  {type: 'post-cta', h: 'Tu web,|con tus reglas.', sub: 'Escríbenos por DM', url: 'falbek.com'},
]};
const r = await renderSocial({stories, post, outDir: 'out/social'});
console.log(JSON.stringify(r));
