/* 
  Mockup Studio Pro - V2.0 Phase 4: Modern Layout Gallery Expansion
  - Bento Grids
  - Triple Stacks
  - Overlap Duo
*/

const v4Layouts = {
  bento: {
    browser: { left: '5%', top: '5%', width: '65%', height: '90%' },
    phone: { right: '5%', top: '5%', width: '140px', height: '280px' },
    tablet: { right: '5%', bottom: '5%', width: '220px', height: '160px' }
  },
  triple: {
    browser: { left: '15%', top: '10%', width: '70%', height: '60%', transform: 'translateZ(0px)' },
    tablet: { left: '10%', top: '30%', width: '60%', height: '50%', transform: 'translateZ(50px)' },
    phone: { left: '5%', top: '50%', width: '130px', height: '260px', transform: 'translateZ(100px)' }
  },
  overlap: {
    browser: { left: '10%', top: '10%', width: '75%', height: '75%', transform: 'rotate(-5deg)' },
    phone: { right: '10%', bottom: '10%', width: '160px', height: '320px', transform: 'rotate(5deg) translateZ(20px)' },
    tablet: null
  }
};

// Extend the global layouts object
Object.assign(layouts, v4Layouts);

const injectV4Styles = () => {
  const style = document.createElement('style');
  style.id = 'v4-layout-styles';
  style.textContent = `
    .layout-grid {
      grid-template-columns: repeat(4, 1fr) !important;
    }
  `;
  document.head.appendChild(style);
};

injectV4Styles();
