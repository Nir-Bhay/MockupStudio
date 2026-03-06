// ==================== GRID & RULER SYSTEM ====================
let _gridVisible=false;
let _rulerVisible=false;

function toggleGrid(){
  _gridVisible=!_gridVisible;
  const ms=$('ms');
  if(_gridVisible){
    ms.classList.add('show-grid');
    $('gridBtn').classList.add('act');
  }else{
    ms.classList.remove('show-grid');
    $('gridBtn').classList.remove('act');
  }
}

function toggleRulers(){
  _rulerVisible=!_rulerVisible;
  const rulerH=$('rulerH');
  const rulerV=$('rulerV');
  if(rulerH)rulerH.style.display=_rulerVisible?'block':'none';
  if(rulerV)rulerV.style.display=_rulerVisible?'block':'none';
  $('rulerBtn').classList.toggle('act',_rulerVisible);
}

function buildRulers(){
  const cv=$('stageCv');
  if(!cv)return;
  
  // Horizontal ruler
  let rh=document.createElement('div');
  rh.id='rulerH';rh.className='ruler ruler-h';rh.style.display='none';
  let marks='';
  for(let i=0;i<=960;i+=50){
    marks+=`<span class="ruler-mark" style="left:${(i/960)*100}%">${i}</span>`;
  }
  rh.innerHTML=marks;
  cv.appendChild(rh);
  
  // Vertical ruler
  let rv=document.createElement('div');
  rv.id='rulerV';rv.className='ruler ruler-v';rv.style.display='none';
  marks='';
  for(let i=0;i<=600;i+=50){
    marks+=`<span class="ruler-mark" style="top:${(i/600)*100}%">${i}</span>`;
  }
  rv.innerHTML=marks;
  cv.appendChild(rv);
}

// ==================== PERSPECTIVE / 3D TILT ====================
let _perspective={enabled:false,rotateX:0,rotateY:0,rotateZ:0,perspective:1000};

function togPerspective(){
  _perspective.enabled=!_perspective.enabled;
  $('perspBtn').classList.toggle('act',_perspective.enabled);
  if(!_perspective.enabled){
    _perspective.rotateX=0;_perspective.rotateY=0;_perspective.rotateZ=0;
    $('ms').style.transform='';
    $('ms').style.perspective='';
    if($('perspX'))$('perspX').value=0;
    if($('perspY'))$('perspY').value=0;
    if($('perspZ'))$('perspZ').value=0;
  }else{
    applyPerspective();
  }
  toast(_perspective.enabled?'📐 3D mode ON':'📐 3D mode OFF');
}

function setPerspective(axis,v){
  if(!_perspective.enabled)return;
  _perspective['rotate'+axis.toUpperCase()]=parseInt(v);
  applyPerspective();
}

function applyPerspective(){
  const ms=$('ms');
  ms.style.perspective=_perspective.perspective+'px';
  ms.style.transform=`rotateX(${_perspective.rotateX}deg) rotateY(${_perspective.rotateY}deg) rotateZ(${_perspective.rotateZ}deg)`;
  ms.style.transformStyle='preserve-3d';
  ms.style.transition='transform .4s var(--ease-out)';
}

// ==================== PROJECT SAVE/LOAD ====================
function saveProject(){
  _saveCurrentArtboard();
  const project={
    version:2,
    name:'MockupStudio Project',
    created:new Date().toISOString(),
    state:{
      artboards:S.artboards,
      activeArtboard:S.activeArtboard,
      _abCounter:S._abCounter
    }
  };
  const data=JSON.stringify(project);
  const blob=new Blob([data],{type:'application/json'});
  const link=document.createElement('a');
  link.download='mockup-project-'+Date.now()+'.mockup';
  link.href=URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  toast('💾 Project saved');
}

function loadProject(){
  const input=document.createElement('input');
  input.type='file';input.accept='.mockup,.json';
  input.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const proj=JSON.parse(ev.target.result);
        if(!proj.state||!Array.isArray(proj.state.artboards))throw new Error('Invalid project');
        S.artboards=proj.state.artboards;
        S.activeArtboard=proj.state.activeArtboard||0;
        S._abCounter=proj.state._abCounter||S.artboards.length;
        _loadArtboard(S.artboards[S.activeArtboard]);
        renderArtboardNav();
        toast('✓ Project loaded');
      }catch(err){toast('✕ Invalid project file')}
    };r.readAsText(f);
  };
  input.click();
}

// ==================== AUTO-LAYOUT / DISTRIBUTE ====================
function distributeFrames(axis){
  if(!S.freeMode){toast('Enable free mode first');return}
  const frames=['bf','pf','tf'].filter(id=>!$(id).classList.contains('hidden'));
  if(frames.length<2)return;
  
  const msW=960,msH=600;
  
  if(axis==='h'){
    // Distribute horizontally with equal spacing
    const totalW=frames.reduce((sum,id)=>sum+$(id).offsetWidth,0);
    const gap=(msW-totalW)/(frames.length+1);
    let x=gap;
    frames.forEach(id=>{
      const fr=$(id);
      fr.style.left=x+'px';
      fr.style.right='auto';
      fr.style.transform='none';
      x+=fr.offsetWidth+gap;
    });
  }else{
    const totalH=frames.reduce((sum,id)=>sum+$(id).offsetHeight,0);
    const gap=(msH-totalH)/(frames.length+1);
    let y=gap;
    frames.forEach(id=>{
      const fr=$(id);
      fr.style.top=y+'px';
      fr.style.bottom='auto';
      fr.style.transform='none';
      y+=fr.offsetHeight+gap;
    });
  }
  pushHistory();
  toast('✓ Frames distributed');
}

function alignFrames(alignment){
  if(!S.freeMode){toast('Enable free mode first');return}
  const frames=['bf','pf','tf'].filter(id=>!$(id).classList.contains('hidden'));
  if(frames.length<1)return;
  
  const msW=960,msH=600;
  
  frames.forEach(id=>{
    const fr=$(id);
    const w=fr.offsetWidth,h=fr.offsetHeight;
    if(alignment==='centerH')fr.style.left=(msW/2-w/2)+'px';
    if(alignment==='centerV')fr.style.top=(msH/2-h/2)+'px';
    if(alignment==='left'){fr.style.left='20px';fr.style.right='auto'}
    if(alignment==='right'){fr.style.left=(msW-w-20)+'px';fr.style.right='auto'}
    if(alignment==='top'){fr.style.top='20px';fr.style.bottom='auto'}
    if(alignment==='bottom'){fr.style.top=(msH-h-20)+'px';fr.style.bottom='auto'}
    fr.style.transform='none';
  });
  pushHistory();
  toast('✓ Frames aligned');
}

// ==================== SVG PATTERN BACKGROUNDS ====================
const BG_PATTERNS={
  dots:{n:'Dots',svg:(c)=>`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1.5' fill='${c}'/></svg>`},
  grid:{n:'Grid',svg:(c)=>`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M20 0H0v20' fill='none' stroke='${c}' stroke-width='.5'/></svg>`},
  diag:{n:'Diagonal',svg:(c)=>`<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><path d='M-1 1l4-4M0 10l10-10M9 11l2-2' stroke='${c}' stroke-width='.5'/></svg>`},
  cross:{n:'Crosses',svg:(c)=>`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M10 6v8M6 10h8' stroke='${c}' stroke-width='.6' fill='none'/></svg>`},
  waves:{n:'Waves',svg:(c)=>`<svg xmlns='http://www.w3.org/2000/svg' width='40' height='10'><path d='M0 5c10-7 20 7 40 0' stroke='${c}' stroke-width='.6' fill='none'/></svg>`},
  hex:{n:'Hexagons',svg:(c)=>`<svg xmlns='http://www.w3.org/2000/svg' width='28' height='49'><path d='M14 0l14 8v16l-14 8L0 24V8z' fill='none' stroke='${c}' stroke-width='.5'/></svg>`},
  zigzag:{n:'Zigzag',svg:(c)=>`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='10'><path d='M0 10L5 0l5 10l5-10l5 10' stroke='${c}' stroke-width='.6' fill='none'/></svg>`},
  diamond:{n:'Diamonds',svg:(c)=>`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M8 0l8 8-8 8-8-8z' fill='none' stroke='${c}' stroke-width='.5'/></svg>`}
};

function renderPatternGrid(){
  const pg=$('patGrid');
  if(!pg)return;
  pg.innerHTML='';
  Object.keys(BG_PATTERNS).forEach(k=>{
    const pat=BG_PATTERNS[k];
    const d=document.createElement('div');
    d.className='pat-sw';
    d.title=pat.n;
    const encoded=encodeURIComponent(pat.svg('rgba(150,150,150,.4)'));
    d.style.backgroundImage=`url("data:image/svg+xml,${encoded}")`;
    d.onclick=()=>applyPattern(k);
    d.innerHTML=`<span>${pat.n}</span>`;
    pg.appendChild(d);
  });
}

function applyPattern(k){
  const pat=BG_PATTERNS[k];
  if(!pat)return;
  pushHistory();
  const ms=$('ms');
  const encoded=encodeURIComponent(pat.svg('rgba(150,150,150,.15)'));
  ms.style.backgroundImage=ms.style.background?
    `url("data:image/svg+xml,${encoded}"),${ms.style.background}`
    :`url("data:image/svg+xml,${encoded}")`;
  S.bgPattern=k;
  toast('✓ Pattern: '+pat.n);
}

function clearPattern(){
  const ms=$('ms');
  S.bgPattern=null;
  setBg(S.bg);
  toast('✓ Pattern cleared');
}

// ==================== BACKGROUND IMAGE UPLOAD ====================
function handleBgImgUpload(e){
  const f=e.target.files[0];
  if(!f)return;
  const r=new FileReader();
  r.onload=function(ev){
    pushHistory();
    const ms=$('ms');
    ms.style.backgroundImage=`url("${ev.target.result}")`;
    ms.style.backgroundSize='cover';
    ms.style.backgroundPosition='center';
    S.bgImage=ev.target.result;
    toast('✓ BG image set');
  };
  r.readAsDataURL(f);
}
