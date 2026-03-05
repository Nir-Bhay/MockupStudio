/* 
  Mockup Studio Pro - V2.0 Phase 6: Device-Level Zoom & Professional Polish
  - Individual Zoom Sliders per Slot
  - Corner Roundness Sync
*/

const injectV6Styles = () => {
  const style = document.createElement('style');
  style.id = 'v6-zoom-styles';
  style.textContent = `
    .zoom-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 10px 0;
    }
    .zoom-slider-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .zoom-slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .zoom-slider-header span {
      font-size: 10px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .zoom-value {
      color: var(--accent) !important;
      font-weight: 700;
    }
  `;
  document.head.appendChild(style);
};

window.updateDeviceZoom = (slot, value) => {
  if (!slots[slot]) return;
  slots[slot].zoom = parseInt(value);
  document.getElementById(`${slot}ZoomVal`).textContent = value + '%';
  
  const img = document.getElementById(`${slot}Img`);
  if (img) {
    img.style.transform = \`scale(\${value / 100})\`;
  }
};

window.syncCornerRoundness = (value) => {
  const r = parseInt(value);
  document.querySelectorAll('.browser-body img, .phone-screen img, .tablet-screen img').forEach(img => {
    img.style.borderRadius = \`\${r * 0.8}px\`;
  });
};

injectV6Styles();
