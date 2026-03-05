/* 
  Mockup Studio Pro - V2.0 Phase 5: Interactive Image Precision
  - Drag-to-pan
  - Zoom per device
*/

let isDragging = false;
let startX, startY;
let activeSlot = null;

const slots = {
  desktop: { x: 50, y: 50, zoom: 100 },
  mobile: { x: 50, y: 50, zoom: 100 },
  tablet: { x: 50, y: 50, zoom: 100 }
};

function initImageControl() {
  ['desktop', 'mobile', 'tablet'].forEach(type => {
    const img = document.getElementById(type + 'Img');
    const frame = document.getElementById(type + 'Frame');
    
    frame.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      activeSlot = type;
      startX = e.clientX;
      startY = e.clientY;
      frame.style.cursor = 'grabbing';
    });
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeSlot) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // Update position (rough sensitivity)
    slots[activeSlot].x = Math.max(0, Math.min(100, slots[activeSlot].x + (dx / 5)));
    slots[activeSlot].y = Math.max(0, Math.min(100, slots[activeSlot].y + (dy / 5)));
    
    startX = e.clientX;
    startY = e.clientY;
    
    applyImageTransform(activeSlot);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    if (activeSlot) {
      document.getElementById(activeSlot + 'Frame').style.cursor = 'grab';
    }
    activeSlot = null;
  });
}

function applyImageTransform(slot) {
  const img = document.getElementById(slot + 'Img');
  const s = slots[slot];
  img.style.objectPosition = `${s.x}% ${s.y}%`;
  img.style.transform = `scale(${s.zoom / 100})`;
}

// Add CSS for grab cursor
const style = document.createElement('style');
style.textContent = '.browser-frame, .phone-frame, .tablet-frame { cursor: grab; }';
document.head.appendChild(style);

initImageControl();
