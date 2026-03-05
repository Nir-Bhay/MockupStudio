/* 
  Mockup Studio Pro - Core Logic
  Author: Nir-Bhay
*/

// STATE (Using Proxy for automatic UI updates - V2.0 Innovation)
const state = new Proxy({
  layout: 'hero',
  bg: 'sahara',
  desktopImg: null,
  mobileImg: null,
  tabletImg: null,
  frameColor: '#ffffff',
  round: 12,
  shadowIntensity: 50,
  phoneScale: 100,
  showNav: true,
  showNotch: true,
  showReflection: false,
  showWatermark: true,
  zoom: 1,
  exportScale: 3,
  exportFormat: 'png'
}, {
  set(target, key, value) {
    target[key] = value;
    updateUI(key);
    return true;
  }
});

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
    phone: { right: '6%', bottom: '8%', width: '165px', height: '330px' },
    tablet: null
  },
  trio: {
    browser: { left: '5%', top: '5%', width: '90%', height: '65%' },
    phone: { left: '8%', bottom: '5%', width: '130px', height: '260px' },
    tablet: { right: '8%', bottom: '5%', width: '250px', height: '180px' }
  },
  stack: {
    browser: { left: '10%', top: '5%', width: '80%', height: '60%' },
    phone: { left: '50%', bottom: '5%', width: '150px', height: '300px', transform: 'translateX(-50%)' },
    tablet: null
  }
};

// ELEMENTS
const elements = {
  mockup: document.getElementById('mockupStage'),
  browser: document.getElementById('browserFrame'),
  phone: document.getElementById('phoneFrame'),
  tablet: document.getElementById('tabletFrame'),
  canvas: document.getElementById('stageCanvas'),
  area: document.getElementById('stageArea'),
  zoomDisplay: document.getElementById('zoomDisplay')
};

// UI UPDATER
function updateUI(key) {
  switch (key) {
    case 'layout':
    case 'phoneScale':
    case 'mobileImg':
    case 'tabletImg':
      applyLayout();
      break;
    case 'bg':
      applyBackground();
      break;
    case 'frameColor':
      applyColors();
      break;
    case 'round':
      elements.browser.style.borderRadius = state.round + 'px';
      document.getElementById('roundVal').textContent = state.round + 'px';
      break;
    case 'shadowIntensity':
      applyShadow();
      document.getElementById('shadowVal').textContent = state.shadowIntensity + '%';
      break;
    case 'zoom':
      elements.canvas.style.transform = `scale(${state.zoom})`;
      elements.zoomDisplay.textContent = Math.round(state.zoom * 100) + '%';
      break;
  }
}

// INITIALIZATION
function init() {
  // Load Session if exists
  const saved = localStorage.getItem('mockup_studio_session');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
    } catch (e) {}
  }

  applyBackground();
  applyLayout();
  applyColors();
  
  setTimeout(zoomFit, 150);
  
  // Adaptive Scaling Observer
  const resizeObs = new ResizeObserver(() => zoomFit());
  resizeObs.observe(elements.area);
}

// LAYOUT & RENDERING
function applyLayout() {
  const l = layouts[state.layout];

  // Browser
  if (l.browser) {
    elements.browser.classList.remove('hidden');
    Object.assign(elements.browser.style, {
      left: l.browser.left || 'auto',
      top: l.browser.top || 'auto',
      right: l.browser.right || 'auto',
      bottom: l.browser.bottom || 'auto',
      width: l.browser.width || 'auto',
      height: l.browser.height || 'auto',
      transform: l.browser.transform || 'none'
    });
  }

  // Phone
  const hasPhone = l.phone && (state.mobileImg || ['duo', 'trio', 'stack'].includes(state.layout));
  elements.phone.classList.toggle('hidden', !hasPhone);
  if (hasPhone) {
    Object.assign(elements.phone.style, {
      left: l.phone.left || 'auto',
      top: l.phone.top || 'auto',
      right: l.phone.right || 'auto',
      bottom: l.phone.bottom || 'auto',
      width: l.phone.width || 'auto',
      height: l.phone.height || 'auto',
      transform: `${l.phone.transform || ''} scale(${state.phoneScale / 100})`
    });
  }

  // Tablet
  const hasTablet = l.tablet && (state.tabletImg || state.layout === 'trio');
  elements.tablet.classList.toggle('hidden', !hasTablet);
  if (hasTablet) {
    Object.assign(elements.tablet.style, {
      left: l.tablet.left || 'auto',
      top: l.tablet.top || 'auto',
      right: l.tablet.right || 'auto',
      bottom: l.tablet.bottom || 'auto',
      width: l.tablet.width || 'auto',
      height: l.tablet.height || 'auto'
    });
  }

  applyShadow();
}

function applyBackground() {
  if (backgrounds[state.bg]) {
    elements.mockup.style.background = backgrounds[state.bg];
  } else if (state.bg === 'custom') {
    elements.mockup.style.background = state.customColor || '#c9956b';
  }
  
  // Highlight active swatch
  document.querySelectorAll('.bg-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.bg === state.bg);
  });
}

function applyColors() {
  const c = state.frameColor;
  [elements.browser, elements.phone, elements.tablet].forEach(el => el.style.backgroundColor = c);
  
  const isDark = ['#000000', '#1e1e1e'].includes(c);
  const barBg = isDark ? 'rgba(40, 40, 40, 0.95)' : 'rgba(245, 245, 245, 0.95)';
  document.getElementById('browserBar').style.background = barBg;
  document.getElementById('browserBar').style.color = isDark ? '#fff' : '#333';
  
  document.querySelectorAll('.address-bar').forEach(bar => {
    bar.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  });
}

function applyShadow() {
  const i = state.shadowIntensity / 100;
  const bShadow = `0 ${30*i}px ${80*i}px rgba(0,0,0,${0.2*i}), 0 ${10*i}px ${30*i}px rgba(0,0,0,${0.1*i})`;
  const pShadow = `0 ${30*i}px ${90*i}px rgba(0,0,0,${0.3*i}), 0 ${10*i}px ${30*i}px rgba(0,0,0,${0.15*i})`;
  
  elements.browser.style.boxShadow = bShadow;
  elements.phone.style.boxShadow = pShadow;
  elements.tablet.style.boxShadow = bShadow;
}

// FILE HANDLING
function handleUpload(e, type) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const url = ev.target.result;
    state[type + 'Img'] = url;

    // Sidebar Preview
    const preview = document.getElementById(`preview${cap(type)}`);
    preview.src = url;
    document.getElementById(`upload${cap(type)}`).classList.add('has-image');

    // Canvas Image
    const imgEl = document.getElementById(`${type}Img`);
    imgEl.src = url;
    imgEl.classList.remove('hidden');
    imgEl.style.display = 'block';
    document.getElementById(`${type}Placeholder`).classList.add('hidden');
    document.getElementById(`${type}Placeholder`).style.display = 'none';

    showToast(`✓ ${cap(type)} asset loaded`);
    saveSession();
  };
  reader.readAsDataURL(file);
}

function removeImage(type) {
  state[type + 'Img'] = null;
  document.getElementById(`upload${cap(type)}`).classList.remove('has-image');
  document.getElementById(`${type}Img`).classList.add('hidden');
  document.getElementById(`${type}Img`).style.display = 'none';
  document.getElementById(`${type}Placeholder`).classList.remove('hidden');
  document.getElementById(`${type}Placeholder`).style.display = 'flex';
  
  showToast(`✕ ${cap(type)} removed`);
  saveSession();
}

// ZOOM SYSTEM
function zoomIn() { state.zoom = Math.min(state.zoom + 0.15, 3); }
function zoomOut() { state.zoom = Math.max(state.zoom - 0.15, 0.2); }
function zoomFit() {
  const pad = 80;
  const sw = 920, sh = 580;
  const area = elements.area.getBoundingClientRect();
  const scale = Math.min((area.width - pad) / sw, (area.height - pad) / sh, 1.2);
  state.zoom = scale;
}

// EXPORT SYSTEM (Multi-Resolution)
async function exportMockup() {
  const overlay = document.getElementById('exportOverlay');
  overlay.classList.add('show');

  try {
    const prevZoom = state.zoom;
    elements.canvas.style.transform = 'scale(1)';
    
    await new Promise(r => setTimeout(r, 300)); // Render wait

    const canvas = await html2canvas(elements.mockup, {
      scale: state.exportScale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      width: 920,
      height: 580
    });

    elements.canvas.style.transform = `scale(${prevZoom})`;

    const link = document.createElement('a');
    link.download = `mockup-${state.layout}-${Date.now()}.${state.exportFormat}`;
    link.href = canvas.toDataURL(`image/${state.exportFormat}`, 0.95);
    link.click();

    showToast('✓ Professional Mockup Exported');
  } catch (err) {
    showToast('✕ Rendering engine error');
    console.error(err);
  } finally {
    overlay.classList.remove('show');
  }
}

// UTILS
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function saveSession() {
  const cleanState = { ...state };
  delete cleanState.desktopImg; // Don't save large Base64 in localStorage
  delete cleanState.mobileImg;
  delete cleanState.tabletImg;
  localStorage.setItem('mockup_studio_session', JSON.stringify(cleanState));
}

// GLOBAL BINDINGS
window.setLayout = (l) => state.layout = l;
window.setBg = (bg) => state.bg = bg;
window.setBgCustom = (c) => { state.customColor = c; state.bg = 'custom'; applyBackground(); };
window.setFrameColor = (c) => state.frameColor = c;
window.setRound = (v) => state.round = parseInt(v);
window.setShadow = (v) => state.shadowIntensity = parseInt(v);
window.setPhoneScale = (v) => state.phoneScale = parseInt(v);
window.toggleNavBar = () => { state.showNav = !state.showNav; document.getElementById('toggleNav').classList.toggle('on'); document.getElementById('browserNav').style.display = state.showNav ? 'flex' : 'none'; };
window.toggleNotch = () => { state.showNotch = !state.showNotch; document.getElementById('toggleNotch').classList.toggle('on'); };
window.toggleReflection = () => { state.showReflection = !state.showReflection; document.getElementById('toggleReflect').classList.toggle('on'); elements.mockup.classList.toggle('reflection'); };
window.toggleWatermark = () => { state.showWatermark = !state.showWatermark; document.getElementById('toggleWm').classList.toggle('on'); document.getElementById('watermark').style.display = state.showWatermark ? 'block' : 'none'; };
window.exportMockup = exportMockup;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.zoomFit = zoomFit;
window.removeImage = removeImage;

// LISTENERS
document.getElementById('fileDesktop').addEventListener('change', (e) => handleUpload(e, 'desktop'));
document.getElementById('fileMobile').addEventListener('change', (e) => handleUpload(e, 'mobile'));
document.getElementById('fileTablet').addEventListener('change', (e) => handleUpload(e, 'tablet'));

init();
