/* 
  Mockup Studio Pro - V3.0 Phase 3: Innovation (2.5D Perspective)
  - 3D Rotation / Perspective Warping
  - Stage Panning/Movement
  - Batch Processing Readiness
*/

const injectV3Styles = () => {
  const style = document.createElement('style');
  style.id = 'v3-innovation-styles';
  style.textContent = `
    .perspective-mode .mockup-stage {
      perspective: 1000px;
    }
    .perspective-mode .browser-frame, 
    .perspective-mode .phone-frame, 
    .perspective-mode .tablet-frame {
      transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .isometric-view .browser-frame {
      transform: rotateX(20deg) rotateY(-20deg) rotateZ(5deg) !important;
    }
    .isometric-view .phone-frame {
      transform: translateZ(50px) rotateX(20deg) rotateY(-20deg) rotateZ(5deg) scale(var(--phone-scale, 1)) !important;
    }
    .perspective-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(style);
};

window.togglePerspective = (on) => {
  document.body.classList.toggle('perspective-mode', on);
  document.getElementById('mockupStage').classList.toggle('isometric-view', on);
};

// Initialize V3 features
injectV3Styles();
