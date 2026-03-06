// ==================== RESET ====================
function doReset(){
  rmImg('desktop');rmImg('mobile');rmImg('tablet');rmBgImg();
  setLayout('hero');setBg('sahara');setTheme('default');
  $('frmCol').value='#ffffff';setFrmCol('#ffffff');
  $('rngR').value=10;setRnd(10);$('rngS').value=50;setShd(50);
  $('rngP').value=100;setPSc(100);$('rngPd').value=5;setPad(5);
  $('rngBl').value=0;setBgBlur(0);
  if(!S.showNav)togNav();if(!S.showIsland)togIsland();
  if(S.showRefl)togRefl();if(!S.showWm)togWm();if(S.showBgOv)togBgOv();

  // Remove all texts
  S.texts.forEach(t=>{const e=$(t.id);if(e)e.remove()});
  S.texts=[];S.selTxt=null;
  $('txtEditSec').style.display='none';
  renderTextList();

  $('lblN').value='01';$('lblD').value='Website';$('lblM').value='Phone';$('lblT').value='Tablet';$('urlTxt').value='www.yourproject.com';
  updateLabels();

  if(S.freeMode)togFree();
  toast('↺ Reset complete');
}

// ==================== DRAG & DROP ON STAGE ====================
$('stageArea').addEventListener('dragover',e=>{
  e.preventDefault();
  const sa=$('stageArea');
  sa.style.outline='2px dashed var(--accent)';
  sa.style.outlineOffset='-3px';
  sa.style.background='rgba(201,149,107,.03)';
});
$('stageArea').addEventListener('dragleave',()=>{
  const sa=$('stageArea');
  sa.style.outline='none';
  sa.style.background='';
});
$('stageArea').addEventListener('drop',e=>{
  e.preventDefault();
  const sa=$('stageArea');
  sa.style.outline='none';
  sa.style.background='';
  const f=e.dataTransfer.files[0];
  if(!f||!f.type.startsWith('image/'))return;
  if(!S.desktopImg){const dt=new DataTransfer();dt.items.add(f);$('fD').files=dt.files;handleUpload({target:{files:[f]}},'desktop')}
  else if(!S.mobileImg){handleUpload({target:{files:[f]}},'mobile')}
  else if(!S.tabletImg){handleUpload({target:{files:[f]}},'tablet')}
  else toast('All slots full');
});

// ==================== WINDOW RESIZE ====================
const _debouncedZFit=debounce(zFit,200);
window.addEventListener('resize',_debouncedZFit);

// ==================== CLICK STAGE TO DESELECT TEXT ====================
$('ms').addEventListener('click',e=>{
  if(e.target===$('ms')||e.target.classList.contains('ms-bg-overlay')){
    S.selTxt=null;
    document.querySelectorAll('.txt-el').forEach(el=>el.classList.remove('sel'));
    $('txtEditSec').style.display='none';
    document.querySelectorAll('.txt-item').forEach(el=>el.classList.remove('sel'));
  }
});

// ==================== RESPONSIVE SIDEBAR TOGGLE ====================
function toggleLeftSidebar(){
  const sb=$('leftSb');
  const ov=$('sbOverlay');
  sb.classList.toggle('open');
  if(ov)ov.classList.toggle('show',sb.classList.contains('open'));
}

function toggleRightSidebar(){
  const sb=$('rightSb');
  const ov=$('sbOverlay');
  sb.classList.toggle('open');
  if(ov)ov.classList.toggle('show',sb.classList.contains('open'));
}

function closeSidebars(){
  $('leftSb').classList.remove('open');
  $('rightSb').classList.remove('open');
  const ov=$('sbOverlay');
  if(ov)ov.classList.remove('show');
}

// ==================== INIT ====================
function init(){
  buildUI();
  setBg('sahara');
  applyLayout();
  initDrag();
  initCanvasToolbar();
  setTimeout(zFit,150);
  pushHistory();
}
init();
