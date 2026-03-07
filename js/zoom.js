//  Shahar Dil Se Surendra bhai mafi mangta hun
// ==================== ZOOM ====================
function zIn() { S.zoom = Math.min(S.zoom + .1, MAX_ZOOM); applyZoom() }
function zOut() { S.zoom = Math.max(S.zoom - .1, MIN_ZOOM); applyZoom() }
function zFit() {
  const a = $('stageArea').getBoundingClientRect();
  const zx = (a.width - 40) / CANVAS_W; const zy = (a.height - 40) / CANVAS_H;
  S.zoom = Math.min(zx, zy, 1.2); applyZoom();
}
function applyZoom() { $('stageCv').style.transform = 'scale(' + S.zoom + ')'; $('zDisp').textContent = Math.round(S.zoom * 100) + '%' }

// Scroll wheel zoom on stage
document.addEventListener('DOMContentLoaded', () => {
  const stage = $('stageArea');
  if (stage) stage.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -.05 : .05;
    S.zoom = Math.min(Math.max(S.zoom + delta, MIN_ZOOM), MAX_ZOOM);
    applyZoom();
  }, { passive: false });
});
