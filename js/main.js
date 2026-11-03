/* Redirect link per wheel sector (keyed by sector id). click_id is fixed. */
const CONFIG = {
  links: {
    slot200: 'https://moldspot.site/?click_id=btag2059_dass_ggds_dsaa',
    s7777:   'https://7777.md/?click_id=btag2059_dass_ggds_dsaa',
    xbet150: 'https://1xbet.com/?click_id=btag2059_dass_ggds_dsaa',
    xbet120: 'https://1xbet.com/?click_id=btag2059_dass_ggds_dsaa'
  }
};

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* i18n                                                                */
  /* ------------------------------------------------------------------ */
  const I18N = {
    ro: {
      title: 'Până la 200% bonus + 300 rotiri gratis',
      offerPrefix: 'PÂNĂ LA',
      offerWord: 'BONUS',
      offerPlate: '+ 300 ROTIRI GRATIS',
      spin: 'SPIN',
      popTitle: 'Felicitări! Ai câștigat',
      popPrefix: 'Până la',
      expires: 'Oferta expiră în:',
      min: 'min',
      sec: 'sec',
      cta: 'Vreau Rotirile',
      ctaShort: 'Vreau Rotirile',
      close: 'Închide',
      mute: 'Oprește sunetul',
      langGroup: 'Limba'
    },
    ru: {
      title: 'Бонус до 200% + 300 фриспинов',
      offerPrefix: 'БОНУС ДО',
      offerWord: '',
      offerPlate: '+ 300 ФРИСПИНОВ',
      spin: 'Крутить',
      popTitle: 'Поздравляем, вы выиграли',
      popPrefix: 'Бонус до',
      expires: 'Предложение истекает через:',
      min: 'мин',
      sec: 'сек',
      cta: 'Забрать Фриспины',
      ctaShort: 'Забрать ФС',
      close: 'Закрыть',
      mute: 'Выключить звук',
      langGroup: 'Язык'
    }
  };

  /* ------------------------------------------------------------------ */
  /* Storage (safe)                                                      */
  /* ------------------------------------------------------------------ */
  const KEY_SPIN = 'xlw_spin', KEY_LANG = 'xlw_lang', KEY_MUTE = 'xlw_muted';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Language                                                            */
  /* ------------------------------------------------------------------ */
  let lang = store.get(KEY_LANG);
  if (lang !== 'ro' && lang !== 'ru') {
    lang = /^ru/i.test(navigator.language || '') ? 'ru' : 'ro';
  }

  function applyLang(l) {
    lang = l;
    const t = I18N[l];
    root.lang = l;
    document.title = t.title;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t[el.dataset.i18nAria]); });
    document.querySelectorAll('.lang-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    renderPrize();
  }

  // Popup prize text for the sector the wheel landed on.
  function renderPrize() {
    const sec = currentSector || SECTORS[0];
    $('popBig').textContent = sec.pct;
    $('popSub').textContent = sec.sub[lang];
  }

  // Same-tab redirect to the landed sector's link. xlwOnNavigate lets tests capture the URL.
  function goToSector() {
    const sec = currentSector || SECTORS[0];
    const url = CONFIG.links[sec.id];
    if (typeof window.xlwOnNavigate === 'function') { window.xlwOnNavigate(url); return; }
    window.location.href = url;
  }

  /* ------------------------------------------------------------------ */
  /* Fluid scale: --s (wheel, number) and --u (offer, length)            */
  /* ------------------------------------------------------------------ */
  function fit() {
    const w = window.innerWidth, h = window.innerHeight;
    let s, u;
    if (w <= 768) {
      const k = w / 390;                    // Figma mobile frame = 390 wide
      s = Math.min(340 / 566 * k, 0.9);     // wheel 340px at 390
      u = Math.min(0.5181 * k, 0.85);       // offer 67.3px "200%" at 390
    } else {
      s = Math.max(0.5, Math.min(1, h / 1080, (w - 40) / 700)); // Figma desktop = 1920x1080
      u = s;
    }
    root.style.setProperty('--u', u.toFixed(4) + 'px');
    if (w <= 768) {
      // keep the SPIN button inside the first screen on tall tablets (e.g. 768x1024)
      const offerBottom = document.querySelector('.offer').getBoundingClientRect().bottom + window.scrollY;
      const gap = 25 * u / 0.5181;
      const fitH = (h - offerBottom - gap - 16) / 727;
      s = Math.max(0.45, Math.min(s, fitH));
    }
    root.style.setProperty('--s', s.toFixed(4));
  }

  /* ------------------------------------------------------------------ */
  /* Bulbs (positions from Figma desktop)                                */
  /* ------------------------------------------------------------------ */
  function buildBulbs() {
    const frag = document.createDocumentFragment();
    const cx = 283.5, cy = 283.5, r = 245.5;
    for (let i = 0; i < 32; i++) {
      const a = (i * 11.25 - 90) * Math.PI / 180;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      const big = i % 2 === 0;
      const size = big ? 35 : 7;
      const img = document.createElement('img');
      img.src = big ? 'assets/bulb-big.svg' : 'assets/bulb-small.svg';
      img.alt = '';
      img.className = 'bulb' + (big ? '' : ' alt');
      img.style.cssText = `left:${(x - size / 2).toFixed(2)}px;top:${(y - size / 2).toFixed(2)}px;width:${size}px;height:${size}px`;
      frag.appendChild(img);
    }
    $('bulbs').appendChild(frag);

    // SPIN button rim bulbs: [left, top, big?] from Figma 1:3329..1:3346
    const sb = [[119,10,1],[191,11,0],[261,10,1],[334,11,0],[403,10,1],[476,11,0],[534,35,1],[552,99,0],
      [511,148,1],[445,157,0],[372,156,1],[302,157,0],[230,156,1],[160,157,0],[87,156,1],[29,132,0],[11,68,1],[52,19,0]];
    const f2 = document.createDocumentFragment();
    sb.forEach(([l, t, big]) => {
      const img = document.createElement('img');
      img.src = big ? 'assets/btn-bulb-big.svg' : 'assets/btn-bulb-small.svg';
      img.alt = '';
      img.className = 'abs bulb' + (big ? '' : ' alt');
      img.style.cssText = big
        ? `left:${l - 12}px;top:${t - 12}px;width:34px;height:34px`
        : `left:${l}px;top:${t}px;width:7px;height:7px`;
      f2.appendChild(img);
    });
    $('spinBulbs').appendChild(f2);
  }

  /* ------------------------------------------------------------------ */
  /* Wheel model                                                         */
  /* Sector centres, clockwise from the pointer (top) at rotation 0.     */
  /* ------------------------------------------------------------------ */
  const SECTORS = [
    { id: 'slot200',  name: 'SLOT 200%',   center: 0,   weight: 80, pct: '200%',
      sub: { ro: 'bonus + 300 Rotiri Gratis', ru: '+ 300 фриспинов' } },
    { id: 'xbet120',  name: '1xBet 120%',  center: 90,  weight: 5,  pct: '120%',
      sub: { ro: 'bonus + 150 Rotiri Gratis', ru: '+ 150 фриспинов' } },
    { id: 's7777',    name: '7777 175%',   center: 180, weight: 10, pct: '175%',
      sub: { ro: 'bonus + 200 Rotiri Gratis', ru: '+ 200 фриспинов' } },
    { id: 'xbet150',  name: '1xBet 150%',  center: 270, weight: 5,  pct: '150%',
      sub: { ro: 'bonus + 200 Rotiri Gratis', ru: '+ 200 фриспинов' } }
  ];
  let currentSector = null;   // sector the wheel landed on (set after spin / restored on reload)
  let forcedId = null;        // test hook: xlwForce(id) makes the next spin land on that sector
  const HALF = 45;         // each sector is 90°

  function pickSector(rand = Math.random) {
    const total = SECTORS.reduce((a, s) => a + s.weight, 0);
    let x = rand() * total;
    for (const s of SECTORS) { if ((x -= s.weight) < 0) return s; }
    return SECTORS[0];
  }

  // Which sector is under the pointer for a clockwise rotation `deg`.
  function sectorAt(deg) {
    const a = (((-deg) % 360) + 360) % 360;            // wheel angle now at the top
    return SECTORS.find((s) => {
      const d = Math.abs(((a - s.center + 540) % 360) - 180);
      return d < HALF;
    });
  }

  // Rotation (mod 360) that puts the sector's exact centre under the pointer.
  const centeredAngle = (sector) => (360 - sector.center) % 360;

  function targetAngle(current, sector, turns) {
    const base = current - (((current % 360) + 360) % 360);          // floor to full turn
    return base + turns * 360 + centeredAngle(sector);
  }

  /* ------------------------------------------------------------------ */
  /* Audio (Web Audio API, starts on user gesture)                       */
  /* ------------------------------------------------------------------ */
  let actx = null;
  let muted = store.get(KEY_MUTE) === '1';
  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(freq, start, dur, type, vol) {
    const ctx = actx; if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(ctx.destination);
    o.start(start); o.stop(start + dur + 0.02);
  }
  function playTick() {
    if (muted || !actx) return;
    const t = actx.currentTime;
    tone(1500, t, 0.045, 'square', 0.06);
    tone(700, t, 0.03, 'triangle', 0.08);
  }
  function playWin() {
    if (muted || !actx) return;
    const t = actx.currentTime + 0.02;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.11, 0.3, 'triangle', 0.18));
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, t + 0.48, 0.9, 'sine', 0.09));
  }

  /* ------------------------------------------------------------------ */
  /* Confetti (canvas, no library)                                       */
  /* ------------------------------------------------------------------ */
  function confetti() {
    const cv = $('confetti'), ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ['#36bcff', '#1a8cff', '#ffffff', '#7fd3ff', '#ffd84d', '#0b6bdb', '#e3f2ff'];
    const rect = $('wheel').getBoundingClientRect();
    const ox = rect.left + rect.width / 2, oy = rect.top + rect.height * 0.35;
    const N = W < 600 ? 110 : 180;
    const parts = [];
    for (let i = 0; i < N; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const v = 7 + Math.random() * 9;
      parts.push({
        x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.35,
        c: colors[(Math.random() * colors.length) | 0], life: 0
      });
    }
    const t0 = performance.now(), DUR = 3600;
    (function frame(now) {
      const el = now - t0;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += 0.28; p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - el / DUR);
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2 * Math.abs(Math.cos(p.r * 2)), p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 1);
        ctx.restore();
      });
      if (el < DUR) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    })(t0);
  }

  /* ------------------------------------------------------------------ */
  /* Spin                                                                */
  /* ------------------------------------------------------------------ */
  const rotor = $('rotor'), wheelEl = $('wheel'), spinBtn = $('spinBtn');
  let rotation = 0, spinning = false;

  function setRotation(deg) { rotation = deg; rotor.style.transform = `rotate(${deg}deg)`; }

  function spin() {
    if (spinning || store.get(KEY_SPIN)) return;
    audio();
    spinning = true;
    spinBtn.disabled = true;
    wheelEl.classList.add('is-spinning');

    const sector = (forcedId && SECTORS.find((s) => s.id === forcedId)) || pickSector();
    const turns = reducedMotion ? 1 : 6;
    const dur = reducedMotion ? 1200 : 5200;
    const from = rotation, to = targetAngle(from, sector, turns);
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    let lastIdx = Math.floor((from + HALF) / 90);
    const t0 = performance.now();

    (function frame(now) {
      const t = Math.min(1, (now - t0) / dur);
      const deg = from + (to - from) * ease(t);
      setRotation(deg);
      const idx = Math.floor((deg + HALF) / 90);
      if (idx !== lastIdx) { lastIdx = idx; playTick(); }
      if (t < 1) { requestAnimationFrame(frame); return; }
      finish(sector, to);
    })(t0);
  }

  function finish(sector, finalDeg) {
    spinning = false;
    wheelEl.classList.remove('is-spinning');
    const landed = sectorAt(finalDeg);
    store.set(KEY_SPIN, JSON.stringify({ sector: sector.id, landed: landed && landed.id, angle: finalDeg % 360, ts: Date.now() }));
    currentSector = landed || sector;
    renderPrize();
    playWin();
    if (!reducedMotion) confetti();
    setTimeout(openPopup, 800);
  }

  /* ------------------------------------------------------------------ */
  /* Popup, focus trap, timer                                            */
  /* ------------------------------------------------------------------ */
  const overlay = $('overlay'), popup = $('popup'), sticky = $('stickyCta');
  const bgEls = [$('stage'), document.querySelector('.controls'), sticky];
  let lastFocus = null;

  function focusables() {
    return Array.from(popup.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])'))
      .filter((el) => !el.disabled && el.offsetParent !== null);
  }

  function openPopup() {
    lastFocus = document.activeElement;
    sticky.hidden = true;
    overlay.hidden = false;
    bgEls.forEach((el) => el && el.setAttribute('inert', ''));
    document.body.style.overflow = 'hidden';
    startTimer();
    overlay.scrollTop = 0;
    popup.focus({ preventScroll: true });
  }

  function closePopup() {
    overlay.hidden = true;
    bgEls.forEach((el) => el && el.removeAttribute('inert'));
    document.body.style.overflow = '';
    sticky.hidden = false;
    $('stickyBtn').focus();
  }

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closePopup(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables(); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === popup)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  const TIMER_FROM = 180;
  let timerLeft = TIMER_FROM, timerId = null;
  function renderTimer() {
    $('tMin').textContent = String(Math.floor(timerLeft / 60)).padStart(2, '0');
    $('tSec').textContent = String(timerLeft % 60).padStart(2, '0');
  }
  function startTimer() {
    if (timerId) return;
    renderTimer();
    timerId = setInterval(() => {
      timerLeft = timerLeft <= 0 ? TIMER_FROM : timerLeft - 1;
      renderTimer();
    }, 1000);
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                              */
  /* ------------------------------------------------------------------ */
  function setMuted(m) {
    muted = m;
    store.set(KEY_MUTE, m ? '1' : '0');
    $('muteBtn').setAttribute('aria-pressed', String(m));
  }

  document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', () => {
    store.set(KEY_LANG, b.dataset.lang);
    applyLang(b.dataset.lang);
  }));
  $('muteBtn').addEventListener('click', () => setMuted(!muted));
  spinBtn.addEventListener('click', spin);
  $('closeBtn').addEventListener('click', closePopup);
  $('stickyBtn').addEventListener('click', goToSector);
  $('submitBtn').addEventListener('click', goToSector);
  window.addEventListener('resize', fit);

  // init
  fit();
  buildBulbs();
  applyLang(lang);
  setMuted(muted);

  // ?reset=1 (testing): clear only the stored spin, then drop the param so a refresh doesn't reset again.
  const qs = new URLSearchParams(location.search);
  if (qs.has('reset')) {
    store.del(KEY_SPIN);
    qs.delete('reset');
    const q = qs.toString();
    try { history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash); } catch (e) { /* ignore */ }
  }

  const saved = (() => { try { return JSON.parse(store.get(KEY_SPIN) || 'null'); } catch (e) { return null; } })();
  if (saved && (typeof saved.angle === 'number' || saved.sector)) {
    // snap to the stored sector's exact centre (old spins may hold an off-centre angle)
    const sec = SECTORS.find((s) => s.id === saved.sector);
    setRotation(sec ? centeredAngle(sec) : (saved.angle || 0));
    currentSector = sec || SECTORS[0];
    renderPrize();
    spinBtn.disabled = true;
    openPopup();
  }

  /* ------------------------------------------------------------------ */
  /* Test helpers (console): xlwSimulate(10000), xlwReset()              */
  /* ------------------------------------------------------------------ */
  window.xlwSimulate = function (n = 10000) {
    const counts = {}; let mismatches = 0;
    SECTORS.forEach((s) => { counts[s.name] = 0; });
    for (let i = 0; i < n; i++) {
      const s = pickSector();
      counts[s.name]++;
      const deg = targetAngle(Math.random() * 3600, s, 6);
      const at = sectorAt(deg);
      if (!at || at.id !== s.id) mismatches++;
    }
    const pct = {};
    Object.keys(counts).forEach((k) => { pct[k] = +(counts[k] * 100 / n).toFixed(2); });
    return { n, percent: pct, pointerMismatches: mismatches };
  };
  window.xlwForce = function (id) { forcedId = id; };
  window.xlwReset = function () { store.del(KEY_SPIN); location.reload(); };
})();
