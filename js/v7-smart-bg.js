/* 
  Mockup Studio Pro - V2.0 Phase 7: Smart Backgrounds & Color Detection
  - Dominant Color Extraction from Screenshots
  - Dynamic Gradient Suggestion
  - Professional Background Palettes
*/

const injectV7Styles = () => {
  const style = document.createElement('style');
  style.id = 'v7-bg-styles';
  style.textContent = `
    .smart-bg-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .suggested-bg-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .btn-suggest {
      width: 100%;
      padding: 8px;
      background: rgba(201, 149, 107, 0.1);
      color: var(--accent);
      border: 1px dashed var(--accent);
      border-radius: 8px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-suggest:hover {
      background: rgba(201, 149, 107, 0.2);
    }
  `;
  document.head.appendChild(style);
};

// Function to extract dominant color using a hidden canvas
window.extractDominantColor = (imgId) => {
  const img = document.getElementById(imgId);
  if (!img || !img.src || img.classList.contains('hidden') || img.style.display === 'none') {
    showToast('✕ Upload an image first');
    return;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 100;
  canvas.height = 100;

  try {
    ctx.drawImage(img, 0, 0, 100, 100);
    const data = ctx.getImageData(0, 0, 100, 100).data;
    let r = 0, g = 0, b = 0;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i+1];
      b += data[i+2];
    }

    const count = data.length / 4;
    const hex = rgbToHex(Math.round(r/count), Math.round(g/count), Math.round(b/count));
    
    // Apply as background and update custom picker
    setBgCustom(hex);
    document.getElementById('customBgColor').value = hex;
    showToast('✨ Background synced with image');
  } catch (e) {
    showToast('✕ Cross-origin image error');
  }
};

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
  const hex = x.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}).join('');

injectV7Styles();
