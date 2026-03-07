//  Shahar Dil Se Surendra bhai mafi mangta hun
// ==================== GRID & RULER SYSTEM ====================
let _gridVisible = false;
let _rulerVisible = false;

function toggleGrid() {
  _gridVisible = !_gridVisible;
  const ms = $('ms');
  if (_gridVisible) {
    ms.classList.add('show-grid');
    $('gridBtn').classList.add('act');
  } else {
    ms.classList.remove('show-grid');
    $('gridBtn').classList.remove('act');
  }
}

function toggleRulers() {
  _rulerVisible = !_rulerVisible;
  const rulerH = $('rulerH');
  const rulerV = $('rulerV');
  if (rulerH) rulerH.style.display = _rulerVisible ? 'block' : 'none';
  if (rulerV) rulerV.style.display = _rulerVisible ? 'block' : 'none';
  $('rulerBtn').classList.toggle('act', _rulerVisible);
}

function buildRulers() {
  const cv = $('stageCv');
  if (!cv) return;

  // Horizontal ruler
  let rh = document.createElement('div');
  rh.id = 'rulerH'; rh.className = 'ruler ruler-h'; rh.style.display = 'none';
  let marks = '';
  for (let i = 0; i <= 960; i += 50) {
    marks += `<span class="ruler-mark" style="left:${(i / 960) * 100}%">${i}</span>`;
  }
  rh.innerHTML = marks;
  cv.appendChild(rh);

  // Vertical ruler
  let rv = document.createElement('div');
  rv.id = 'rulerV'; rv.className = 'ruler ruler-v'; rv.style.display = 'none';
  marks = '';
  for (let i = 0; i <= 600; i += 50) {
    marks += `<span class="ruler-mark" style="top:${(i / 600) * 100}%">${i}</span>`;
  }
  rv.innerHTML = marks;
  cv.appendChild(rv);
}

// ==================== PERSPECTIVE / 3D TILT ====================
let _perspective = { enabled: false, rotateX: 0, rotateY: 0, rotateZ: 0, perspective: 1000 };

function togPerspective() {
  _perspective.enabled = !_perspective.enabled;
  $('perspBtn').classList.toggle('act', _perspective.enabled);
  if (!_perspective.enabled) {
    _perspective.rotateX = 0; _perspective.rotateY = 0; _perspective.rotateZ = 0;
    $('ms').style.transform = '';
    $('ms').style.perspective = '';
    if ($('perspX')) $('perspX').value = 0;
    if ($('perspY')) $('perspY').value = 0;
    if ($('perspZ')) $('perspZ').value = 0;
  } else {
    applyPerspective();
  }
  toast(_perspective.enabled ? '📐 3D mode ON' : '📐 3D mode OFF');
}

function setPerspective(axis, v) {
  if (!_perspective.enabled) return;
  _perspective['rotate' + axis.toUpperCase()] = parseInt(v);
  applyPerspective();
}

function applyPerspective() {
  const ms = $('ms');
  ms.style.perspective = _perspective.perspective + 'px';
  ms.style.transform = `rotateX(${_perspective.rotateX}deg) rotateY(${_perspective.rotateY}deg) rotateZ(${_perspective.rotateZ}deg)`;
  ms.style.transformStyle = 'preserve-3d';
  ms.style.transition = 'transform .4s var(--ease-out)';
}

// ==================== PROJECT SAVE/LOAD ====================
function saveProject() {
  _saveCurrentArtboard();
  const project = {
    version: 2,
    name: 'MockupStudio Project',
    created: new Date().toISOString(),
    state: {
      artboards: S.artboards,
      activeArtboard: S.activeArtboard,
      _abCounter: S._abCounter
    }
  };
  const data = JSON.stringify(project);
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'mockup-project-' + Date.now() + '.mockup';
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  toast('✓ Project saved');
}

function loadProject() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.mockup,.json';
  input.onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const proj = JSON.parse(ev.target.result);
        if (!proj.state || !Array.isArray(proj.state.artboards)) throw new Error('Invalid project');
        S.artboards = proj.state.artboards;
        S.activeArtboard = proj.state.activeArtboard || 0;
        S._abCounter = proj.state._abCounter || S.artboards.length;
        _loadArtboard(S.artboards[S.activeArtboard]);
        renderArtboardNav();
        toast('✓ Project loaded');
      } catch (err) { toast('✕ Invalid project file') }
    }; r.readAsText(f);
  };
  input.click();
}

// ==================== AUTO-LAYOUT / DISTRIBUTE ====================
function distributeFrames(axis) {
  if (!S.freeMode) { toast('Enable free mode first'); return }
  const frames = ['bf', 'pf', 'tf'].filter(id => !$(id).classList.contains('hidden'));
  if (frames.length < 2) return;

  const msW = 960, msH = 600;

  if (axis === 'h') {
    // Distribute horizontally with equal spacing
    const totalW = frames.reduce((sum, id) => sum + $(id).offsetWidth, 0);
    const gap = (msW - totalW) / (frames.length + 1);
    let x = gap;
    frames.forEach(id => {
      const fr = $(id);
      fr.style.left = x + 'px';
      fr.style.right = 'auto';
      fr.style.transform = 'none';
      x += fr.offsetWidth + gap;
    });
  } else {
    const totalH = frames.reduce((sum, id) => sum + $(id).offsetHeight, 0);
    const gap = (msH - totalH) / (frames.length + 1);
    let y = gap;
    frames.forEach(id => {
      const fr = $(id);
      fr.style.top = y + 'px';
      fr.style.bottom = 'auto';
      fr.style.transform = 'none';
      y += fr.offsetHeight + gap;
    });
  }
  pushHistory();
  toast('✓ Frames distributed');
}

function alignFrames(alignment) {
  if (!S.freeMode) { toast('Enable free mode first'); return }
  const frames = ['bf', 'pf', 'tf'].filter(id => !$(id).classList.contains('hidden'));
  if (frames.length < 1) return;

  const msW = 960, msH = 600;

  frames.forEach(id => {
    const fr = $(id);
    const w = fr.offsetWidth, h = fr.offsetHeight;
    if (alignment === 'centerH') fr.style.left = (msW / 2 - w / 2) + 'px';
    if (alignment === 'centerV') fr.style.top = (msH / 2 - h / 2) + 'px';
    if (alignment === 'left') { fr.style.left = '20px'; fr.style.right = 'auto' }
    if (alignment === 'right') { fr.style.left = (msW - w - 20) + 'px'; fr.style.right = 'auto' }
    if (alignment === 'top') { fr.style.top = '20px'; fr.style.bottom = 'auto' }
    if (alignment === 'bottom') { fr.style.top = (msH - h - 20) + 'px'; fr.style.bottom = 'auto' }
    fr.style.transform = 'none';
  });
  pushHistory();
  toast('✓ Frames aligned');
}

// ==================== SVG PATTERN BACKGROUNDS ====================
const BG_PATTERNS = {
  dots: { n: 'Dots', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1.5' fill='${c}'/></svg>` },
  grid: { n: 'Grid', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M20 0H0v20' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  diag: { n: 'Diagonal', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><path d='M-1 1l4-4M0 10l10-10M9 11l2-2' stroke='${c}' stroke-width='.5'/></svg>` },
  cross: { n: 'Crosses', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M10 6v8M6 10h8' stroke='${c}' stroke-width='.6' fill='none'/></svg>` },
  waves: { n: 'Waves', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='10'><path d='M0 5c10-7 20 7 40 0' stroke='${c}' stroke-width='.6' fill='none'/></svg>` },
  hex: { n: 'Hexagons', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='49'><path d='M14 0l14 8v16l-14 8L0 24V8z' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  zigzag: { n: 'Zigzag', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='10'><path d='M0 10L5 0l5 10l5-10l5 10' stroke='${c}' stroke-width='.6' fill='none'/></svg>` },
  diamond: { n: 'Diamonds', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M8 0l8 8-8 8-8-8z' fill='none' stroke='${c}' stroke-width='.5'/></svg>` }
};

function renderPatternGrid() {
  const pg = $('patGrid');
  if (!pg) return;
  pg.innerHTML = '';
  Object.keys(BG_PATTERNS).forEach(k => {
    const pat = BG_PATTERNS[k];
    const d = document.createElement('div');
    d.className = 'pat-sw';
    d.title = pat.n;
    const encoded = encodeURIComponent(pat.svg('rgba(150,150,150,.4)'));
    d.style.backgroundImage = `url("data:image/svg+xml,${encoded}")`;
    d.onclick = () => applyPattern(k);
    d.innerHTML = `<span>${pat.n}</span>`;
    pg.appendChild(d);
  });
}

function applyPattern(k) {
  const pat = BG_PATTERNS[k];
  if (!pat) return;
  pushHistory();
  const ms = $('ms');
  const encoded = encodeURIComponent(pat.svg('rgba(150,150,150,.15)'));
  ms.style.backgroundImage = ms.style.background ?
    `url("data:image/svg+xml,${encoded}"),${ms.style.background}`
    : `url("data:image/svg+xml,${encoded}")`;
  S.bgPattern = k;
  toast('✓ Pattern: ' + pat.n);
}

function clearPattern() {
  const ms = $('ms');
  S.bgPattern = null;
  setBg(S.bg);
  toast('✓ Pattern cleared');
}

// ==================== BACKGROUND IMAGE UPLOAD ====================
function handleBgImgUpload(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = function (ev) {
    pushHistory();
    const ms = $('ms');
    ms.style.backgroundImage = `url("${ev.target.result}")`;
    ms.style.backgroundSize = 'cover';
    ms.style.backgroundPosition = 'center';
    S.bgImage = ev.target.result;
    toast('✓ BG image set');
  };
  r.readAsDataURL(f);
}

// ==================== SHAPE TOOLS ====================
let _shapeIdCounter = 0;
S.shapes = S.shapes || [];
S.selShape = null;

function addShape(type) {
  pushHistory();
  const id = 'shp_' + (++_shapeIdCounter);
  const obj = {
    id, type, x: 50, y: 50, w: 100, h: type === 'line' ? 4 : type === 'circle' ? 100 : 80,
    fill: type === 'line' ? 'var(--accent)' : 'transparent',
    stroke: 'var(--accent)', strokeW: 2, radius: type === 'circle' ? 50 : 0, opacity: 100, rotation: 0
  };
  S.shapes.push(obj);

  const el = document.createElement('div');
  el.className = 'shape-el'; el.id = id;
  _applyShapeStyle(el, obj);
  _makeShapeDraggable(el, id);
  $('ms').appendChild(el);
  selectShape(id);
  toast('✓ Shape added');
}

function _applyShapeStyle(el, obj) {
  el.style.cssText = `position:absolute;left:${obj.x}px;top:${obj.y}px;width:${obj.w}px;height:${obj.h}px;
    background:${obj.fill};border:${obj.strokeW}px solid ${obj.stroke};
    border-radius:${obj.radius}px;opacity:${obj.opacity / 100};
    transform:rotate(${obj.rotation}deg);cursor:pointer;z-index:25;
    transition:outline .15s;box-sizing:border-box;`;
}

function _makeShapeDraggable(el, id) {
  el.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    selectShape(id);
    const msRect = $('ms').getBoundingClientRect();
    const ox = e.clientX - el.getBoundingClientRect().left;
    const oy = e.clientY - el.getBoundingClientRect().top;
    function mv(ev) {
      const x = (ev.clientX - msRect.left) / S.zoom - ox / S.zoom;
      const y = (ev.clientY - msRect.top) / S.zoom - oy / S.zoom;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      const obj = S.shapes.find(s => s.id === id);
      if (obj) { obj.x = x; obj.y = y }
    }
    function up() { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up) }
    document.addEventListener('mousemove', mv);
    document.addEventListener('mouseup', up);
  });
}

function selectShape(id) {
  S.selShape = id;
  document.querySelectorAll('.shape-el').forEach(e => e.style.outline = e.id === id ? '2px solid var(--accent)' : '');
  const sec = $('shapeEditSec'); if (sec) sec.style.display = id ? 'flex' : 'none';
  const obj = S.shapes.find(s => s.id === id);
  if (obj) {
    if ($('shpFill')) $('shpFill').value = obj.fill === 'transparent' ? '#000000' : obj.fill;
    if ($('shpStroke')) $('shpStroke').value = obj.stroke;
    if ($('shpStrokeW')) $('shpStrokeW').value = obj.strokeW;
    if ($('shpW')) $('shpW').value = obj.w;
    if ($('shpH')) $('shpH').value = obj.h;
    if ($('shpRot')) $('shpRot').value = obj.rotation;
    if ($('shpOp')) $('shpOp').value = obj.opacity;
  }
}

function editShapeProp(prop) {
  if (!S.selShape) return;
  const obj = S.shapes.find(s => s.id === S.selShape);
  const el = $(S.selShape);
  if (!obj || !el) return;
  if (prop === 'fill') { obj.fill = $('shpFill').value; el.style.background = obj.fill }
  if (prop === 'stroke') { obj.stroke = $('shpStroke').value; el.style.borderColor = obj.stroke }
  if (prop === 'strokeW') { obj.strokeW = parseInt($('shpStrokeW').value); el.style.borderWidth = obj.strokeW + 'px' }
  if (prop === 'w') { obj.w = parseInt($('shpW').value); el.style.width = obj.w + 'px' }
  if (prop === 'h') { obj.h = parseInt($('shpH').value); el.style.height = obj.h + 'px' }
  if (prop === 'rotation') { obj.rotation = parseInt($('shpRot').value); el.style.transform = 'rotate(' + obj.rotation + 'deg)' }
  if (prop === 'opacity') { obj.opacity = parseInt($('shpOp').value); el.style.opacity = obj.opacity / 100 }
}

function deleteShape() {
  if (!S.selShape) return;
  const el = $(S.selShape); if (el) el.remove();
  S.shapes = S.shapes.filter(s => s.id !== S.selShape);
  S.selShape = null;
  const sec = $('shapeEditSec'); if (sec) sec.style.display = 'none';
  toast('✕ Shape removed');
}

// ==================== NOISE / GRAIN OVERLAY ====================
S.noiseEnabled = S.noiseEnabled || false;
S.noiseIntensity = S.noiseIntensity || 15;

function togNoise() {
  S.noiseEnabled = !S.noiseEnabled;
  const ms = $('ms');
  let noiseEl = ms.querySelector('.noise-overlay');
  if (S.noiseEnabled) {
    if (!noiseEl) {
      noiseEl = document.createElement('div');
      noiseEl.className = 'noise-overlay';
      ms.appendChild(noiseEl);
    }
    noiseEl.style.opacity = S.noiseIntensity / 100;
    noiseEl.style.display = 'block';
    if ($('tNoise')) $('tNoise').classList.add('on');
  } else {
    if (noiseEl) noiseEl.style.display = 'none';
    if ($('tNoise')) $('tNoise').classList.remove('on');
  }
  toast(S.noiseEnabled ? '✓ Noise ON' : '✕ Noise OFF');
}

function setNoiseIntensity(v) {
  S.noiseIntensity = parseInt(v);
  const ms = $('ms');
  const noiseEl = ms.querySelector('.noise-overlay');
  if (noiseEl) noiseEl.style.opacity = S.noiseIntensity / 100;
  if ($('rvNoise')) $('rvNoise').textContent = v + '%';
}

// ==================== VIGNETTE EFFECT ====================
S.vignetteEnabled = S.vignetteEnabled || false;
S.vignetteIntensity = S.vignetteIntensity || 40;

function togVignette() {
  S.vignetteEnabled = !S.vignetteEnabled;
  _applyVignette();
  if ($('tVig')) $('tVig').classList.toggle('on', S.vignetteEnabled);
  toast(S.vignetteEnabled ? '✓ Vignette ON' : '✕ Vignette OFF');
}

function setVignetteIntensity(v) {
  S.vignetteIntensity = parseInt(v);
  _applyVignette();
  if ($('rvVig')) $('rvVig').textContent = v + '%';
}

function _applyVignette() {
  const ms = $('ms');
  let vigEl = ms.querySelector('.vignette-overlay');
  if (S.vignetteEnabled) {
    if (!vigEl) {
      vigEl = document.createElement('div');
      vigEl.className = 'vignette-overlay';
      ms.appendChild(vigEl);
    }
    const i = S.vignetteIntensity / 100;
    vigEl.style.background = `radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,${(.6 * i).toFixed(2)}) 100%)`;
    vigEl.style.display = 'block';
  } else {
    if (vigEl) vigEl.style.display = 'none';
  }
}

// ==================== GRADIENT CUSTOMIZER ====================
S.gradAngle = S.gradAngle || 145;
S.gradType = S.gradType || 'linear';

function setGradAngle(v) {
  S.gradAngle = parseInt(v);
  if ($('rvGAngle')) $('rvGAngle').textContent = v + '°';
  _reapplyGradient();
}

function setGradType(type) {
  S.gradType = type;
  _reapplyGradient();
}

function _reapplyGradient() {
  if (S.bgCustom || !S.bg || !BGS[S.bg]) return;
  const orig = BGS[S.bg];
  // Replace gradient direction/type
  let css = orig;
  if (S.gradType === 'linear') {
    css = css.replace(/^(linear-gradient|radial-gradient|conic-gradient)\([^,]+,/, `linear-gradient(${S.gradAngle}deg,`);
  } else if (S.gradType === 'radial') {
    css = css.replace(/^(linear-gradient|radial-gradient|conic-gradient)\([^,]+,/, 'radial-gradient(circle,');
  } else if (S.gradType === 'conic') {
    css = css.replace(/^(linear-gradient|radial-gradient|conic-gradient)\([^,]+,/, `conic-gradient(from ${S.gradAngle}deg,`);
  }
  $('ms').style.background = css;
}

// ==================== ANIMATED BACKGROUND (Subtle) ====================
S.animBg = S.animBg || false;

function togAnimBg() {
  S.animBg = !S.animBg;
  $('ms').classList.toggle('anim-bg', S.animBg);
  if ($('tAnimBg')) $('tAnimBg').classList.toggle('on', S.animBg);
  toast(S.animBg ? '✓ Animated BG ON' : '✕ Animated BG OFF');
}

// ==================== BACKGROUND PANEL TABS ====================
function swBgTab(tab, btn) {
  document.querySelectorAll('.bg-tab').forEach(b => b.classList.remove('act'));
  document.querySelectorAll('.bg-tab-body').forEach(b => b.classList.remove('act'));
  if (btn) btn.classList.add('act');
  const body = $('bgTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (body) body.classList.add('act');
}

// ==================== BACKGROUND GALLERY ====================
const BG_GALLERY = [
  { n: 'Aurora', css: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
  { n: 'Peach', css: 'linear-gradient(135deg,#ffecd2,#fcb69f,#ff9a9e)' },
  { n: 'Ocean', css: 'linear-gradient(135deg,#2193b0,#6dd5ed,#fff)' },
  { n: 'Forest', css: 'linear-gradient(135deg,#11998e,#38ef7d)' },
  { n: 'Candy', css: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { n: 'Night', css: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' },
  { n: 'Gold', css: 'linear-gradient(135deg,#f7971e,#ffd200)' },
  { n: 'Rose', css: 'linear-gradient(135deg,#f953c6,#b91d73)' },
  { n: 'Mint', css: 'linear-gradient(135deg,#a8edea,#fed6e3)' },
  { n: 'Steel', css: 'linear-gradient(135deg,#636fa4,#e8ebf5)' },
  { n: 'Cosmos', css: 'radial-gradient(circle at 30% 50%,#1a1a2e,#16213e,#0f3460)' },
  { n: 'Ember', css: 'radial-gradient(circle at 70% 30%,#f7971e 0%,#c62828 60%,#1a1a1e 100%)' },
  { n: 'Tropical', css: 'linear-gradient(135deg,#a1ffce,#faffd1)' },
  { n: 'Mauve', css: 'linear-gradient(135deg,#e0c3fc,#8ec5fc)' },
  { n: 'Carbon', css: 'linear-gradient(160deg,#0a0a0a,#1a1a1e,#252525)' },
  { n: 'Citrus', css: 'linear-gradient(135deg,#f9d423,#ff4e50)' }
];

function renderBgGallery() {
  const gallery = $('bgImgGallery');
  if (!gallery) return;
  gallery.innerHTML = '';
  BG_GALLERY.forEach(item => {
    const sw = document.createElement('div');
    sw.className = 'bg-gallery-sw';
    sw.style.background = item.css;
    sw.title = item.n;
    const lbl = document.createElement('span');
    lbl.textContent = item.n;
    sw.appendChild(lbl);
    sw.onclick = () => {
      pushHistory();
      $('ms').style.background = item.css;
      S.bgCustom = item.css; S.bg = null;
      toast('✓ ' + item.n);
    };
    gallery.appendChild(sw);
  });
}

// ==================== GRADIENT COLOR-STOP EDITOR ====================
S.gradStops = S.gradStops || [{ pos: 0, color: '#c9956b' }, { pos: 100, color: '#1a1a1e' }];

function renderGradStopEditor() {
  const editor = $('gradStopEditor');
  if (!editor) return;
  const sorted = [...S.gradStops].sort((a, b) => a.pos - b.pos);
  const stops = sorted.map(s => `${s.color} ${s.pos}%`).join(',');
  const previewCss = `linear-gradient(90deg,${stops})`;
  let html = `<div class="grad-preview-bar" style="background:${previewCss}"></div>`;
  S.gradStops.forEach((stop, i) => {
    html += `<div class="grad-stop-row">
      <input type="color" value="${stop.color}" oninput="editGradStop(${i},'color',this.value)" style="width:26px;height:22px;border:none;background:none;cursor:pointer;padding:0;flex-shrink:0">
      <input type="range" min="0" max="100" value="${stop.pos}" oninput="editGradStop(${i},'pos',this.value)" style="flex:1">
      <span style="font-size:8px;color:var(--muted);width:22px;text-align:right;flex-shrink:0">${stop.pos}%</span>
      ${S.gradStops.length > 2 ? `<button class="bk-del" style="position:static;opacity:1;width:14px;height:14px" onclick="removeGradStop(${i})">×</button>` : ''}
    </div>`;
  });
  editor.innerHTML = html;
}

function editGradStop(i, prop, val) {
  if (!S.gradStops[i]) return;
  if (prop === 'color') S.gradStops[i].color = val;
  if (prop === 'pos') S.gradStops[i].pos = parseInt(val);
  renderGradStopEditor();
}

function addGradStop() {
  if (S.gradStops.length >= 6) { toast('Max 6 stops'); return }
  S.gradStops.push({ pos: 50, color: '#888888' });
  renderGradStopEditor();
  toast('✓ Stop added');
}

function removeGradStop(i) {
  if (S.gradStops.length <= 2) return;
  S.gradStops.splice(i, 1);
  renderGradStopEditor();
}

function _buildGradCSS() {
  const sorted = [...S.gradStops].sort((a, b) => a.pos - b.pos);
  const stops = sorted.map(s => `${s.color} ${s.pos}%`).join(',');
  if (S.gradType === 'radial') return `radial-gradient(circle,${stops})`;
  if (S.gradType === 'conic') return `conic-gradient(from ${S.gradAngle || 145}deg,${stops})`;
  return `linear-gradient(${S.gradAngle || 145}deg,${stops})`;
}

function applyCustomGradient() {
  pushHistory();
  const css = _buildGradCSS();
  $('ms').style.background = css;
  S.bgCustom = css; S.bg = null;
  toast('✓ Custom gradient applied');
}
