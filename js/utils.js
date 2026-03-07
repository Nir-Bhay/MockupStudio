// ==================== UTILITIES ====================
const $ = id => document.getElementById(id);
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
function toast(msg) { const t = $('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(t._to); t._to = setTimeout(() => t.classList.remove('show'), 2200) }

// Debounce helper for range sliders
function debounce(fn, ms) { let t; return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms) } }

// requestAnimationFrame throttle for smooth drag
function rafThrottle(fn) { let ticking = false; return function (...a) { if (!ticking) { ticking = true; requestAnimationFrame(() => { fn.apply(this, a); ticking = false }) } } }

let CANVAS_W = 960;
let CANVAS_H = 600;

function setCanvasSize(w, h) {
  CANVAS_W = parseInt(w);
  CANVAS_H = parseInt(h);
  const ms = $('ms');
  if (ms) {
    ms.style.width = w + 'px';
    ms.style.height = h + 'px';
  }
  const stSize = $('stSize');
  if (stSize) stSize.value = w + 'x' + h;
  if (typeof zFit === 'function') zFit();
  if (!S.freeMode && typeof applyLayout === 'function') applyLayout();
}

const MIN_FRAME_W = 80;
const MIN_FRAME_H = 60;
const MAX_UNDO_HISTORY = 40;
const MAX_ZOOM = 2.5;
const MIN_ZOOM = 0.2;
const MAX_GRAD_STOPS = 6;
const MAX_BRAND_COLORS = 12;
const SNAP_THRESHOLD = 8;
const FRAME_SNAP_THRESHOLD = 6;
const MAX_FILE_SIZE_MB = 10;

// ==================== SHARED DRAGGABLE ====================
// Universal drag utility with mouse + touch support, zoom-aware
function makeDraggable(el, opts = {}) {
  // opts: { container, zoom, onStart, onMove, onEnd, snapToCenter, clamp }
  function getPos(ev) {
    if (ev.touches && ev.touches.length > 0) return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
    return { x: ev.clientX, y: ev.clientY };
  }
  function start(e) {
    if (opts.guard && !opts.guard(e)) return;
    e.preventDefault();
    if (e.cancelable !== false) e.stopPropagation && e.stopPropagation();
    const pos = getPos(e);
    const rect = el.getBoundingClientRect();
    const containerEl = opts.container ? opts.container() : $('ms');
    const contRect = containerEl ? containerEl.getBoundingClientRect() : { left: 0, top: 0 };
    const zoom = opts.zoom ? opts.zoom() : 1;
    const ox = pos.x - rect.left;
    const oy = pos.y - rect.top;

    if (opts.onStart) opts.onStart(el, e);

    // Snap guides
    let guideH = null, guideV = null;
    if (opts.snapToCenter && containerEl) {
      guideH = containerEl.querySelector('.snap-guide.h');
      guideV = containerEl.querySelector('.snap-guide.v');
      if (!guideH) { guideH = document.createElement('div'); guideH.className = 'snap-guide h'; guideH.style.opacity = '0'; containerEl.appendChild(guideH) }
      if (!guideV) { guideV = document.createElement('div'); guideV.className = 'snap-guide v'; guideV.style.opacity = '0'; containerEl.appendChild(guideV) }
    }

    const _raf = rafThrottle(function (ev) {
      const p = getPos(ev);
      const z = opts.zoom ? opts.zoom() : 1;
      let x = (p.x - contRect.left) / z - ox / z;
      let y = (p.y - contRect.top) / z - oy / z;

      // Snap to center
      if (opts.snapToCenter) {
        const elW = el.offsetWidth, elH = el.offsetHeight;
        const cx = x + elW / 2, cy = y + elH / 2;
        const threshold = opts.snapThreshold || SNAP_THRESHOLD;
        if (Math.abs(cx - CANVAS_W / 2) < threshold) { x = CANVAS_W / 2 - elW / 2; if (guideV) { guideV.style.left = '50%'; guideV.style.opacity = '1' } }
        else { if (guideV) guideV.style.opacity = '0' }
        if (Math.abs(cy - CANVAS_H / 2) < threshold) { y = CANVAS_H / 2 - elH / 2; if (guideH) { guideH.style.top = '50%'; guideH.style.opacity = '1' } }
        else { if (guideH) guideH.style.opacity = '0' }
      }

      // Clamp to container bounds
      if (opts.clamp) {
        const elW = el.offsetWidth, elH = el.offsetHeight;
        x = Math.max(0, Math.min(x, CANVAS_W - elW));
        y = Math.max(0, Math.min(y, CANVAS_H - elH));
      }

      el.style.left = x + 'px';
      el.style.top = y + 'px';
      if (opts.clearTransform !== false) el.style.transform = 'none';

      if (opts.onMove) opts.onMove(el, x, y, e);
    });

    function move(ev) { _raf(ev) }
    function end(ev) {
      if (guideH) guideH.style.opacity = '0';
      if (guideV) guideV.style.opacity = '0';
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
      if (opts.onEnd) opts.onEnd(el, e);
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', end);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', end);
  }
  el.addEventListener('mousedown', start);
  el.addEventListener('touchstart', start, { passive: false });
}

// ==================== HTML ESCAPE (XSS prevention) ====================
function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ==================== RGBA TO HEX ====================
function rgbaToHex(rgba) {
  if (!rgba || rgba.startsWith('#')) return rgba;
  const m = rgba.match(/[\d.]+/g);
  if (!m || m.length < 3) return '#888888';
  const r = Math.round(parseFloat(m[0]));
  const g = Math.round(parseFloat(m[1]));
  const b = Math.round(parseFloat(m[2]));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ==================== CONFIRM DIALOG ====================
function confirmAction(msg, cb) {
  if (confirm(msg)) cb();
}

// ==================== FILE SIZE CHECK ====================
function checkFileSize(file) {
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    toast('⚠ File too large (max ' + MAX_FILE_SIZE_MB + 'MB)');
    return false;
  }
  return true;
}
