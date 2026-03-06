// ==================== DYNAMIC MULTI-SCREENS ====================
let _dynamicFrameCounter = 0;

function addDynamicScreen(type) {
    if (typeof pushHistory === 'function') pushHistory();
    // 'desktop' -> 'bf', 'mobile' -> 'pf', 'tablet' -> 'tf'
    const baseIdMap = { desktop: 'bf', mobile: 'pf', tablet: 'tf' };
    const baseId = baseIdMap[type];
    const template = $(baseId);
    if (!template) return;

    _dynamicFrameCounter++;
    const newId = 'df_' + type + '_' + _dynamicFrameCounter;

    // Clone element
    const clone = template.cloneNode(true);
    clone.id = newId;
    clone.classList.remove('hidden');
    clone.classList.add('dynamic-frame');

    // Stagger position
    const ox = Math.floor(Math.random() * 40 - 20) + 10;
    const oy = Math.floor(Math.random() * 40 - 20) + 10;
    clone.style.left = `calc(50% + ${ox}px)`;
    clone.style.top = `calc(50% + ${oy}px)`;

    if (type === 'desktop' || type === 'tablet') {
        clone.style.transform = 'translate(-50%, -50%)';
    } else {
        const sc = S.phoneScale ? S.phoneScale / 100 : 1;
        clone.style.transform = 'translate(-50%, -50%) scale(' + sc + ')';
        clone.style.transformOrigin = 'center center';
    }

    // Ensure z-index is higher
    clone.style.zIndex = typeof _activeZIndex !== 'undefined' ? ++_activeZIndex : 100;

    // Remap inner IDs to prevent collisions
    _remapDynamicIds(clone, baseId, newId, type);

    // Mount
    const msNode = $('ms');
    if (msNode) msNode.appendChild(clone);

    // Make Draggable & Resizable
    _initDynamicDrag(newId);

    // Add Upload Zone dynamically
    _injectDynamicUploadZone(newId, type);

    // Register state
    S.dynamicFrames = S.dynamicFrames || [];
    S.dynamicFrames.push({ id: newId, type: type });

    // Dynamically add to Layers system
    if (typeof _layers !== 'undefined') {
        _layers[newId] = { z: typeof _activeZIndex !== 'undefined' ? _activeZIndex : 100, locked: false, visible: true, name: 'Custom ' + cap(type) };
    }

    // Add to Layer Panel
    if (typeof renderLayerPanel === 'function') setTimeout(renderLayerPanel, 50);

    // Force Free Mode on because predefined layouts shouldn't squash dynamic frames
    if (!S.freeMode) {
        if (typeof togFree === 'function') togFree();
    } else {
        // Create Snap Guides for the new frame
        if (typeof _initFrameSnapGuides === 'function') _initFrameSnapGuides();
    }

    if (typeof toast === 'function') toast('✅ Custom ' + cap(type) + ' added');

    // Update the dynamic screens list in the panel
    if (typeof _updateDynList === 'function') _updateDynList();
}

function _remapDynamicIds(el, oldBase, newId, type) {
    // 1. Drag handle
    const dragH = el.querySelector('#' + oldBase + 'Drag');
    if (dragH) dragH.id = newId + 'Drag';

    // 2. Resize handles
    el.querySelectorAll('.resize-h').forEach(rh => {
        rh.dataset.frame = newId;
    });

    // 3. Image tag
    const oldImgId = { desktop: 'imgD', mobile: 'imgM', tablet: 'imgTb' }[type];
    const oldPhId = { desktop: 'phD', mobile: 'phM', tablet: 'phTb' }[type];

    const imgEL = el.querySelector('#' + oldImgId);
    if (imgEL) imgEL.id = 'img_' + newId;

    const phEL = el.querySelector('#' + oldPhId);
    if (phEL) phEL.id = 'ph_' + newId;

    // Clear or rename other hardcoded ids to avoid conflicts
    el.querySelectorAll('[id]').forEach(child => {
        if (child.id === newId + 'Drag' || child.id === 'img_' + newId || child.id === 'ph_' + newId) return;
        child.id = child.id + '_' + newId;
    });
}

function _initDynamicDrag(frameId) {
    const fr = $(frameId);
    const hId = frameId + 'Drag';
    const h = $(hId);
    if (!fr || !h) return;

    h.addEventListener('mousedown', startDrag);
    h.addEventListener('touchstart', startDrag, { passive: false });
    function startDrag(e) {
        if (!S.freeMode) {
            if (typeof togFree === 'function') togFree();
        }
        e.preventDefault();
        if (typeof dragTarget !== 'undefined') dragTarget = fr;
        fr.style.zIndex = typeof _activeZIndex !== 'undefined' ? ++_activeZIndex : 100;
        const pos = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
        const rect = fr.getBoundingClientRect();
        if (typeof dragOff !== 'undefined') {
            dragOff.x = pos.x - rect.left;
            dragOff.y = pos.y - rect.top;
        }
        fr.classList.add('dragging');
        if (typeof _initFrameSnapGuides === 'function') _initFrameSnapGuides();
        if (typeof onDrag === 'function') {
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('touchmove', onDrag, { passive: false });
        }
        if (typeof offDrag === 'function') {
            document.addEventListener('mouseup', offDrag);
            document.addEventListener('touchend', offDrag);
        }
    }

    // 8-point resize handles mapping
    fr.querySelectorAll('.resize-h').forEach(rh => {
        rh.addEventListener('mousedown', e => {
            if (!S.freeMode) return;
            e.preventDefault(); e.stopPropagation();
            const dir = rh.dataset.dir;
            fr.style.zIndex = typeof _activeZIndex !== 'undefined' ? ++_activeZIndex : 100;
            const startW = fr.offsetWidth;
            const startH = fr.offsetHeight;
            const startL = fr.offsetLeft;
            const startT = fr.offsetTop;
            const startX = e.clientX;
            const startY = e.clientY;
            const ar = startW / startH;

            const MIN_W = typeof MIN_FRAME_W !== 'undefined' ? MIN_FRAME_W : 80;
            const MIN_H = typeof MIN_FRAME_H !== 'undefined' ? MIN_FRAME_H : 60;

            // Store initial sizes for pattern resize
            if (S.patternResize) {
                fr.dataset.startW = startW;
                fr.dataset.startH = startH;
                // Store initial sizes for all frames
                _getAllResizeableFramesDyn().forEach(fId => {
                    const f = $(fId);
                    if (f && f !== fr) {
                        f.dataset.startW = f.offsetWidth;
                        f.dataset.startH = f.offsetHeight;
                    }
                });
            }

            function onResize(ev) {
                const zoom = S.zoom || 1;
                const dx = (ev.clientX - startX) / zoom;
                const dy = (ev.clientY - startY) / zoom;
                let nw = startW, nh = startH, nl = startL, nt = startT;
                const keepAR = !ev.shiftKey;

                if (dir === 'br') { nw = Math.max(MIN_W, startW + dx); nh = keepAR ? nw / ar : Math.max(MIN_H, startH + dy) }
                else if (dir === 'bl') { nw = Math.max(MIN_W, startW - dx); nl = startL + (startW - nw); nh = keepAR ? nw / ar : Math.max(MIN_H, startH + dy) }
                else if (dir === 'tr') { nw = Math.max(MIN_W, startW + dx); nh = keepAR ? nw / ar : Math.max(MIN_H, startH - dy); if (!keepAR) nt = startT + (startH - nh) }
                else if (dir === 'tl') { nw = Math.max(MIN_W, startW - dx); nl = startL + (startW - nw); nh = keepAR ? nw / ar : Math.max(MIN_H, startH - dy); if (!keepAR) nt = startT + (startH - nh); else nt = startT - (nh - startH) }
                else if (dir === 'tm') { nh = Math.max(MIN_H, startH - dy); nt = startT + (startH - nh); if (keepAR) nw = nh * ar }
                else if (dir === 'bm') { nh = Math.max(MIN_H, startH + dy); if (keepAR) nw = nh * ar }
                else if (dir === 'ml') { nw = Math.max(MIN_W, startW - dx); nl = startL + (startW - nw); if (keepAR) nh = nw / ar }
                else if (dir === 'mr') { nw = Math.max(MIN_W, startW + dx); if (keepAR) nh = nw / ar }

                fr.style.width = nw + 'px';
                fr.style.height = nh + 'px';
                fr.style.left = nl + 'px';
                fr.style.top = nt + 'px';

                // Apply proportional resize to all other frames if pattern mode is enabled
                if (S.patternResize && typeof _applyProportionalResizeDyn === 'function') {
                    _applyProportionalResizeDyn(frameId, nw, nh);
                }
            }
            function offResize() {
                document.removeEventListener('mousemove', onResize);
                document.removeEventListener('mouseup', offResize);
                if (typeof pushHistory === 'function') pushHistory();
            }
            document.addEventListener('mousemove', onResize);
            document.addEventListener('mouseup', offResize);
        });
    });
}

function _injectDynamicUploadZone(id, type) {
    // Find the UPLOADS panel to add the upload zone
    const container = $('panelUploads');
    if (!container) return;

    // Check if upload zone already exists
    if ($('up_' + id)) return;

    const div = document.createElement('div');
    div.className = 'up-zone';
    div.id = 'up_' + id;
    div.onclick = function () { $('#f_' + id).click(); };

    const icon = type === 'desktop' ? '🖥' : (type === 'tablet' ? '📋' : '📱');
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);

    div.innerHTML = `
        <input type="file" id="f_${id}" accept="image/*"><button class="rm-btn"
        onclick="event.stopPropagation();rmDynamicImg('${id}')">✕</button>
        <img class="up-prev" id="pv_${id}">
        <div class="up-info">
            <div class="up-icon">${icon}</div>
            <div class="up-txt">
                <div class="l1">Custom ${typeName}</div>
                <div class="l2">Custom frame</div>
            </div>
        </div>
    `;

    container.appendChild(div);

    const fileInput = div.querySelector('#f_' + id);
    fileInput.addEventListener('change', e => {
        const f = e.target.files[0]; if (!f) return;
        if (typeof checkFileSize === 'function' && !checkFileSize(f)) return;
        div.classList.add('uploading');
        const r = new FileReader();
        r.onload = ev => {
            const url = ev.target.result;
            div.querySelector('#pv_' + id).src = url;
            div.classList.remove('uploading');
            div.classList.add('has', 'just-uploaded');
            setTimeout(() => div.classList.remove('just-uploaded'), 400);

            const imgEl = $('img_' + id);
            const phEl = $('ph_' + id);
            if (imgEl) { imgEl.src = url; imgEl.style.display = 'block'; }
            if (phEl) phEl.style.display = 'none';

            // Register in state to remember image url for snapshots
            const dt = S.dynamicFrames.find(d => d.id === id);
            if (dt) dt.imgUrl = url;

            if (typeof toast === 'function') toast('✓ Image uploaded to custom frame');
        };
        r.readAsDataURL(f);
    });
}

function rmDynamicImg(id) {
    const div = $('up_' + id);
    if (div) {
        div.classList.remove('has');
        const pv = div.querySelector('#pv_' + id); if (pv) pv.src = '';
        const file = div.querySelector('#f_' + id); if (file) file.value = '';
    }
    const imgEL = $('img_' + id);
    const phEL = $('ph_' + id);
    if (imgEL) { imgEL.style.display = 'none'; imgEL.src = ''; }
    if (phEL) phEL.style.display = 'flex';

    const dt = (S.dynamicFrames || []).find(d => d.id === id);
    if (dt) dt.imgUrl = null;
    if (typeof toast === 'function') toast('✕ Image removed');
}

function deleteDynamicFrame(id) {
    if (typeof pushHistory === 'function') pushHistory();
    const fr = $(id); if (fr) fr.remove();
    const up = $('up_' + id); if (up) up.remove();
    S.dynamicFrames = (S.dynamicFrames || []).filter(f => f.id !== id);
    if (typeof _layers !== 'undefined' && _layers[id]) delete _layers[id];
    if (typeof renderLayerPanel === 'function') renderLayerPanel();
    if (typeof toast === 'function') toast('Frame deleted');
}

function _removeAllDynamic() {
    (S.dynamicFrames || []).forEach(f => {
        let node = $(f.id);
        if (node) node.remove();
        let up = $('up_' + f.id);
        if (up) up.remove();
        if (typeof _layers !== 'undefined' && _layers[f.id]) delete _layers[f.id];
    });
    S.dynamicFrames = [];
    _updateDynList();
}

// Update the dynamic screens list in the panel
function _updateDynList() {
    const listEl = $('dynList');
    if (!listEl) return;

    const emptyEl = $('dynEmpty');
    const frames = S.dynamicFrames || [];

    if (frames.length === 0) {
        if (emptyEl) emptyEl.style.display = 'block';
        // Remove all dyn-items
        listEl.querySelectorAll('.dyn-item').forEach(el => el.remove());
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    // Clear existing items
    listEl.querySelectorAll('.dyn-item').forEach(el => el.remove());

    // Add each frame
    frames.forEach(f => {
        const item = document.createElement('div');
        item.className = 'dyn-item';
        item.id = 'dynItem_' + f.id;
        const icon = f.type === 'desktop' ? '💻' : (f.type === 'tablet' ? '📱' : '📱');
        item.innerHTML = `
            <div class="dyn-item-info">
                <span>${icon}</span>
                <span>${f.type} #${f.id.split('_').pop()}</span>
            </div>
            <button class="dyn-item-remove" onclick="removeDynamicFrame('${f.id}')" title="Remove">✕</button>
        `;
        listEl.appendChild(item);
    });
}

// Wrapper for removing individual dynamic frame
function removeDynamicFrame(id) {
    rmDynamicFrame(id);
    _updateDynList();
}

// Get all resizeable frames for dynamic screens
function _getAllResizeableFramesDyn() {
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

// Apply proportional resize to all frames for dynamic screens
function _applyProportionalResizeDyn(mainFrameId, newWidth, newHeight) {
    const mainFrame = $(mainFrameId);
    if (!mainFrame) return;

    const startW = parseFloat(mainFrame.dataset.startW) || mainFrame.offsetWidth;
    const startH = parseFloat(mainFrame.dataset.startH) || mainFrame.offsetHeight;

    if (startW === 0 || startH === 0) return;

    const widthRatio = newWidth / startW;
    const heightRatio = newHeight / startH;

    const allFrames = _getAllResizeableFramesDyn();

    allFrames.forEach(frameId => {
        if (frameId === mainFrameId) return;
        const frame = $(frameId);
        if (!frame) return;

        const fw = frame.offsetWidth;
        const fh = frame.offsetHeight;

        // Store initial size if not stored
        if (!frame.dataset.startW) {
            frame.dataset.startW = fw;
            frame.dataset.startH = fh;
        }

        const initialW = parseFloat(frame.dataset.startW);
        const initialH = parseFloat(frame.dataset.startH);

        // Apply proportional resize based on the main frame's ratio
        frame.style.width = (initialW * widthRatio) + 'px';
        frame.style.height = (initialH * heightRatio) + 'px';
    });
}
