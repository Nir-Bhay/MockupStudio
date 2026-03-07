//  Shahar Dil Se Surendra bhai mafi mangta hun
// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.ctrlKey || e.metaKey) {
    if (e.key === '=' || e.key === '+') { e.preventDefault(); zIn() }
    if (e.key === '-') { e.preventDefault(); zOut() }
    if (e.key === '0') { e.preventDefault(); zFit() }
    if (e.key === 's') { e.preventDefault(); doExport() }
    // Fix: only copy mockup if no native text selection exists
    if (e.key === 'c') {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim() === '') {
        e.preventDefault(); doCopy();
      }
      // else: let the browser handle native copy
    }
    if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
    if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo() }
    if (e.key === 'y') { e.preventDefault(); redo() }
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (S.selTxt) { deleteTxt(); return }
    if (S.selShape) { deleteShape(); return }
    if (S.selAnno) { deleteAnno(); return }
    if (S.selBadge) { deleteBadge(); return }
  }
  if (e.key === 'Escape') {
    S.selTxt = null; document.querySelectorAll('.txt-el').forEach(e => e.classList.remove('sel'));
    $('txtEditSec').style.display = 'none';
    document.querySelectorAll('.txt-item').forEach(e => e.classList.remove('sel'));
    // Also deselect shapes, annotations, badges
    if (S.selShape) { S.selShape = null; document.querySelectorAll('.shape-el').forEach(e => e.style.outline = ''); const sec = $('shapeEditSec'); if (sec) sec.style.display = 'none' }
    if (S.selAnno) { S.selAnno = null; document.querySelectorAll('.anno-marker').forEach(e => e.classList.remove('sel')); const sec = $('annoEditSec'); if (sec) sec.style.display = 'none' }
    if (S.selBadge) { S.selBadge = null; document.querySelectorAll('.canvas-badge').forEach(e => e.classList.remove('sel')); const sec = $('badgeEditSec'); if (sec) sec.style.display = 'none' }
    deselectFrame();
  }
});
