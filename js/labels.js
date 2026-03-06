// ==================== LABELS ====================
function updateLabels(){
  const n=$('lblN').value,d=$('lblD').value,m=$('lblM').value,t=$('lblT').value,u=$('urlTxt').value;
  $('phDN').textContent=n;$('phDT').textContent=d;
  $('phMN').textContent=n;$('phMT').textContent=m;
  $('phTN').textContent=n;$('phTT').textContent=t;
  $('addrTxt').textContent=u;
}

function updateLabelStyle(){
  const font=$('lblFont').value;
  const size=$('lblSize').value+'px';
  const color=$('lblColor').value;
  const weight=$('lblWeight').value;
  const transform=$('lblTransform')?$('lblTransform').value:'none';
  
  const labels=document.querySelectorAll('.ph-n,.ph-t,.ph-s');
  labels.forEach(el=>{
    el.style.fontFamily=font;
    el.style.color=color;
    el.style.fontWeight=weight;
    el.style.textTransform=transform;
  });
  // Apply size only to .ph-t and .ph-s (number has its own size)
  document.querySelectorAll('.ph-t,.ph-s').forEach(el=>{
    el.style.fontSize=size;
  });
}

function toggleLabelsVisible(){
  const visible=$('lblVisible').checked;
  document.querySelectorAll('.ph').forEach(el=>{
    el.style.display=visible?'':'none';
  });
}

// ==================== PER-LABEL VISIBILITY ====================
function toggleDeviceLabel(device){
  const map={desktop:'phD',mobile:'phM',tablet:'phTb'};
  const el=$(map[device]);
  const cb=$('lv_'+device);
  if(el&&cb)el.style.display=cb.checked?'':'none';
}

function toggleUrlLabel(){
  const bar=$('bBar');
  const cb=$('lv_url');
  if(bar&&cb)bar.style.display=cb.checked?'':'none';
}

// ==================== CANVAS BADGES ====================
let _badgeIdCounter=0;
S.badges=S.badges||[];S.selBadge=null;

const BADGE_TYPES={
  version:{icon:'📦',text:'v2.0',cls:'bdg-version'},
  date:{icon:'📅',text:()=>new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),cls:'bdg-date'},
  specs:{icon:'📱',text:'iPhone 15 Pro · iOS 17',cls:'bdg-specs'},
  new:{icon:'⚡',text:'New Feature',cls:'bdg-new'},
  beta:{icon:'🔬',text:'Beta',cls:'bdg-beta'},
  custom:{icon:'🏷',text:'Label',cls:'bdg-custom'}
};

function addBadge(type){
  pushHistory();
  const def=BADGE_TYPES[type];if(!def)return;
  const id='bdg_'+(++_badgeIdCounter);
  const text=typeof def.text==='function'?def.text():def.text;
  const obj={id,type,text,x:30+(S.badges.length*10),y:20};
  S.badges.push(obj);
  _renderBadgeEl(obj,def);
  selectBadge(id);
  toast('✓ Badge added');
}

function _renderBadgeEl(obj,def){
  if(!def)def=BADGE_TYPES[obj.type]||BADGE_TYPES.custom;
  const el=document.createElement('div');
  el.className='canvas-badge '+def.cls;
  el.id=obj.id;
  el.style.left=obj.x+'px';el.style.top=obj.y+'px';
  el.innerHTML=`<span class="bdg-ico">${def.icon}</span><span class="bdg-txt">${obj.text}</span>`;
  _makeBadgeDrag(el,obj.id);
  el.addEventListener('click',e=>{e.stopPropagation();selectBadge(obj.id)});
  $('ms').appendChild(el);
}

function _makeBadgeDrag(el,id){
  el.addEventListener('mousedown',e=>{
    e.preventDefault();e.stopPropagation();
    selectBadge(id);
    const msR=$('ms').getBoundingClientRect();
    const ox=e.clientX-el.getBoundingClientRect().left;
    const oy=e.clientY-el.getBoundingClientRect().top;
    function mv(ev){
      const x=(ev.clientX-msR.left)/S.zoom-ox/S.zoom;
      const y=(ev.clientY-msR.top)/S.zoom-oy/S.zoom;
      el.style.left=Math.max(0,x)+'px';el.style.top=Math.max(0,y)+'px';
      const obj=S.badges.find(b=>b.id===id);if(obj){obj.x=x;obj.y=y}
    }
    function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up)}
    document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
  });
}

function selectBadge(id){
  S.selBadge=id;
  document.querySelectorAll('.canvas-badge').forEach(e=>e.classList.toggle('sel',e.id===id));
  const sec=$('badgeEditSec');if(sec)sec.style.display=id?'flex':'none';
  const obj=S.badges.find(b=>b.id===id);
  if(obj&&$('badgeTxt'))$('badgeTxt').value=obj.text;
}

function editBadgeText(){
  if(!S.selBadge)return;
  const obj=S.badges.find(b=>b.id===S.selBadge);
  const el=$(S.selBadge);if(!obj||!el)return;
  obj.text=$('badgeTxt').value;
  const span=el.querySelector('.bdg-txt');if(span)span.textContent=obj.text;
}

function deleteBadge(){
  if(!S.selBadge)return;
  const el=$(S.selBadge);if(el)el.remove();
  S.badges=S.badges.filter(b=>b.id!==S.selBadge);
  S.selBadge=null;
  const sec=$('badgeEditSec');if(sec)sec.style.display='none';
  toast('✕ Badge removed');
}

// ==================== LABEL PRESETS ====================
const LABEL_PRESETS=[
  {n:'Minimal',font:'Inter',size:9,weight:'400',color:'rgba(180,140,100,.2)',transform:'none'},
  {n:'Bold',font:'Inter',size:11,weight:'700',color:'rgba(180,140,100,.35)',transform:'uppercase'},
  {n:'Elegant',font:'Playfair Display',size:10,weight:'600',color:'rgba(180,140,100,.25)',transform:'none'},
  {n:'Modern',font:'Space Grotesk',size:10,weight:'500',color:'rgba(100,100,100,.3)',transform:'uppercase'},
  {n:'Clean',font:'DM Sans',size:9,weight:'500',color:'rgba(255,255,255,.15)',transform:'none'},
  {n:'Display',font:'Outfit',size:12,weight:'600',color:'rgba(201,149,107,.3)',transform:'capitalize'}
];

function applyLabelPreset(i){
  const p=LABEL_PRESETS[i];if(!p)return;
  if($('lblFont'))$('lblFont').value=p.font;
  if($('lblSize'))$('lblSize').value=p.size;
  if($('lblWeight'))$('lblWeight').value=p.weight;
  if($('lblColor'))$('lblColor').value=p.color;
  if($('lblTransform'))$('lblTransform').value=p.transform;
  updateLabelStyle();
  toast('✓ Label style: '+p.n);
}

function renderLabelPresets(){
  const container=$('lblPresets');
  if(!container)return;
  container.innerHTML='';
  LABEL_PRESETS.forEach((p,i)=>{
    const btn=document.createElement('button');
    btn.className='btn-s';btn.textContent=p.n;
    btn.style.fontSize='8px';
    btn.onclick=()=>applyLabelPreset(i);
    container.appendChild(btn);
  });
}
