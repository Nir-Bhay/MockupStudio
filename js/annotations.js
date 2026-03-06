// ==================== ANNOTATIONS / CALLOUT MARKERS ====================
let _annoIdCounter = 0;
S.annotations = S.annotations || []; S.selAnno = null;

function addAnnotation() {
  pushHistory();
  const id = 'ann_' + (++_annoIdCounter);
  const num = S.annotations.length + 1;
  const obj = { id, num, x: 80 + (S.annotations.length * 35), y: 60, color: '#c9956b', text: '' };
  S.annotations.push(obj);
  _renderAnnoEl(obj);
  selectAnno(id);
  toast('✓ Marker ' + num + ' added');
}

function _renderAnnoEl(obj) {
  const el = document.createElement('div');
  el.className = 'anno-marker';
  el.id = obj.id;
  el.textContent = obj.num;
  el.style.left = obj.x + 'px';
  el.style.top = obj.y + 'px';
  el.style.borderColor = obj.color;
  el.style.color = obj.color;
  el.title = obj.text || ('Marker ' + obj.num);
  _makeAnnoDrag(el, obj.id);
  el.addEventListener('click', e => { e.stopPropagation(); selectAnno(obj.id) });
  $('ms').appendChild(el);
}

function _makeAnnoDrag(el, id) {
  makeDraggable(el, {
    zoom: () => S.zoom,
    clamp: true,
    guard: () => true,
    onStart: () => selectAnno(id),
    onMove: (el, x, y) => { const obj = S.annotations.find(a => a.id === id); if (obj) { obj.x = x; obj.y = y } },
    onEnd: () => pushHistory(),
    clearTransform: true
  });
}


function selectAnno(id) {
  S.selAnno = id;
  document.querySelectorAll('.anno-marker').forEach(e => e.classList.toggle('sel', e.id === id));
  const sec = $('annoEditSec'); if (sec) sec.style.display = id ? 'flex' : 'none';
  const obj = S.annotations.find(a => a.id === id);
  if (obj) {
    if ($('annoNum')) $('annoNum').value = obj.num;
    if ($('annoColor')) $('annoColor').value = obj.color;
    if ($('annoText')) $('annoText').value = obj.text || '';
  }
}

function editAnnoProp(prop) {
  if (!S.selAnno) return;
  const obj = S.annotations.find(a => a.id === S.selAnno);
  const el = $(S.selAnno);
  if (!obj || !el) return;
  if (prop === 'num') { obj.num = parseInt($('annoNum').value) || obj.num; el.textContent = obj.num }
  if (prop === 'color') { obj.color = $('annoColor').value; el.style.borderColor = obj.color; el.style.color = obj.color }
  if (prop === 'text') { obj.text = $('annoText').value; el.title = obj.text || ('Marker ' + obj.num) }
}

function deleteAnno() {
  if (!S.selAnno) return;
  const el = $(S.selAnno); if (el) el.remove();
  S.annotations = S.annotations.filter(a => a.id !== S.selAnno);
  S.selAnno = null;
  const sec = $('annoEditSec'); if (sec) sec.style.display = 'none';
  toast('✕ Marker removed');
}

function clearAnnotations() {
  S.annotations.forEach(a => { const el = $(a.id); if (el) el.remove() });
  S.annotations = []; S.selAnno = null; _annoIdCounter = 0;
  const sec = $('annoEditSec'); if (sec) sec.style.display = 'none';
  toast('✕ All markers cleared');
}
