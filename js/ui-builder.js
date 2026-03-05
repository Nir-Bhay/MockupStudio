// ==================== DYNAMIC UI BUILDER ====================
function buildUI(){
  // Layouts
  const lg=$('layGrid');lg.innerHTML='';
  Object.keys(LAYS).forEach(k=>{
    const l=LAYS[k];
    const d=document.createElement('div');
    d.className='lay-opt'+(S.layout===k?' act':'');
    d.dataset.lay=k;
    d.title=l.n;
    d.onclick=()=>setLayout(k);
    let svg='<svg viewBox="0 0 64 40">';
    if(l.bf) svg+=`<rect x="${l.bf.l*.64}" y="${l.bf.t*.4}" width="${l.bf.w*.64}" height="${l.bf.h*.4}" rx="3" fill="none" stroke="#c9956b" stroke-width="1.2"/>`;
    if(l.pf) svg+=`<rect x="${l.pf.l*.64}" y="${l.pf.t*.4}" width="${l.pf.w*.64}" height="${l.pf.h*.4}" rx="4" fill="none" stroke="#c9956b" stroke-width="1.2"/>`;
    if(l.tf) svg+=`<rect x="${l.tf.l*.64}" y="${l.tf.t*.4}" width="${l.tf.w*.64}" height="${l.tf.h*.4}" rx="2" fill="none" stroke="#c9956b" stroke-width="1.2"/>`;
    svg+='</svg>';
    d.innerHTML=svg;
    lg.appendChild(d);
  });

  // Backgrounds
  const bg=$('bgGrid');bg.innerHTML='';
  Object.keys(BGS).forEach(k=>{
    const d=document.createElement('div');
    d.className='bg-sw'+(S.bg===k?' act':'');
    d.dataset.bg=k;
    d.style.background=BGS[k];
    d.title=k;
    d.onclick=()=>setBg(k);
    bg.appendChild(d);
  });

  // Themes
  const tg=$('themeGrid');tg.innerHTML='';
  THEMES.forEach(t=>{
    const d=document.createElement('div');
    d.className='theme-card'+(S.theme===t.id?' act':'');
    d.dataset.theme=t.id;
    d.style.background=t.bg;
    d.onclick=()=>setTheme(t.id);
    d.innerHTML=`<span>${t.n}</span>`;
    tg.appendChild(d);
  });

  // Templates
  const tp=$('tplGrid');tp.innerHTML='';
  TPLS.forEach((t,i)=>{
    const bgVal=BGS[t.bg]||BGS.sahara;
    const d=document.createElement('div');
    d.className='tpl-card';
    d.style.background=bgVal;
    d.onclick=()=>applyTemplate(i);
    d.innerHTML=`<span>${t.n}</span><small>${t.s}</small>`;
    tp.appendChild(d);
  });

  renderPresets();
}

// ==================== SECTION COLLAPSE ====================
function togSec(el){
  const body=el.parentElement.querySelector('.sec-body');
  const arrow=el.querySelector('.sec-arrow');
  if(body){
    body.classList.toggle('collapsed');
    if(body.classList.contains('collapsed')){
      body.style.maxHeight='0';
      if(arrow)arrow.classList.add('collapsed');
    }else{
      body.style.maxHeight=body.scrollHeight+200+'px';
      if(arrow)arrow.classList.remove('collapsed');
    }
  }
}

// ==================== TAB SWITCHING ====================
function swTab(name){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('act',t.dataset.tab===name));
  document.querySelectorAll('.tab-body').forEach(tb=>tb.classList.remove('act'));
  const target=$('tab'+name.charAt(0).toUpperCase()+name.slice(1));
  if(target)target.classList.add('act');
}
