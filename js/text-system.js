//  Shahar Dil Se Surendra bhai mafi mangta hun
// ==================== TEXT ON STAGE ====================
let txtIdCounter = 0;

function addText() {
  const txt = $('newTxtVal').value || 'Your Text';
  const font = $('newTxtFont').value;
  const size = $('newTxtSize').value;
  const weight = $('newTxtW').value;
  const color = $('newTxtCol').value;
  const opacity = parseInt($('newTxtOp').value) / 100;
  const ls = parseInt($('newTxtLs').value);
  const lh = parseFloat($('newTxtLh') ? $('newTxtLh').value : 1.2);
  const shadow = parseInt($('newTxtSh') ? $('newTxtSh').value : 0);
  const align = $('newTxtAlign') ? $('newTxtAlign').value : 'center';

  const id = 'txt_' + (++txtIdCounter);
  const obj = { id, text: txt, font, size: parseInt(size), weight: parseInt(weight), color, opacity, ls, lh, shadow, align, x: 50, y: 50 };
  S.texts.push(obj);

  const el = document.createElement('div');
  el.className = 'txt-el';
  el.id = id;
  el.textContent = txt;
  el.style.fontFamily = font;
  el.style.fontSize = size + 'px';
  el.style.fontWeight = weight;
  el.style.color = color;
  el.style.opacity = opacity;
  el.style.letterSpacing = ls + 'px';
  el.style.lineHeight = lh;
  el.style.textShadow = shadow > 0 ? `0 2px ${shadow}px rgba(0,0,0,0.5)` : 'none';
  el.style.textAlign = align;
  el.style.left = '50%';
  el.style.top = '50%';
  el.style.transform = 'translate(-50%,-50%)';

  // Shared draggable with mouse + touch support
  makeDraggable(el, {
    zoom: () => S.zoom,
    snapToCenter: true,
    onStart: () => { el.classList.add('dragging'); selectText(id) },
    onMove: (el, x, y) => { const tObj = S.texts.find(t => t.id === id); if (tObj) { tObj.x = x; tObj.y = y } },
    onEnd: () => { el.classList.remove('dragging'); pushHistory() }
  });

  $('ms').appendChild(el);
  renderTextList();
  selectText(id);
  toast('✓ Text added');
}

function selectText(id) {
  S.selTxt = id;
  document.querySelectorAll('.txt-el').forEach(e => e.classList.toggle('sel', e.id === id));
  document.querySelectorAll('.txt-item').forEach(e => e.classList.toggle('sel', e.dataset.id === id));

  const obj = S.texts.find(t => t.id === id);
  if (obj) {
    $('txtEditSec').style.display = 'flex';
    $('edTxtVal').value = obj.text;
    $('edTxtSz').value = obj.size;
    $('edTxtCol').value = obj.color;
    if ($('edTxtLh')) $('edTxtLh').value = obj.lh !== undefined ? obj.lh : 1.2;
    if ($('edTxtSh')) $('edTxtSh').value = obj.shadow !== undefined ? obj.shadow : 0;
  }
}

function editTxtProp(prop) {
  if (!S.selTxt) return;
  const obj = S.texts.find(t => t.id === S.selTxt);
  const el = $(S.selTxt);
  if (!obj || !el) return;

  if (prop === 'text') { obj.text = $('edTxtVal').value; el.textContent = obj.text; renderTextList() }
  if (prop === 'size') { obj.size = parseInt($('edTxtSz').value); el.style.fontSize = obj.size + 'px' }
  if (prop === 'color') { obj.color = $('edTxtCol').value; el.style.color = obj.color }
  if (prop === 'align') { const a = $('edTxtAlign').value; obj.align = a; el.style.textAlign = a }
  if (prop === 'lineHeight') { obj.lh = parseFloat($('edTxtLh').value); el.style.lineHeight = obj.lh }
  if (prop === 'shadow') { obj.shadow = parseInt($('edTxtSh').value); el.style.textShadow = obj.shadow > 0 ? `0 2px ${obj.shadow}px rgba(0,0,0,0.5)` : 'none' }
}

function deleteTxt() {
  if (!S.selTxt) return;
  pushHistory();
  const el = $(S.selTxt);
  if (el) el.remove();
  S.texts = S.texts.filter(t => t.id !== S.selTxt);
  S.selTxt = null;
  $('txtEditSec').style.display = 'none';
  renderTextList();
  toast('✕ Text removed');
}

function duplicateTxt() {
  if (!S.selTxt) return;
  const obj = S.texts.find(t => t.id === S.selTxt);
  if (!obj) return;
  $('newTxtVal').value = obj.text;
  $('newTxtFont').value = obj.font;
  $('newTxtSize').value = obj.size;
  $('newTxtW').value = obj.weight;
  $('newTxtCol').value = obj.color;
  if ($('newTxtLs')) $('newTxtLs').value = obj.ls !== undefined ? obj.ls : 0;
  if ($('newTxtLh')) $('newTxtLh').value = obj.lh !== undefined ? obj.lh : 1.2;
  if ($('newTxtSh')) $('newTxtSh').value = obj.shadow !== undefined ? obj.shadow : 0;
  addText();
}

function renderTextList() {
  const list = $('txtList');
  if (S.texts.length === 0) {
    list.innerHTML = '<div style="font-size:9px;color:var(--muted);text-align:center;padding:10px">No text added yet</div>';
    return;
  }
  list.innerHTML = '';
  S.texts.forEach(t => {
    const d = document.createElement('div');
    d.className = 'txt-item' + (S.selTxt === t.id ? ' sel' : '');
    d.dataset.id = t.id;
    // XSS-safe: use textContent instead of innerHTML for user text
    const span = document.createElement('span');
    span.className = 'ti-t';
    span.textContent = t.text;
    const del = document.createElement('span');
    del.className = 'ti-del';
    del.textContent = '✕';
    del.onclick = ev => { ev.stopPropagation(); S.selTxt = t.id; deleteTxt() };
    d.appendChild(span);
    d.appendChild(del);
    d.onclick = () => selectText(t.id);
    list.appendChild(d);
  });
}
