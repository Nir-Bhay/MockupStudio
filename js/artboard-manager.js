// ==================== ARTBOARD MANAGER ====================

// Snapshot current state into a portable artboard object
function _snapshotArtboard(){
  return {
    id:'ab_'+(S._abCounter),
    name:'Artboard '+S._abCounter,
    layout:S.layout,bg:S.bg,bgCustom:S.bgCustom,bgImgUrl:S.bgImgUrl,theme:S.theme,
    desktopImg:S.desktopImg,mobileImg:S.mobileImg,tabletImg:S.tabletImg,
    frameColor:S.frameColor,round:S.round,shadow:S.shadow,
    phoneScale:S.phoneScale,pad:S.pad,bgBlur:S.bgBlur,
    showNav:S.showNav,showIsland:S.showIsland,showRefl:S.showRefl,showWm:S.showWm,showBgOv:S.showBgOv,
    freeMode:S.freeMode,
    imgFit:JSON.parse(JSON.stringify(S.imgFit)),
    imgScale:JSON.parse(JSON.stringify(S.imgScale)),
    imgOff:JSON.parse(JSON.stringify(S.imgOff)),
    imgRad:JSON.parse(JSON.stringify(S.imgRad)),
    imgRotation:JSON.parse(JSON.stringify(S.imgRotation)),
    imgOpacity:JSON.parse(JSON.stringify(S.imgOpacity)),
    imgFlip:JSON.parse(JSON.stringify(S.imgFlip)),
    imgFilters:JSON.parse(JSON.stringify(S.imgFilters)),
    texts:JSON.parse(JSON.stringify(S.texts))
  };
}

// Load artboard into active state and re-render canvas
function _loadArtboard(ab){
  S.layout=ab.layout;S.bg=ab.bg;S.bgCustom=ab.bgCustom;S.bgImgUrl=ab.bgImgUrl;S.theme=ab.theme;
  S.desktopImg=ab.desktopImg;S.mobileImg=ab.mobileImg;S.tabletImg=ab.tabletImg;
  S.frameColor=ab.frameColor;S.round=ab.round;S.shadow=ab.shadow;
  S.phoneScale=ab.phoneScale;S.pad=ab.pad;S.bgBlur=ab.bgBlur;
  S.showNav=ab.showNav;S.showIsland=ab.showIsland;S.showRefl=ab.showRefl;S.showWm=ab.showWm;S.showBgOv=ab.showBgOv;
  S.freeMode=ab.freeMode;
  S.imgFit=JSON.parse(JSON.stringify(ab.imgFit));
  S.imgScale=JSON.parse(JSON.stringify(ab.imgScale));
  S.imgOff=JSON.parse(JSON.stringify(ab.imgOff));
  S.imgRad=JSON.parse(JSON.stringify(ab.imgRad));
  S.imgRotation=JSON.parse(JSON.stringify(ab.imgRotation));
  S.imgOpacity=JSON.parse(JSON.stringify(ab.imgOpacity));
  S.imgFlip=JSON.parse(JSON.stringify(ab.imgFlip));
  S.imgFilters=JSON.parse(JSON.stringify(ab.imgFilters));
  // Restore texts
  S.texts.forEach(t=>{const e=$(t.id);if(e)e.remove()});
  S.texts=JSON.parse(JSON.stringify(ab.texts));
  S.selTxt=null;

  // Re-render entire canvas
  _renderArtboardVisuals();
}

function _renderArtboardVisuals(){
  // Background
  if(S.bgCustom)$('ms').style.background=S.bgCustom;
  else if(BGS[S.bg])$('ms').style.background=BGS[S.bg];

  // Background image
  if(S.bgImgUrl){$('msBgImg').src=S.bgImgUrl;$('msBgImg').style.display='block';$('msBgImg').style.filter='blur('+S.bgBlur+'px)'}
  else{$('msBgImg').style.display='none';$('msBgImg').src=''}

  // Theme
  THEMES.forEach(t=>$('ms').classList.remove('th-'+t.id));
  if(S.theme!=='default')$('ms').classList.add('th-'+S.theme);

  // Frame color
  setFrmCol(S.frameColor);

  // Style controls
  $('rngR').value=S.round;setRnd(S.round);
  $('rngS').value=S.shadow;setShd(S.shadow);
  $('rngP').value=S.phoneScale;setPSc(S.phoneScale);
  $('rngPd').value=S.pad;setPad(S.pad);
  $('rngBl').value=S.bgBlur;setBgBlur(S.bgBlur);

  // Toggles
  $('tN').classList.toggle('on',S.showNav);$('bNav').style.display=S.showNav?'flex':'none';
  $('tI').classList.toggle('on',S.showIsland);$('pIsl').style.display=S.showIsland?'block':'none';
  $('tR').classList.toggle('on',S.showRefl);$('ms').classList.toggle('reflection',S.showRefl);
  $('tW').classList.toggle('on',S.showWm);$('wm').style.display=S.showWm?'block':'none';

  // Images
  _restoreImage('desktop','imgD','phD','pvD','upD');
  _restoreImage('mobile','imgM','phM','pvM','upM');
  _restoreImage('tablet','imgTb','phTb','pvT','upT');

  // Free mode
  $('freeBtn').style.background=S.freeMode?'rgba(201,149,107,.2)':'';
  $('freeBtn').style.borderColor=S.freeMode?'var(--accent)':'';

  // Layout
  applyLayout();

  // Restore text elements on canvas
  S.texts.forEach(t=>{
    const el=document.createElement('div');
    el.className='txt-el';el.id=t.id;
    el.style.left=t.x+'px';el.style.top=t.y+'px';
    el.style.fontSize=t.size+'px';el.style.fontWeight=t.weight;
    el.style.fontFamily=t.font;el.style.color=t.color;
    el.style.opacity=(t.opacity||100)/100;
    el.style.letterSpacing=(t.ls||0)+'px';
    el.style.textAlign=t.align||'center';
    el.textContent=t.text;
    $('ms').appendChild(el);
  });
  renderTextList();

  // Update sidebar active states
  document.querySelectorAll('.lay-opt').forEach(el=>el.classList.toggle('act',el.dataset.lay===S.layout));
  document.querySelectorAll('.bg-sw').forEach(el=>el.classList.toggle('act',el.dataset.bg===S.bg));
  document.querySelectorAll('.theme-card').forEach(el=>el.classList.toggle('act',el.dataset.theme===S.theme));
}

function _restoreImage(type,imgId,phId,pvId,upId){
  const url=S[type+'Img'];
  if(url){
    $(imgId).src=url;$(imgId).style.display='block';
    $(phId).style.display='none';
    $(pvId).src=url;$(upId).classList.add('has');
    applyImgStyle(type);
  }else{
    $(imgId).style.display='none';$(imgId).src='';
    $(phId).style.display='flex';
    $(pvId).src='';$(upId).classList.remove('has');
  }
}

// ==================== ARTBOARD OPERATIONS ====================

function initArtboards(){
  // Create first artboard from default state
  const ab=_snapshotArtboard();
  S.artboards=[ab];
  S.activeArtboard=0;
  renderArtboardNav();
}

function addArtboard(){
  // Save current artboard
  _saveCurrentArtboard();
  // Create new blank artboard
  S._abCounter++;
  const ab={
    id:'ab_'+S._abCounter,name:'Artboard '+S._abCounter,
    layout:'hero',bg:'sahara',bgCustom:null,bgImgUrl:null,theme:'default',
    desktopImg:null,mobileImg:null,tabletImg:null,
    frameColor:'#ffffff',round:10,shadow:50,phoneScale:100,pad:5,bgBlur:0,
    showNav:true,showIsland:true,showRefl:false,showWm:true,showBgOv:false,
    freeMode:false,
    imgFit:{desktop:'cover',mobile:'cover',tablet:'cover'},
    imgScale:{desktop:100,mobile:100,tablet:100},
    imgOff:{desktop:{x:0,y:0},mobile:{x:0,y:0},tablet:{x:0,y:0}},
    imgRad:{desktop:0,mobile:0,tablet:0},
    imgRotation:{desktop:0,mobile:0,tablet:0},
    imgOpacity:{desktop:100,mobile:100,tablet:100},
    imgFlip:{desktop:{h:false,v:false},mobile:{h:false,v:false},tablet:{h:false,v:false}},
    imgFilters:{desktop:{brightness:100,contrast:100,saturation:100,blur:0},mobile:{brightness:100,contrast:100,saturation:100,blur:0},tablet:{brightness:100,contrast:100,saturation:100,blur:0}},
    texts:[]
  };
  S.artboards.push(ab);
  S.activeArtboard=S.artboards.length-1;
  _loadArtboard(ab);
  renderArtboardNav();
  toast('+ New artboard added');
}

function dupArtboard(){
  _saveCurrentArtboard();
  S._abCounter++;
  const src=S.artboards[S.activeArtboard];
  const ab=JSON.parse(JSON.stringify(src));
  ab.id='ab_'+S._abCounter;
  ab.name=src.name+' copy';
  S.artboards.push(ab);
  S.activeArtboard=S.artboards.length-1;
  _loadArtboard(ab);
  renderArtboardNav();
  toast('⧉ Artboard duplicated');
}

function delArtboard(){
  if(S.artboards.length<=1){toast('Cannot delete last artboard');return}
  S.artboards.splice(S.activeArtboard,1);
  if(S.activeArtboard>=S.artboards.length)S.activeArtboard=S.artboards.length-1;
  _loadArtboard(S.artboards[S.activeArtboard]);
  renderArtboardNav();
  toast('✕ Artboard deleted');
}

function switchArtboard(idx){
  if(idx===S.activeArtboard||idx<0||idx>=S.artboards.length)return;
  _saveCurrentArtboard();
  S.activeArtboard=idx;
  _loadArtboard(S.artboards[idx]);
  renderArtboardNav();
}

function _saveCurrentArtboard(){
  const prevName=S.artboards[S.activeArtboard].name;
  const prevId=S.artboards[S.activeArtboard].id;
  S.artboards[S.activeArtboard]=_snapshotArtboard();
  S.artboards[S.activeArtboard].id=prevId;
  S.artboards[S.activeArtboard].name=prevName;
}

function renameArtboard(idx,name){
  if(idx>=0&&idx<S.artboards.length){
    S.artboards[idx].name=name;
    renderArtboardNav();
  }
}

// ==================== ARTBOARD NAVIGATION ====================
function renderArtboardNav(){
  const nav=$('abNav');
  if(!nav)return;
  nav.innerHTML='';
  S.artboards.forEach((ab,i)=>{
    const d=document.createElement('div');
    d.className='ab-thumb'+(i===S.activeArtboard?' act':'');
    d.onclick=()=>switchArtboard(i);
    d.ondblclick=()=>{
      const input=d.querySelector('.ab-name');
      if(!input)return;
      input.contentEditable='true';input.focus();
      const sel=window.getSelection();sel.selectAllChildren(input);
      input.onblur=()=>{input.contentEditable='false';renameArtboard(i,input.textContent.trim()||('Artboard '+(i+1)))};
      input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();input.blur()}};
    };
    // Mini preview swatch
    const bg=ab.bgCustom||BGS[ab.bg]||BGS.sahara;
    d.innerHTML=`<div class="ab-preview" style="background:${bg}"><span class="ab-idx">${i+1}</span></div><span class="ab-name">${ab.name}</span>`;
    nav.appendChild(d);
  });
}

// ==================== BATCH EXPORT ====================
async function batchExport(){
  if(S.artboards.length<=1){doExport();return}
  _saveCurrentArtboard();
  const origIdx=S.activeArtboard;
  const scale=parseInt($('expSc').value);
  const fmt=$('expFmt').value;
  
  $('expOv').classList.add('show');
  try{
    for(let i=0;i<S.artboards.length;i++){
      // Load artboard
      _loadArtboard(S.artboards[i]);
      $('stageCv').style.transform='scale(1)';
      document.querySelectorAll('.txt-el').forEach(e=>e.classList.remove('sel'));
      document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar').forEach(e=>e.style.visibility='hidden');
      await new Promise(r=>setTimeout(r,400));
      
      const canvas=await html2canvas($('ms'),{scale,useCORS:true,allowTaint:true,backgroundColor:null,logging:false,width:960,height:600});
      
      document.querySelectorAll('.drag-h,.resize-h,.canvas-toolbar').forEach(e=>e.style.visibility='');
      
      const link=document.createElement('a');
      const safeName=S.artboards[i].name.replace(/[^a-zA-Z0-9]/g,'_');
      link.download='mockup-'+safeName+'-'+Date.now()+'.'+fmt;
      link.href=canvas.toDataURL(fmt==='jpeg'?'image/jpeg':'image/png',.95);
      link.click();
      await new Promise(r=>setTimeout(r,200));
    }
    toast('✓ Exported '+S.artboards.length+' artboards');
  }catch(err){
    console.error(err);toast('✕ Batch export failed');
  }
  
  // Restore original artboard
  _loadArtboard(S.artboards[origIdx]);
  S.activeArtboard=origIdx;
  $('stageCv').style.transform='scale('+S.zoom+')';
  renderArtboardNav();
  $('expOv').classList.remove('show');
}
