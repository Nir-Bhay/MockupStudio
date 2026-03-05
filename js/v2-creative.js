/* 
  Mockup Studio Pro - V2.0 Phase 2: Creative Extensions
  - Glassmorphism effects
  - Dynamic Lighting (Glow)
  - Advanced Shadows
  - Session Persistence (localStorage)
*/

// Add specific styles for Glassmorphism & Lighting
const injectV2Styles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .glass-effect {
      background: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
    .mockup-stage.lighting::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
      mix-blend-mode: overlay;
      transition: opacity 0.5s ease;
    }
    .device-glow {
      filter: drop-shadow(0 0 20px var(--accent-light));
    }
  `;
  document.head.appendChild(style);
};

// Advanced Shadow Logic
const updateShadows = (intensity) => {
  const i = intensity / 100;
  const blur = 40 * i;
  const spread = 20 * i;
  const opacity = 0.3 * i;
  
  const shadow = `0 ${blur}px ${spread}px rgba(0,0,0,${opacity})`;
  document.querySelectorAll('.browser-frame, .phone-frame, .tablet-frame').forEach(el => {
    el.style.boxShadow = shadow;
  });
};

// Exported Globals for HTML
window.toggleGlass = (on) => {
  document.querySelectorAll('.browser-frame, .phone-frame, .tablet-frame').forEach(el => {
    el.classList.toggle('glass-effect', on);
  });
};

window.toggleLighting = (on) => {
  document.getElementById('mockupStage').classList.toggle('lighting', on);
};

injectV2Styles();
