// ==================== IMAGE CONTROLS ====================
function setImgFit(type, v) {
  S.imgFit[type] = v;
  applyImgStyle(type);
}
const setImgScale = rafThrottle(function (type, v) {
  S.imgScale[type] = parseInt(v);
  const rvId = { desktop: 'rvDS', mobile: 'rvMS', tablet: 'rvTS', mobile2: 'rvM2S' }[type];
  if ($(rvId)) $(rvId).textContent = v + '%';
  applyImgStyle(type);
});
const setImgOff = rafThrottle(function (type, axis, v) {
  S.imgOff[type][axis] = parseInt(v);
  const rvId = { desktop: { x: 'rvDX', y: 'rvDY' }, mobile: { x: 'rvMX', y: 'rvMY' }, tablet: { x: 'rvTX', y: 'rvTY' }, mobile2: { x: 'rvM2X', y: 'rvM2Y' } }[type][axis];
  if ($(rvId)) $(rvId).textContent = v + 'px';
  applyImgStyle(type);
});
const setImgRad = rafThrottle(function (type, v) {
  S.imgRad[type] = parseInt(v);
  if (type === 'desktop') $('rvDR').textContent = v + 'px';
  applyImgStyle(type);
});

// ==================== ADVANCED IMAGE CONTROLS ====================
const setImgRotation = rafThrottle(function (type, v) {
  S.imgRotation[type] = parseInt(v);
  const rvId = { desktop: 'rvDRot', mobile: 'rvMRot', tablet: 'rvTRot', mobile2: 'rvM2Rot' }[type];
  if ($(rvId)) $(rvId).textContent = v + '°';
  applyImgStyle(type);
});

const setImgOpacity = rafThrottle(function (type, v) {
  S.imgOpacity[type] = parseInt(v);
  const rvId = { desktop: 'rvDOp', mobile: 'rvMOp', tablet: 'rvTOp', mobile2: 'rvM2Op' }[type];
  if ($(rvId)) $(rvId).textContent = v + '%';
  applyImgStyle(type);
});

function setImgFilter(type, prop, v) {
  S.imgFilters[type][prop] = parseInt(v);
  const rvId = 'rv' + type.charAt(0).toUpperCase() + prop.charAt(0).toUpperCase();
  applyImgStyle(type);
}

function flipImg(type, axis) {
  if (axis === 'h') S.imgFlip[type].h = !S.imgFlip[type].h;
  else S.imgFlip[type].v = !S.imgFlip[type].v;
  applyImgStyle(type);
  toast('↔ Image flipped');
}

function autoFitImg(type) {
  const imgId = { desktop: 'imgD', mobile: 'imgM', tablet: 'imgTb', mobile2: 'imgM2' }[type];
  const img = $(imgId); if (!img || !img.naturalWidth) return;

  const frameId = { desktop: 'bf', mobile: 'pf', tablet: 'tf', mobile2: 'pf2' }[type];
  const frame = $(frameId); if (!frame) return;

  const iw = img.naturalWidth, ih = img.naturalHeight;
  const fw = frame.clientWidth, fh = frame.clientHeight;
  const imgAR = iw / ih, frameAR = fw / fh;

  // Choose cover or contain based on aspect ratio similarity
  const fit = Math.abs(imgAR - frameAR) < 0.5 ? 'cover' : 'contain';
  S.imgFit[type] = fit;
  S.imgScale[type] = 100;
  S.imgOff[type] = { x: 0, y: 0 };

  // Update UI controls
  const fitSelect = { desktop: 'dFit', mobile: 'mFit', mobile2: 'm2Fit' }[type];
  if ($(fitSelect)) $(fitSelect).value = fit;

  applyImgStyle(type);
  toast('✓ Auto-fit applied');
}

function resetImgControls(type) {
  S.imgFit[type] = 'cover';
  S.imgScale[type] = 100;
  S.imgOff[type] = { x: 0, y: 0 };
  S.imgRad[type] = 0;
  S.imgRotation[type] = 0;
  S.imgOpacity[type] = 100;
  S.imgFlip[type] = { h: false, v: false };
  S.imgFilters[type] = { brightness: 100, contrast: 100, saturation: 100, blur: 0 };

  // Update UI controls for the reset type
  const fitSelect = { desktop: 'dFit', mobile: 'mFit', mobile2: 'm2Fit' }[type];
  if (fitSelect && $(fitSelect)) $(fitSelect).value = 'cover';

  applyImgStyle(type);
  toast('↺ Image reset');
}

function applyImgStyle(type) {
  const imgId = { desktop: 'imgD', mobile: 'imgM', tablet: 'imgTb', mobile2: 'imgM2' }[type];
  const img = $(imgId); if (!img) return;
  if (!S.imgScale[type]) S.imgScale[type] = 100;
  if (!S.imgOff[type]) S.imgOff[type] = { x: 0, y: 0 };
  if (!S.imgFit[type]) S.imgFit[type] = 'cover';
  const sc = S.imgScale[type] / 100;
  const ox = S.imgOff[type].x;
  const oy = S.imgOff[type].y;
  const fit = S.imgFit[type];
  const rad = S.imgRad[type] || 0;
  const rot = S.imgRotation[type] || 0;
  const op = (S.imgOpacity[type] != null ? S.imgOpacity[type] : 100) / 100;
  const flip = S.imgFlip[type] || { h: false, v: false };
  const filters = S.imgFilters[type] || { brightness: 100, contrast: 100, saturation: 100, blur: 0 };

  img.style.objectFit = fit;
  img.style.width = '100%';
  img.style.height = '100%';

  const sx = flip.h ? -sc : sc;
  const sy = flip.v ? -sc : sc;
  img.style.transform = `scale(${sx},${sy}) translate(${ox}px, ${oy}px) rotate(${rot}deg)`;
  img.style.borderRadius = rad + 'px';
  img.style.opacity = op;
  img.style.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`;
  img.style.transition = 'transform .2s var(--ease-out),filter .2s,opacity .2s,border-radius .2s';
}
