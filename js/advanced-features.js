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
  for (let i = 0; i <= CANVAS_W; i += 50) {
    marks += `<span class="ruler-mark" style="left:${(i / CANVAS_W) * 100}%">${i}</span>`;
  }
  rh.innerHTML = marks;
  cv.appendChild(rh);

  // Vertical ruler
  let rv = document.createElement('div');
  rv.id = 'rulerV'; rv.className = 'ruler ruler-v'; rv.style.display = 'none';
  marks = '';
  for (let i = 0; i <= CANVAS_H; i += 50) {
    marks += `<span class="ruler-mark" style="top:${(i / CANVAS_H) * 100}%">${i}</span>`;
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
  const frames = ['bf', 'pf', 'tf', 'pf2'].filter(id => $(id) && !$(id).classList.contains('hidden'));
  if (frames.length < 2) return;

  const msW = CANVAS_W, msH = CANVAS_H;

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
  const frames = ['bf', 'pf', 'tf', 'pf2'].filter(id => $(id) && !$(id).classList.contains('hidden'));
  if (frames.length < 1) return;

  const msW = CANVAS_W, msH = CANVAS_H;

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
  dots: { n: 'Dots', cat: 'basic', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1.5' fill='${c}'/></svg>` },
  grid: { n: 'Grid', cat: 'basic', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M20 0H0v20' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  diag: { n: 'Diagonal', cat: 'basic', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><path d='M-1 1l4-4M0 10l10-10M9 11l2-2' stroke='${c}' stroke-width='.5'/></svg>` },
  cross: { n: 'Crosses', cat: 'basic', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M10 6v8M6 10h8' stroke='${c}' stroke-width='.6' fill='none'/></svg>` },
  waves: { n: 'Waves', cat: 'basic', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='10'><path d='M0 5c10-7 20 7 40 0' stroke='${c}' stroke-width='.6' fill='none'/></svg>` },
  hex: { n: 'Hexagons', cat: 'geo', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='49'><path d='M14 0l14 8v16l-14 8L0 24V8z' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  zigzag: { n: 'Zigzag', cat: 'basic', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='10'><path d='M0 10L5 0l5 10l5-10l5 10' stroke='${c}' stroke-width='.6' fill='none'/></svg>` },
  diamond: { n: 'Diamonds', cat: 'geo', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M8 0l8 8-8 8-8-8z' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  // Additional patterns
  triangles: { n: 'Triangles', cat: 'geo', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='18'><path d='M10 0l10 18H0z' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  circles: { n: 'Circles', cat: 'geo', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='8' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  squares: { n: 'Squares', cat: 'basic', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect x='3' y='3' width='10' height='10' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  stars: { n: 'Stars', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 2l2.5 5.5L20 8.5l-4 4 1 5.5-5-2.8-5 2.8 1-5.5-4-4 5.5-1z' fill='none' stroke='${c}' stroke-width='.4'/></svg>` },
  hatch: { n: 'Hatch', cat: 'basic', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><path d='M-1 1l4-4M0 10l10-10M9 11l2-2M-1 9l4 4M0 0l10 10M9-1l2 2' stroke='${c}' stroke-width='.3'/></svg>` },
  brick: { n: 'Brick', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='16'><path d='M0 8h32M16 0v8M0 8v8M32 8v8' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  chevron: { n: 'Chevron', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='12'><path d='M0 12l10-12 10 12' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  confetti: { n: 'Confetti', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'><rect x='5' y='3' width='3' height='3' rx='0.5' fill='${c}' transform='rotate(25 6 4)'/><rect x='18' y='14' width='3' height='3' rx='0.5' fill='${c}' transform='rotate(-15 19 15)'/><rect x='10' y='22' width='3' height='3' rx='0.5' fill='${c}' transform='rotate(40 11 23)'/></svg>` },
  plusses: { n: 'Plus', cat: 'basic', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 8v8M8 12h8' stroke='${c}' stroke-width='1.2' stroke-linecap='round' fill='none'/></svg>` },
  arrows: { n: 'Arrows', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M10 4v12M6 8l4-4 4 4' stroke='${c}' stroke-width='.5' fill='none'/></svg>` },
  leaf: { n: 'Leaf', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M6 18Q6 6 18 6Q18 18 6 18z' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  trellis: { n: 'Trellis', cat: 'geo', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M0 0l20 20M20 0L0 20' stroke='${c}' stroke-width='.4'/></svg>` },
  // Additional patterns from reference images
  flower: { n: 'Flower', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='8' r='3' fill='none' stroke='${c}' stroke-width='.4'/><circle cx='8' cy='14' r='3' fill='none' stroke='${c}' stroke-width='.4'/><circle cx='16' cy='14' r='3' fill='none' stroke='${c}' stroke-width='.4'/><circle cx='12' cy='12' r='1.5' fill='${c}'/></svg>` },
  octagon: { n: 'Octagon', cat: 'geo', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M8 2h8l6 6v8l-6 6H8l-6-6V8z' fill='none' stroke='${c}' stroke-width='.4'/></svg>` },
  herring: { n: 'Herringbone', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='12'><path d='M0 6l5-6 5 6 5-6 5 6M0 12l5-6 5 6 5-6 5 6' stroke='${c}' stroke-width='.5' fill='none'/></svg>` },
  scales: { n: 'Scales', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M0 10 Q10 0 20 10' fill='none' stroke='${c}' stroke-width='.5'/><path d='M-10 20 Q0 10 10 20' fill='none' stroke='${c}' stroke-width='.5'/><path d='M10 20 Q20 10 30 20' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  maze: { n: 'Maze', cat: 'geo', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M0 0h10v10H0M10 10h10v10H10' fill='none' stroke='${c}' stroke-width='.5'/></svg>` },
  weave: { n: 'Weave', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M0 0h8v8H0M8 8h8v8H8' fill='${c}'/></svg>` },
  hearts: { n: 'Hearts', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 20 Q4 14 4 9 Q4 5 8 5 Q10 5 12 8 Q14 5 16 5 Q20 5 20 9 Q20 14 12 20z' fill='none' stroke='${c}' stroke-width='.4'/></svg>` },
  spiral: { n: 'Spiral', cat: 'fancy', svg: (c) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 12 Q12 6 18 6 Q24 6 24 12 Q24 20 14 20 Q6 20 6 12 Q6 4 14 2' fill='none' stroke='${c}' stroke-width='.4'/></svg>` }
};

// Pattern state defaults
S.patColor = S.patColor || '#969696';
S.patOpacity = S.patOpacity != null ? S.patOpacity : 15;
S.patScale = S.patScale || 100;

function renderPatternGrid() {
  const pg = $('patGrid');
  if (!pg) return;
  pg.innerHTML = '';
  Object.keys(BG_PATTERNS).forEach(k => {
    const pat = BG_PATTERNS[k];
    const d = document.createElement('div');
    d.className = 'pat-sw' + (S.bgPattern === k ? ' act' : '');
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
  S.bgPattern = k;
  _renderPatternOverlay();
  // Update active state in grid
  document.querySelectorAll('.pat-sw').forEach(el => el.classList.remove('act'));
  const idx = Object.keys(BG_PATTERNS).indexOf(k);
  const swatches = document.querySelectorAll('.pat-sw');
  if (swatches[idx]) swatches[idx].classList.add('act');
  toast('✓ Pattern: ' + pat.n);
}

function _renderPatternOverlay() {
  const ov = $('msPatOv');
  if (!ov) return;
  const pat = BG_PATTERNS[S.bgPattern];
  if (!pat) { ov.style.backgroundImage = ''; return }
  const hex = S.patColor || '#969696';
  const op = (S.patOpacity != null ? S.patOpacity : 15) / 100;
  // Convert hex to rgba
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const rgba = `rgba(${r},${g},${b},${op})`;
  const encoded = encodeURIComponent(pat.svg(rgba));
  const scale = S.patScale || 100;
  ov.style.backgroundImage = `url("data:image/svg+xml,${encoded}")`;
  ov.style.backgroundSize = scale === 100 ? '' : `${scale}%`;
  ov.style.backgroundRepeat = 'repeat';
}

function clearPattern() {
  pushHistory();
  S.bgPattern = null;
  const ov = $('msPatOv');
  if (ov) { ov.style.backgroundImage = ''; ov.style.backgroundSize = '' }
  document.querySelectorAll('.pat-sw').forEach(el => el.classList.remove('act'));
  toast('✓ Pattern cleared');
}

function setPatColor(v) {
  S.patColor = v;
  if (S.bgPattern) _renderPatternOverlay();
}
function setPatOpacity(v) {
  S.patOpacity = parseInt(v);
  if ($('rvPatOp')) $('rvPatOp').textContent = v + '%';
  if (S.bgPattern) _renderPatternOverlay();
}
function setPatScale(v) {
  S.patScale = parseInt(v);
  if ($('rvPatSc')) $('rvPatSc').textContent = v + '%';
  if (S.bgPattern) _renderPatternOverlay();
}

// ==================== BACKGROUND IMAGE UPLOAD ====================
function handleBgImgUpload(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = function (ev) {
    pushHistory();
    const img = $('msBgImg');
    img.src = ev.target.result;
    img.style.display = 'block';
    S.bgImage = ev.target.result;
    toast('✓ BG image set');
  };
  r.readAsDataURL(f);
}

function clearBgImage() {
  pushHistory();
  const img = $('msBgImg');
  img.src = '';
  img.style.display = 'none';
  S.bgImage = null;
  S.bgImgUrl = null;
  if ($('bgImgUp')) $('bgImgUp').value = '';
  toast('✓ BG image cleared');
}

function clearGradient() {
  pushHistory();
  S.bg = null;
  S.bgCustom = null;
  $('ms').style.background = 'transparent';
  document.querySelectorAll('.bg-sw').forEach(el => el.classList.remove('act'));
  toast('✓ Background cleared');
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
    transform:rotate(${obj.rotation}deg);cursor:pointer;z-index:30;
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
  // Abstract gradients
  { n: 'Aurora', css: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', cat: 'abstract' },
  { n: 'Peach', css: 'linear-gradient(135deg,#ffecd2,#fcb69f,#ff9a9e)', cat: 'abstract' },
  { n: 'Ocean', css: 'linear-gradient(135deg,#2193b0,#6dd5ed,#fff)', cat: 'abstract' },
  { n: 'Forest', css: 'linear-gradient(135deg,#11998e,#38ef7d)', cat: 'abstract' },
  { n: 'Candy', css: 'linear-gradient(135deg,#f093fb,#f5576c)', cat: 'abstract' },
  { n: 'Night', css: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', cat: 'abstract' },
  { n: 'Gold', css: 'linear-gradient(135deg,#f7971e,#ffd200)', cat: 'abstract' },
  { n: 'Rose', css: 'linear-gradient(135deg,#f953c6,#b91d73)', cat: 'abstract' },
  { n: 'Mint', css: 'linear-gradient(135deg,#a8edea,#fed6e3)', cat: 'abstract' },
  { n: 'Steel', css: 'linear-gradient(135deg,#636fa4,#e8ebf5)', cat: 'abstract' },
  // Mesh
  { n: 'Cosmos', css: 'radial-gradient(circle at 30% 50%,#1a1a2e,#16213e,#0f3460)', cat: 'mesh' },
  { n: 'Ember', css: 'radial-gradient(circle at 70% 30%,#f7971e 0%,#c62828 60%,#1a1a1e 100%)', cat: 'mesh' },
  { n: 'Tropical', css: 'linear-gradient(135deg,#a1ffce,#faffd1)', cat: 'mesh' },
  { n: 'Mauve', css: 'linear-gradient(135deg,#e0c3fc,#8ec5fc)', cat: 'mesh' },
  { n: 'Carbon', css: 'linear-gradient(160deg,#0a0a0a,#1a1a1e,#252525)', cat: 'mesh' },
  { n: 'Citrus', css: 'linear-gradient(135deg,#f9d423,#ff4e50)', cat: 'mesh' },
  // Vivid
  { n: 'Flamingo', css: 'linear-gradient(135deg,#ee9ca7,#ffdde1)', cat: 'vivid' },
  { n: 'Lagoon', css: 'linear-gradient(135deg,#43cea2,#185a9d)', cat: 'vivid' },
  { n: 'Velvet', css: 'linear-gradient(135deg,#bc4e9c,#f80759)', cat: 'vivid' },
  { n: 'Sunrise', css: 'linear-gradient(135deg,#ff6a00,#ee0979)', cat: 'vivid' },
  { n: 'Mystic', css: 'linear-gradient(135deg,#757f9a,#d7dde8)', cat: 'vivid' },
  { n: 'Dusk', css: 'linear-gradient(135deg,#2c3e50,#fd746c)', cat: 'vivid' },
  { n: 'Berry', css: 'linear-gradient(135deg,#8360c3,#2ebf91)', cat: 'vivid' },
  { n: 'Lava', css: 'linear-gradient(135deg,#f12711,#f5af19)', cat: 'vivid' },
  // Desktop wallpaper styles
  { n: 'Sequoia', css: 'linear-gradient(180deg,#1a1a2e,#16213e,#533483,#e94560)', cat: 'desktop' },
  { n: 'Sonoma', css: 'linear-gradient(160deg,#87ceeb,#b0c4de,#708090,#455a64)', cat: 'desktop' },
  { n: 'Ventura', css: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364,#4ca1af)', cat: 'desktop' },
  { n: 'Monterey', css: 'radial-gradient(ellipse at 50% 30%,#667eea 0%,#764ba2 40%,#1a1a2e 100%)', cat: 'desktop' },
  { n: 'Big Sur', css: 'linear-gradient(180deg,#f093fb,#f5576c,#ffd200,#00f260)', cat: 'desktop' },
  // Dreamy mystic
  { n: 'Silk Rose', css: 'linear-gradient(135deg,#fecfef,#e8b4d9,#f5d5e7)', cat: 'mystic' },
  { n: 'Silk Mint', css: 'linear-gradient(135deg,#a7f3d0,#99f6e4,#d5f5f0)', cat: 'mystic' },
  { n: 'Silk Lilac', css: 'linear-gradient(135deg,#c9b1ff,#e0c3fc,#d8b4fe)', cat: 'mystic' },
  { n: 'Silk Sky', css: 'linear-gradient(135deg,#bae6fd,#c7d2fe,#e0e7ff)', cat: 'mystic' },
  { n: 'Cotton Candy', css: 'linear-gradient(135deg,#fce7f3,#dbeafe,#ede9fe)', cat: 'mystic' },
  // Earth tones
  { n: 'Sahara Dune', css: 'linear-gradient(145deg,#d4a574,#c49264,#a67a52)', cat: 'earth' },
  { n: 'Desert Sand', css: 'linear-gradient(145deg,#f5e6d3,#e8d5c0,#ceb39a)', cat: 'earth' },
  { n: 'Red Clay', css: 'linear-gradient(145deg,#8b4513,#a0522d,#deb887)', cat: 'earth' },
  { n: 'Deep Ocean', css: 'linear-gradient(180deg,#006994,#00a5cf,#40bfef)', cat: 'earth' },
  { n: 'Mountain', css: 'linear-gradient(180deg,#87ceeb,#708090,#2f4f4f)', cat: 'earth' },
  // Cosmic
  { n: 'Nebula', css: 'radial-gradient(at 30% 40%,#4c1d95 0,transparent 50%),radial-gradient(at 70% 60%,#1e1b4b 0,transparent 50%),#020617', cat: 'cosmic' },
  { n: 'Deep Space', css: 'radial-gradient(at 50% 50%,#1e293b 0%,#020617 50%,#000 100%)', cat: 'cosmic' },
  { n: 'Stardust', css: 'radial-gradient(at 30% 20%,#312e81 0,transparent 30%),radial-gradient(at 80% 80%,#1e1b4b 0,transparent 30%),#000', cat: 'cosmic' }
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
      document.querySelectorAll('.bg-sw').forEach(el => el.classList.remove('act'));
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

// ==================== SHADOW SCENES (B&W overlay shadows) ====================
const SHADOW_SCENES = {
  blinds: { n: 'Window Blinds', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><defs><linearGradient id='b' x1='0' y1='0' x2='0' y2='1'>${Array.from({ length: 12 }, (_, i) => `<stop offset='${i * 8.33}%' stop-color='${i % 2 === 0 ? "rgba(0,0,0," + o + ")" : "transparent"}'/>`).join('')}</linearGradient></defs><rect width='200' height='200' fill='url(#b)' transform='rotate(-15,100,100)'/></svg>` },
  palm: { n: 'Palm Leaves', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><g fill='rgba(0,0,0,${o})'><path d='M150 0 Q120 80 50 120 Q100 100 150 150 Q200 100 250 120 Q180 80 150 0z'/><path d='M80 100 Q60 160 30 200 Q80 180 120 220 Q100 160 80 100z'/><path d='M220 80 Q240 150 270 200 Q230 170 190 210 Q200 140 220 80z'/></g></svg>` },
  window: { n: 'Window Frame', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='rgba(0,0,0,${o * .3})'/><rect x='40' y='40' width='150' height='150' fill='rgba(255,255,255,${o})' rx='2'/><rect x='210' y='40' width='150' height='150' fill='rgba(255,255,255,${o})' rx='2'/><rect x='40' y='210' width='150' height='150' fill='rgba(255,255,255,${o})' rx='2'/><rect x='210' y='210' width='150' height='150' fill='rgba(255,255,255,${o})' rx='2'/></svg>` },
  diagonal: { n: 'Diagonal Light', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>${Array.from({ length: 10 }, (_, i) => `<rect x='${i * 30 - 50}' y='-20' width='12' height='260' fill='rgba(0,0,0,${o})' transform='rotate(30,100,100)'/>`).join('')}</svg>` },
  plant: { n: 'Plant Shadow', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><g fill='rgba(0,0,0,${o})'><ellipse cx='100' cy='60' rx='40' ry='25' transform='rotate(-20,100,60)'/><ellipse cx='180' cy='100' rx='35' ry='22' transform='rotate(15,180,100)'/><ellipse cx='130' cy='160' rx='45' ry='20' transform='rotate(-10,130,160)'/><ellipse cx='200' cy='200' rx='30' ry='18' transform='rotate(25,200,200)'/><ellipse cx='80' cy='230' rx='38' ry='22' transform='rotate(-15,80,230)'/><path d='M140 50 Q145 120 150 250' stroke='rgba(0,0,0,${o})' stroke-width='3' fill='none'/><path d='M160 80 Q165 140 170 240' stroke='rgba(0,0,0,${o})' stroke-width='2' fill='none'/></g></svg>` },
  tropical: { n: 'Tropical', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><g fill='rgba(0,0,0,${o})'><path d='M0 150 Q80 100 150 0 Q120 100 200 150 Q120 140 0 150z'/><path d='M300 100 Q230 130 200 200 Q220 140 180 100 Q240 110 300 100z'/><path d='M100 300 Q130 230 200 200 Q140 230 100 180 Q110 240 100 300z'/></g></svg>` },
  mesh: { n: 'Net Shadow', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><path d='M0 0l100 100M100 0L0 100M50 0v100M0 50h100' stroke='rgba(0,0,0,${o})' stroke-width='8' fill='none'/></svg>` },
  arch: { n: 'Arch Window', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400'><rect width='300' height='400' fill='rgba(0,0,0,${o * .3})'/><path d='M50 400 V180 Q50 50 150 50 Q250 50 250 180 V400 Z' fill='rgba(255,255,255,${o})'/><line x1='150' y1='50' x2='150' y2='400' stroke='rgba(0,0,0,${o * .3})' stroke-width='6'/><line x1='50' y1='250' x2='250' y2='250' stroke='rgba(0,0,0,${o * .3})' stroke-width='6'/></svg>` },
  softLight: { n: 'Soft Light', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><radialGradient id='sl'><stop offset='0%' stop-color='rgba(255,255,255,${o * .5})'/><stop offset='100%' stop-color='transparent'/></radialGradient></defs><rect width='400' height='400' fill='rgba(0,0,0,${o * .15})'/><circle cx='120' cy='100' r='180' fill='url(#sl)'/></svg>` },
  geometric: { n: 'Geometric', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><polygon points='100,10 190,80 160,180 40,180 10,80' fill='none' stroke='rgba(0,0,0,${o})' stroke-width='15'/><polygon points='100,40 165,90 145,160 55,160 35,90' fill='none' stroke='rgba(0,0,0,${o * .5})' stroke-width='8'/></svg>` },
  // Additional shadow scenes from reference images
  lattice: { n: 'Lattice', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>${Array.from({length:7},(_, i)=>`<line x1='${i*35}' y1='0' x2='${i*35}' y2='200' stroke='rgba(0,0,0,${o})' stroke-width='10'/>`).join('')}${Array.from({length:7},(_, i)=>`<line x1='0' y1='${i*35}' x2='200' y2='${i*35}' stroke='rgba(0,0,0,${o})' stroke-width='10'/>`).join('')}</svg>` },
  monstera: { n: 'Monstera', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><g fill='rgba(0,0,0,${o})'><path d='M150 20 Q100 60 80 120 Q90 90 120 80 Q100 120 110 180 Q130 130 150 120 Q170 130 190 180 Q200 120 180 80 Q210 90 220 120 Q200 60 150 20z'/><circle cx='120' cy='110' r='12' fill='rgba(255,255,255,.8)'/><circle cx='180' cy='110' r='12' fill='rgba(255,255,255,.8)'/><circle cx='150' cy='140' r='10' fill='rgba(255,255,255,.8)'/><path d='M60 200 Q40 240 50 280 Q60 250 80 230 Q70 260 80 290 Q100 260 90 230 Q100 250 60 200z'/><path d='M230 180 Q250 220 240 260 Q230 230 210 220 Q220 250 210 280 Q200 240 200 210 Q190 230 230 180z'/></g></svg>` },
  blindsWide: { n: 'Wide Blinds', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>${Array.from({length:6},(_, i)=>`<rect x='-20' y='${i*35}' width='240' height='18' fill='rgba(0,0,0,${o})'/>`).join('')}</svg>` },
  circles: { n: 'Circle Bokeh', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><circle cx='60' cy='50' r='40' fill='rgba(0,0,0,${o*.2})'/><circle cx='200' cy='80' r='55' fill='rgba(0,0,0,${o*.15})'/><circle cx='130' cy='200' r='65' fill='rgba(0,0,0,${o*.18})'/><circle cx='250' cy='230' r='35' fill='rgba(0,0,0,${o*.25})'/><circle cx='40' cy='260' r='45' fill='rgba(0,0,0,${o*.12})'/><circle cx='280' cy='130' r='30' fill='rgba(0,0,0,${o*.2})'/></svg>` },
  curtain: { n: 'Curtain', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400'><rect width='300' height='400' fill='rgba(0,0,0,${o*.2})'/><path d='M0 0 Q30 200 0 400 L130 400 Q100 200 130 0 Z' fill='rgba(255,255,255,${o*.8})'/><path d='M170 0 Q200 200 170 400 L300 400 Q270 200 300 0 Z' fill='rgba(255,255,255,${o*.8})'/></svg>` },
  fence: { n: 'Fence', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>${Array.from({length:8},(_, i)=>`<rect x='${i*28}' y='0' width='14' height='200' fill='rgba(0,0,0,${o})'/>`).join('')}<rect x='0' y='30' width='200' height='8' fill='rgba(0,0,0,${o})'/><rect x='0' y='100' width='200' height='8' fill='rgba(0,0,0,${o})'/><rect x='0' y='170' width='200' height='8' fill='rgba(0,0,0,${o})'/></svg>` },
  leaves: { n: 'Leaf Scatter', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><g fill='rgba(0,0,0,${o})'><ellipse cx='80' cy='40' rx='30' ry='12' transform='rotate(-30,80,40)'/><ellipse cx='220' cy='70' rx='25' ry='10' transform='rotate(20,220,70)'/><ellipse cx='150' cy='120' rx='35' ry='13' transform='rotate(-15,150,120)'/><ellipse cx='60' cy='180' rx='28' ry='11' transform='rotate(35,60,180)'/><ellipse cx='240' cy='200' rx='32' ry='12' transform='rotate(-25,240,200)'/><ellipse cx='130' cy='260' rx='30' ry='10' transform='rotate(10,130,260)'/><ellipse cx='200' cy='280' rx='22' ry='9' transform='rotate(-40,200,280)'/></g></svg>` },
  spotlight2: { n: 'Dual Light', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><radialGradient id='sp1'><stop offset='0%' stop-color='rgba(255,255,255,${o*.6})'/><stop offset='100%' stop-color='transparent'/></radialGradient><radialGradient id='sp2'><stop offset='0%' stop-color='rgba(255,255,255,${o*.4})'/><stop offset='100%' stop-color='transparent'/></radialGradient></defs><rect width='400' height='400' fill='rgba(0,0,0,${o*.2})'/><ellipse cx='100' cy='80' rx='160' ry='120' fill='url(#sp1)'/><ellipse cx='300' cy='320' rx='140' ry='100' fill='url(#sp2)'/></svg>` },
  stripe: { n: 'Stripes', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>${Array.from({length:15},(_, i)=>`<rect x='${i*15-10}' y='-20' width='6' height='240' fill='rgba(0,0,0,${o})' transform='rotate(45,100,100)'/>`).join('')}</svg>` },
  tree: { n: 'Tree Shadow', svg: (o) => `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400'><g fill='rgba(0,0,0,${o})'><path d='M140 400 L140 200 Q140 180 130 170 Q80 140 60 100 Q50 70 80 50 Q100 30 130 50 Q140 10 160 10 Q180 10 190 50 Q220 30 240 50 Q270 70 260 100 Q240 140 190 170 Q180 180 180 200 L180 400 Z'/><ellipse cx='50' cy='280' rx='30' ry='15' transform='rotate(-20,50,280)'/><ellipse cx='250' cy='300' rx='25' ry='12' transform='rotate(15,250,300)'/></g></svg>` }
};

S.shadowScene = S.shadowScene || null;
S.shadowOpacity = S.shadowOpacity != null ? S.shadowOpacity : 30;
S.shadowBlur = S.shadowBlur != null ? S.shadowBlur : 0;

function setShadowScene(key) {
  pushHistory();
  S.shadowScene = key;
  _applyShadowScene();
  toast('✓ Shadow: ' + (SHADOW_SCENES[key] ? SHADOW_SCENES[key].n : 'None'));
}

function clearShadowScene() {
  pushHistory();
  S.shadowScene = null;
  const el = $('msShadowOv');
  if (el) { el.style.backgroundImage = 'none'; el.style.display = 'none'; }
  toast('✕ Shadow scene removed');
}

function setShadowOpacity(v) {
  S.shadowOpacity = parseInt(v);
  if ($('rvShadowOp')) $('rvShadowOp').textContent = v + '%';
  _applyShadowScene();
}

function setShadowSceneBlur(v) {
  S.shadowBlur = parseInt(v);
  if ($('rvShadowBl')) $('rvShadowBl').textContent = v + 'px';
  _applyShadowScene();
}

function _applyShadowScene() {
  let el = $('msShadowOv');
  if (!el) {
    el = document.createElement('div');
    el.id = 'msShadowOv';
    el.className = 'ms-shadow-overlay';
    $('ms').appendChild(el);
  }
  if (!S.shadowScene || !SHADOW_SCENES[S.shadowScene]) {
    el.style.display = 'none';
    return;
  }
  const scene = SHADOW_SCENES[S.shadowScene];
  const opacity = (S.shadowOpacity || 30) / 100;
  const svg = scene.svg(opacity);
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  el.style.display = 'block';
  el.style.backgroundImage = `url("data:image/svg+xml;base64,${encoded}")`;
  el.style.backgroundSize = scene === SHADOW_SCENES.mesh ? '100px 100px' : 'cover';
  el.style.backgroundRepeat = scene === SHADOW_SCENES.mesh ? 'repeat' : 'no-repeat';
  el.style.filter = S.shadowBlur ? `blur(${S.shadowBlur}px)` : 'none';
}

function renderShadowSceneGrid() {
  const grid = $('shadowSceneGrid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.entries(SHADOW_SCENES).forEach(([key, scene]) => {
    const sw = document.createElement('div');
    sw.className = 'shadow-scene-sw' + (S.shadowScene === key ? ' act' : '');
    sw.title = scene.n;
    // Create a small preview
    const svg = scene.svg(0.3);
    const encoded = btoa(unescape(encodeURIComponent(svg)));
    sw.style.backgroundImage = `url("data:image/svg+xml;base64,${encoded}")`;
    sw.style.backgroundSize = 'cover';
    sw.onclick = () => {
      setShadowScene(key);
      grid.querySelectorAll('.shadow-scene-sw').forEach(s => s.classList.remove('act'));
      sw.classList.add('act');
    };
    const lbl = document.createElement('span');
    lbl.textContent = scene.n;
    sw.appendChild(lbl);
    grid.appendChild(sw);
  });
}

// ==================== CURVATURE / CORNER PRESETS ====================
const CORNER_PRESETS = [
  { n: 'Sharp', v: 0 },
  { n: 'Subtle', v: 4 },
  { n: 'Rounded', v: 10 },
  { n: 'Smooth', v: 16 },
  { n: 'Pill', v: 24 },
  { n: 'Circle', v: 28 }
];

function renderCornerPresets() {
  const el = $('cornerPresets');
  if (!el) return;
  el.innerHTML = '';
  CORNER_PRESETS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'btn-s corner-preset' + (S.round == p.v ? ' act' : '');
    btn.textContent = p.n;
    btn.onclick = () => {
      $('rngR').value = p.v;
      setRnd(p.v);
      el.querySelectorAll('.corner-preset').forEach(b => b.classList.remove('act'));
      btn.classList.add('act');
    };
    el.appendChild(btn);
  });
}

// ==================== SHADOW PRESETS ====================
const SHADOW_PRESETS = [
  { n: 'None', v: 0 },
  { n: 'Subtle', v: 20 },
  { n: 'Medium', v: 50 },
  { n: 'Heavy', v: 80 },
  { n: 'Ultra', v: 100 }
];

function renderShadowPresets() {
  const el = $('shadowPresets');
  if (!el) return;
  el.innerHTML = '';
  SHADOW_PRESETS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'btn-s shadow-preset' + (S.shadow == p.v ? ' act' : '');
    btn.textContent = p.n;
    btn.onclick = () => {
      $('rngS').value = p.v;
      setShd(p.v);
      el.querySelectorAll('.shadow-preset').forEach(b => b.classList.remove('act'));
      btn.classList.add('act');
    };
    el.appendChild(btn);
  });
}

// ==================== BACKGROUND FIT OPTIONS ====================
S.bgFit = S.bgFit || 'cover';

function setBgFit(mode) {
  S.bgFit = mode;
  const bgImg = $('msBgImg');
  if (bgImg) {
    bgImg.style.objectFit = mode;
    if (mode === 'tile') {
      bgImg.style.objectFit = 'none';
    }
  }
  document.querySelectorAll('.bg-fit-btn').forEach(b => b.classList.toggle('act', b.dataset.fit === mode));
  toast('✓ BG fit: ' + mode);
}

// ==================== MORE SOLID COLOR PRESETS (expanded) ====================
const SOLID_COLORS_EXTENDED = [
  // Neutrals
  '#ffffff', '#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717', '#000000',
  // Reds
  '#fef2f2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
  // Oranges
  '#fff7ed', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c',
  // Yellows
  '#fefce8', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04',
  // Greens
  '#f0fdf4', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d',
  // Blues
  '#eff6ff', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
  // Purples
  '#faf5ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce',
  // Pinks
  '#fdf2f8', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d',
  // Brand Colors
  '#c9956b', '#f5f0eb', '#1a1a1e', '#667eea', '#764ba2'
];

function renderSolidPresetsExtended() {
  const el = $('solidPresets');
  if (!el) return;
  el.innerHTML = '';
  SOLID_COLORS_EXTENDED.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'solid-sw';
    sw.style.background = c;
    sw.title = c;
    sw.onclick = () => { setBgCustom(c); if ($('custBg')) $('custBg').value = c };
    el.appendChild(sw);
  });
}
