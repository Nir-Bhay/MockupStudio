//  Shahar Dil Se Surendra bhai mafi mangta hun
// ==================== LAYER PANEL ====================
// Z-order management, lock/hide frames, layer reordering

const _layers = {
  bf: { z: 10, locked: false, visible: true, name: 'Desktop' },
  pf: { z: 20, locked: false, visible: true, name: 'Phone' },
  tf: { z: 15, locked: false, visible: true, name: 'Tablet' }
};

let _draggedLayerId = null;

function renderLayerPanel() {
  const list = $('layerList');
  if (!list) return;
  list.innerHTML = '';

  // Sort by z-index descending (top layer first)
  const sorted = Object.keys(_layers).sort((a, b) => _layers[b].z - _layers[a].z);

  sorted.forEach(id => {
    const ly = _layers[id];
    const fr = $(id);
    const isHidden = fr && fr.classList.contains('hidden');

    const d = document.createElement('div');
    d.className = 'layer-item' + (ly.locked ? ' locked' : '');
    d.dataset.layer = id;
    d.draggable = true;

    d.addEventListener('dragstart', (e) => {
      _draggedLayerId = id;
      e.dataTransfer.effectAllowed = 'move';
      d.style.opacity = '0.5';
    });
    d.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      d.style.borderTop = _layers[id].z > _layers[_draggedLayerId].z ? '2px solid var(--accent)' : '';
      d.style.borderBottom = _layers[id].z < _layers[_draggedLayerId].z ? '2px solid var(--accent)' : '';
    });
    d.addEventListener('dragleave', () => { d.style.borderTop = ''; d.style.borderBottom = ''; });
    d.addEventListener('drop', (e) => {
      e.preventDefault();
      d.style.borderTop = ''; d.style.borderBottom = '';
      if (_draggedLayerId && _draggedLayerId !== id) {
        reorderLayers(_draggedLayerId, id);
      }
    });
    d.addEventListener('dragend', () => {
      d.style.opacity = '1';
      _draggedLayerId = null;
    });

    d.innerHTML = `
      <span class="ly-grip" title="Drag to reorder">⠿</span>
      <span class="ly-name">${ly.name}</span>
      <button class="ly-btn${ly.visible && !isHidden ? ' act' : ''}" onclick="toggleLayerVis('${id}')" title="${ly.visible ? 'Hide' : 'Show'}">
        <svg class="icon" viewBox="0 0 24 24">${ly.visible && !isHidden ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'}</svg>
      </button>
      <button class="ly-btn${ly.locked ? ' act' : ''}" onclick="toggleLayerLock('${id}')" title="${ly.locked ? 'Unlock' : 'Lock'}">
        <svg class="icon" viewBox="0 0 24 24">${ly.locked ? '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' : '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'}</svg>
      </button>
    `;
    list.appendChild(d);
  });
}

function toggleLayerVis(id) {
  const ly = _layers[id];
  const fr = $(id);
  if (!fr) return;
  ly.visible = !ly.visible;
  if (!ly.visible) {
    fr.style.opacity = '0';
    fr.style.pointerEvents = 'none';
  } else {
    fr.style.opacity = '';
    fr.style.pointerEvents = '';
  }
  renderLayerPanel();
}

function toggleLayerLock(id) {
  const ly = _layers[id];
  ly.locked = !ly.locked;
  const fr = $(id);
  if (fr) {
    fr.style.pointerEvents = ly.locked ? 'none' : '';
    fr.classList.toggle('frame-locked', ly.locked);
  }
  renderLayerPanel();
  toast(ly.locked ? 'Layer ' + ly.name + ' locked' : 'Layer ' + ly.name + ' unlocked');
}

function bringToFront(id) {
  const maxZ = Math.max(...Object.values(_layers).map(l => l.z));
  _layers[id].z = maxZ + 1;
  $(id).style.zIndex = _layers[id].z;
  renderLayerPanel();
}

function sendToBack(id) {
  const minZ = Math.min(...Object.values(_layers).map(l => l.z));
  _layers[id].z = Math.max(1, minZ - 1);
  $(id).style.zIndex = _layers[id].z;
  renderLayerPanel();
}

function reorderLayers(fromId, toId) {
  const sorted = Object.keys(_layers).sort((a, b) => _layers[a].z - _layers[b].z);
  const fromIdx = sorted.indexOf(fromId);
  const toIdx = sorted.indexOf(toId);
  if (fromIdx < 0 || toIdx < 0) return;

  sorted.splice(fromIdx, 1);
  sorted.splice(toIdx, 0, fromId);

  sorted.forEach((id, i) => {
    _layers[id].z = (i + 1) * 10;
    const fr = $(id);
    if (fr) fr.style.zIndex = _layers[id].z;
  });
  renderLayerPanel();
  toast('⇕ Layers reordered');
}

function isFrameLocked(frameId) {
  return _layers[frameId] && _layers[frameId].locked;
}
