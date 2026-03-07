// ==================== BACKGROUND ====================
function setBg(k) {
  pushHistory();
  S.bg = k; S.bgCustom = null;
  document.querySelectorAll('.bg-sw').forEach(el => el.classList.toggle('act', el.dataset.bg === k));
  $('ms').style.background = BGS[k];
}

function setBgCustom(v) {
  S.bgCustom = v; S.bg = 'custom';
  document.querySelectorAll('.bg-sw').forEach(el => el.classList.remove('act'));
  $('ms').style.background = v;
}

// ==================== THEME ====================
function setTheme(id) {
  pushHistory();
  S.theme = id;
  document.querySelectorAll('.theme-card').forEach(el => el.classList.toggle('act', el.dataset.theme === id));
  const ms = $('ms');
  THEMES.forEach(t => ms.classList.remove('th-' + t.id));
  if (id !== 'default') ms.classList.add('th-' + id);
}

// ==================== TEMPLATE ====================
function applyTemplate(i) {
  pushHistory();
  const t = TPLS[i];
  setLayout(t.lay);
  setBg(t.bg);
  setTheme(t.theme);
  toast('✓ Template "' + t.n + '" applied');
}

// ==================== FRAME COLOR ====================
function setFrmCol(c) {
  S.frameColor = c;
  $('bf').style.backgroundColor = c;
  $('pf').style.backgroundColor = c;
  $('tf').style.backgroundColor = c;
  if ($('pf2')) $('pf2').style.backgroundColor = c;
  const dk = c === '#000000' || c === '#1a1a1e';
  $('bBar').style.background = dk ? 'rgba(30,30,30,.95)' : 'rgba(245,245,245,.95)';
  $('bNav').style.background = dk ? 'rgba(30,30,30,.9)' : 'rgba(250,250,250,.9)';
  document.querySelectorAll('.b-ctrl span').forEach(s => s.style.color = dk ? '#555' : '#ccc');
  document.querySelectorAll('.addr span').forEach(s => s.style.color = dk ? '#666' : '#aaa');
  document.querySelectorAll('.b-nav span').forEach(s => s.style.color = dk ? '#666' : '#999');
}

// ==================== STYLE CONTROLS ====================
function setRnd(v) { S.round = v; $('rvR').textContent = v + 'px'; $('bf').style.borderRadius = v + 'px' }
function setShd(v) {
  S.shadow = parseInt(v);
  $('rvS').textContent = v + '%';
  // Sync global depth to all per-frame shadows so they stay consistent
  if (S.frameShadows) {
    ['bf', 'pf', 'tf', 'pf2'].forEach(id => {
      if (S.frameShadows[id]) S.frameShadows[id].depth = parseInt(v);
    });
    // Update Scenes-tab depth labels
    var sfxMap = { bf: 'Bf', pf: 'Pf', tf: 'Tf', pf2: 'Pf2' };
    Object.keys(sfxMap).forEach(id => {
      var el = $(('rvFs' + sfxMap[id]));
      if (el) el.textContent = v + '%';
    });
  }
  applyShadow();
}
function setPSc(v) { S.phoneScale = v; $('rvP').textContent = v + '%'; applyLayout() }
function setPad(v) { S.pad = v; $('rvPd').textContent = v + '%'; applyLayout() }
function setBgBlur(v) { S.bgBlur = v; $('rvBl').textContent = v + 'px'; $('msBgImg').style.filter = 'blur(' + v + 'px)' }

function applyShadow() {
  // Delegate entirely to the per-frame shadow system so Scenes-tab
  // customisations are never overwritten by a layout/template change.
  if (typeof applyAllFrameShadows === 'function') applyAllFrameShadows();
}

// ==================== TOGGLES ====================
function togNav() { S.showNav = !S.showNav; $('tN').classList.toggle('on'); $('bNav').style.display = S.showNav ? 'flex' : 'none'; const h = S.showNav ? 48 : 28; $('bBody').style.height = 'calc(100% - ' + h + 'px)' }
function togIsland() { S.showIsland = !S.showIsland; $('tI').classList.toggle('on'); $('pIsl').style.display = S.showIsland ? 'block' : 'none'; if ($('pIsl2')) $('pIsl2').style.display = S.showIsland ? 'block' : 'none' }
function togRefl() { S.showRefl = !S.showRefl; $('tR').classList.toggle('on'); $('ms').classList.toggle('reflection') }
function togWm() { S.showWm = !S.showWm; $('tW').classList.toggle('on'); $('wm').style.display = S.showWm ? 'block' : 'none' }
function togBgOv() { S.showBgOv = !S.showBgOv; $('tOv').classList.toggle('on'); $('msBgOv').style.background = S.showBgOv ? 'rgba(0,0,0,.3)' : 'none' }

// ==================== PER-FRAME SHADOW SYSTEM ====================
const FRAME_SHADOW_PRESETS = [
  { n: 'None', icon: '○', vals: { depth: 0, x: 0, y: 0, blur: 0, spread: 0, opacity: 0 } },
  { n: 'Soft', icon: '◐', vals: { depth: 30, x: 0, y: 4, blur: 16, spread: 0, opacity: 12 } },
  { n: 'Medium', icon: '◑', vals: { depth: 50, x: 0, y: 8, blur: 32, spread: 0, opacity: 18 } },
  { n: 'Heavy', icon: '●', vals: { depth: 80, x: 0, y: 12, blur: 48, spread: 0, opacity: 25 } },
  { n: 'Float', icon: '◉', vals: { depth: 60, x: 0, y: 20, blur: 60, spread: -8, opacity: 22 } },
  { n: 'Sharp', icon: '◼', vals: { depth: 40, x: 4, y: 4, blur: 0, spread: 0, opacity: 30 } },
  { n: 'Left', icon: '◧', vals: { depth: 50, x: -16, y: 8, blur: 30, spread: 0, opacity: 18 } },
  { n: 'Right', icon: '◨', vals: { depth: 50, x: 16, y: 8, blur: 30, spread: 0, opacity: 18 } },
  { n: 'Bottom', icon: '◩', vals: { depth: 60, x: 0, y: 24, blur: 40, spread: -4, opacity: 20 } },
  { n: 'Glow', icon: '◎', vals: { depth: 70, x: 0, y: 0, blur: 40, spread: 10, opacity: 15 } },
  { n: 'Deep', icon: '◆', vals: { depth: 90, x: 0, y: 16, blur: 72, spread: -6, opacity: 30 } },
  { n: 'Flat', icon: '▬', vals: { depth: 20, x: 2, y: 2, blur: 6, spread: 0, opacity: 10 } }
];

function setFrameShadow(frameId, prop, value) {
  if (!S.frameShadows[frameId]) return;
  const v = (prop === 'color') ? value : parseInt(value);
  S.frameShadows[frameId][prop] = v;
  // Update display label
  const sfx = frameId.charAt(0).toUpperCase() + frameId.slice(1);
  const labelMap = { depth: 'rvFs', x: 'rvFsX', y: 'rvFsY', blur: 'rvFsBl', spread: 'rvFsSp' };
  if (labelMap[prop]) {
    const el = $(labelMap[prop] + sfx);
    if (el) el.textContent = v + (prop === 'depth' ? '%' : (prop === 'blur' || prop === 'spread' ? '' : ''));
  }
  _applyFrameShadow(frameId);
}

function _applyFrameShadow(frameId) {
  const el = $(frameId);
  if (!el) return;
  const s = S.frameShadows[frameId];
  if (!s) return;
  const i = s.depth / 100;
  const ox = s.x || 0;
  const oy = s.y || 0;
  const bl = s.blur || 0;
  const sp = s.spread || 0;
  const col = s.color || '#000000';
  const op = (s.opacity || 0) / 100;

  // Build multi-layer shadow: base depth shadow + custom offset/blur/spread
  const layers = [];
  // Depth-based diffused shadow (like the original applyShadow)
  if (i > 0) {
    layers.push(`0 ${Math.round(2 * i)}px ${Math.round(4 * i)}px rgba(0,0,0,${(.04 * i).toFixed(3)})`);
    layers.push(`0 ${Math.round(8 * i)}px ${Math.round(16 * i)}px rgba(0,0,0,${(.06 * i).toFixed(3)})`);
    layers.push(`0 ${Math.round(20 * i)}px ${Math.round(48 * i)}px rgba(0,0,0,${(.1 * i).toFixed(3)})`);
    layers.push(`0 ${Math.round(32 * i)}px ${Math.round(72 * i)}px rgba(0,0,0,${(.14 * i).toFixed(3)})`);
  }
  // Custom directional shadow
  if (op > 0 && (bl > 0 || ox !== 0 || oy !== 0 || sp !== 0)) {
    const r = parseInt(col.slice(1, 3), 16);
    const g = parseInt(col.slice(3, 5), 16);
    const b = parseInt(col.slice(5, 7), 16);
    layers.push(`${ox}px ${oy}px ${bl}px ${sp}px rgba(${r},${g},${b},${op.toFixed(2)})`);
  }
  el.style.boxShadow = layers.length ? layers.join(',') : 'none';
}

function applyAllFrameShadows() {
  ['bf', 'pf', 'tf', 'pf2'].forEach(id => _applyFrameShadow(id));
}

function resetFrameShadow(frameId) {
  pushHistory();
  S.frameShadows[frameId] = { depth: 50, x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 20, preset: null };
  _applyFrameShadow(frameId);
  _syncFrameShadowUI(frameId);
  toast('↺ ' + frameId.toUpperCase() + ' shadow reset');
}

function applyFrameShadowPreset(frameId, presetIdx) {
  pushHistory();
  const p = FRAME_SHADOW_PRESETS[presetIdx];
  if (!p) return;
  Object.assign(S.frameShadows[frameId], p.vals);
  S.frameShadows[frameId].preset = presetIdx;
  _applyFrameShadow(frameId);
  _syncFrameShadowUI(frameId);
  toast('✓ ' + p.n + ' shadow on ' + frameId.toUpperCase());
}

function _syncFrameShadowUI(frameId) {
  const s = S.frameShadows[frameId];
  const sfx = frameId.charAt(0).toUpperCase() + frameId.slice(1);
  // Update range values and labels via parent tab DOM
  const tab = $('tabScenes');
  if (!tab) return;
  const ranges = tab.querySelectorAll('input[type="range"]');
  ranges.forEach(r => {
    const fn = r.getAttribute('oninput');
    if (!fn || !fn.includes("'" + frameId + "'")) return;
    if (fn.includes("'depth'")) { r.value = s.depth; }
    else if (fn.includes("'x'")) { r.value = s.x; }
    else if (fn.includes("'y'")) { r.value = s.y; }
    else if (fn.includes("'blur'")) { r.value = s.blur; }
    else if (fn.includes("'spread'")) { r.value = s.spread; }
    else if (fn.includes("'opacity'")) { r.value = s.opacity; }
  });
  const colEl = $('fs' + sfx + 'Col');
  if (colEl) colEl.value = s.color || '#000000';
  // Update labels
  const lbl = { 'rvFs': s.depth + '%', 'rvFsX': s.x, 'rvFsY': s.y, 'rvFsBl': s.blur, 'rvFsSp': s.spread };
  Object.entries(lbl).forEach(([k, v]) => { const e = $(k + sfx); if (e) e.textContent = v; });
}

function renderScenePresets() {
  ['bf', 'pf', 'tf', 'pf2'].forEach(frameId => {
    const map = { bf: 'desktopScenePresets', pf: 'mobileScenePresets', tf: 'tabletScenePresets', pf2: 'phone2ScenePresets' };
    const container = $(map[frameId]);
    if (!container) return;
    container.innerHTML = '';
    FRAME_SHADOW_PRESETS.forEach((p, i) => {
      const btn = document.createElement('div');
      btn.className = 'scene-preset-btn' + (S.frameShadows[frameId] && S.frameShadows[frameId].preset === i ? ' act' : '');
      btn.title = p.n;
      btn.textContent = p.icon;
      btn.onclick = () => applyFrameShadowPreset(frameId, i);
      container.appendChild(btn);
    });
  });
  // Render global shadow preset grid
  _renderScenePresetGrid();
}

function _renderScenePresetGrid() {
  const grid = $('scenePresetGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const combos = [
    { n: 'Subtle All', desc: 'Soft shadows on all frames', apply: () => { ['bf', 'pf', 'tf', 'pf2'].forEach(f => applyFrameShadowPreset(f, 1)) } },
    { n: 'Floating Cards', desc: 'Float effect on all frames', apply: () => { ['bf', 'pf', 'tf', 'pf2'].forEach(f => applyFrameShadowPreset(f, 4)) } },
    { n: 'Deep Desktop', desc: 'Heavy desktop, soft mobile', apply: () => { applyFrameShadowPreset('bf', 10); applyFrameShadowPreset('pf', 1); applyFrameShadowPreset('tf', 2); applyFrameShadowPreset('pf2', 1) } },
    { n: 'Sharp Edges', desc: 'Hard sharp shadows everywhere', apply: () => { ['bf', 'pf', 'tf', 'pf2'].forEach(f => applyFrameShadowPreset(f, 5)) } },
    { n: 'No Shadow', desc: 'Remove all shadows', apply: () => { ['bf', 'pf', 'tf', 'pf2'].forEach(f => applyFrameShadowPreset(f, 0)) } },
    { n: 'Glow All', desc: 'Soft glow around all frames', apply: () => { ['bf', 'pf', 'tf', 'pf2'].forEach(f => applyFrameShadowPreset(f, 9)) } },
    { n: 'Dramatic', desc: 'Deep desktop, float mobile', apply: () => { applyFrameShadowPreset('bf', 10); applyFrameShadowPreset('pf', 4); applyFrameShadowPreset('tf', 10); applyFrameShadowPreset('pf2', 4) } },
    { n: 'Offset Right', desc: 'Right-side shadows', apply: () => { ['bf', 'pf', 'tf', 'pf2'].forEach(f => applyFrameShadowPreset(f, 7)) } }
  ];
  combos.forEach(c => {
    const card = document.createElement('div');
    card.className = 'scene-combo-card';
    card.onclick = () => { pushHistory(); c.apply(); toast('✓ ' + c.n) };
    card.innerHTML = `<span class="scene-combo-n">${c.n}</span><span class="scene-combo-d">${c.desc}</span>`;
    grid.appendChild(card);
  });
}
