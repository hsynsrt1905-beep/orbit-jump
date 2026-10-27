// Uygulama ikonu (1024x1024): halkalı gezegen + yörüngede izli astronot
// Çıktı: store/icon/icon-1024.png, icon-512.png (Play), foreground-1024.png (adaptif ikon ön yüzü)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'make-screens.cjs'), 'utf8');
const astro = src.match(/astronaut: '([^']*)'/)[1];
const OUT = path.join(__dirname, '..', 'icon');
fs.mkdirSync(OUT, { recursive: true });

const defs = `<defs>
  <radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#3b1a78"/><stop offset=".55" stop-color="#1a0b3d"/><stop offset="1" stop-color="#07041a"/></radialGradient>
  <radialGradient id="pl" cx="34%" cy="30%" r="75%"><stop offset="0" stop-color="#d4fbff"/><stop offset=".35" stop-color="#22d3ee"/><stop offset=".75" stop-color="#0e7490"/><stop offset="1" stop-color="#083344"/></radialGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#22d3ee" stop-opacity=".55"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
  <radialGradient id="ag"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".4" stop-color="#67e8f9" stop-opacity=".55"/><stop offset="1" stop-color="#67e8f9" stop-opacity="0"/></radialGradient>
  <linearGradient id="trail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f472b6" stop-opacity="0"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".7"/><stop offset="1" stop-color="#fde047"/></linearGradient>
</defs>`;
const stars = Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 389) % 1024}" cy="${(i * 211 + 70) % 1024}" r="${2 + (i % 3) * 1.6}" fill="#fff" opacity="${0.35 + (i % 4) * 0.15}"/>`).join('');
// Gezegen biraz sola-aşağı, astronot sağ üstte yörüngeden fırlıyor
const scene = (withBg) => `
  ${withBg ? `<rect width="1024" height="1024" fill="url(#bg)"/>${stars}` : ''}
  <circle cx="440" cy="600" r="340" fill="url(#glow)"/>
  <g transform="rotate(-18 440 600)"><ellipse cx="440" cy="600" rx="350" ry="96" fill="none" stroke="#a5f3fc" stroke-width="24" opacity=".5"/></g>
  <circle cx="440" cy="600" r="215" fill="url(#pl)"/>
  <clipPath id="front"><rect x="-200" y="600" width="1400" height="600"/></clipPath>
  <g transform="rotate(-18 440 600)"><ellipse cx="440" cy="600" rx="350" ry="96" fill="none" stroke="#e0f2fe" stroke-width="24" clip-path="url(#front)"/></g>
  <path d="M 545 395 Q 640 320 720 262" fill="none" stroke="url(#trail)" stroke-width="58" stroke-linecap="round"/>
  <circle cx="770" cy="228" r="175" fill="url(#ag)"/>
  <g transform="translate(770 228) rotate(-24) translate(-140 -140) scale(${280 / 32})">${astro}</g>`;
const svg = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${defs}${scene(bg)}</svg>`;
(async () => {
  await sharp(Buffer.from(svg(true))).png().toFile(path.join(OUT, 'icon-1024.png'));
  await sharp(Buffer.from(svg(true))).resize(512, 512).png().toFile(path.join(OUT, 'icon-512.png'));
  // Adaptif ikon: içerik ortadaki %66'lık güvenli alana sığsın
  const fg = await sharp(Buffer.from(svg(false))).resize(676, 676).png().toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: fg, left: 174, top: 174 }]).png().toFile(path.join(OUT, 'foreground-1024.png'));
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${defs}<rect width="1024" height="1024" fill="url(#bg)"/>${stars}</svg>`)).png().toFile(path.join(OUT, 'background-1024.png'));
  console.log('ok');
})();
