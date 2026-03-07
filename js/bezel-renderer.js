// ==================== REALISTIC DEVICE BEZELS ====================
let _bezelsEnabled = false;

function toggleBezels() {
  _bezelsEnabled = !_bezelsEnabled;
  if (_bezelsEnabled) {
    refreshBezels();
    if ($('bezelsBtn')) $('bezelsBtn').classList.add('act');
  } else {
    ['bf', 'pf', 'tf', 'pf2'].forEach(id => {
      const el = $(id); if (!el) return;
      const b = el.querySelector('.device-bezel'); if (b) b.remove();
      el.classList.remove('bezel-watch', 'bezel-monitor', 'bezel-laptop');
    });
    if ($('bezelsBtn')) $('bezelsBtn').classList.remove('act');
  }
  toast(_bezelsEnabled ? '✓ Detailed bezels ON' : 'Bezels minimal');
}

function _applyBezel(frameId, type) {
  const el = $(frameId);
  if (!el || el.classList.contains('hidden')) return;
  const existing = el.querySelector('.device-bezel'); if (existing) existing.remove();
  el.classList.remove('bezel-watch', 'bezel-monitor', 'bezel-laptop');
  const div = document.createElement('div');
  div.className = 'device-bezel device-bezel-' + type;
  if (type === 'iphone') {
    div.innerHTML = `
      <div class="bz-btn bz-vol-1"></div>
      <div class="bz-btn bz-vol-2"></div>
      <div class="bz-btn bz-silent"></div>
      <div class="bz-btn bz-power"></div>
      <div class="bz-home-bar"></div>`;
  } else if (type === 'macbook') {
    div.innerHTML = `
      <div class="bz-webcam"></div>
      <div class="bz-kbhint"></div>`;
  } else if (type === 'ipad') {
    div.innerHTML = `
      <div class="bz-cam-ipad"></div>
      <div class="bz-btn bz-power-ipad"></div>`;
  } else if (type === 'watch') {
    el.classList.add('bezel-watch');
    div.innerHTML = `
      <div class="bz-crown"></div>
      <div class="bz-crown-btn"></div>
      <div class="bz-watch-band-top"></div>
      <div class="bz-watch-band-bottom"></div>`;
  } else if (type === 'monitor') {
    el.classList.add('bezel-monitor');
    div.innerHTML = `
      <div class="bz-monitor-chin"></div>
      <div class="bz-monitor-stand-neck"></div>
      <div class="bz-monitor-stand-base"></div>
      <div class="bz-monitor-logo"></div>`;
  } else if (type === 'laptop') {
    el.classList.add('bezel-laptop');
    div.innerHTML = `
      <div class="bz-webcam"></div>
      <div class="bz-laptop-hinge"></div>
      <div class="bz-laptop-base"></div>
      <div class="bz-laptop-trackpad"></div>`;
  }
  el.appendChild(div);
}

function refreshBezels() {
  if (!_bezelsEnabled) return;
  ['bf', 'pf', 'tf', 'pf2'].forEach(id => {
    const el = $(id);
    if (el) {
      const b = el.querySelector('.device-bezel'); if (b) b.remove();
      el.classList.remove('bezel-watch', 'bezel-monitor', 'bezel-laptop');
    }
  });
  // Determine bezel types based on current layout
  const lay = LAYS[S.layout];
  const cat = lay ? lay.cat : '';
  if (cat === 'watch') {
    _applyBezel('pf', 'watch');
    _applyBezel('pf2', 'watch');
    _applyBezel('tf', 'ipad');
    _applyBezel('bf', 'macbook');
  } else if (cat === 'monitor') {
    _applyBezel('bf', 'monitor');
    _applyBezel('pf', 'iphone');
    _applyBezel('pf2', 'iphone');
    _applyBezel('tf', 'ipad');
  } else if (cat === 'laptop') {
    _applyBezel('bf', 'laptop');
    _applyBezel('pf', 'iphone');
    _applyBezel('pf2', 'iphone');
    _applyBezel('tf', 'ipad');
  } else {
    _applyBezel('pf', 'iphone');
    _applyBezel('pf2', 'iphone');
    _applyBezel('tf', 'ipad');
    _applyBezel('bf', 'macbook');
  }
}
