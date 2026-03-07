// ==================== DYNAMIC UI BUILDER ====================
let _layFilter = 'all';

function buildUI() {
  // Layouts — with category filtering
  renderLayoutGrid();

  // Layout category tabs
  const catBar = $('layCats');
  if (catBar) {
    catBar.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'cat-btn act'; allBtn.textContent = 'All'; allBtn.dataset.cat = 'all';
    allBtn.onclick = () => filterLayouts('all');
    catBar.appendChild(allBtn);
    Object.entries(LAY_CATS).forEach(([k, v]) => {
      const b = document.createElement('button');
      b.className = 'cat-btn'; b.textContent = v; b.dataset.cat = k;
      b.onclick = () => filterLayouts(k);
      catBar.appendChild(b);
    });
  }

  // Backgrounds — categorized gradient grid
  renderCategorizedBgGrid();

  // Solid color presets (extended palette)
  if (typeof renderSolidPresetsExtended === 'function') renderSolidPresetsExtended();
  else renderSolidPresets();

  // Shadow scene grid (Scenes tab)
  if (typeof renderShadowSceneGrid === 'function') renderShadowSceneGrid();

  // Corner presets
  if (typeof renderCornerPresets === 'function') renderCornerPresets();

  // Shadow presets
  if (typeof renderShadowPresets === 'function') renderShadowPresets();

  // Scene presets (per-frame shadows)
  if (typeof renderScenePresets === 'function') renderScenePresets();

  // Themes
  const tg = $('themeGrid'); tg.innerHTML = '';
  THEMES.forEach(t => {
    const d = document.createElement('div');
    d.className = 'theme-card' + (S.theme === t.id ? ' act' : '');
    d.dataset.theme = t.id;
    d.style.background = t.bg;
    d.onclick = () => setTheme(t.id);
    d.innerHTML = `<span>${t.n}</span>`;
    tg.appendChild(d);
  });

  // Templates
  renderTemplateGrid();

  // Template category tabs
  const tplCatBar = $('tplCats');
  if (tplCatBar) {
    tplCatBar.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'tpl-cat-btn act'; allBtn.textContent = 'All'; allBtn.dataset.cat = 'all';
    allBtn.onclick = () => filterTemplates('all');
    tplCatBar.appendChild(allBtn);
    Object.entries(TPL_CATS).forEach(([k, v]) => {
      const b = document.createElement('button');
      b.className = 'tpl-cat-btn'; b.textContent = v; b.dataset.cat = k;
      b.onclick = () => filterTemplates(k);
      tplCatBar.appendChild(b);
    });
  }

  renderPresets();
}

// ==================== CATEGORIZED GRADIENT GRID ====================
const BGS_CATEGORIES = {
  warm: { n: 'Warm', keys: ['sahara', 'peach', 'honey', 'coffee', 'cream', 'coral', 'blush', 'rose', 'wine', 'sunset', 'terracotta', 'amber'] },
  cool: { n: 'Cool', keys: ['midnight', 'aurora', 'ocean', 'ice', 'arctic', 'sky', 'lavender', 'slate', 'indigo', 'cobalt', 'frost', 'aqua'] },
  nature: { n: 'Nature', keys: ['forest', 'emerald', 'moss', 'sage', 'teal', 'spring', 'earth'] },
  dark: { n: 'Dark', keys: ['charcoal', 'noir', 'obsidian', 'graphite', 'void', 'matrix'] },
  light: { n: 'Light', keys: ['snow', 'pearl', 'linen', 'ivory'] },
  vibrant: { n: 'Vibrant', keys: ['neon', 'electric', 'plasma', 'prism', 'rainbow'] },
  mesh: { n: 'Mesh', keys: ['meshPurple', 'meshGreen', 'meshWarm', 'meshAurora', 'meshRose', 'meshOcean', 'meshSunset', 'meshMint', 'meshTwilight'] },
  studio: { n: 'Studio', keys: ['studioBlack', 'studioWhite', 'studioGray', 'studioCream', 'studioSlate', 'studioCool'] },
  premium: { n: 'Premium', keys: ['velvet', 'copper', 'titanium', 'champagne', 'glacier', 'dusk', 'cherry', 'steel'] },
  mystic: { n: 'Mystic', keys: ['mysticRose', 'mysticLilac', 'mysticMint', 'mysticPeach', 'mysticSky', 'mysticCoral', 'mysticTeal', 'mysticLavender', 'mysticSunrise', 'mysticOcean', 'mysticBlush', 'mysticForest', 'mysticDream', 'mysticGlow', 'mysticIce', 'mysticWine'] },
  abstract: { n: 'Abstract', keys: ['absOrange', 'absPurple', 'absBlue', 'absPink', 'absGreen', 'absRed', 'absTeal', 'absYellow', 'absIndigo', 'absCyan', 'absFuchsia', 'absLime'] },
  radiant: { n: 'Radiant', keys: ['radPink', 'radCoral', 'radPurple', 'radOrange', 'radBlue', 'radGreen', 'radGold', 'radLilac', 'radTeal', 'radRose', 'radSky', 'radMint'] },
  cosmic: { n: 'Cosmic', keys: ['cosmicNebula', 'cosmicVoid', 'cosmicAurora', 'cosmicEmber', 'cosmicDeep', 'cosmicStars'] },
  earthTones: { n: 'Earth', keys: ['earthDesert', 'earthSand', 'earthClay', 'earthStone', 'earthOcean', 'earthMountain', 'earthSunset', 'earthDune'] },
  glass: { n: 'Glass', keys: ['glassClear', 'glassFrost', 'glassDark', 'glassRose', 'glassOcean', 'glassViolet'] },
  texture: { n: 'Texture', keys: ['txWood', 'txMarble', 'txConcrete', 'txFabric', 'txLeather', 'txPaper', 'txDenim', 'txBrick', 'txGold', 'txSilver', 'txRoseGold', 'txBronze'] }
};

function renderCategorizedBgGrid() {
  const container = $('bgCatGrid');
  if (!container) return;
  container.innerHTML = '';
  Object.entries(BGS_CATEGORIES).forEach(([catKey, cat]) => {
    const label = document.createElement('div');
    label.className = 'bg-cat-label';
    label.textContent = cat.n;
    container.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'bg-grid';
    cat.keys.forEach(k => {
      if (!BGS[k]) return;
      const d = document.createElement('div');
      d.className = 'bg-sw' + (S.bg === k ? ' act' : '');
      d.dataset.bg = k;
      d.style.background = BGS[k];
      d.title = k;
      d.onclick = () => setBg(k);
      grid.appendChild(d);
    });
    container.appendChild(grid);
  });
}

// ==================== SOLID COLOR PRESETS ====================
const SOLID_COLORS = [
  '#ffffff', '#f5f5f5', '#e0e0e0', '#9e9e9e', '#616161', '#424242', '#212121', '#000000',
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
  '#795548', '#607d8b', '#c9956b', '#f5f0eb', '#fce4ec', '#e8eaf6', '#e0f7fa', '#e8f5e9'
];

function renderSolidPresets() {
  const el = $('solidPresets');
  if (!el) return;
  el.innerHTML = '';
  SOLID_COLORS.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'solid-sw';
    sw.style.background = c;
    sw.title = c;
    sw.onclick = () => { setBgCustom(c); if ($('custBg')) $('custBg').value = c };
    el.appendChild(sw);
  });
}

function filterLayouts(cat) {
  _layFilter = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('act', b.dataset.cat === cat));
  renderLayoutGrid();
}

function renderLayoutGrid() {
  const lg = $('layGrid'); lg.innerHTML = '';
  Object.keys(LAYS).forEach(k => {
    const l = LAYS[k];
    if (_layFilter !== 'all' && l.cat !== _layFilter) return;
    const d = document.createElement('div');
    d.className = 'lay-opt' + (S.layout === k ? ' act' : '');
    d.dataset.lay = k;
    d.title = l.n;
    d.onclick = () => setLayout(k);
    let svg = '<svg viewBox="0 0 64 40">';
    if (l.bf) svg += `<rect x="${l.bf.l * .64}" y="${l.bf.t * .4}" width="${l.bf.w * .64}" height="${l.bf.h * .4}" rx="3" fill="none" stroke="#c9956b" stroke-width="1.2"/>`;
    if (l.pf) svg += `<rect x="${l.pf.l * .64}" y="${l.pf.t * .4}" width="${l.pf.w * .64}" height="${l.pf.h * .4}" rx="4" fill="none" stroke="#c9956b" stroke-width="1.2"/>`;
    if (l.tf) svg += `<rect x="${l.tf.l * .64}" y="${l.tf.t * .4}" width="${l.tf.w * .64}" height="${l.tf.h * .4}" rx="2" fill="none" stroke="#c9956b" stroke-width="1.2"/>`;
    if (l.pf2) svg += `<rect x="${l.pf2.l * .64}" y="${l.pf2.t * .4}" width="${l.pf2.w * .64}" height="${l.pf2.h * .4}" rx="4" fill="none" stroke="#c9956b" stroke-width="1.2"/>`;
    svg += '</svg>';
    d.innerHTML = svg;
    lg.appendChild(d);
  });
}

function renderTemplateGrid() {
  const tp = $('tplGrid'); tp.innerHTML = '';
  const filter = _tplFilter || 'all';
  TPLS.forEach((t, i) => {
    if (filter !== 'all' && t.cat !== filter) return;
    const bgVal = BGS[t.bg] || BGS.sahara;
    const d = document.createElement('div');
    d.className = 'tpl-card';
    d.style.background = bgVal;
    d.onclick = () => applyTemplate(i);
    d.innerHTML = `<span>${escHtml(t.n)}</span><small>${escHtml(t.s)}</small>`;
    tp.appendChild(d);
  });
}

let _tplFilter = 'all';
function filterTemplates(cat) {
  _tplFilter = cat;
  document.querySelectorAll('.tpl-cat-btn').forEach(b => b.classList.toggle('act', b.dataset.cat === cat));
  renderTemplateGrid();
}

// ==================== SECTION COLLAPSE ====================
function togSec(el) {
  const body = el.parentElement.querySelector('.sec-body');
  const arrow = el.querySelector('.sec-arrow');
  if (body) {
    body.classList.toggle('collapsed');
    if (body.classList.contains('collapsed')) {
      body.style.maxHeight = '0';
      if (arrow) arrow.classList.add('collapsed');
    } else {
      body.style.maxHeight = body.scrollHeight + 200 + 'px';
      if (arrow) arrow.classList.remove('collapsed');
    }
  }
}

// ==================== TAB SWITCHING ====================
function swTab(name) {
  document.querySelectorAll('#rightSb .rail-icon[data-tab]').forEach(t => t.classList.toggle('act', t.dataset.tab === name));
  document.querySelectorAll('.tab-body').forEach(tb => tb.classList.remove('act'));
  const target = $('tab' + name.charAt(0).toUpperCase() + name.slice(1));
  if (target) target.classList.add('act');
}

// ==================== LEFT PANEL SWITCHING ====================
const _panelNames = { uploads: 'Upload Assets', layouts: 'Layouts', templates: 'Templates', themes: 'Frame Theme', backgrounds: 'Background', labels: 'Labels', brand: 'Brand Kit', dynamic: 'Custom Screens' };
let _activePanel = 'uploads';

function togPanel(name) {
  const panel = $('sbPanel');
  if (_activePanel === name && !panel.classList.contains('collapsed')) {
    // Same panel clicked again — collapse
    panel.classList.add('collapsed');
    document.querySelectorAll('.rail-icon').forEach(r => r.classList.remove('act'));
    _activePanel = null;
    return;
  }
  _activePanel = name;
  // Show panel
  panel.classList.remove('collapsed');
  // Switch active icon
  document.querySelectorAll('.rail-icon').forEach(r => r.classList.toggle('act', r.dataset.panel === name));
  // Switch content
  document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('act'));
  const target = $('panel' + name.charAt(0).toUpperCase() + name.slice(1));
  if (target) target.classList.add('act');
  // Update title
  $('panelTitle').textContent = _panelNames[name] || name;
}

function closePanel() {
  $('sbPanel').classList.add('collapsed');
  document.querySelectorAll('.rail-icon').forEach(r => r.classList.remove('act'));
  _activePanel = null;
}

function togPanelCollapse() {
  const panel = $('sbPanel');
  const btn = $('panelToggleBtn');
  const isCollapsed = panel.classList.contains('collapsed');
  if (isCollapsed) {
    // Expand — restore last active panel or default to uploads
    const target = _activePanel || 'uploads';
    togPanel(target);
    if (btn) {
      btn.querySelector('.ri-txt').textContent = 'Hide';
      btn.querySelector('.ri-ico svg').style.transform = '';
    }
  } else {
    // Collapse
    panel.classList.add('collapsed');
    document.querySelectorAll('.rail-icon[data-panel]').forEach(r => r.classList.remove('act'));
    if (btn) {
      btn.querySelector('.ri-txt').textContent = 'Show';
      btn.querySelector('.ri-ico svg').style.transform = 'rotate(180deg)';
    }
  }
}
