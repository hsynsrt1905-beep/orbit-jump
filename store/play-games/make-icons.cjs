// Google Play Games başarım simgeleri (512x512 PNG) — `node store/play-games/make-icons.cjs`
// Her rozet için koyu zemin, renkli halka ve ortada sembol/sayı.
const sharp = require('sharp');
const path = require('path');

const star = (cx, cy, r, fill) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
};
const gem = (cx, cy, s, fill) => `<polygon points="${cx},${cy - s} ${cx + s * 0.9},${cy - s * 0.25} ${cx},${cy + s} ${cx - s * 0.9},${cy - s * 0.25}" fill="${fill}"/><polygon points="${cx},${cy - s} ${cx + s * 0.9},${cy - s * 0.25} ${cx},${cy - s * 0.1} ${cx - s * 0.9},${cy - s * 0.25}" fill="#ffffff" opacity=".35"/>`;
const flame = (cx, cy, s, fill) => `<path d="M${cx} ${cy - s} C${cx + s * 0.9} ${cy - s * 0.2} ${cx + s * 0.75} ${cy + s * 0.85} ${cx} ${cy + s} C${cx - s * 0.75} ${cy + s * 0.85} ${cx - s * 0.9} ${cy - s * 0.2} ${cx} ${cy - s} Z" fill="${fill}"/><path d="M${cx} ${cy - s * 0.2} C${cx + s * 0.45} ${cy + s * 0.25} ${cx + s * 0.35} ${cy + s * 0.8} ${cx} ${cy + s * 0.85} C${cx - s * 0.35} ${cy + s * 0.8} ${cx - s * 0.45} ${cy + s * 0.25} ${cx} ${cy - s * 0.2} Z" fill="#fde047"/>`;
const text = (t, y, size, fill = '#ffffff') => `<text x="256" y="${y}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${size}" fill="${fill}" text-anchor="middle">${t}</text>`;
const planet = (fill) => `<circle cx="256" cy="250" r="95" fill="${fill}"/><ellipse cx="256" cy="250" rx="165" ry="42" fill="none" stroke="#ffffff" stroke-width="14" opacity=".85" transform="rotate(-18 256 250)"/>`;
const astronaut = `<g transform="translate(96 90) scale(10)"><rect x="0.8" y="11" width="3.2" height="10" rx="1.6" fill="#cbd5e1"/><rect x="28" y="11" width="3.2" height="10" rx="1.6" fill="#cbd5e1"/><circle cx="16" cy="16" r="14.2" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/><ellipse cx="16" cy="15" rx="9.5" ry="7.5" fill="#0e7490" stroke="#1e293b" stroke-width="1.2"/><path d="M10 12.5 Q13 9.5 17 10" stroke="#a5f3fc" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`;

const icons = [
  ['badge1', '#f59e0b', star(256, 256, 150, '#fde047')],
  ['badge2', '#06b6d4', planet('#0891b2') + text('10', 290, 120)],
  ['badge3', '#a855f7', gem(256, 256, 150, '#c084fc')],
  ['badge4', '#22d3ee', gem(256, 200, 90, '#67e8f9') + text('500', 400, 120)],
  ['badge5', '#f97316', text('25', 320, 200)],
  ['badge6', '#ef4444', text('50', 320, 200)],
  ['badge7', '#fb923c', flame(256, 220, 120, '#f97316') + text('×8', 420, 110)],
  ['badge8', '#eab308', star(256, 200, 100, '#fde047') + text('100', 410, 115)],
  ['badge9', '#10b981', `<polygon points="200,150 340,230 200,310" fill="#6ee7b7"/>` + text('50', 430, 120)],
  ['badge10', '#38bdf8', astronaut],
  ['badge11', '#facc15', text('LV', 230, 110, '#fde68a') + text('10', 390, 170)],
  ['badge12', '#f43f5e', flame(256, 230, 140, '#f43f5e') + text('7', 300, 120, '#1c1917')],
];

(async () => {
  for (const [id, ring, art] of icons) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <defs><radialGradient id="bg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#020617"/></radialGradient></defs>
      <rect width="512" height="512" fill="url(#bg)"/>
      <circle cx="256" cy="256" r="228" fill="none" stroke="${ring}" stroke-width="22"/>
      ${art}
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, `${id}.png`));
  }
  console.log('ok', icons.length);
})();
