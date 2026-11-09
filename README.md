# Falbek · reels automáticos (gratis)

Cada día, GitHub Actions: pide el guion a Make (Claude), genera la voz (Edge TTS), renderiza el vídeo con Remotion,
lo publica en GitHub Pages y avisa a Make para publicarlo en TikTok e Instagram (Zernio).

- `script/daily.mjs`: orquestador. `lib/pipeline.mjs`: voz, línea de tiempo, render, mezcla y verificación.
- `src/pro/*`: plantilla de motion graphics (11 tipos de escena). `tts/mix_pro.py`: audio.
- Secretos de Actions: MAKE_SCRIPT_URL, MAKE_PUBLISH_URL.
- Prueba manual: Actions > Reel diario > Run workflow (con `job_json` y `dry_run=1`).
