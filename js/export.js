// ==================== EXPORT ====================
async function doExport() {
  $('expOv').classList.add('show');
  try {
    const scale = parseInt($('expSc').value);
    const fmt = $('expFmt').value;
    const prevZ = S.zoom;
    $('stageCv').style.transform = 'scale(1)';

    // Hide selection outlines on texts
    document.querySelectorAll('.txt-el').forEach(e => e.classList.remove('sel'));
    // Hide drag handles and resize handles visibility
    document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar,.shape-el.sel,.anno-marker.sel').forEach(e => { if (e.style) e.style.visibility = 'hidden' });

    await new Promise(r => setTimeout(r, 300));
    const canvas = await html2canvas($('ms'), { scale, useCORS: true, allowTaint: true, backgroundColor: null, logging: false, width: CANVAS_W, height: CANVAS_H });

    // Restore
    document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar').forEach(e => e.style.visibility = '');
    $('stageCv').style.transform = 'scale(' + prevZ + ')';
    if (S.selTxt) $(S.selTxt).classList.add('sel');

    const link = document.createElement('a');
    link.download = 'mockup-' + S.layout + '-' + Date.now() + '.' + fmt;
    link.href = canvas.toDataURL(fmt === 'jpeg' ? 'image/jpeg' : 'image/png', .95);
    link.click();
    toast('✓ Exported successfully!');
  } catch (err) {
    console.error(err); toast('✕ Export failed');
  }
  $('expOv').classList.remove('show');
}

async function doCopy() {
  try {
    const prevZ = S.zoom;
    $('stageCv').style.transform = 'scale(1)';
    document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar').forEach(e => e.style.visibility = 'hidden');
    await new Promise(r => setTimeout(r, 300));
    const canvas = await html2canvas($('ms'), { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null, logging: false, width: CANVAS_W, height: CANVAS_H });
    document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar').forEach(e => e.style.visibility = '');
    $('stageCv').style.transform = 'scale(' + prevZ + ')';
    canvas.toBlob(async b => {
      try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); toast('✓ Copied!') }
      catch (e) { toast('✕ Clipboard denied') }
    });
  } catch (e) { toast('✕ Copy failed') }
}

// ==================== SVG EXPORT ====================
async function doExportSVG() {
  $('expOv').classList.add('show');
  try {
    document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar').forEach(e => e.style.visibility = 'hidden');
    const prevZ = S.zoom;
    $('stageCv').style.transform = 'scale(1)';
    await new Promise(r => setTimeout(r, 300));
    const canvas = await html2canvas($('ms'), { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null, logging: false, width: CANVAS_W, height: CANVAS_H });
    document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar').forEach(e => e.style.visibility = '');
    $('stageCv').style.transform = 'scale(' + prevZ + ')';
    const dataUrl = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}"><image xlink:href="${dataUrl}" width="${CANVAS_W}" height="${CANVAS_H}"/></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.download = 'mockup-' + Date.now() + '.svg';
    a.href = URL.createObjectURL(blob);
    a.click(); URL.revokeObjectURL(a.href);
    toast('✓ SVG exported');
  } catch (err) { console.error(err); toast('✕ SVG export failed') }
  $('expOv').classList.remove('show');
}

// ==================== PDF EXPORT ====================
async function doExportPDF() {
  $('expOv').classList.add('show');
  try {
    document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar').forEach(e => e.style.visibility = 'hidden');
    const prevZ = S.zoom;
    $('stageCv').style.transform = 'scale(1)';
    await new Promise(r => setTimeout(r, 300));
    const canvas = await html2canvas($('ms'), { scale: 3, useCORS: true, allowTaint: true, backgroundColor: null, logging: false, width: CANVAS_W, height: CANVAS_H });
    document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar').forEach(e => e.style.visibility = '');
    $('stageCv').style.transform = 'scale(' + prevZ + ')';
    const dataUrl = canvas.toDataURL('image/png', .98);
    const w = window.open('', '_blank');
    if (!w) { toast('✕ Popup blocked — allow popups'); $('expOv').classList.remove('show'); return }
    w.document.write(`<!DOCTYPE html><html><head><title>Mockup Print</title><style>@page{margin:0;size:${CANVAS_W}px ${CANVAS_H}px}*{margin:0;padding:0;box-sizing:border-box}body{width:${CANVAS_W}px;height:${CANVAS_H}px;overflow:hidden}img{width:${CANVAS_W}px;height:${CANVAS_H}px;display:block}</style></head><body><img src="${dataUrl}"><script>window.onload=()=>setTimeout(()=>{window.print();window.close()},400)<\/script></body></html>`);
    w.document.close();
    toast('✓ PDF print dialog opened');
  } catch (err) { console.error(err); toast('✕ PDF export failed') }
  $('expOv').classList.remove('show');
}
