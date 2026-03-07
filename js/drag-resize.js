// ==================== FREE POSITION MODE ====================
let dragTarget = null, dragOff = { x: 0, y: 0 };
let _activeZIndex = 100;

function togFree() {
  S.freeMode = !S.freeMode;
  $('freeBtn').style.background = S.freeMode ? 'rgba(201,149,107,.2)' : '';
  $('freeBtn').style.borderColor = S.freeMode ? 'var(--accent)' : '';
  $('freeBtn').title = S.freeMode ? 'Free mode ON' : 'Free mode OFF';
  toast(S.freeMode ? 'Free position mode ON' : 'Snapped to layout');
  if (!S.freeMode) applyLayout();
}

// ==================== PATTERN RESIZE MODE ====================
function togPatternResize() {
  if (!S.freeMode) {
    toast('Enable free mode first');
    return;
  }
  S.patternResize = !S.patternResize;
  const btn = $('patternBtn');
  if (btn) {
    btn.style.background = S.patternResize ? 'rgba(201,149,107,.2)' : '';
    btn.style.borderColor = S.patternResize ? 'var(--accent)' : '';
    btn.title = S.patternResize ? 'Pattern resize ON - resize all scenes proportionally' : 'Pattern resize OFF';
  }
  toast(S.patternResize ? 'Pattern resize ON - resize all scenes together' : 'Pattern resize OFF');
}

// Get all visible frames for proportional resize
function _getAllResizeableFrames() {
  const frames = [];
  // Main frames
  ['bf', 'pf', 'tf', 'pf2'].forEach(id => {
    const el = $(id);
    if (el && !el.classList.contains('hidden')) {
      frames.push(id);
    }
  });
  // Dynamic frames
  (S.dynamicFrames || []).forEach(f => {
    const el = $(f.id);
    if (el) frames.push(f.id);
  });
  return frames;
}

// Apply proportional resize to all frames
function _applyProportionalResize(mainFrameId, newWidth, newHeight) {
  const mainFrame = $(mainFrameId);
  if (!mainFrame) return;

  const startW = parseFloat(mainFrame.dataset.startW) || mainFrame.offsetWidth;
  const startH = parseFloat(mainFrame.dataset.startH) || mainFrame.offsetHeight;

  if (startW === 0 || startH === 0) return;

  const widthRatio = newWidth / startW;
  const heightRatio = newHeight / startH;

  const allFrames = _getAllResizeableFrames();

  allFrames.forEach(frameId => {
    if (frameId === mainFrameId) return;
    const frame = $(frameId);
    if (!frame) return;

    // Store initial size if not stored
    if (!frame.dataset.startW) {
      frame.dataset.startW = frame.offsetWidth;
      frame.dataset.startH = frame.offsetHeight;
      frame.dataset.startL = frame.offsetLeft;
      frame.dataset.startT = frame.offsetTop;
    }

    const initialW = parseFloat(frame.dataset.startW);
    const initialH = parseFloat(frame.dataset.startH);
    const initialL = parseFloat(frame.dataset.startL);
    const initialT = parseFloat(frame.dataset.startT);
    const cx = initialL + initialW / 2;
    const cy = initialT + initialH / 2;

    const newW = initialW * widthRatio;
    const newH = initialH * heightRatio;

    // Symmetric: keep each frame's center fixed
    frame.style.width = newW + 'px';
    frame.style.height = newH + 'px';
    frame.style.left = (cx - newW / 2) + 'px';
    frame.style.top = (cy - newH / 2) + 'px';
  });
}

function initDrag() {
  const handles = ['bfDrag', 'pfDrag', 'tfDrag', 'pf2Drag'];
  const frames = ['bf', 'pf', 'tf', 'pf2'];

  handles.forEach((hId, i) => {
    const h = $(hId); const fr = $(frames[i]);
    if (!h || !fr) return;

    h.addEventListener('mousedown', startDrag);
    h.addEventListener('touchstart', startDrag, { passive: false });
    function startDrag(e) {
      if (!S.freeMode) return;
      if (isFrameLocked && isFrameLocked(frames[i])) return;
      e.preventDefault();
      dragTarget = fr;
      // Bring to front on click
      fr.style.zIndex = ++_activeZIndex;
      const pos = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
      const rect = fr.getBoundingClientRect();
      dragOff.x = pos.x - rect.left;
      dragOff.y = pos.y - rect.top;
      fr.classList.add('dragging');

      // Create snap guides for frames
      _initFrameSnapGuides();

      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', offDrag);
      document.addEventListener('touchmove', onDrag, { passive: false });
      document.addEventListener('touchend', offDrag);
    }
  });

  // 8-point resize handles
  document.querySelectorAll('.resize-h').forEach(rh => {
    rh.addEventListener('mousedown', e => {
      if (!S.freeMode) return;
      e.preventDefault(); e.stopPropagation();

      const frameId = rh.dataset.frame;
      const dir = rh.dataset.dir;
      const fr = $(frameId);
      if (!fr) return;
      if (isFrameLocked && isFrameLocked(frameId)) return;

      fr.style.zIndex = ++_activeZIndex;
      const startW = fr.offsetWidth;
      const startH = fr.offsetHeight;
      const startL = fr.offsetLeft;
      const startT = fr.offsetTop;
      const startX = e.clientX;
      const startY = e.clientY;
      const ar = startW / startH;

      // Store initial sizes for pattern resize
      if (S.patternResize) {
        fr.dataset.startW = startW;
        fr.dataset.startH = startH;
        fr.dataset.startL = startL;
        fr.dataset.startT = startT;
        // Store initial sizes for all frames
        _getAllResizeableFrames().forEach(fId => {
          const f = $(fId);
          if (f && f !== fr) {
            f.dataset.startW = f.offsetWidth;
            f.dataset.startH = f.offsetHeight;
            f.dataset.startL = f.offsetLeft;
            f.dataset.startT = f.offsetTop;
          }
        });
      }

      function onResize(ev) {
        const dx = (ev.clientX - startX) / S.zoom;
        const dy = (ev.clientY - startY) / S.zoom;
        let nw = startW, nh = startH, nl = startL, nt = startT;

        const keepAR = !ev.shiftKey;
        // Symmetric resize: Alt key or pattern resize mode — resize from center
        const symmetric = ev.altKey || S.patternResize;

        if (dir === 'br') { nw = Math.max(MIN_FRAME_W, startW + dx); nh = keepAR ? nw / ar : Math.max(MIN_FRAME_H, startH + dy) }
        else if (dir === 'bl') { nw = Math.max(MIN_FRAME_W, startW - dx); nl = startL + (startW - nw); nh = keepAR ? nw / ar : Math.max(MIN_FRAME_H, startH + dy) }
        else if (dir === 'tr') { nw = Math.max(MIN_FRAME_W, startW + dx); nh = keepAR ? nw / ar : Math.max(MIN_FRAME_H, startH - dy); if (!keepAR) nt = startT + (startH - nh) }
        else if (dir === 'tl') { nw = Math.max(MIN_FRAME_W, startW - dx); nl = startL + (startW - nw); nh = keepAR ? nw / ar : Math.max(MIN_FRAME_H, startH - dy); if (!keepAR) nt = startT + (startH - nh); else nt = startT - (nh - startH) }
        else if (dir === 'tm') { nh = Math.max(MIN_FRAME_H, startH - dy); nt = startT + (startH - nh); if (keepAR) nw = nh * ar }
        else if (dir === 'bm') { nh = Math.max(MIN_FRAME_H, startH + dy); if (keepAR) nw = nh * ar }
        else if (dir === 'ml') { nw = Math.max(MIN_FRAME_W, startW - dx); nl = startL + (startW - nw); if (keepAR) nh = nw / ar }
        else if (dir === 'mr') { nw = Math.max(MIN_FRAME_W, startW + dx); if (keepAR) nh = nw / ar }

        // Symmetric resize: adjust position to keep center fixed
        if (symmetric) {
          const cxOrig = startL + startW / 2;
          const cyOrig = startT + startH / 2;
          nl = cxOrig - nw / 2;
          nt = cyOrig - nh / 2;
        }

        fr.style.width = nw + 'px';
        fr.style.height = nh + 'px';
        fr.style.left = nl + 'px';
        fr.style.top = nt + 'px';
        
        // Apply proportional resize to all other frames if pattern mode is enabled
        if (S.patternResize) {
          _applyProportionalResize(frameId, nw, nh);
        }
      }
      function offResize() {
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', offResize);
        pushHistory();
      }
      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', offResize);
    });
  });
}

// ==================== FRAME SNAP GUIDES ====================
// FRAME_SNAP_THRESHOLD is defined in utils.js as a constant

function _initFrameSnapGuides() {
  const ms = $('ms');
  if (!ms.querySelector('.frame-snap-guide.fh')) {
    const gh = document.createElement('div'); gh.className = 'frame-snap-guide fh'; gh.style.opacity = '0'; ms.appendChild(gh);
    const gv = document.createElement('div'); gv.className = 'frame-snap-guide fv'; gv.style.opacity = '0'; ms.appendChild(gv);
  }
}

function onDrag(e) {
  if (!dragTarget) return;
  _rafDrag(e);
}

const _rafDrag = rafThrottle(function (e) {
  if (!dragTarget) return;
  const pos = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
  const msRect = $('ms').getBoundingClientRect();
  const scale = S.zoom;
  let x = (pos.x - msRect.left) / scale - dragOff.x / scale;
  let y = (pos.y - msRect.top) / scale - dragOff.y / scale;

  // Snap to canvas center
  const ms = $('ms');
  const fw = dragTarget.offsetWidth, fh = dragTarget.offsetHeight;
  const cx = x + fw / 2, cy = y + fh / 2;

  const gh = ms.querySelector('.frame-snap-guide.fh');
  const gv = ms.querySelector('.frame-snap-guide.fv');

  if (Math.abs(cx - CANVAS_W / 2) < FRAME_SNAP_THRESHOLD) {
    x = CANVAS_W / 2 - fw / 2;
    if (gv) { gv.style.left = '50%'; gv.style.opacity = '1' }
  } else { if (gv) gv.style.opacity = '0' }

  if (Math.abs(cy - CANVAS_H / 2) < FRAME_SNAP_THRESHOLD) {
    y = CANVAS_H / 2 - fh / 2;
    if (gh) { gh.style.top = '50%'; gh.style.opacity = '1' }
  } else { if (gh) gh.style.opacity = '0' }

  // Clamp to canvas bounds
  x = Math.max(0, Math.min(x, CANVAS_W - fw));
  y = Math.max(0, Math.min(y, CANVAS_H - fh));

  dragTarget.style.left = x + 'px';
  dragTarget.style.top = y + 'px';
  dragTarget.style.right = 'auto';
  dragTarget.style.bottom = 'auto';
  dragTarget.style.transform = 'none';
});

function offDrag() {
  if (dragTarget) dragTarget.classList.remove('dragging');
  dragTarget = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', offDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', offDrag);

  // Hide snap guides
  const ms = $('ms');
  const gh = ms.querySelector('.frame-snap-guide.fh');
  const gv = ms.querySelector('.frame-snap-guide.fv');
  if (gh) gh.style.opacity = '0';
  if (gv) gv.style.opacity = '0';

  pushHistory();
}

// ==================== CANVAS TOOLBAR ====================
let _selectedFrame = null;
const _frameTypeMap = { bf: 'desktop', pf: 'mobile', tf: 'tablet', pf2: 'mobile2' };
const _frameLabelMap = { bf: 'Desktop', pf: 'Mobile', tf: 'Tablet', pf2: 'Phone 2' };

function initCanvasToolbar() {
  const frames = ['bf', 'pf', 'tf', 'pf2'];
  frames.forEach(fId => {
    const fr = $(fId);
    if (!fr) return;
    fr.addEventListener('click', e => {
      // Don't select on resize handle clicks
      if (e.target.classList.contains('resize-h')) return;
      selectFrame(fId);
    });
  });
  // Click on stage (but not on a frame) deselects
  $('ms').addEventListener('click', e => {
    if (e.target.id === 'ms' || e.target.classList.contains('ms-bg-img') || e.target.classList.contains('ms-bg-overlay')) deselectFrame();
  });
}

function selectFrame(fId) {
  _selectedFrame = fId;
  // Highlight selected frame
  ['bf', 'pf', 'tf', 'pf2'].forEach(id => {
    const el = $(id); if (el) el.style.outline = id === fId ? '2px solid var(--accent)' : '';
  });
  _showCanvasToolbar(fId);
}

function deselectFrame() {
  _selectedFrame = null;
  ['bf', 'pf', 'tf', 'pf2'].forEach(id => {
    const el = $(id); if (el) el.style.outline = '';
  });
  _hideCanvasToolbar();
}

function _showCanvasToolbar(fId) {
  const tb = $('canvasToolbar');
  const fr = $(fId);
  if (!tb || !fr) return;

  // Set label
  $('ctLabel').textContent = _frameLabelMap[fId] || 'Frame';

  // Highlight active fit mode
  const type = _frameTypeMap[fId];
  const fit = S.imgFit[type] || 'cover';
  ['ctCover', 'ctContain', 'ctFill'].forEach(id => {
    const btn = $(id); if (btn) btn.classList.remove('active');
  });
  const fitBtnMap = { cover: 'ctCover', contain: 'ctContain', fill: 'ctFill' };
  if (fitBtnMap[fit]) $(fitBtnMap[fit]).classList.add('active');

  // Position below frame — clamped to stay within canvas bounds
  let top = fr.offsetTop + fr.offsetHeight + 8;
  let left = fr.offsetLeft + fr.offsetWidth / 2;
  // Prevent overflow bottom — if toolbar goes past canvas, position above frame
  if (top + 40 > CANVAS_H) { top = fr.offsetTop - 40 }
  // Prevent overflow sides
  left = Math.max(60, Math.min(left, CANVAS_W - 60));
  tb.style.top = top + 'px';
  tb.style.left = left + 'px';
  tb.classList.add('visible');
}

function _hideCanvasToolbar() {
  const tb = $('canvasToolbar');
  if (tb) tb.classList.remove('visible');
}

// Toolbar action helpers
function ctFit(mode) {
  if (!_selectedFrame) return;
  setImgFit(_frameTypeMap[_selectedFrame], mode);
  _showCanvasToolbar(_selectedFrame);
}
function ctFlipH() {
  if (!_selectedFrame) return;
  flipImg(_frameTypeMap[_selectedFrame], 'h');
}
function ctFlipV() {
  if (!_selectedFrame) return;
  flipImg(_frameTypeMap[_selectedFrame], 'v');
}
function ctAutoFit() {
  if (!_selectedFrame) return;
  autoFitImg(_frameTypeMap[_selectedFrame]);
}
function ctResetPos() {
  if (!_selectedFrame) return;
  resetImgControls(_frameTypeMap[_selectedFrame]);
  if (!S.freeMode) return;
  // Reset position in free mode
  applyLayout();
  pushHistory();
}
