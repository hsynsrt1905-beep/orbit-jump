// Not: puppeteer-core ve ffmpeg-static gerekir (npm i -D puppeteer-core ffmpeg-static veya ayrı klasörde). Dev sunucu: npm run dev (localhost:5173).
// Akıcı kayıt için adımda "record" yerine "det": <ms> kullan (sanal saatle kare kare, kare düşmez).
// Oyunun dev sürümünü (?autoplay) Chrome'da açıp CDP screencast ile kaydeder.
// node rec.cjs <cfg.json>
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { execFileSync } = require('child_process');
const FF = require('ffmpeg-static');

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const W = 432, H = 936, DPR = 2.5;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(page, re) {
  return page.evaluate((src) => {
    const rx = new RegExp(src, 'i');
    const els = [...document.querySelectorAll('button, [role=button], div, span')].filter((e) => rx.test(e.innerText || '') && e.offsetParent);
    els.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
    const el = els[0];
    if (!el) return false;
    (el.closest('button') || el).click();
    return true;
  }, re.source);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument(() => { setInterval(() => { document.querySelectorAll('button, a').forEach((b) => { if (/google play/i.test(b.innerText || '')) { b.style.display = 'none'; const n = b.nextElementSibling; if (n && !n.querySelector('button') && (n.innerText || '').length < 90) n.style.display = 'none'; } }); }, 150); });
  // Sanal saat: requestAnimationFrame ve performance.now kayıt sırasında elle ilerletilir.
  await page.evaluateOnNewDocument(() => {
    const realRAF = window.requestAnimationFrame.bind(window);
    const realCAF = window.cancelAnimationFrame.bind(window);
    const realNow = performance.now.bind(performance);
    const vt = { on: false, t: 0, id: 1e6, q: [] };
    window.__vt = vt;
    performance.now = () => (vt.on ? vt.t : realNow());
    window.requestAnimationFrame = (cb) => { if (!vt.on) return realRAF(cb); const id = ++vt.id; vt.q.push([id, cb]); return id; };
    window.cancelAnimationFrame = (id) => { if (id > 1e6) vt.q = vt.q.filter((x) => x[0] !== id); else realCAF(id); };
    vt.start = () => { vt.t = realNow(); vt.on = true; };
    vt.step = (dt) => { vt.t += dt; const q = vt.q; vt.q = []; for (const [, cb] of q) { try { cb(vt.t); } catch (e) { console.error(e); } } };
  });
  const url = `http://localhost:5173/?autoplay=${cfg.tol || 3}`;
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.evaluate((c) => {
    localStorage.clear();
    localStorage.setItem('orbitJumpLang', c.lang);
    localStorage.setItem('orbit_player_name', c.name || 'Nova');
    localStorage.setItem('orbit_highscore', String(c.best || 42));
    localStorage.setItem('orbit_owned_items', JSON.stringify(['astronaut', 'rocket', 'ufo', 'alien', 'robot', 'cat', 'meteor', 'trail_gold', 'trail_fire', 'trail_cyan', 'bg_nebula', 'bg_void', 'bg_solar', 'bg_galactic', 'trail_rainbow', 'trail_star', 'trail_pixel', 'bg_aurora', 'bg_blackhole']));
    localStorage.setItem('orbit_ball_levels', JSON.stringify({ astronaut: 3, rocket: 3, ufo: 2, alien: 2, robot: 2, cat: 3, meteor: 2 }));
    localStorage.setItem('orbit_selected_skin', JSON.stringify(c.skin || 'astronaut'));
    localStorage.setItem('orbit_selected_trail', JSON.stringify(c.trail || 'trail_cyan'));
    localStorage.setItem('orbit_selected_theme', JSON.stringify(c.theme || 'bg_nebula'));
    localStorage.setItem('orbit_sound', 'false'); if (c.ls) for (const k in c.ls) localStorage.setItem(k, JSON.stringify(c.ls[k]));
  }, cfg);
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2500);

  const outDir = path.resolve(cfg.out);
  fs.mkdirSync(outDir, { recursive: true });

  for (const step of cfg.steps) {
    if (step.click) { const ok = await clickText(page, new RegExp(step.click)); if (!ok) console.log('click miss', step.click); }
    if (step.eval) await page.evaluate(step.eval);
    if (step.wait) await sleep(step.wait);
    if (step.shot) await page.screenshot({ path: path.join(outDir, step.shot) });
    if (step.det) {
      // Kare kare kayıt: her karede sanal saati 1/30 sn ilerlet, ekran görüntüsü al.
      const fdir = path.join(outDir, 'frames_' + step.name);
      fs.rmSync(fdir, { recursive: true, force: true }); fs.mkdirSync(fdir);
      const client = await page.createCDPSession();
      await page.evaluate(() => window.__vt.start());
      const n = Math.round(step.det / 1000 * 30);
      let t0 = Date.now();
      for (let i = 0; i < n; i++) {
        const ms = i * 1000 / 30;
        if (step.clicks) for (const k of step.clicks) if (!k.done && ms >= k.at) { k.done = true; await page.evaluate((tx) => { const b = [...document.querySelectorAll('button')].find((x) => (x.innerText || '').includes(tx)); if (b) b.click(); }, k.text); }
        await page.evaluate(() => window.__vt.step(1000 / 30));
        await new Promise((r) => setTimeout(r, 0));
        if (i === 10) { const real = (Date.now() - t0) / 10; await client.send('Animation.setPlaybackRate', { playbackRate: Math.min(1, (1000 / 30) / real) }).catch(() => {}); }
        await page.screenshot({ path: path.join(fdir, 'f' + String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 90 });
      }
      execFileSync(FF, ['-y', '-framerate', '30', '-i', 'f%05d.jpg', '-vf', 'scale=1080:-2,format=yuv420p', '-c:v', 'libx264', '-crf', '18', path.join(outDir, step.name + '.mp4')], { cwd: fdir, stdio: 'ignore' });
      console.log('recorded(det)', step.name, n, 'frames', ((Date.now() - t0) / 1000).toFixed(1) + 's');
    }
    if (step.record) {
      const frames = [];
      const client = await page.createCDPSession();
      client.on('Page.screencastFrame', async (f) => {
        frames.push({ t: f.metadata.timestamp, data: f.data });
        client.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
      });
      await client.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: W * DPR, maxHeight: H * DPR, everyNthFrame: 1 });
      const t0 = Date.now();
      while (Date.now() - t0 < step.record) {
        if (step.burst && Date.now() - t0 < (step.burstUntil||1e9)) { const fl = await page.evaluate(() => window.__orbitPhys && window.__orbitPhys.current.isFlying); if (fl !== step._fl) { step._fl = fl; await sleep(fl ? 110 : 60); const n = (fl ? 'fly' : 'land') + String(Date.now() - t0).padStart(6, '0') + '.png'; await page.screenshot({ path: path.join(outDir, 'burst_' + step.name + '_' + n) }); } }
        if (step.stopAt && Date.now() - t0 > step.stopAt) await page.evaluate(() => { window.__orbitAutoplay.current = 0; });
        if (step.clicks) for (const k of step.clicks) if (!k.done && Date.now() - t0 > k.at) { k.done = true; await page.evaluate((tx) => { const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").includes(tx)); if (b) b.click(); }, k.text); }
        if (step.shots) for (const s of step.shots) if (!s.done && Date.now() - t0 > s.at) { s.done = true; await page.screenshot({ path: path.join(outDir, s.name) }); }
        await sleep(15);
      }
      await client.send('Page.stopScreencast');
      const fdir = path.join(outDir, 'frames_' + step.name);
      fs.rmSync(fdir, { recursive: true, force: true }); fs.mkdirSync(fdir);
      let list = '';
      frames.forEach((f, i) => {
        const fn = `f${String(i).padStart(5, '0')}.jpg`;
        fs.writeFileSync(path.join(fdir, fn), Buffer.from(f.data, 'base64'));
        const dur = i + 1 < frames.length ? frames[i + 1].t - f.t : 0.033;
        list += `file '${fn}'\nduration ${dur.toFixed(4)}\n`;
      });
      fs.writeFileSync(path.join(fdir, 'list.txt'), list);
      execFileSync(FF, ['-y', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-vf', 'fps=30,scale=1080:-2,format=yuv420p', '-c:v', 'libx264', '-crf', '18', path.join(outDir, step.name + '.mp4')], { cwd: fdir, stdio: 'ignore' });
      console.log('recorded', step.name, frames.length, 'frames');
    }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
