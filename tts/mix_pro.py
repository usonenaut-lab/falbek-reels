# Mezcla estilo profesional: voz en off continua + colchón musical suave (sin bombo) + whoosh sutil en cada corte.
# Uso: python3 mix_pro.py timeline.json voz.wav salida.mp3 [offset_voz_seg]
import numpy as np, soundfile as sf, json, subprocess, sys
tlp, vp, outp = sys.argv[1:4]; off = float(sys.argv[4]) if len(sys.argv) > 4 else 0.4
sr = 22050
tl = json.load(open(tlp)); T = tl['total'] / 30; n = int(T * sr)
rng = np.random.default_rng(7)
def sine(f, d): t = np.arange(int(d * sr)) / sr; return np.sin(2 * np.pi * f * t)
def env(x, a, r):
    k = len(x); e = np.ones(k); na = min(int(a * sr), k); nr = min(int(r * sr), k)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return x * e
def add(buf, x, t, g=1.0):
    i = int(t * sr); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf) and j > i: buf[i:j] += x[:j - i] * g
m = np.zeros(n); bar = 60 / 96 * 4
chords = [[110, 164.8, 220, 277.2], [87.3, 130.8, 174.6, 220], [98, 146.8, 196, 246.9], [110, 164.8, 220, 277.2]]
t = 0; i = 0
while t < T:
    d = min(bar * 1.1, T - t + 0.5)
    add(m, env(sum(sine(f, d) for f in chords[i % 4]) / 4, 0.9, 1.2), t, 0.5)
    for k, f in enumerate(chords[i % 4]):
        add(m, env(sine(f * 4, 0.6) * np.exp(-np.arange(int(0.6 * sr)) / sr * 5), 0.004, 0.2), t + k * bar / 4 * 1.0, 0.10)
    t += bar; i += 1
m *= np.clip(np.linspace(0, 1, n) * 6, 0, 1)
fd = int(2.2 * sr); m[-fd:] *= np.linspace(1, 0, fd)
m = m / (np.max(np.abs(m)) + 1e-9) * 0.8
def whoosh(d=0.55):
    x = rng.standard_normal(int(d * sr)); y = np.zeros_like(x); s = 0
    for k in range(len(x)):
        a = 0.03 + 0.35 * (k / len(x)); s += a * (x[k] - s); y[k] = s
    return y * np.sin(np.pi * np.linspace(0, 1, len(x))) ** 2 * 2.2
sfx = np.zeros(n)
for s in tl['scenes'][1:]: add(sfx, whoosh(), s['from'] / 30 - 0.30, 0.30)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', vp, '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', str(sr), '-ac', '1', '_voz_norm.wav'], check=True)
x, _ = sf.read('_voz_norm.wav'); v = np.zeros(n); add(v, x, off, 1.0)
ev = np.convolve(np.abs(v), np.ones(int(0.2 * sr)) / int(0.2 * sr), mode='same'); duck = 1 - 0.65 * np.clip(ev * 10, 0, 1)
mix = v + m * 0.20 * duck + sfx * 0.25
mix = mix / np.max(np.abs(mix)) * 0.92
sf.write('_mix.wav', mix, sr)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '_mix.wav', '-ar', '44100', '-b:a', '192k', outp], check=True)
print('ok', round(T, 1), 's')
