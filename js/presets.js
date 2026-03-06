// ==================== PRESETS ====================
function savePreset(){
  const name=$('presetName').value.trim()||('Preset '+(S.presets.length+1));
  const preset={
    name,date:new Date().toLocaleDateString(),
    layout:S.layout,bg:S.bg,bgCustom:S.bgCustom,theme:S.theme,
    frameColor:S.frameColor,round:S.round,shadow:S.shadow,
    phoneScale:S.phoneScale,pad:S.pad,bgBlur:S.bgBlur,
    showNav:S.showNav,showIsland:S.showIsland,showRefl:S.showRefl,showWm:S.showWm,
    imgFit:{...S.imgFit},imgScale:{...S.imgScale}
  };
  S.presets.push(preset);
  localStorage.setItem('mp_presets',JSON.stringify(S.presets));
  renderPresets();
  $('presetName').value='';
  toast('💾 Preset "'+name+'" saved');
}

function loadPreset(i){
  pushHistory();
  const p=S.presets[i];if(!p)return;
  setLayout(p.layout);
  if(p.bgCustom)setBgCustom(p.bgCustom); else setBg(p.bg);
  setTheme(p.theme);
  $('frmCol').value=p.frameColor;setFrmCol(p.frameColor);
  $('rngR').value=p.round;setRnd(p.round);
  $('rngS').value=p.shadow;setShd(p.shadow);
  $('rngP').value=p.phoneScale;setPSc(p.phoneScale);
  $('rngPd').value=p.pad;setPad(p.pad);
  if(p.bgBlur!=null){$('rngBl').value=p.bgBlur;setBgBlur(p.bgBlur)}
  if(p.showNav!==S.showNav)togNav();
  if(p.showIsland!==S.showIsland)togIsland();
  if(p.showRefl!==S.showRefl)togRefl();
  if(p.showWm!==S.showWm)togWm();
  pushHistory();
  toast('✓ Preset "'+p.name+'" loaded');
}

function deletePreset(i){
  const name=S.presets[i].name;
  S.presets.splice(i,1);
  localStorage.setItem('mp_presets',JSON.stringify(S.presets));
  renderPresets();
  toast('✕ Preset "'+name+'" deleted');
}

function exportPresets(){
  const data=JSON.stringify(S.presets,null,2);
  const blob=new Blob([data],{type:'application/json'});
  const link=document.createElement('a');
  link.download='mockup-presets-'+Date.now()+'.json';
  link.href=URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  toast('📦 Presets exported');
}

function importPresets(){
  const input=document.createElement('input');
  input.type='file';input.accept='.json';
  input.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const imported=JSON.parse(ev.target.result);
        if(!Array.isArray(imported))throw new Error('Invalid format');
        imported.forEach(p=>{if(p.name&&p.layout)S.presets.push(p)});
        localStorage.setItem('mp_presets',JSON.stringify(S.presets));
        renderPresets();
        toast('✓ '+imported.length+' presets imported');
      }catch(err){toast('✕ Invalid preset file')}
    };r.readAsText(f);
  };
  input.click();
}

function renderPresets(){
  const list=$('presetList');
  if(S.presets.length===0){
    list.innerHTML='<div style="font-size:9px;color:var(--muted);text-align:center;padding:10px">No presets saved</div>';
    return;
  }
  list.innerHTML='';
  S.presets.forEach((p,i)=>{
    const d=document.createElement('div');
    d.className='preset-item';
    d.innerHTML=`<span class="pi-n">${p.name}</span><span class="pi-d">${p.date}</span>
      <div class="pi-a"><button class="btn-s" onclick="event.stopPropagation();loadPreset(${i})">Load</button>
      <button class="btn-d" onclick="event.stopPropagation();deletePreset(${i})">✕</button></div>`;
    list.appendChild(d);
  });
}
