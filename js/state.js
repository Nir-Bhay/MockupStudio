// ==================== STATE ====================
const S = {
  layout: 'hero', bg: 'sahara', bgCustom: null, bgImgUrl: null, theme: 'default',
  desktopImg: null, mobileImg: null, tabletImg: null,
  frameColor: '#ffffff', round: 10, shadow: 50, phoneScale: 100, pad: 5, bgBlur: 0,
  showNav: true, showIsland: true, showRefl: false, showWm: true, showBgOv: false,
  freeMode: false, patternResize: false, zoom: 1,
  imgFit: { desktop: 'cover', mobile: 'cover', tablet: 'cover' },
  imgScale: { desktop: 100, mobile: 100, tablet: 100 },
  imgOff: { desktop: { x: 0, y: 0 }, mobile: { x: 0, y: 0 }, tablet: { x: 0, y: 0 } },
  imgRad: { desktop: 0, mobile: 0, tablet: 0 },
  imgRotation: { desktop: 0, mobile: 0, tablet: 0 },
  imgOpacity: { desktop: 100, mobile: 100, tablet: 100 },
  imgFlip: { desktop: { h: false, v: false }, mobile: { h: false, v: false }, tablet: { h: false, v: false } },
  imgFilters: { desktop: { brightness: 100, contrast: 100, saturation: 100, blur: 0 }, mobile: { brightness: 100, contrast: 100, saturation: 100, blur: 0 }, tablet: { brightness: 100, contrast: 100, saturation: 100, blur: 0 } },
  texts: [], selTxt: null,
  presets: JSON.parse(localStorage.getItem('mp_presets') || '[]'),
  // Artboard system
  artboards: [],
  activeArtboard: 0,
  _abCounter: 1
};

// ==================== UNDO/REDO ====================
const _history = [];
let _histIdx = -1;

function _deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }

function _snapshotState() {
  return JSON.stringify({
    layout: S.layout, bg: S.bg, bgCustom: S.bgCustom, bgImgUrl: S.bgImgUrl, theme: S.theme,
    frameColor: S.frameColor, round: S.round, shadow: S.shadow,
    phoneScale: S.phoneScale, pad: S.pad, bgBlur: S.bgBlur,
    showNav: S.showNav, showIsland: S.showIsland, showRefl: S.showRefl, showWm: S.showWm, showBgOv: S.showBgOv,
    freeMode: S.freeMode, patternResize: S.patternResize,
    imgFit: _deepClone(S.imgFit), imgScale: _deepClone(S.imgScale),
    imgOff: _deepClone(S.imgOff), imgRad: _deepClone(S.imgRad),
    imgRotation: _deepClone(S.imgRotation), imgOpacity: _deepClone(S.imgOpacity),
    imgFlip: _deepClone(S.imgFlip), imgFilters: _deepClone(S.imgFilters),
    texts: _deepClone(S.texts),
    shapes: _deepClone(S.shapes || []),
    annotations: _deepClone(S.annotations || []),
    badges: _deepClone(S.badges || []),
    noiseEnabled: S.noiseEnabled || false, noiseIntensity: S.noiseIntensity || 15,
    vignetteEnabled: S.vignetteEnabled || false, vignetteIntensity: S.vignetteIntensity || 40,
    gradStops: _deepClone(S.gradStops || [{ pos: 0, color: '#c9956b' }, { pos: 100, color: '#1a1a1e' }]),
    gradType: S.gradType || 'linear', gradAngle: S.gradAngle || 145,
    animBg: S.animBg || false, bgPattern: S.bgPattern || null
  });
}

function pushHistory() {
  const snap = _snapshotState();
  if (_histIdx >= 0 && _history[_histIdx] === snap) return;
  _history.splice(_histIdx + 1);
  _history.push(snap);
  if (_history.length > MAX_UNDO_HISTORY) _history.shift();
  _histIdx = _history.length - 1;
}

function undo() {
  if (_histIdx <= 0) return;
  _histIdx--;
  _restoreState(JSON.parse(_history[_histIdx]));
  toast('↩ Undo');
}

function redo() {
  if (_histIdx >= _history.length - 1) return;
  _histIdx++;
  _restoreState(JSON.parse(_history[_histIdx]));
  toast('↪ Redo');
}

function _restoreState(snap) {
  // Remove existing dynamic elements from canvas before restoring
  if (typeof _removeAllDynamic === 'function') _removeAllDynamic();

  Object.assign(S, snap);

  // Re-apply visuals
  setLayout(S.layout);
  if (S.bgCustom) setBgCustom(S.bgCustom); else if (S.bg) setBg(S.bg);
  setTheme(S.theme);
  setFrmCol(S.frameColor);
  $('rngR').value = S.round; setRnd(S.round);
  $('rngS').value = S.shadow; setShd(S.shadow);
  $('rngP').value = S.phoneScale; setPSc(S.phoneScale);
  $('rngPd').value = S.pad; setPad(S.pad);
  $('rngBl').value = S.bgBlur; setBgBlur(S.bgBlur);

  // Restore image styles
  ['desktop', 'mobile', 'tablet'].forEach(t => applyImgStyle(t));

  // Restore toggles
  $('tN').classList.toggle('on', S.showNav); $('bNav').style.display = S.showNav ? 'flex' : 'none';
  $('tI').classList.toggle('on', S.showIsland); $('pIsl').style.display = S.showIsland ? 'block' : 'none';
  $('tR').classList.toggle('on', S.showRefl); $('ms').classList.toggle('reflection', S.showRefl);
  $('tW').classList.toggle('on', S.showWm); $('wm').style.display = S.showWm ? 'block' : 'none';

  // Re-render dynamic elements
  _restoreDynamic();

  // Free mode UI
  $('freeBtn').style.background = S.freeMode ? 'rgba(201,149,107,.2)' : '';
  $('freeBtn').style.borderColor = S.freeMode ? 'var(--accent)' : '';
}

function _removeAllDynamic() {
  // Remove texts
  (S.texts || []).forEach(t => { const e = $(t.id); if (e) e.remove() });
  // Remove shapes
  (S.shapes || []).forEach(s => { const e = $(s.id); if (e) e.remove() });
  // Remove annotations
  (S.annotations || []).forEach(a => { const e = $(a.id); if (e) e.remove() });
  // Remove badges
  (S.badges || []).forEach(b => { const e = $(b.id); if (e) e.remove() });
}

function _restoreDynamic() {
  // Re-render texts on canvas
  if (S.texts && S.texts.length > 0) {
    S.texts.forEach(t => {
      const el = document.createElement('div');
      el.className = 'txt-el'; el.id = t.id;
      el.textContent = t.text;
      el.style.fontFamily = t.font; el.style.fontSize = t.size + 'px';
      el.style.fontWeight = t.weight; el.style.color = t.color;
      el.style.opacity = (t.opacity != null ? t.opacity : 100) / 100;
      el.style.letterSpacing = (t.ls || 0) + 'px'; el.style.textAlign = t.align || 'center';
      el.style.left = (t.x || 50) + 'px'; el.style.top = (t.y || 50) + 'px';
      if (t.x === 50 && t.y === 50) el.style.transform = 'translate(-50%,-50%)';
      // Mouse + touch drag via shared utility
      makeDraggable(el, {
        zoom: () => S.zoom, snapToCenter: true,
        onStart: () => { if (typeof selectText === 'function') selectText(t.id) },
        onMove: (el, x, y) => { const o = S.texts.find(tx => tx.id === t.id); if (o) { o.x = x; o.y = y } },
        onEnd: () => pushHistory()
      });
      el.addEventListener('click', () => { if (typeof selectText === 'function') selectText(t.id) });
      $('ms').appendChild(el);
    });
  }
  S.selTxt = null;
  if (typeof renderTextList === 'function') renderTextList();

  // Re-render shapes
  if (S.shapes && S.shapes.length > 0) {
    S.shapes.forEach(obj => {
      const el = document.createElement('div');
      el.className = 'shape-el'; el.id = obj.id;
      if (typeof _applyShapeStyle === 'function') _applyShapeStyle(el, obj);
      if (typeof _makeShapeDraggable === 'function') _makeShapeDraggable(el, obj.id);
      $('ms').appendChild(el);
    });
  }
  S.selShape = null;
  const shpSec = $('shapeEditSec'); if (shpSec) shpSec.style.display = 'none';

  // Re-render annotations
  if (S.annotations && S.annotations.length > 0) {
    S.annotations.forEach(obj => { if (typeof _renderAnnoEl === 'function') _renderAnnoEl(obj) });
  }
  S.selAnno = null;
  const annoSec = $('annoEditSec'); if (annoSec) annoSec.style.display = 'none';

  // Re-render badges
  if (S.badges && S.badges.length > 0) {
    S.badges.forEach(obj => { if (typeof _renderBadgeEl === 'function') _renderBadgeEl(obj) });
  }
  S.selBadge = null;
  const bdgSec = $('badgeEditSec'); if (bdgSec) bdgSec.style.display = 'none';

  // Noise & vignette state
  if (typeof togNoise === 'function') {
    const noiseEl = $('ms').querySelector('.noise-overlay');
    if (S.noiseEnabled) {
      if (!noiseEl) { const n = document.createElement('div'); n.className = 'noise-overlay'; $('ms').appendChild(n); n.style.opacity = (S.noiseIntensity || 15) / 100 }
      else { noiseEl.style.display = 'block'; noiseEl.style.opacity = (S.noiseIntensity || 15) / 100 }
      if ($('tNoise')) $('tNoise').classList.add('on');
    } else {
      if (noiseEl) noiseEl.style.display = 'none';
      if ($('tNoise')) $('tNoise').classList.remove('on');
    }
  }
  if (typeof _applyVignette === 'function') _applyVignette();
  if ($('tVig')) $('tVig').classList.toggle('on', !!S.vignetteEnabled);

  // Animated BG
  $('ms').classList.toggle('anim-bg', !!S.animBg);
  if ($('tAnimBg')) $('tAnimBg').classList.toggle('on', !!S.animBg);

  // Layer panel refresh
  if (typeof renderLayerPanel === 'function') renderLayerPanel();
}

// ==================== BACKGROUNDS ====================
const BGS = {
  // Warm
  sahara: 'linear-gradient(145deg,#c9956b,#b8845d,#d4a57a)',
  peach: 'linear-gradient(145deg,#ffecd2,#fcb69f)',
  honey: 'linear-gradient(145deg,#f7971e,#ffd200)',
  coffee: 'linear-gradient(145deg,#3E2723,#795548)',
  cream: 'linear-gradient(145deg,#f5f0eb,#e8ddd4)',
  coral: 'linear-gradient(145deg,#ff7675,#fab1a0)',
  blush: 'linear-gradient(145deg,#fbc2eb,#a6c1ee)',
  rose: 'linear-gradient(145deg,#fecfef,#ff9a9e)',
  wine: 'linear-gradient(145deg,#4a0e2b,#8e2c5a)',
  sunset: 'linear-gradient(145deg,#f093fb,#f5576c)',
  terracotta: 'linear-gradient(145deg,#c1440e,#e77d11)',
  amber: 'linear-gradient(145deg,#ff8008,#ffc837)',
  // Cool
  midnight: 'linear-gradient(145deg,#0f0c29,#302b63,#24243e)',
  aurora: 'linear-gradient(145deg,#667eea,#764ba2)',
  ocean: 'linear-gradient(145deg,#2193b0,#6dd5ed)',
  ice: 'linear-gradient(145deg,#e6e9f0,#eef1f5)',
  arctic: 'linear-gradient(145deg,#74ebd5,#ACB6E5)',
  sky: 'linear-gradient(145deg,#89CFF0,#a0d8ef)',
  lavender: 'linear-gradient(145deg,#c471f5,#fa71cd)',
  slate: 'linear-gradient(145deg,#373B44,#4286f4)',
  indigo: 'linear-gradient(145deg,#4338ca,#6366f1)',
  cobalt: 'linear-gradient(145deg,#0052d4,#4364f7,#6fb1fc)',
  frost: 'linear-gradient(145deg,#cfd9df,#e2ebf0)',
  aqua: 'linear-gradient(145deg,#00c6fb,#005bea)',
  // Nature
  forest: 'linear-gradient(145deg,#134e5e,#71b280)',
  emerald: 'linear-gradient(145deg,#0d9488,#34d399)',
  moss: 'linear-gradient(145deg,#4a7c59,#8fbc8f)',
  sage: 'linear-gradient(145deg,#b8c6a5,#94a37e)',
  teal: 'linear-gradient(145deg,#0f766e,#5eead4)',
  spring: 'linear-gradient(145deg,#c6ea8d,#fe90af)',
  earth: 'linear-gradient(145deg,#614385,#516395)',
  // Dark
  charcoal: 'linear-gradient(145deg,#232526,#414345)',
  noir: 'linear-gradient(145deg,#0a0a0a,#1a1a1a)',
  obsidian: 'linear-gradient(145deg,#0c0c0c,#2d1f3d)',
  graphite: 'linear-gradient(145deg,#2c3e50,#3498db)',
  void: 'linear-gradient(145deg,#000000,#0a0a0a)',
  matrix: 'linear-gradient(145deg,#000d00,#003300)',
  // Light
  snow: 'linear-gradient(145deg,#ffffff,#f5f5f5)',
  pearl: 'linear-gradient(145deg,#fdfcfb,#e2d1c3)',
  linen: 'linear-gradient(145deg,#faf0e6,#f5deb3)',
  ivory: 'linear-gradient(145deg,#fffff0,#eeeee0)',
  // Vibrant
  neon: 'linear-gradient(145deg,#00f260,#0575e6)',
  electric: 'linear-gradient(145deg,#fc466b,#3f5efb)',
  plasma: 'linear-gradient(145deg,#f857a6,#ff5858)',
  prism: 'linear-gradient(145deg,#a18cd1,#fbc2eb)',
  rainbow: 'linear-gradient(145deg,#f093fb,#f5576c,#ffd200,#00f260)',
  // Mesh-style
  meshPurple: 'radial-gradient(at 40% 20%,#6366f1 0,transparent 50%),radial-gradient(at 80% 60%,#a855f7 0,transparent 50%),radial-gradient(at 10% 80%,#3b82f6 0,transparent 50%),#0f172a',
  meshGreen: 'radial-gradient(at 30% 30%,#10b981 0,transparent 50%),radial-gradient(at 70% 70%,#06b6d4 0,transparent 50%),radial-gradient(at 90% 20%,#22d3ee 0,transparent 50%),#042f2e',
  meshWarm: 'radial-gradient(at 50% 20%,#f97316 0,transparent 50%),radial-gradient(at 80% 80%,#ef4444 0,transparent 50%),radial-gradient(at 20% 60%,#fbbf24 0,transparent 50%),#1c1917',
  // Mesh 2026 Trending
  meshAurora: 'radial-gradient(at 20% 10%,#06b6d4 0,transparent 50%),radial-gradient(at 60% 40%,#8b5cf6 0,transparent 50%),radial-gradient(at 90% 80%,#10b981 0,transparent 50%),radial-gradient(at 40% 90%,#3b82f6 0,transparent 50%),#020617',
  meshRose: 'radial-gradient(at 30% 20%,#fb7185 0,transparent 50%),radial-gradient(at 70% 50%,#c084fc 0,transparent 50%),radial-gradient(at 50% 90%,#fda4af 0,transparent 50%),#1c1017',
  meshOcean: 'radial-gradient(at 10% 30%,#22d3ee 0,transparent 50%),radial-gradient(at 60% 70%,#2563eb 0,transparent 50%),radial-gradient(at 90% 20%,#6366f1 0,transparent 50%),#0c1222',
  meshSunset: 'radial-gradient(at 20% 40%,#f97316 0,transparent 50%),radial-gradient(at 70% 20%,#ec4899 0,transparent 50%),radial-gradient(at 50% 80%,#eab308 0,transparent 50%),#1a0a0a',
  meshMint: 'radial-gradient(at 40% 20%,#34d399 0,transparent 50%),radial-gradient(at 80% 60%,#22d3ee 0,transparent 50%),radial-gradient(at 20% 80%,#67e8f9 0,transparent 50%),#0a1a1a',
  meshTwilight: 'radial-gradient(at 30% 30%,#7c3aed 0,transparent 50%),radial-gradient(at 80% 20%,#db2777 0,transparent 50%),radial-gradient(at 50% 80%,#1d4ed8 0,transparent 50%),#0a0520',
  // Studio Surfaces (solid)
  studioBlack: '#0a0a0a',
  studioWhite: '#fafafa',
  studioGray: '#27272a',
  studioCream: '#f5f0eb',
  studioSlate: '#1e293b',
  studioCool: '#f1f5f9',
  // Premium Gradients
  velvet: 'linear-gradient(135deg,#1a0025,#3d005c,#6b0f8a)',
  copper: 'linear-gradient(145deg,#b87333,#da9c5a,#c27840)',
  titanium: 'linear-gradient(145deg,#485563,#29323c)',
  champagne: 'linear-gradient(145deg,#f7e7ce,#e8d5b7,#f2e6d9)',
  glacier: 'linear-gradient(145deg,#e0eafc,#cfdef3,#dfe9f3)',
  dusk: 'linear-gradient(145deg,#2c3e50,#4ca1af)',
  cherry: 'linear-gradient(145deg,#eb3349,#f45c43)',
  steel: 'linear-gradient(145deg,#333333,#555555,#444444)'
};

// ==================== LAYOUTS ====================
const LAYS = {
  // === SINGLE DEVICE ===
  hero: { n: 'Hero', cat: 'single', bf: { l: 5, t: 5, w: 90, h: 90 }, pf: null, tf: null },
  center: { n: 'Center', cat: 'single', bf: { l: 15, t: 10, w: 70, h: 80 }, pf: null, tf: null },
  phone: { n: 'Phone', cat: 'single', bf: null, pf: { l: 35, t: 5, w: 18, h: 90 }, tf: null },
  heroAngled: { n: 'Hero Angled', cat: 'single', bf: { l: 10, t: 8, w: 80, h: 84 }, pf: null, tf: null },
  heroFloat: { n: 'Hero Float', cat: 'single', bf: { l: 12, t: 12, w: 76, h: 76 }, pf: null, tf: null },
  minCenter: { n: 'Min Center', cat: 'single', bf: { l: 20, t: 15, w: 60, h: 70 }, pf: null, tf: null },
  minSide: { n: 'Min Side', cat: 'single', bf: { l: 5, t: 10, w: 55, h: 80 }, pf: null, tf: null },
  // === MULTI DEVICE ===
  duo: { n: 'Duo', cat: 'multi', bf: { l: 3, t: 6, w: 62, h: 86 }, pf: { l: 68, t: 30, w: 16, h: 54 }, tf: null },
  duoR: { n: 'Duo R', cat: 'multi', bf: { l: 35, t: 6, w: 62, h: 86 }, pf: { l: 3, t: 30, w: 16, h: 54 }, tf: null },
  trio: { n: 'Trio', cat: 'multi', bf: { l: 3, t: 3, w: 94, h: 58 }, pf: { l: 5, t: 52, w: 13, h: 44 }, tf: { l: 60, t: 52, w: 26, h: 38 } },
  stack: { n: 'Stack', cat: 'multi', bf: { l: 8, t: 3, w: 84, h: 56 }, pf: { l: 42, t: 45, w: 15, h: 50 }, tf: null },
  tabDesk: { n: 'Tab+Desk', cat: 'multi', bf: { l: 30, t: 3, w: 66, h: 75 }, pf: null, tf: { l: 3, t: 18, w: 26, h: 60 } },
  overlap: { n: 'Overlap', cat: 'multi', bf: { l: 5, t: 8, w: 70, h: 80 }, pf: { l: 60, t: 20, w: 18, h: 60 }, tf: null },
  grid: { n: 'Grid', cat: 'multi', bf: { l: 2, t: 2, w: 48, h: 48 }, pf: { l: 52, t: 2, w: 16, h: 48 }, tf: { l: 2, t: 52, w: 48, h: 46 } },
  float: { n: 'Float', cat: 'multi', bf: { l: 8, t: 12, w: 55, h: 70 }, pf: { l: 66, t: 5, w: 15, h: 50 }, tf: { l: 50, t: 55, w: 25, h: 36 } },
  phones: { n: '2 Phones', cat: 'multi', bf: null, pf: { l: 15, t: 8, w: 16, h: 82 }, tf: null, pf2: { l: 55, t: 8, w: 16, h: 82 } },
  // === CREATIVE ===
  cascade: { n: 'Cascade', cat: 'creative', bf: { l: 5, t: 5, w: 65, h: 75 }, pf: { l: 55, t: 15, w: 15, h: 55 }, tf: { l: 72, t: 25, w: 24, h: 45 } },
  diamond: { n: 'Diamond', cat: 'creative', bf: { l: 22, t: 3, w: 56, h: 65 }, pf: { l: 5, t: 30, w: 14, h: 50 }, tf: { l: 80, t: 30, w: 17, h: 42 } },
  staircase: { n: 'Staircase', cat: 'creative', bf: { l: 3, t: 3, w: 55, h: 55 }, pf: { l: 42, t: 28, w: 15, h: 50 }, tf: { l: 60, t: 48, w: 28, h: 42 } },
  spotlight: { n: 'Spotlight', cat: 'creative', bf: { l: 20, t: 8, w: 60, h: 72 }, pf: { l: 2, t: 55, w: 12, h: 40 }, tf: { l: 84, t: 55, w: 14, h: 35 } },
  magazine: { n: 'Magazine', cat: 'creative', bf: { l: 2, t: 2, w: 60, h: 96 }, pf: { l: 65, t: 2, w: 16, h: 48 }, tf: { l: 65, t: 52, w: 32, h: 46 } },
  // === BENTO ===
  bento2x2: { n: 'Bento 2×2', cat: 'bento', bf: { l: 2, t: 2, w: 48, h: 48 }, pf: { l: 52, t: 2, w: 46, h: 48 }, tf: { l: 2, t: 52, w: 96, h: 46 } },
  bento3: { n: 'Bento 3', cat: 'bento', bf: { l: 2, t: 2, w: 64, h: 48 }, pf: { l: 68, t: 2, w: 30, h: 48 }, tf: { l: 2, t: 52, w: 96, h: 46 } },
  bentoAsym: { n: 'Bento Asym', cat: 'bento', bf: { l: 2, t: 2, w: 48, h: 96 }, pf: { l: 52, t: 2, w: 46, h: 46 }, tf: { l: 52, t: 50, w: 46, h: 48 } },
  // === SHOWCASE ===
  appleStyle: { n: 'Apple', cat: 'showcase', bf: { l: 10, t: 5, w: 80, h: 70 }, pf: { l: 38, t: 65, w: 14, h: 32 }, tf: null },
  showcase: { n: 'Showcase', cat: 'showcase', bf: { l: 12, t: 2, w: 76, h: 62 }, pf: { l: 3, t: 50, w: 13, h: 48 }, tf: { l: 62, t: 50, w: 24, h: 40 } },
  panorama: { n: 'Panorama', cat: 'showcase', bf: { l: 2, t: 15, w: 96, h: 70 }, pf: null, tf: null },
  triScreen: { n: 'Tri Screen', cat: 'showcase', bf: { l: 18, t: 5, w: 64, h: 72 }, pf: { l: 2, t: 20, w: 14, h: 60 }, tf: { l: 84, t: 20, w: 14, h: 52 } }
};

const LAY_CATS = { single: 'Single Device', multi: 'Multi Device', creative: 'Creative', bento: 'Bento Grid', showcase: 'Showcase' };

// ==================== THEMES ====================
const THEMES = [
  { id: 'default', n: 'Default', bg: 'linear-gradient(135deg,#f5f0eb,#e8ddd4)' },
  { id: 'glass', n: 'Glass', bg: 'linear-gradient(135deg,rgba(100,100,255,.1),rgba(200,100,255,.05))' },
  { id: 'dark', n: 'Dark', bg: 'linear-gradient(135deg,#1a1a1e,#0a0a0c)' },
  { id: 'minimal', n: 'Minimal', bg: 'linear-gradient(135deg,#fafafa,#f0f0f0)' },
  { id: 'neo', n: 'Neon', bg: 'linear-gradient(135deg,#0a0a1a,#1a0a2e)' },
  { id: 'bento', n: 'Bento', bg: 'linear-gradient(135deg,#f8f8f8,#efefef)' },
  { id: 'neumorphism', n: 'Neumorphic', bg: 'linear-gradient(135deg,#e0e5ec,#d0d5dc)' },
  { id: 'brutalist', n: 'Brutalist', bg: 'linear-gradient(135deg,#f0f0e8,#e8e8d8)' },
  { id: 'retro', n: 'Retro', bg: 'linear-gradient(135deg,#f4e9d9,#e8d5c0)' },
  { id: 'pastel', n: 'Pastel', bg: 'linear-gradient(135deg,#f0e6f6,#e6f0f6)' },
  { id: 'cyberpunk', n: 'Cyberpunk', bg: 'linear-gradient(135deg,#0d0221,#1a0533)' },
  { id: 'frosted', n: 'Frosted', bg: 'linear-gradient(135deg,rgba(255,255,255,.7),rgba(240,240,255,.5))' },
  { id: 'outline', n: 'Outline', bg: 'linear-gradient(135deg,#fff,#fafafa)' },
  { id: 'gradient', n: 'Gradient', bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'clay', n: 'Clay', bg: 'linear-gradient(135deg,#f0ece1,#dfd8c8)' },
  { id: 'editorial', n: 'Editorial', bg: 'linear-gradient(135deg,#f4f4f0,#e8e8e4)' },
  { id: 'wireframe', n: 'Wireframe', bg: 'linear-gradient(135deg,#ffffff,#f5f5f5)' }
];

// ==================== TEMPLATES ====================
const TPLS = [
  // === SaaS ===
  { n: 'SaaS Landing', s: 'For product pages', cat: 'saas', lay: 'duo', bg: 'midnight', theme: 'glass' },
  { n: 'SaaS Hero', s: 'Bold product hero', cat: 'saas', lay: 'heroFloat', bg: 'indigo', theme: 'neo' },
  { n: 'SaaS Dashboard', s: 'App dashboard view', cat: 'saas', lay: 'center', bg: 'charcoal', theme: 'dark' },
  { n: 'SaaS Pricing', s: 'Feature comparison', cat: 'saas', lay: 'bento3', bg: 'midnight', theme: 'glass' },
  // === Portfolio ===
  { n: 'Portfolio', s: 'Showcase work', cat: 'portfolio', lay: 'hero', bg: 'cream', theme: 'minimal' },
  { n: 'Designer Folio', s: 'Clean showcase', cat: 'portfolio', lay: 'minCenter', bg: 'snow', theme: 'minimal' },
  { n: 'Dev Portfolio', s: 'Code projects', cat: 'portfolio', lay: 'bento2x2', bg: 'charcoal', theme: 'dark' },
  { n: 'Photo Folio', s: 'Photography work', cat: 'portfolio', lay: 'panorama', bg: 'noir', theme: 'default' },
  // === Mobile ===
  { n: 'App Launch', s: 'Mobile first', cat: 'mobile', lay: 'phone', bg: 'aurora', theme: 'default' },
  { n: 'App Duo', s: 'iOS & Android', cat: 'mobile', lay: 'phones', bg: 'indigo', theme: 'neo' },
  { n: 'App Showcase', s: 'Multi-screen flow', cat: 'mobile', lay: 'triScreen', bg: 'midnight', theme: 'glass' },
  { n: 'App Store', s: 'App store ready', cat: 'mobile', lay: 'appleStyle', bg: 'noir', theme: 'default' },
  // === Dashboard ===
  { n: 'Dashboard', s: 'Admin panels', cat: 'dashboard', lay: 'center', bg: 'charcoal', theme: 'dark' },
  { n: 'Analytics', s: 'Data dashboard', cat: 'dashboard', lay: 'heroAngled', bg: 'midnight', theme: 'dark' },
  { n: 'CRM Panel', s: 'Customer data', cat: 'dashboard', lay: 'bentoAsym', bg: 'slate', theme: 'dark' },
  // === E-Commerce ===
  { n: 'E-Commerce', s: 'Online stores', cat: 'ecommerce', lay: 'trio', bg: 'peach', theme: 'default' },
  { n: 'Product Page', s: 'Product details', cat: 'ecommerce', lay: 'overlap', bg: 'cream', theme: 'minimal' },
  { n: 'Shop Landing', s: 'Store hero', cat: 'ecommerce', lay: 'showcase', bg: 'sahara', theme: 'default' },
  // === Startup ===
  { n: 'Startup Pitch', s: 'Investor decks', cat: 'startup', lay: 'overlap', bg: 'indigo', theme: 'neo' },
  { n: 'Launch Page', s: 'Coming soon', cat: 'startup', lay: 'spotlight', bg: 'aurora', theme: 'glass' },
  { n: 'Product Hunt', s: 'Launch day', cat: 'startup', lay: 'appleStyle', bg: 'coral', theme: 'default' },
  // === Agency ===
  { n: 'Agency', s: 'Creative studios', cat: 'agency', lay: 'float', bg: 'sahara', theme: 'default' },
  { n: 'Studio Page', s: 'Design agency', cat: 'agency', lay: 'cascade', bg: 'cream', theme: 'minimal' },
  { n: 'Agency Hero', s: 'Bold statement', cat: 'agency', lay: 'magazine', bg: 'noir', theme: 'neo' },
  // === Multi-Device ===
  { n: 'Multi Device', s: 'Responsive', cat: 'multidevice', lay: 'grid', bg: 'ice', theme: 'minimal' },
  { n: 'Device Trio', s: 'All screens', cat: 'multidevice', lay: 'staircase', bg: 'slate', theme: 'dark' },
  { n: 'Responsive Set', s: 'Desktop+Mobile', cat: 'multidevice', lay: 'diamond', bg: 'indigo', theme: 'glass' },
  { n: 'Screen Flow', s: 'User journey', cat: 'multidevice', lay: 'float', bg: 'aurora', theme: 'neo' },
  // === Bento ===
  { n: 'Bento Layout', s: 'Grid showcase', cat: 'bento', lay: 'bento2x2', bg: 'midnight', theme: 'dark' },
  { n: 'Bento Feature', s: 'Feature grid', cat: 'bento', lay: 'bento3', bg: 'charcoal', theme: 'glass' },
  { n: 'Bento Asym', s: 'Asymmetric grid', cat: 'bento', lay: 'bentoAsym', bg: 'noir', theme: 'neo' }
];

const TPL_CATS = { saas: 'SaaS', portfolio: 'Portfolio', mobile: 'Mobile', dashboard: 'Dashboard', ecommerce: 'E-Commerce', startup: 'Startup', agency: 'Agency', multidevice: 'Multi-Device', bento: 'Bento' };
