// ==================== STATE ====================
const S = {
  layout: 'hero', bg: 'sahara', bgCustom: null, bgImgUrl: null, theme: 'default',
  desktopImg: null, mobileImg: null, tabletImg: null, mobile2Img: null,
  frameColor: '#ffffff', round: 10, shadow: 50, phoneScale: 100, pad: 5, bgBlur: 0,
  showNav: true, showIsland: true, showRefl: false, showWm: true, showBgOv: false,
  freeMode: false, patternResize: false, zoom: 1,
  frameShadows: {
    bf: { depth: 50, x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 20, preset: null },
    pf: { depth: 50, x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 25, preset: null },
    tf: { depth: 50, x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 20, preset: null },
    pf2: { depth: 50, x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 25, preset: null }
  },
  imgFit: { desktop: 'cover', mobile: 'cover', tablet: 'cover', mobile2: 'cover' },
  imgScale: { desktop: 100, mobile: 100, tablet: 100, mobile2: 100 },
  imgOff: { desktop: { x: 0, y: 0 }, mobile: { x: 0, y: 0 }, tablet: { x: 0, y: 0 }, mobile2: { x: 0, y: 0 } },
  imgRad: { desktop: 0, mobile: 0, tablet: 0, mobile2: 0 },
  imgRotation: { desktop: 0, mobile: 0, tablet: 0, mobile2: 0 },
  imgOpacity: { desktop: 100, mobile: 100, tablet: 100, mobile2: 100 },
  imgFlip: { desktop: { h: false, v: false }, mobile: { h: false, v: false }, tablet: { h: false, v: false }, mobile2: { h: false, v: false } },
  imgFilters: { desktop: { brightness: 100, contrast: 100, saturation: 100, blur: 0 }, mobile: { brightness: 100, contrast: 100, saturation: 100, blur: 0 }, tablet: { brightness: 100, contrast: 100, saturation: 100, blur: 0 }, mobile2: { brightness: 100, contrast: 100, saturation: 100, blur: 0 } },
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
    frameShadows: _deepClone(S.frameShadows),
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
    animBg: S.animBg || false, bgPattern: S.bgPattern || null,
    bgImage: S.bgImage || null, bgImgUrl: S.bgImgUrl || null,
    patColor: S.patColor || '#969696', patOpacity: S.patOpacity != null ? S.patOpacity : 15, patScale: S.patScale || 100,
    shadowScene: S.shadowScene || null, shadowOpacity: S.shadowOpacity != null ? S.shadowOpacity : 30, shadowBlur: S.shadowBlur || 0,
    bgFit: S.bgFit || 'cover'
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
  _removeAllDynamicElements();
  if (typeof _removeAllDynamic === 'function') _removeAllDynamic();

  Object.assign(S, snap);

  // Re-apply visuals
  setLayout(S.layout);
  if (S.bgCustom) setBgCustom(S.bgCustom);
  else if (S.bg && BGS[S.bg]) setBg(S.bg);
  else $('ms').style.background = 'transparent';
  setTheme(S.theme);
  setFrmCol(S.frameColor);
  $('rngR').value = S.round; setRnd(S.round);
  $('rngS').value = S.shadow; setShd(S.shadow);
  $('rngP').value = S.phoneScale; setPSc(S.phoneScale);
  $('rngPd').value = S.pad; setPad(S.pad);
  $('rngBl').value = S.bgBlur; setBgBlur(S.bgBlur);

  // Restore background image layer
  const bgImg = $('msBgImg');
  if (S.bgImage) {
    bgImg.src = S.bgImage; bgImg.style.display = 'block';
  } else {
    bgImg.src = ''; bgImg.style.display = 'none';
  }

  // Restore pattern overlay
  if (S.bgPattern && typeof _renderPatternOverlay === 'function') {
    _renderPatternOverlay();
  } else {
    const patOv = $('msPatOv');
    if (patOv) { patOv.style.backgroundImage = ''; patOv.style.backgroundSize = '' }
  }

  // Restore gradient editor controls
  if (typeof renderGradStopEditor === 'function') renderGradStopEditor();
  if ($('gradType')) $('gradType').value = S.gradType || 'linear';
  if ($('gradAngle')) $('gradAngle').value = S.gradAngle || 145;
  if ($('rvGAngle')) $('rvGAngle').textContent = (S.gradAngle || 145) + '°';
  // Restore pattern controls
  if ($('patColor')) $('patColor').value = S.patColor || '#969696';
  if ($('patOpacity')) $('patOpacity').value = S.patOpacity != null ? S.patOpacity : 15;
  if ($('patScale')) $('patScale').value = S.patScale || 100;

  // Restore image styles
  ['desktop', 'mobile', 'tablet', 'mobile2'].forEach(t => applyImgStyle(t));

  // Restore toggles
  $('tN').classList.toggle('on', S.showNav); $('bNav').style.display = S.showNav ? 'flex' : 'none';
  $('tI').classList.toggle('on', S.showIsland); $('pIsl').style.display = S.showIsland ? 'block' : 'none'; if ($('pIsl2')) $('pIsl2').style.display = S.showIsland ? 'block' : 'none';
  $('tR').classList.toggle('on', S.showRefl); $('ms').classList.toggle('reflection', S.showRefl);
  $('tW').classList.toggle('on', S.showWm); $('wm').style.display = S.showWm ? 'block' : 'none';

  // Re-render dynamic elements
  _restoreDynamic();

  // Restore shadow scene overlay
  if (typeof _applyShadowScene === 'function') {
    _applyShadowScene();
    if ($('shadowSceneOp')) $('shadowSceneOp').value = S.shadowOpacity != null ? S.shadowOpacity : 30;
    if ($('rvShadowOp')) $('rvShadowOp').textContent = (S.shadowOpacity != null ? S.shadowOpacity : 30) + '%';
    if ($('shadowSceneBl')) $('shadowSceneBl').value = S.shadowBlur || 0;
    if ($('rvShadowBl')) $('rvShadowBl').textContent = (S.shadowBlur || 0) + 'px';
  }

  // Restore BG fit
  if (typeof setBgFit === 'function' && S.bgFit) setBgFit(S.bgFit);

  // Restore per-frame shadows
  if (typeof applyAllFrameShadows === 'function') applyAllFrameShadows();

  // Free mode UI
  $('freeBtn').style.background = S.freeMode ? 'rgba(201,149,107,.2)' : '';
  $('freeBtn').style.borderColor = S.freeMode ? 'var(--accent)' : '';
}

function _removeAllDynamicElements() {
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
  steel: 'linear-gradient(145deg,#333333,#555555,#444444)',
  // === MYSTIC (soft flowing dreamy) ===
  mysticRose: 'linear-gradient(135deg,#fecfef,#e8b4d9,#d4a5c7,#f5d5e7)',
  mysticLilac: 'linear-gradient(160deg,#c9b1ff,#e0c3fc,#f0d9ff,#d8b4fe)',
  mysticMint: 'linear-gradient(135deg,#a7f3d0,#99f6e4,#c4f1e0,#d5f5f0)',
  mysticPeach: 'linear-gradient(150deg,#fed7aa,#fecaca,#fde2e4,#ffecd2)',
  mysticSky: 'linear-gradient(135deg,#bae6fd,#c7d2fe,#ddd6fe,#e0e7ff)',
  mysticCoral: 'linear-gradient(145deg,#fca5a5,#fda4af,#f9a8d4,#fbcfe8)',
  mysticTeal: 'linear-gradient(140deg,#5eead4,#67e8f9,#a5f3fc,#99f6e4)',
  mysticLavender: 'linear-gradient(155deg,#c4b5fd,#d8b4fe,#f0abfc,#e9d5ff)',
  mysticSunrise: 'linear-gradient(135deg,#fed7aa,#fbbf24,#f9a8d4,#c084fc)',
  mysticOcean: 'linear-gradient(140deg,#67e8f9,#6ee7b7,#a5b4fc,#93c5fd)',
  mysticBlush: 'linear-gradient(130deg,#fce7f3,#ffe4e6,#fff1f2,#fdf2f8)',
  mysticForest: 'linear-gradient(160deg,#6ee7b7,#86efac,#a7f3d0,#bbf7d0)',
  mysticDream: 'linear-gradient(135deg,#e9d5ff,#fce7f3,#dbeafe,#ede9fe)',
  mysticGlow: 'linear-gradient(145deg,#fef08a,#fde68a,#fbbf24,#fcd34d)',
  mysticIce: 'linear-gradient(135deg,#e0f2fe,#dbeafe,#ede9fe,#f0f9ff)',
  mysticWine: 'linear-gradient(140deg,#881337,#9f1239,#be185d,#a21caf)',
  // === ABSTRACT (macOS-inspired flowing) ===
  absOrange: 'linear-gradient(135deg,#ea580c,#f97316,#fb923c,#fdba74)',
  absPurple: 'linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa,#6d28d9)',
  absBlue: 'linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa,#1d4ed8)',
  absPink: 'linear-gradient(135deg,#db2777,#ec4899,#f472b6,#be185d)',
  absGreen: 'linear-gradient(135deg,#059669,#10b981,#34d399,#047857)',
  absRed: 'linear-gradient(135deg,#dc2626,#ef4444,#f87171,#b91c1c)',
  absTeal: 'linear-gradient(135deg,#0d9488,#14b8a6,#2dd4bf,#0f766e)',
  absYellow: 'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24,#b45309)',
  absIndigo: 'linear-gradient(135deg,#4338ca,#4f46e5,#6366f1,#3730a3)',
  absCyan: 'linear-gradient(135deg,#0891b2,#06b6d4,#22d3ee,#0e7490)',
  absFuchsia: 'linear-gradient(135deg,#a21caf,#c026d3,#d946ef,#86198f)',
  absLime: 'linear-gradient(135deg,#65a30d,#84cc16,#a3e635,#4d7c0f)',
  // === RADIANT (soft luminance center glow) ===
  radPink: 'radial-gradient(ellipse at 50% 50%,#fce7f3,#fbcfe8,#f9a8d4,#f472b6)',
  radCoral: 'radial-gradient(ellipse at 50% 40%,#fff1f2,#ffe4e6,#fecdd3,#fda4af)',
  radPurple: 'radial-gradient(ellipse at 50% 50%,#f5f3ff,#ede9fe,#ddd6fe,#c4b5fd)',
  radOrange: 'radial-gradient(ellipse at 50% 50%,#fff7ed,#ffedd5,#fed7aa,#fdba74)',
  radBlue: 'radial-gradient(ellipse at 50% 50%,#eff6ff,#dbeafe,#bfdbfe,#93c5fd)',
  radGreen: 'radial-gradient(ellipse at 50% 50%,#ecfdf5,#d1fae5,#a7f3d0,#6ee7b7)',
  radGold: 'radial-gradient(ellipse at 50% 50%,#fffbeb,#fef3c7,#fde68a,#fcd34d)',
  radLilac: 'radial-gradient(ellipse at 50% 50%,#fdf4ff,#fae8ff,#f5d0fe,#e879f9)',
  radTeal: 'radial-gradient(ellipse at 50% 50%,#f0fdfa,#ccfbf1,#99f6e4,#5eead4)',
  radRose: 'radial-gradient(ellipse at 50% 50%,#fff1f2,#fce7f3,#fbcfe8,#f9a8d4)',
  radSky: 'radial-gradient(ellipse at 50% 50%,#f0f9ff,#e0f2fe,#bae6fd,#7dd3fc)',
  radMint: 'radial-gradient(ellipse at 50% 50%,#f0fdf4,#dcfce7,#bbf7d0,#86efac)',
  // === COSMIC (deep space) ===
  cosmicNebula: 'radial-gradient(at 30% 40%,#4c1d95 0,transparent 50%),radial-gradient(at 70% 60%,#1e1b4b 0,transparent 50%),radial-gradient(at 50% 20%,#312e81 0,transparent 40%),#020617',
  cosmicVoid: 'radial-gradient(at 50% 50%,#0f172a 0,#020617 50%,#000000 100%)',
  cosmicAurora: 'radial-gradient(at 20% 30%,#059669 0,transparent 50%),radial-gradient(at 80% 70%,#7c3aed 0,transparent 50%),radial-gradient(at 50% 100%,#0ea5e9 0,transparent 40%),#020617',
  cosmicEmber: 'radial-gradient(at 40% 60%,#9f1239 0,transparent 40%),radial-gradient(at 70% 30%,#78350f 0,transparent 40%),radial-gradient(at 20% 80%,#7c2d12 0,transparent 40%),#0a0a0a',
  cosmicDeep: 'radial-gradient(at 50% 50%,#1e293b 0%,#0f172a 40%,#020617 70%,#000000 100%)',
  cosmicStars: 'radial-gradient(at 30% 20%,#312e81 0,transparent 30%),radial-gradient(at 80% 80%,#1e1b4b 0,transparent 30%),radial-gradient(at 60% 40%,#1e3a5f 0,transparent 30%),#000000',
  // === EARTH (nature-inspired) ===
  earthDesert: 'linear-gradient(145deg,#d4a574,#c49264,#b8845d,#a67a52)',
  earthSand: 'linear-gradient(145deg,#f5e6d3,#e8d5c0,#dbc4ad,#ceb39a)',
  earthClay: 'linear-gradient(145deg,#8b4513,#a0522d,#cd853f,#deb887)',
  earthStone: 'linear-gradient(145deg,#708090,#778899,#8899aa,#b0c4de)',
  earthOcean: 'linear-gradient(145deg,#006994,#008cba,#00a5cf,#40bfef)',
  earthMountain: 'linear-gradient(180deg,#87ceeb,#b0c4de,#708090,#465362,#2f4f4f)',
  earthSunset: 'linear-gradient(180deg,#1a1a2e,#16213e,#533483,#e94560,#f38181)',
  earthDune: 'linear-gradient(160deg,#c2b280,#d2c290,#e2d2a0,#c9b87c)',
  // === GLASS (frosted morphism) ===
  glassClear: 'linear-gradient(135deg,rgba(255,255,255,.25),rgba(255,255,255,.05))',
  glassFrost: 'linear-gradient(135deg,rgba(200,210,255,.2),rgba(255,255,255,.1),rgba(200,200,255,.15))',
  glassDark: 'linear-gradient(135deg,rgba(15,15,30,.9),rgba(30,30,50,.8),rgba(20,20,40,.85))',
  glassRose: 'linear-gradient(135deg,rgba(255,200,220,.2),rgba(255,180,200,.1),rgba(255,220,230,.15))',
  glassOcean: 'linear-gradient(135deg,rgba(100,180,255,.15),rgba(80,160,240,.1),rgba(120,200,255,.12))',
  glassViolet: 'linear-gradient(135deg,rgba(150,100,255,.15),rgba(180,130,255,.1),rgba(200,150,255,.12))',
  // === TEXTURE-INSPIRED (CSS gradients mimicking textures) ===
  txWood: 'repeating-linear-gradient(90deg,#deb887 0px,#d2b48c 3px,#c8a87c 6px,#be9a6c 8px,#d4a76a 10px,#deb887 12px)',
  txMarble: 'linear-gradient(135deg,#f5f5f5 0%,#e8e8e8 25%,#f0f0f0 50%,#e0e0e0 75%,#f8f8f8 100%),linear-gradient(45deg,rgba(180,180,180,.1) 0%,transparent 40%,rgba(200,200,200,.1) 60%,transparent 100%)',
  txConcrete: 'linear-gradient(145deg,#b0b0b0,#a0a0a0,#c0c0c0,#b5b5b5)',
  txFabric: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 4px),repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 4px),#e8e0d8',
  txLeather: 'linear-gradient(145deg,#654321,#5c3d1e,#704214,#8b6914)',
  txPaper: 'linear-gradient(145deg,#f5f0e8,#ede5d8,#f0e8dd,#e8e0d0)',
  txDenim: 'linear-gradient(145deg,#4169e1,#3a5fcd,#3b5fc0,#436eb0)',
  txBrick: 'repeating-linear-gradient(0deg,#a0522d 0px,#a0522d 20px,#8b4513 20px,#8b4513 22px),repeating-linear-gradient(90deg,#a0522d 0px,#a0522d 40px,#8b4513 40px,#8b4513 42px)',
  txGold: 'linear-gradient(145deg,#ffd700,#daa520,#b8860b,#ffd700,#daa520)',
  txSilver: 'linear-gradient(145deg,#c0c0c0,#d8d8d8,#a9a9a9,#c0c0c0,#e0e0e0)',
  txRoseGold: 'linear-gradient(145deg,#b76e79,#c78283,#d4918e,#e8a598)',
  txBronze: 'linear-gradient(145deg,#cd7f32,#b87333,#a0652a,#cd7f32)'
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
  triScreen: { n: 'Tri Screen', cat: 'showcase', bf: { l: 18, t: 5, w: 64, h: 72 }, pf: { l: 2, t: 20, w: 14, h: 60 }, tf: { l: 84, t: 20, w: 14, h: 52 } },
  // === FULLSCREEN ===
  fullPhone: { n: 'Full Phone', cat: 'fullscreen', bf: null, pf: { l: 28, t: 2, w: 25, h: 96 }, tf: null },
  fullTablet: { n: 'Full Tablet', cat: 'fullscreen', bf: null, pf: null, tf: { l: 10, t: 5, w: 80, h: 90 } },
  fullBrowser: { n: 'Full Browser', cat: 'fullscreen', bf: { l: 2, t: 2, w: 96, h: 96 }, pf: null, tf: null },
  // === ISOMETRIC ===
  isoLeft: { n: 'Iso Left', cat: 'isometric', bf: { l: 10, t: 10, w: 70, h: 75 }, pf: { l: 72, t: 25, w: 16, h: 55 }, tf: null },
  isoRight: { n: 'Iso Right', cat: 'isometric', bf: { l: 20, t: 10, w: 70, h: 75 }, pf: { l: 5, t: 25, w: 16, h: 55 }, tf: null },
  isoTriple: { n: 'Iso Triple', cat: 'isometric', bf: { l: 15, t: 5, w: 60, h: 65 }, pf: { l: 2, t: 35, w: 14, h: 50 }, tf: { l: 78, t: 35, w: 20, h: 45 } },
  // === EDITORIAL ===
  editorial1: { n: 'Side Art', cat: 'editorial', bf: { l: 40, t: 5, w: 55, h: 85 }, pf: null, tf: null },
  editorial2: { n: 'Top Heavy', cat: 'editorial', bf: { l: 5, t: 2, w: 90, h: 55 }, pf: { l: 30, t: 60, w: 14, h: 38 }, tf: null },
  editorial3: { n: 'Split', cat: 'editorial', bf: { l: 2, t: 5, w: 48, h: 90 }, pf: { l: 52, t: 20, w: 16, h: 60 }, tf: null },
  editMag: { n: 'Magazine 2', cat: 'editorial', bf: { l: 2, t: 2, w: 55, h: 96 }, pf: { l: 60, t: 5, w: 16, h: 45 }, tf: { l: 60, t: 55, w: 36, h: 40 } },
  // === SOCIAL ===
  story: { n: 'Story', cat: 'social', bf: null, pf: { l: 32, t: 2, w: 20, h: 96 }, tf: null },
  socialDuo: { n: 'Social Duo', cat: 'social', bf: null, pf: { l: 10, t: 5, w: 18, h: 90 }, tf: null, pf2: { l: 60, t: 5, w: 18, h: 90 } },
  socialGrid: { n: 'Social Grid', cat: 'social', bf: null, pf: { l: 5, t: 5, w: 17, h: 88 }, tf: null, pf2: { l: 25, t: 5, w: 17, h: 88 } },
  postView: { n: 'Post View', cat: 'social', bf: { l: 5, t: 5, w: 90, h: 90 }, pf: null, tf: null },
  // === LAPTOP (uses browser frame with laptop proportions) ===
  laptop: { n: 'Laptop', cat: 'laptop', bf: { l: 10, t: 10, w: 80, h: 65 }, pf: null, tf: null },
  laptopOpen: { n: 'Laptop Open', cat: 'laptop', bf: { l: 5, t: 5, w: 90, h: 70 }, pf: null, tf: null },
  laptopSide: { n: 'Laptop Side', cat: 'laptop', bf: { l: 15, t: 8, w: 70, h: 60 }, pf: { l: 70, t: 35, w: 16, h: 55 }, tf: null },
  laptopDuo: { n: 'Laptop+Phone', cat: 'laptop', bf: { l: 3, t: 8, w: 65, h: 65 }, pf: { l: 72, t: 20, w: 16, h: 60 }, tf: null },
  laptopTriple: { n: 'Laptop+Devices', cat: 'laptop', bf: { l: 10, t: 3, w: 75, h: 55 }, pf: { l: 5, t: 58, w: 14, h: 40 }, tf: { l: 55, t: 58, w: 30, h: 38 } },
  // === MONITOR (uses browser frame with monitor proportions) ===
  monitor: { n: 'Monitor', cat: 'monitor', bf: { l: 8, t: 3, w: 84, h: 80 }, pf: null, tf: null },
  monitorWide: { n: 'Ultrawide', cat: 'monitor', bf: { l: 3, t: 10, w: 94, h: 60 }, pf: null, tf: null },
  monitorDual: { n: 'Dual Monitor', cat: 'monitor', bf: { l: 2, t: 8, w: 48, h: 70 }, pf: null, tf: { l: 52, t: 8, w: 46, h: 70 } },
  monitorSetup: { n: 'Desk Setup', cat: 'monitor', bf: { l: 12, t: 3, w: 76, h: 60 }, pf: { l: 3, t: 40, w: 12, h: 42 }, tf: { l: 78, t: 25, w: 20, h: 40 } },
  // === WATCH (uses phone frame styled as watch) ===
  watch: { n: 'Watch', cat: 'watch', bf: null, pf: { l: 38, t: 15, w: 14, h: 70 }, tf: null },
  watchDuo: { n: 'Watch Duo', cat: 'watch', bf: null, pf: { l: 20, t: 15, w: 14, h: 70 }, tf: null, pf2: { l: 55, t: 15, w: 14, h: 70 } },
  watchPhone: { n: 'Watch+Phone', cat: 'watch', bf: null, pf: { l: 15, t: 10, w: 12, h: 65 }, tf: null, pf2: { l: 50, t: 8, w: 20, h: 84 } },
  // === FLOATING ===
  floatCenter: { n: 'Float Center', cat: 'creative', bf: { l: 15, t: 15, w: 70, h: 70 }, pf: null, tf: null },
  floatStack: { n: 'Float Stack', cat: 'creative', bf: { l: 10, t: 5, w: 60, h: 55 }, pf: { l: 50, t: 30, w: 16, h: 50 }, tf: { l: 65, t: 45, w: 25, h: 40 } }
};

const LAY_CATS = { single: 'Single Device', multi: 'Multi Device', creative: 'Creative', bento: 'Bento Grid', showcase: 'Showcase', fullscreen: 'Fullscreen', isometric: 'Isometric', editorial: 'Editorial', social: 'Social', laptop: 'Laptop', monitor: 'Monitor', watch: 'Watch' };

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
  { id: 'wireframe', n: 'Wireframe', bg: 'linear-gradient(135deg,#ffffff,#f5f5f5)' },
  { id: 'aurora', n: 'Aurora', bg: 'linear-gradient(135deg,#0f172a,#1e1b4b,#312e81)' },
  { id: 'sunset', n: 'Sunset', bg: 'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)' },
  { id: 'ocean', n: 'Ocean', bg: 'linear-gradient(135deg,#0ea5e9,#06b6d4,#14b8a6)' },
  { id: 'forest', n: 'Forest', bg: 'linear-gradient(135deg,#064e3b,#065f46,#047857)' },
  { id: 'midnight', n: 'Midnight', bg: 'linear-gradient(135deg,#020617,#0f172a,#1e293b)' },
  { id: 'rose', n: 'Rose', bg: 'linear-gradient(135deg,#fce7f3,#fbcfe8,#f9a8d4)' },
  { id: 'monochrome', n: 'Mono', bg: 'linear-gradient(135deg,#27272a,#3f3f46,#52525b)' },
  { id: 'luxury', n: 'Luxury', bg: 'linear-gradient(135deg,#1c1917,#292524,#44403c)' },
  { id: 'paper', n: 'Paper', bg: 'linear-gradient(135deg,#faf8f5,#f5f0e8,#ede5d8)' },
  { id: 'holographic', n: 'Holo', bg: 'linear-gradient(135deg,#c084fc,#818cf8,#22d3ee,#a3e635)' }
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
  { n: 'Bento Asym', s: 'Asymmetric grid', cat: 'bento', lay: 'bentoAsym', bg: 'noir', theme: 'neo' },
  // === Social Media ===
  { n: 'IG Story', s: 'Story format', cat: 'social', lay: 'story', bg: 'mysticRose', theme: 'default' },
  { n: 'IG Post', s: 'Square post', cat: 'social', lay: 'postView', bg: 'mysticLilac', theme: 'glass' },
  { n: 'Social Twin', s: 'Side by side', cat: 'social', lay: 'socialDuo', bg: 'mysticSky', theme: 'default' },
  { n: 'TikTok', s: 'Vertical video', cat: 'social', lay: 'fullPhone', bg: 'cosmicNebula', theme: 'dark' },
  // === Presentation ===
  { n: 'Pitch Deck', s: 'Investor pitch', cat: 'presentation', lay: 'center', bg: 'midnight', theme: 'glass' },
  { n: 'Case Study', s: 'UX case study', cat: 'presentation', lay: 'editorial1', bg: 'snow', theme: 'minimal' },
  { n: 'Feature Show', s: 'Product features', cat: 'presentation', lay: 'isoLeft', bg: 'meshPurple', theme: 'neo' },
  { n: 'Comparison', s: 'Before/after', cat: 'presentation', lay: 'editorial3', bg: 'cream', theme: 'clay' },
  // === Dribbble/Behance ===
  { n: 'Dribbble Shot', s: 'Portfolio shot', cat: 'dribbble', lay: 'heroFloat', bg: 'radPink', theme: 'default' },
  { n: 'Behance Hero', s: 'Project cover', cat: 'dribbble', lay: 'hero', bg: 'cosmicDeep', theme: 'dark' },
  { n: 'Minimal Shot', s: 'Clean & simple', cat: 'dribbble', lay: 'minCenter', bg: 'glassFrost', theme: 'frosted' },
  { n: 'Bold Shot', s: 'Statement piece', cat: 'dribbble', lay: 'panorama', bg: 'absIndigo', theme: 'neo' },
  // === Isometric ===
  { n: 'Iso Mockup', s: '3D perspective', cat: 'isometric', lay: 'isoLeft', bg: 'meshAurora', theme: 'glass' },
  { n: 'Iso Right', s: 'Right angle 3D', cat: 'isometric', lay: 'isoRight', bg: 'cosmicNebula', theme: 'dark' },
  { n: 'Iso Triple', s: 'Triple device 3D', cat: 'isometric', lay: 'isoTriple', bg: 'meshTwilight', theme: 'neo' },
  // === Glass/Frosted ===
  { n: 'Glass Card', s: 'Frosted glass', cat: 'glass', lay: 'center', bg: 'glassFrost', theme: 'frosted' },
  { n: 'Glass Dark', s: 'Dark glass', cat: 'glass', lay: 'heroFloat', bg: 'glassDark', theme: 'glass' },
  { n: 'Glass Rose', s: 'Pink frosted', cat: 'glass', lay: 'duo', bg: 'glassRose', theme: 'frosted' },
  // === Texture ===
  { n: 'Wood Desk', s: 'Natural wood', cat: 'texture', lay: 'hero', bg: 'txWood', theme: 'default' },
  { n: 'Marble', s: 'Marble surface', cat: 'texture', lay: 'center', bg: 'txMarble', theme: 'minimal' },
  { n: 'Gold Luxury', s: 'Premium gold', cat: 'texture', lay: 'heroFloat', bg: 'txGold', theme: 'luxury' },
  { n: 'Paper Note', s: 'Paper texture', cat: 'texture', lay: 'minCenter', bg: 'txPaper', theme: 'paper' },
  // === Laptop ===
  { n: 'Laptop Hero', s: 'MacBook mockup', cat: 'laptop', lay: 'laptop', bg: 'charcoal', theme: 'dark' },
  { n: 'Laptop Open', s: 'Open laptop', cat: 'laptop', lay: 'laptopOpen', bg: 'midnight', theme: 'glass' },
  { n: 'Laptop+Phone', s: 'Responsive pair', cat: 'laptop', lay: 'laptopDuo', bg: 'meshPurple', theme: 'neo' },
  { n: 'Laptop Desk', s: 'Desk scene', cat: 'laptop', lay: 'laptopSide', bg: 'txWood', theme: 'default' },
  { n: 'Full Setup', s: 'All devices', cat: 'laptop', lay: 'laptopTriple', bg: 'noir', theme: 'dark' },
  // === Monitor ===
  { n: 'iMac View', s: 'Desktop monitor', cat: 'monitor', lay: 'monitor', bg: 'snow', theme: 'minimal' },
  { n: 'Ultrawide', s: 'Wide display', cat: 'monitor', lay: 'monitorWide', bg: 'charcoal', theme: 'dark' },
  { n: 'Dual Monitor', s: 'Two screens', cat: 'monitor', lay: 'monitorDual', bg: 'midnight', theme: 'glass' },
  { n: 'Desk Setup', s: 'Multi-device desk', cat: 'monitor', lay: 'monitorSetup', bg: 'meshOcean', theme: 'neo' },
  // === Watch ===
  { n: 'Watch App', s: 'Smartwatch UI', cat: 'watch', lay: 'watch', bg: 'noir', theme: 'dark' },
  { n: 'Watch Duo', s: 'Two watch faces', cat: 'watch', lay: 'watchDuo', bg: 'cosmicDeep', theme: 'dark' },
  { n: 'Watch+Phone', s: 'Watch companion', cat: 'watch', lay: 'watchPhone', bg: 'meshPurple', theme: 'neo' },
  // === Cosmic ===
  { n: 'Cosmic App', s: 'Space themed', cat: 'social', lay: 'fullPhone', bg: 'cosmicNebula', theme: 'dark' },
  { n: 'Aurora Shot', s: 'Northern lights', cat: 'presentation', lay: 'hero', bg: 'cosmicAurora', theme: 'aurora' },
  // === Earth ===
  { n: 'Desert View', s: 'Sandy tones', cat: 'texture', lay: 'center', bg: 'earthDesert', theme: 'default' },
  { n: 'Mountain Air', s: 'Mountain scene', cat: 'texture', lay: 'panorama', bg: 'earthMountain', theme: 'frosted' },
  // === Mystic ===
  { n: 'Dream Flow', s: 'Dreamy gradient', cat: 'glass', lay: 'heroFloat', bg: 'mysticDream', theme: 'frosted' },
  { n: 'Soft Glow', s: 'Gentle radiance', cat: 'glass', lay: 'center', bg: 'radPink', theme: 'pastel' }
];

const TPL_CATS = { saas: 'SaaS', portfolio: 'Portfolio', mobile: 'Mobile', dashboard: 'Dashboard', ecommerce: 'E-Commerce', startup: 'Startup', agency: 'Agency', multidevice: 'Multi-Device', bento: 'Bento', social: 'Social', presentation: 'Presentation', dribbble: 'Dribbble', isometric: 'Isometric', glass: 'Glass', texture: 'Texture', laptop: 'Laptop', monitor: 'Monitor', watch: 'Watch' };
