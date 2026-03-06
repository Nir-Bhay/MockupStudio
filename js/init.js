// ==================== RESET (with confirmation) ====================
function doReset() {
  confirmAction('Are you sure you want to reset everything? All unsaved work will be lost.', () => {
    pushHistory();
    rmImg('desktop'); rmImg('mobile'); rmImg('tablet'); rmBgImg();
    setLayout('hero'); setBg('sahara'); setTheme('default');
    $('frmCol').value = '#ffffff'; setFrmCol('#ffffff');
    $('rngR').value = 10; setRnd(10); $('rngS').value = 50; setShd(50);
    $('rngP').value = 100; setPSc(100); $('rngPd').value = 5; setPad(5);
    $('rngBl').value = 0; setBgBlur(0);
    if (!S.showNav) togNav(); if (!S.showIsland) togIsland();
    if (S.showRefl) togRefl(); if (!S.showWm) togWm(); if (S.showBgOv) togBgOv();
    if (S.noiseEnabled) togNoise(); if (S.vignetteEnabled) togVignette(); if (S.animBg) togAnimBg();

    // Remove all dynamic elements
    _removeAllDynamic();
    S.shapes = []; S.selShape = null;
    S.badges = []; S.selBadge = null;
    S.annotations = []; S.selAnno = null;
    S.texts = []; S.selTxt = null;

    const sec = $('shapeEditSec'); if (sec) sec.style.display = 'none';
    const bsec = $('badgeEditSec'); if (bsec) bsec.style.display = 'none';
    const asec = $('annoEditSec'); if (asec) asec.style.display = 'none';
    $('txtEditSec').style.display = 'none';
    renderTextList();

    $('lblN').value = '01'; $('lblD').value = 'Website'; $('lblM').value = 'Phone'; $('lblT').value = 'Tablet'; $('urlTxt').value = 'www.yourproject.com';
    updateLabels();

    if (S.freeMode) togFree();
    renderLayerPanel();
    toast('↺ Reset complete');
  });
}

// ==================== DRAG & DROP ON STAGE ====================
$('stageArea').addEventListener('dragover', e => {
  e.preventDefault();
  const sa = $('stageArea');
  sa.style.outline = '2px dashed var(--accent)';
  sa.style.outlineOffset = '-3px';
  sa.style.background = 'rgba(201,149,107,.03)';
});
$('stageArea').addEventListener('dragleave', () => {
  const sa = $('stageArea');
  sa.style.outline = 'none';
  sa.style.background = '';
});
$('stageArea').addEventListener('drop', e => {
  e.preventDefault();
  const sa = $('stageArea');
  sa.style.outline = 'none';
  sa.style.background = '';
  const f = e.dataTransfer.files[0];
  if (!f || !f.type.startsWith('image/')) return;
  if (!checkFileSize(f)) return;
  if (!S.desktopImg) { const dt = new DataTransfer(); dt.items.add(f); $('fD').files = dt.files; handleUpload({ target: { files: [f] } }, 'desktop') }
  else if (!S.mobileImg) { handleUpload({ target: { files: [f] } }, 'mobile') }
  else if (!S.tabletImg) { handleUpload({ target: { files: [f] } }, 'tablet') }
  else toast('All slots full');
});

// ==================== WINDOW RESIZE ====================
const _debouncedZFit = debounce(zFit, 200);
window.addEventListener('resize', _debouncedZFit);

// ==================== CLICK STAGE TO DESELECT ALL ====================
$('ms').addEventListener('click', e => {
  if (e.target === $('ms') || e.target.classList.contains('ms-bg-overlay')) {
    S.selTxt = null;
    document.querySelectorAll('.txt-el').forEach(el => el.classList.remove('sel'));
    $('txtEditSec').style.display = 'none';
    document.querySelectorAll('.txt-item').forEach(el => el.classList.remove('sel'));
    // Deselect shapes too
    if (S.selShape) { S.selShape = null; document.querySelectorAll('.shape-el').forEach(e => e.style.outline = ''); const sec = $('shapeEditSec'); if (sec) sec.style.display = 'none' }
    if (S.selAnno) { S.selAnno = null; document.querySelectorAll('.anno-marker').forEach(e => e.classList.remove('sel')); const sec = $('annoEditSec'); if (sec) sec.style.display = 'none' }
    if (S.selBadge) { S.selBadge = null; document.querySelectorAll('.canvas-badge').forEach(e => e.classList.remove('sel')); const sec = $('badgeEditSec'); if (sec) sec.style.display = 'none' }
    deselectFrame();
  }
});

// ==================== AUTOSAVE ====================
const _AUTOSAVE_KEY = 'ms_autosave';
const _AUTOSAVE_INTERVAL = 30000; // 30 seconds

function _autoSave() {
  try {
    _saveCurrentArtboard();
    const data = { artboards: S.artboards, activeArtboard: S.activeArtboard, _abCounter: S._abCounter };
    localStorage.setItem(_AUTOSAVE_KEY, JSON.stringify(data));
  } catch (e) {/* silently fail if storage full */ }
}

function _tryRestoreAutosave() {
  try {
    const raw = localStorage.getItem(_AUTOSAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.artboards || !data.artboards.length) return false;
    if (confirm('Restore your last autosaved session?')) {
      S.artboards = data.artboards;
      S.activeArtboard = data.activeArtboard || 0;
      S._abCounter = data._abCounter || data.artboards.length;
      _loadArtboard(S.artboards[S.activeArtboard]);
      renderArtboardNav();
      toast('✓ Session restored');
      return true;
    } else {
      localStorage.removeItem(_AUTOSAVE_KEY);
    }
  } catch (e) { }
  return false;
}

setInterval(_autoSave, _AUTOSAVE_INTERVAL);

// ==================== BEFOREUNLOAD WARNING ====================
window.addEventListener('beforeunload', e => {
  _autoSave();
  // Only warn if user has images or texts
  if (S.desktopImg || S.mobileImg || S.tabletImg || S.texts.length > 0 || (S.shapes && S.shapes.length > 0)) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// ==================== RESPONSIVE SIDEBAR TOGGLE ====================
function toggleLeftSidebar() {
  const sb = $('leftSb');
  const ov = $('sbOverlay');
  sb.classList.toggle('open');
  if (ov) ov.classList.toggle('show', sb.classList.contains('open'));
}

function toggleRightSidebar() {
  const sb = $('rightSb');
  const ov = $('sbOverlay');
  sb.classList.toggle('open');
  if (ov) ov.classList.toggle('show', sb.classList.contains('open'));
}

function closeSidebars() {
  $('leftSb').classList.remove('open');
  $('rightSb').classList.remove('open');
  const ov = $('sbOverlay');
  if (ov) ov.classList.remove('show');
}

// ==================== INIT ====================
function init() {
  buildUI();
  setBg('sahara');
  applyLayout();
  initDrag();
  initCanvasToolbar();
  initArtboards();
  buildRulers();
  renderLayerPanel();
  renderPatternGrid();
  renderLabelPresets();
  renderBrandKit();
  renderBgGallery();
  renderGradStopEditor();
  setTimeout(zFit, 150);
  pushHistory();
  // Try autosave restore after initial setup
  setTimeout(() => _tryRestoreAutosave(), 200);
}
init();
