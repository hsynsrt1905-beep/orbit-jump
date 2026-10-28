// Web oyun siteleri için kapaklar: itch.io 630x500, CrazyGames 1920x1080 / 800x1200 / 800x800
// Çıktı: store/web/covers/*.png
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'make-screens.cjs'), 'utf8');
const art = (id) => src.match(new RegExp(id + ": '([^']*)'"))[1];
const OUT = path.join(__dirname, '..', 'web', 'covers');
fs.mkdirSync(OUT, { recursive: true });
const skin = (id, cx, cy, s, rot = 0) => `<g transform="translate(${cx} ${cy}) rotate(${rot}) translate(${-s / 2} ${-s / 2}) scale(${s / 32})">${art(id)}</g>`;

function cover(W, H) {
  const u = Math.min(W, H) / 500; // ölçek birimi
  const portrait = W / H < 1.5; // kare ve dikeyde başlık üstte
  const pcx = portrait ? W * 0.45 : W * 0.33, pcy = portrait ? H * 0.7 : H * 0.6;
  const pr = (portrait ? 82 : 95) * u;
  const tx = portrait ? W / 2 : W * 0.68, ty = portrait ? H * 0.16 : H * 0.42;
  const anchor = 'middle';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#07041a"/><stop offset=".55" stop-color="#2a0f5e"/><stop offset="1" stop-color="#0b1a3d"/></linearGradient>
  <radialGradient id="p1" cx="35%" cy="30%"><stop offset="0" stop-color="#d4fbff"/><stop offset=".45" stop-color="#22d3ee"/><stop offset="1" stop-color="#083344"/></radialGradient>
  <radialGradient id="p2" cx="35%" cy="30%"><stop offset="0" stop-color="#ffd7ec"/><stop offset=".5" stop-color="#db2777"/><stop offset="1" stop-color="#3d0420"/></radialGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#22d3ee" stop-opacity=".4"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
  <linearGradient id="trail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f472b6" stop-opacity="0"/><stop offset="1" stop-color="#fde047"/></linearGradient>
  <linearGradient id="title" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#67e8f9"/><stop offset="1" stop-color="#fde047"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
${Array.from({ length: 80 }, (_, i) => `<circle cx="${(i * 233) % W}" cy="${(i * 97 + 13) % H}" r="${(1 + (i % 3) * 0.7) * u * 0.8}" fill="#fff" opacity="${0.25 + (i % 4) * 0.15}"/>`).join('')}
<circle cx="${pcx}" cy="${pcy}" r="${pr * 1.9}" fill="url(#glow)"/>
<ellipse cx="${pcx}" cy="${pcy}" rx="${pr * 1.8}" ry="${pr * 0.42}" fill="none" stroke="#a5f3fc" stroke-width="${9 * u}" opacity=".5" transform="rotate(-14 ${pcx} ${pcy})"/>
<circle cx="${pcx}" cy="${pcy}" r="${pr}" fill="url(#p1)"/>
<circle cx="${pcx - pr * 1.6}" cy="${pcy - pr * 1.5}" r="${pr * 0.32}" fill="url(#p2)"/>
<path d="M ${pcx + pr * 0.8} ${pcy - pr * 0.9} Q ${pcx + pr * 1.3} ${pcy - pr * 1.4} ${pcx + pr * 1.75} ${pcy - pr * 1.7}" fill="none" stroke="url(#trail)" stroke-width="${18 * u}" stroke-linecap="round"/>
${skin('astronaut', pcx + pr * 2.0, pcy - pr * 1.9, 70 * u, -22)}
${skin('rocket', pcx - pr * 1.5, pcy + pr * 1.1, 46 * u, -30)}${skin('ufo', pcx + pr * 1.7, pcy + pr * 0.9, 44 * u)}${skin('cat', pcx - pr * 0.2, pcy + pr * 1.6, 40 * u)}
<text x="${tx}" y="${ty}" text-anchor="${anchor}" font-family="Arial Black, Arial" font-weight="900" font-size="${Math.min((portrait ? 74 : 66) * u, (portrait ? W * 0.88 : W * 0.56) / 7.6)}" fill="url(#title)" letter-spacing="${2 * u}">ORBIT JUMP</text>
<text x="${tx}" y="${ty + 44 * u}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-weight="700" font-size="${26 * u}" fill="#e2e8f0">One tap. Endless planets.</text>
</svg>`;
}
(async () => {
  for (const [name, w, h] of [['itch-cover-630x500', 630, 500], ['cover-1920x1080', 1920, 1080], ['cover-800x1200', 800, 1200], ['cover-800x800', 800, 800]]) {
    await sharp(Buffer.from(cover(w, h))).png().toFile(path.join(OUT, name + '.png'));
  }
  console.log('ok', OUT);
})();
