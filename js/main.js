/* 
  Mockup Studio Pro - Core Logic
  Author: Nir-Bhay
*/

// STATE
const state = {
  layout: 'hero',
  bg: 'sahara',
  desktopImg: null,
  mobileImg: null,
  tabletImg: null,
  frameColor: '#ffffff',
  round: 10,
  shadowIntensity: 50,
  phoneScale: 100,
  showNav: true,
  showNotch: true,
  showReflection: false,
  showWatermark: true,
  zoom: 1
};

const backgrounds = {
  sahara: 'linear-gradient(145deg, #c9956b, #b8845d, #d4a57a)',
  midnight: 'linear-gradient(145deg, #0f0c29, #302b63, #24243e)',
  aurora: 'linear-gradient(145deg, #667eea, #764ba2)',
  ocean: 'linear-gradient(145deg, #2193b0, #6dd5ed)',
  forest: 'linear-gradient(145deg, #134e5e, #71b280)',
  sunset: 'linear-gradient(145deg, #f093fb, #f5576c)',
  charcoal: 'linear-gradient(145deg, #232526, #414345)',
  peach: 'linear-gradient(145deg, #ffecd2, #fcb69f)',
  ice: 'linear-gradient(145deg, #e6e9f0, #eef1f5)',
  rose: 'linear-gradient(145deg, #fecfef, #ff9a9e)',
  emerald: 'linear-gradient(145deg, #0d9488, #34d399)'
};

const layouts = {
  hero: {
    browser: { left: '8%', top: '8%', width: '84%', height: '84%' },
    phone: null,
    tablet: null
  },
  duo: {
    browser: { left: '5%', top: '8%', width: '62%', height: '82%' },
    phone: { right: '6%', bottom: '8%', width: '155px', height: '310px' },
    tablet: null
  },
  trio: {
    browser: { left: '5%', top: '5%', width: '90%', height: '65%' },
    phone: { left: '8%', bottom: '5%', width: '120px', height: '240px' },
    tablet: { right: '8%', bottom: '5%', width: '230px', height: '170px' }
  },
  stack: {
    browser: { left: '10%', top: '5%', width: '80%', height: '60%' },
    phone: { left: '50%', bottom: '5%', width: '140px', height: '280px', transform: 'translateX(-50%)' },
    tablet: null
  }
};

// ELEMENTS
const $mockup = document.getElementById('mockupStage');
const $browser = document.getElementById('browserFrame');
const $phone = document.getElementById('phoneFrame');
const $tablet = document.getElementById('tabletFrame');
const $canvas = document.getElementById('stageCanvas');
const $stageArea = document.getElementById('stageArea');

// INITIALIZATION
function init() {
  setBg('sahara');
  applyLayout();
  setTimeout(zoomFit, 100);
}

// FILE UPLOADS
document.getElementById('fileDesktop').addEventListener('change', (e) => handleUpload(e, 'desktop'));
document.getElementById('fileMobile').addEventListener('change', (e) => handleUpload(e, 'mobile'));
document.getElementById('fileTablet').addEventListener('change', (e) => handleUpload(e, 'tablet'));

function handleUpload(e, type) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const url = ev.target.result;
    state[type + 'Img'] = url;

    // Preview in sidebar
    const previewEl = document.getElementById('preview' + cap(type));
    previewEl.src = url;
    document.getElementById('upload' + cap(type)).classList.add('has-image');

    // Display on stage
    if (type === 'desktop') {
      document.getElementById('desktopImg').src = url;
      document.getElementById('desktopImg').style.display = 'block';
      document.getElementById('desktopPlaceholder').style.display = 'none';
    } else if (type === 'mobile') {
      document.getElementById('mobileImg').src = url;
      document.getElementById('mobileImg').style.display = 'block';
      document.getElementById('mobilePlaceholder').style.display = 'none';
    } else if (type === 'tablet') {
      document.getElementById('tabletImg').src = url;
      document.getElementById('tabletImg').style.display = 'block';
      document.getElementById('tabletPlaceholder').style.display = 'none';
    }
    applyLayout();
    showToast('✓ ' + cap(type) + ' image uploaded');
  };
  reader.readAsDataURL(file);
}

function removeImage(type) {
  state[type + 'Img'] = null;
  const previewEl = document.getElementById('preview' + cap(type));
  previewEl.src = '';
  document.getElementById('upload' + cap(type)).classList.remove('has-image');
  document.getElementById('file' + cap(type)).value = '';

  if (type === 'desktop') {
    document.getElementById('desktopImg').style.display = 'none';
    document.getElementById('desktopPlaceholder').style.display = 'flex';
  } else if (type === 'mobile') {
    document.getElementById('mobileImg').style.display = 'none';
    document.getElementById('mobilePlaceholder').style.display = 'flex';
  } else if (type === 'tablet') {
    document.getElementById('tabletImg').style.display = 'none';
    document.getElementById('tabletPlaceholder').style.display = 'flex';
  }
  applyLayout();
  showToast('✕ ' + cap(type) + ' image removed');
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// LAYOUT CONTROL
function setLayout(l) {
  state.layout = l;
  document.querySelectorAll('.layout-opt').forEach(el => el.classList.remove('active'));
  document.querySelector('[data-layout="'+l+'"]').classList.add('active');
  applyLayout();
}

function applyLayout() {
  const l = layouts[state.layout];

  // Browser layout
  if (l.browser) {
    $browser.classList.remove('hidden');
    Object.assign($browser.style, {
      left: l.browser.left || 'auto',
      top: l.browser.top || 'auto',
      right: l.browser.right || 'auto',
      bottom: l.browser.bottom || 'auto',
      width: l.browser.width || 'auto',
      height: l.browser.height || 'auto',
      transform: l.browser.transform || 'none'
    });
    const barH = state.showNav ? 56 : 32;
    document.getElementById('browserBody').style.height = 'calc(100% - ' + barH + 'px)';
  }

  // Phone layout
  if (l.phone) {
    const shouldShowPhone = state.mobileImg || state.layout === 'duo' || state.layout === 'trio' || state.layout === 'stack';
    $phone.classList.toggle('hidden', !shouldShowPhone);
    
    Object.assign($phone.style, {
      left: l.phone.left || 'auto',
      top: l.phone.top || 'auto',
      right: l.phone.right || 'auto',
      bottom: l.phone.bottom || 'auto',
      width: l.phone.width || 'auto',
      height: l.phone.height || 'auto',
      transform: (l.phone.transform || 'none') + ' scale(' + (state.phoneScale / 100) + ')'
    });
  } else {
    $phone.classList.add('hidden');
  }

  // Tablet layout
  if (l.tablet) {
    $tablet.classList.toggle('hidden', !state.tabletImg && state.layout !== 'trio');
    Object.assign($tablet.style, {
      left: l.tablet.left || 'auto',
      top: l.tablet.top || 'auto',
      right: l.tablet.right || 'auto',
      bottom: l.tablet.bottom || 'auto',
      width: l.tablet.width || 'auto',
      height: l.tablet.height || 'auto',
      transform: l.tablet.transform || 'none'
    });
  } else {
    $tablet.classList.add('hidden');
  }

  applyShadow();
}

// COSMETIC CUSTOMIZATION
function setBg(name) {
  state.bg = name;
  document.querySelectorAll('.bg-swatch').forEach(el => el.classList.remove('active'));
  const sw = document.querySelector('[data-bg="'+name+'"]');
  if (sw) sw.classList.add('active');
  if (backgrounds[name]) {
    $mockup.style.background = backgrounds[name];
  }
}

function setBgCustom(color) {
  state.bg = 'custom';
  document.querySelectorAll('.bg-swatch').forEach(el => el.classList.remove('active'));
  document.querySelector('[data-bg="custom"]').classList.add('active');
  $mockup.style.background = color;
}

function setFrameColor(c) {
  state.frameColor = c;
  $browser.style.backgroundColor = c;
  $phone.style.backgroundColor = c;
  $tablet.style.backgroundColor = c;
  
  const barBg = ['#000000', '#1e1e1e'].includes(c) ? 'rgba(40,40,40,.95)' : 'rgba(245,245,245,.95)';
  document.getElementById('browserBar').style.background = barBg;

  const isDark = ['#000000', '#1e1e1e'].includes(c);
  document.querySelectorAll('.browser-controls span').forEach(s => s.style.color = isDark ? '#555' : '#ccc');
  document.querySelector('.address-bar span').style.color = isDark ? '#666' : '#aaa';
  document.querySelectorAll('.browser-nav span').forEach(s => s.style.color = isDark ? '#666' : '#999');
  document.getElementById('browserNav').style.background = isDark ? 'rgba(30,30,30,.9)' : 'rgba(250,250,250,.9)';
}

function setRound(v) {
  state.round = v;
  document.getElementById('roundVal').textContent = v + 'px';
  $browser.style.borderRadius = v + 'px';
}

function setShadow(v) {
  state.shadowIntensity = v;
  document.getElementById('shadowVal').textContent = v + '%';
  applyShadow();
}

function applyShadow() {
  const i = state.shadowIntensity / 100;
  const bShadow = `0 ${25*i}px ${70*i}px rgba(0,0,0,${.18*i}), 0 ${8*i}px ${24*i}px rgba(0,0,0,${.12*i})`;
  const pShadow = `0 ${25*i}px ${60*i}px rgba(0,0,0,${.22*i}), 0 ${8*i}px ${24*i}px rgba(0,0,0,${.14*i})`;
  $browser.style.boxShadow = bShadow;
  $phone.style.boxShadow = pShadow;
  $tablet.style.boxShadow = bShadow;
}

function setPhoneScale(v) {
  state.phoneScale = v;
  document.getElementById('phoneScaleVal').textContent = v + '%';
  applyLayout();
}

// TOGGLE HANDLERS
function toggleNavBar() {
  state.showNav = !state.showNav;
  document.getElementById('toggleNav').classList.toggle('on');
  document.getElementById('browserNav').style.display = state.showNav ? 'flex' : 'none';
  const barH = state.showNav ? 56 : 32;
  document.getElementById('browserBody').style.height = 'calc(100% - ' + barH + 'px)';
}

function toggleNotch() {
  state.showNotch = !state.showNotch;
  document.getElementById('toggleNotch').classList.toggle('on');
  document.getElementById('phoneIsland').style.display = state.showNotch ? 'block' : 'none';
}

function toggleReflection() {
  state.showReflection = !state.showReflection;
  document.getElementById('toggleReflect').classList.toggle('on');
  $mockup.classList.toggle('reflection');
}

function toggleWatermark() {
  state.showWatermark = !state.showWatermark;
  document.getElementById('toggleWm').classList.toggle('on');
  document.getElementById('watermark').style.display = state.showWatermark ? 'block' : 'none';
}

// LABEL HANDLERS
function updateLabels() {
  const num = document.getElementById('labelNum').value;
  const dt = document.getElementById('labelDesktopTitle').value;
  const mt = document.getElementById('labelMobileTitle').value;
  const url = document.getElementById('urlText').value;

  document.getElementById('desktopPhNum').textContent = num;
  document.getElementById('desktopPhTitle').textContent = dt;
  document.getElementById('mobilePhNum').textContent = num;
  document.getElementById('mobilePhTitle').textContent = mt;
  document.getElementById('tabletPhNum').textContent = num;
  document.getElementById('addressText').textContent = url;
}

// ZOOM CONTROLS
function zoomIn() {
  state.zoom = Math.min(state.zoom + 0.1, 2);
  applyZoom();
}

function zoomOut() {
  state.zoom = Math.max(state.zoom - 0.1, 0.3);
  applyZoom();
}

function zoomFit() {
  const area = $stageArea.getBoundingClientRect();
  const sw = 920, sh = 580;
  const zx = (area.width - 60) / sw;
  const zy = (area.height - 60) / sh;
  state.zoom = Math.min(zx, zy, 1);
  applyZoom();
}

function applyZoom() {
  $canvas.style.transform = 'scale(' + state.zoom + ')';
  document.getElementById('zoomDisplay').textContent = Math.round(state.zoom * 100) + '%';
}

// EXPORT SYSTEM
async function exportMockup() {
  const overlay = document.getElementById('exportOverlay');
  overlay.classList.add('show');

  try {
    const scale = parseInt(document.getElementById('exportScale').value);
    const format = document.getElementById('exportFormat').value;

    const prevZoom = state.zoom;
    $canvas.style.transform = 'scale(1)';

    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas($mockup, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      width: 920,
      height: 580
    });

    $canvas.style.transform = 'scale(' + prevZoom + ')';

    const link = document.createElement('a');
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    link.download = 'mockup-' + state.layout + '-' + Date.now() + '.' + format;
    link.href = canvas.toDataURL(mime, 0.95);
    link.click();

    showToast('✓ Mockup exported successfully!');
  } catch(err) {
    console.error(err);
    showToast('✕ Export failed. Try again.');
  }

  overlay.classList.remove('show');
}

async function copyToClipboard() {
  try {
    const prevZoom = state.zoom;
    $canvas.style.transform = 'scale(1)';
    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas($mockup, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false
    });

    $canvas.style.transform = 'scale(' + prevZoom + ')';

    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('✓ Copied to clipboard!');
      } catch(e) {
        showToast('✕ Clipboard access denied');
      }
    });
  } catch(err) {
    showToast('✕ Copy failed');
  }
}

// UTILITIES
function resetAll() {
  removeImage('desktop');
  removeImage('mobile');
  removeImage('tablet');
  setLayout('hero');
  setBg('sahara');
  document.getElementById('frameColor').value = '#ffffff';
  setFrameColor('#ffffff');
  document.getElementById('roundRange').value = 10;
  setRound(10);
  document.getElementById('shadowRange').value = 50;
  setShadow(50);
  document.getElementById('phoneScaleRange').value = 100;
  setPhoneScale(100);

  if (!state.showNav) toggleNavBar();
  if (!state.showNotch) toggleNotch();
  if (state.showReflection) toggleReflection();
  if (!state.showWatermark) toggleWatermark();

  document.getElementById('labelNum').value = '01';
  document.getElementById('labelDesktopTitle').value = 'Website';
  document.getElementById('labelMobileTitle').value = 'Phone';
  document.getElementById('urlText').value = 'www.yourproject.com';
  updateLabels();

  showToast('↺ Reset complete');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// EVENT LISTENERS
window.addEventListener('resize', () => {
  clearTimeout(window._rz);
  window._rz = setTimeout(zoomFit, 200);
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn(); }
    if (e.key === '-') { e.preventDefault(); zoomOut(); }
    if (e.key === '0') { e.preventDefault(); zoomFit(); }
    if (e.key === 's') { e.preventDefault(); exportMockup(); }
  }
});

// Drag & Drop
$stageArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  $stageArea.style.outline = '2px dashed var(--accent)';
  $stageArea.style.outlineOffset = '-4px';
});

$stageArea.addEventListener('dragleave', () => $stageArea.style.outline = 'none');

$stageArea.addEventListener('drop', (e) => {
  e.preventDefault();
  $stageArea.style.outline = 'none';
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  if (!state.desktopImg) {
    handleUpload({ target: { files: [file] } }, 'desktop');
  } else if (!state.mobileImg) {
    handleUpload({ target: { files: [file] } }, 'mobile');
  } else if (!state.tabletImg) {
    handleUpload({ target: { files: [file] } }, 'tablet');
  } else {
    showToast('All slots filled. Remove one first.');
  }
});

// RUN INIT
init();
