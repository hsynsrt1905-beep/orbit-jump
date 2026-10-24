// Play Store görselleri: `node store/screens/make-screens.cjs`
// Çıktı: store/screens/out/{tr,en}/01..06.png (1080x1920) ve feature-graphic.png (1024x500)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, 'raw');
const OUT = path.join(__dirname, 'out');
const W = 1080, H = 1920;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Oyundaki karakter çizimleri (src/App.jsx SKIN_ART ile aynı)
const SKINS = {
  astronaut: '<rect x="0.8" y="11" width="3.2" height="10" rx="1.6" fill="#cbd5e1"/><rect x="28" y="11" width="3.2" height="10" rx="1.6" fill="#cbd5e1"/><circle cx="16" cy="16" r="14.2" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/><ellipse cx="16" cy="15" rx="9.5" ry="7.5" fill="#0e7490" stroke="#1e293b" stroke-width="1.2"/><path d="M10 12.5 Q13 9.5 17 10" stroke="#a5f3fc" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="21" cy="17.5" r="1.2" fill="#67e8f9"/><rect x="12" y="25" width="8" height="2.5" rx="1.2" fill="#f97316"/>',
  rocket: '<path d="M1 16 L8 12 L8 20 Z" fill="#f97316"/><path d="M4 16 L8 13.5 L8 18.5 Z" fill="#fde047"/><path d="M9 6.5 L14.5 11 L9 11 Z" fill="#dc2626"/><path d="M9 25.5 L14.5 21 L9 21 Z" fill="#dc2626"/><path d="M7 16 C7 11.5 12 9.5 19 9.5 C25 9.5 29 12.5 31 16 C29 19.5 25 22.5 19 22.5 C12 22.5 7 20.5 7 16 Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/><path d="M24 10.4 C27.5 11.5 30 13.5 31 16 C30 18.5 27.5 20.5 24 21.6 Z" fill="#ef4444"/><circle cx="17.5" cy="16" r="3.3" fill="#38bdf8" stroke="#1e40af" stroke-width="1.2"/><circle cx="16.6" cy="15" r="1" fill="#e0f2fe"/>',
  ufo: '<ellipse cx="16" cy="13.5" rx="7" ry="6.5" fill="#a5f3fc" stroke="#0891b2" stroke-width="1"/><path d="M12.5 11 Q14.5 9 17 9.5" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/><ellipse cx="16" cy="18.5" rx="15" ry="5.5" fill="#7c3aed"/><ellipse cx="16" cy="17.2" rx="14" ry="3.6" fill="#a78bfa"/><circle cx="8" cy="19.6" r="1.3" fill="#fde047"/><circle cx="16" cy="20.6" r="1.3" fill="#fde047"/><circle cx="24" cy="19.6" r="1.3" fill="#fde047"/>',
  alien: '<path d="M16 2.5 C25 2.5 29.5 9 29.5 14.5 C29.5 22.5 22.5 29.5 16 29.5 C9.5 29.5 2.5 22.5 2.5 14.5 C2.5 9 7 2.5 16 2.5 Z" fill="#4ade80" stroke="#15803d" stroke-width="1.2"/><ellipse cx="10.5" cy="15.5" rx="4.6" ry="2.8" transform="rotate(28 10.5 15.5)" fill="#052e16"/><ellipse cx="21.5" cy="15.5" rx="4.6" ry="2.8" transform="rotate(-28 21.5 15.5)" fill="#052e16"/><circle cx="9.3" cy="14.4" r="1" fill="#fff"/><circle cx="20.3" cy="14.4" r="1" fill="#fff"/><path d="M13.5 23 Q16 24.5 18.5 23" stroke="#14532d" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  robot: '<line x1="16" y1="7" x2="16" y2="3" stroke="#64748b" stroke-width="1.6"/><circle cx="16" cy="2.6" r="2" fill="#f87171"/><rect x="1" y="13" width="2.5" height="7" rx="1" fill="#94a3b8"/><rect x="28.5" y="13" width="2.5" height="7" rx="1" fill="#94a3b8"/><rect x="3.5" y="7" width="25" height="20" rx="5" fill="#cbd5e1" stroke="#64748b" stroke-width="1.2"/><rect x="7" y="11" width="18" height="11" rx="3" fill="#0f172a"/><circle cx="12" cy="16.5" r="2.3" fill="#22d3ee"/><circle cx="20" cy="16.5" r="2.3" fill="#22d3ee"/>',
  cat: '<path d="M8.5 11 L9.5 4.5 L14 9 Z" fill="#fb923c"/><path d="M23.5 11 L22.5 4.5 L18 9 Z" fill="#fb923c"/><circle cx="16" cy="17" r="10" fill="#fb923c"/><ellipse cx="12.3" cy="16" rx="1.6" ry="2.2" fill="#1c1917"/><ellipse cx="19.7" cy="16" rx="1.6" ry="2.2" fill="#1c1917"/><path d="M15 19.5 L17 19.5 L16 20.8 Z" fill="#f472b6"/><path d="M16 20.8 Q14.5 22.5 13 21.5 M16 20.8 Q17.5 22.5 19 21.5" stroke="#7c2d12" stroke-width="0.9" fill="none" stroke-linecap="round"/><circle cx="16" cy="16" r="14.8" fill="#bae6fd" fill-opacity="0.18" stroke="#e2e8f0" stroke-width="1.6"/><path d="M7 10 Q10 6 14 5.5" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.8"/>',
  meteor: '<path d="M11 8 Q0 16 11 25 Q5 16 11 8 Z" fill="#f97316"/><path d="M12 11 Q5 16 12 22 Q9 16 12 11 Z" fill="#fde047"/><path d="M13 6 L22 4.5 L29 10 L30 19 L24 27.5 L14 27 L8.5 20 L9 11.5 Z" fill="#a8a29e" stroke="#57534e" stroke-width="1.2"/><circle cx="20" cy="11" r="2.4" fill="#78716c"/><circle cx="24.5" cy="19" r="3" fill="#78716c"/><circle cx="15.5" cy="20" r="1.8" fill="#78716c"/>',
};
const GLOW = { astronaut: '#67e8f9', rocket: '#f97316', ufo: '#a78bfa', alien: '#4ade80', robot: '#22d3ee', cat: '#fb923c', meteor: '#fbbf24' };
const skin = (id, x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / 32})">${SKINS[id]}</g>`;
const glowDot = (id, cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#g-${id})"/>`;
const glowDefs = Object.entries(GLOW).map(([id, c]) => `<radialGradient id="g-${id}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('');

const bg = (accent) => `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0726"/><stop offset=".55" stop-color="#1e0f45"/><stop offset="1" stop-color="#04020f"/></linearGradient>
  <radialGradient id="acc" cx="50%" cy="22%" r="60%"><stop offset="0" stop-color="${accent}" stop-opacity=".45"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  ${glowDefs}
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#acc)"/>
${Array.from({ length: 70 }, (_, i) => `<circle cx="${(i * 157) % W}" cy="${(i * 263) % H}" r="${1 + (i % 3) * 0.6}" fill="#fff" opacity="${0.25 + (i % 4) * 0.15}"/>`).join('')}`;

const caption = (title, sub, accent) => `
  <text x="540" y="170" font-family="Arial Black, Arial" font-weight="900" font-size="${Math.min(84, Math.floor(980 / (0.7 * title.length)))}" fill="#ffffff" text-anchor="middle">${esc(title)}</text>
  <text x="540" y="250" font-family="Arial, sans-serif" font-weight="700" font-size="44" fill="${accent}" text-anchor="middle">${esc(sub)}</text>`;

// Telefon ekran görüntüsünü yuvarlatılmış çerçeveye koyar
async function phoneShot(file, crop) {
  const fw = 760, fh = 1560;
  let img = sharp(path.join(RAW, file));
  if (crop) img = img.extract(crop);
  const inner = await img.resize(fw - 24, fh - 24, { fit: 'cover', position: 'top' }).png().toBuffer();
  const mask = Buffer.from(`<svg width="${fw - 24}" height="${fh - 24}"><rect width="100%" height="100%" rx="44" fill="#fff"/></svg>`);
  const rounded = await sharp(inner).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const frame = Buffer.from(`<svg width="${fw}" height="${fh}"><rect x="2" y="2" width="${fw - 4}" height="${fh - 4}" rx="54" fill="#0f172a" stroke="#475569" stroke-width="4"/></svg>`);
  return sharp(frame).composite([{ input: rounded, left: 12, top: 12 }]).png().toBuffer();
}

async function shotSlide(out, file, crop, title, sub, accent) {
  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${bg(accent)}${caption(title, sub, accent)}</svg>`);
  const phone = await phoneShot(file, crop);
  await sharp(base).composite([{ input: phone, left: (W - 760) / 2, top: 320 }]).png().toFile(out);
}

async function charactersSlide(out, title, sub, names) {
  const ids = Object.keys(SKINS);
  const pos = [[540, 620, 300], [250, 980, 220], [830, 980, 220], [250, 1330, 220], [830, 1330, 220], [380, 1680, 200], [700, 1680, 200]];
  const order = ['astronaut', 'rocket', 'ufo', 'alien', 'robot', 'cat', 'meteor'];
  const art = order.map((id, i) => {
    const [cx, cy, s] = pos[i];
    return `${glowDot(id, cx, cy, s * 0.95)}${skin(id, cx - s / 2, cy - s / 2, s)}<text x="${cx}" y="${cy + s / 2 + 52}" font-family="Arial, sans-serif" font-weight="700" font-size="38" fill="#e2e8f0" text-anchor="middle">${esc(names[ids.indexOf(id)])}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${bg('#a855f7')}${caption(title, sub, '#c4b5fd')}${art}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(out);
}

async function badgesSlide(out, title, sub) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${bg('#f59e0b')}${caption(title, sub, '#fcd34d')}</svg>`;
  const tiles = [];
  for (let i = 0; i < 12; i++) {
    const b = await sharp(path.join(__dirname, '..', 'play-games', `badge${i + 1}.png`)).resize(260, 260).png().toBuffer();
    tiles.push({ input: b, left: 75 + (i % 3) * 320, top: 360 + Math.floor(i / 3) * 360 });
  }
  await sharp(Buffer.from(svg)).composite(tiles).png().toFile(out);
}

async function featureGraphic(out) {
  const fw = 1024, fh = 500;
  const planets = `
    <circle cx="880" cy="150" r="110" fill="url(#p1)"/><ellipse cx="880" cy="150" rx="185" ry="40" fill="none" stroke="#f9a8d4" stroke-width="7" opacity=".8" transform="rotate(-16 880 150)"/>
    <circle cx="170" cy="400" r="80" fill="url(#p2)"/><circle cx="960" cy="430" r="45" fill="url(#p3)"/><circle cx="90" cy="90" r="34" fill="url(#p4)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${fw}" height="${fh}"><defs>
    <linearGradient id="fbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b0726"/><stop offset=".6" stop-color="#2e1065"/><stop offset="1" stop-color="#04020f"/></linearGradient>
    <radialGradient id="p1" cx="35%" cy="30%"><stop offset="0" stop-color="#ffd7ec"/><stop offset=".5" stop-color="#db2777"/><stop offset="1" stop-color="#3d0420"/></radialGradient>
    <radialGradient id="p2" cx="35%" cy="30%"><stop offset="0" stop-color="#cfe8ff"/><stop offset=".5" stop-color="#2563eb"/><stop offset="1" stop-color="#071a44"/></radialGradient>
    <radialGradient id="p3" cx="35%" cy="30%"><stop offset="0" stop-color="#fff7d6"/><stop offset=".5" stop-color="#eab308"/><stop offset="1" stop-color="#422006"/></radialGradient>
    <radialGradient id="p4" cx="35%" cy="30%"><stop offset="0" stop-color="#ecfccb"/><stop offset=".5" stop-color="#65a30d"/><stop offset="1" stop-color="#142305"/></radialGradient>
    ${glowDefs}</defs>
    <rect width="${fw}" height="${fh}" fill="url(#fbg)"/>
    ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 97) % fw}" cy="${(i * 53) % fh}" r="${1 + (i % 3) * 0.5}" fill="#fff" opacity=".5"/>`).join('')}
    ${planets}
    <text x="512" y="205" font-family="Arial Black, Arial" font-weight="900" font-size="104" fill="#ffffff" text-anchor="middle" letter-spacing="4">ORBIT JUMP</text>
    <text x="512" y="262" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#67e8f9" text-anchor="middle">One tap. Endless planets.</text>
    ${['rocket', 'ufo', 'astronaut', 'alien', 'cat'].map((id, i) => { const cx = 312 + i * 100, cy = 375, s = i === 2 ? 110 : 82; return `${glowDot(id, cx, cy, s)}${skin(id, cx - s / 2, cy - s / 2, s)}`; }).join('')}
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(out);
}

const TEXT = {
  tr: {
    s1: ['Tek dokunuşla zıpla', 'Gezegenden gezegene uç, rekoru kır'],
    s2: ['Mükemmel iniş = kombo', 'Kenara yakın in, puanını katla'],
    s3: ['10 farklı gezegen', 'Her tur yepyeni bir evren'],
    s4: ['7 karakter', 'Topla, geliştir, parlat'],
    s5: ['12 rozet', '+ Google Play başarımları'],
    s6: ['Arkadaşına meydan oku', 'Aynı haritada skorunu geçebilir mi?'],
    names: ['Astronot', 'Roket', 'UFO', 'Uzaylı', 'Robot', 'Uzay Kedisi', 'Meteor'],
  },
  en: {
    s1: ['One tap to jump', 'Hop planet to planet, beat your record'],
    s2: ['Perfect landing = combo', 'Land near the edge to multiply points'],
    s3: ['10 unique planets', 'A brand-new universe every run'],
    s4: ['7 characters', 'Collect them, upgrade them'],
    s5: ['12 badges', '+ Google Play achievements'],
    s6: ['Challenge your friends', 'Can they beat you on the same map?'],
    names: ['Astronaut', 'Rocket', 'UFO', 'Alien', 'Robot', 'Space Cat', 'Meteor'],
  },
};

(async () => {
  for (const lang of Object.keys(TEXT)) {
    const t = TEXT[lang];
    const dir = path.join(OUT, lang);
    fs.mkdirSync(dir, { recursive: true });
    await shotSlide(path.join(dir, '01.png'), 'burst/g10.png', null, ...t.s1, '#22d3ee');
    await shotSlide(path.join(dir, '02.png'), 'burst/g07.png', null, ...t.s2, '#38bdf8');
    await shotSlide(path.join(dir, '03.png'), 'burst/g13.png', null, ...t.s3, '#f472b6');
    await charactersSlide(path.join(dir, '04.png'), ...t.s4, t.names);
    await badgesSlide(path.join(dir, '05.png'), ...t.s5);
    await shotSlide(path.join(dir, '06.png'), 'burst/g09.png', null, ...t.s6, '#fb923c');
  }
  await featureGraphic(path.join(OUT, 'feature-graphic.png'));
  console.log('ok');
})();
