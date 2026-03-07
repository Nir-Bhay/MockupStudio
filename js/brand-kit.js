//  Shahar Dil Se Surendra bhai mafi mangta hun
// ==================== BRAND KIT ====================
const _BK_KEY='ms_brand_kit';

function _loadBK(){
  try{return JSON.parse(localStorage.getItem(_BK_KEY)||'null')||{colors:['#c9956b','#1a1a1e','#6366f1','#ffffff'],fonts:['Inter','Space Grotesk']};}
  catch{return{colors:['#c9956b'],fonts:['Inter']};}
}
function _saveBK(bk){localStorage.setItem(_BK_KEY,JSON.stringify(bk))}

function renderBrandKit(){
  const bk=_loadBK();
  const cc=$('brandColors');
  if(cc){
    cc.innerHTML='';
    bk.colors.forEach((c,i)=>{
      const sw=document.createElement('div');
      sw.className='bk-swatch';sw.style.background=c;sw.title=c;
      sw.onclick=()=>applyBrandColor(c);
      const del=document.createElement('button');
      del.className='bk-del';del.textContent='×';
      del.onclick=e=>{e.stopPropagation();removeBrandColor(i)};
      sw.appendChild(del);cc.appendChild(sw);
    });
  }
  const fl=$('brandFonts');
  if(fl){
    fl.innerHTML='';
    bk.fonts.forEach((f,i)=>{
      const item=document.createElement('div');
      item.className='bk-font-item';
      item.innerHTML=`<span style="font-family:${f};font-size:10px">${f}</span><button class="btn-s" style="font-size:7px;padding:1px 5px" onclick="applyBrandFont('${f}')">Use</button><button class="bk-del" style="position:static;opacity:1;width:14px;height:14px" onclick="removeBrandFont(${i})">×</button>`;
      fl.appendChild(item);
    });
  }
}

function addBrandColor(){
  const c=$('bkColorPick')?$('bkColorPick').value:'#c9956b';
  const bk=_loadBK();
  if(bk.colors.length>=12){toast('Max 12 colors');return}
  if(!bk.colors.includes(c)){bk.colors.push(c);_saveBK(bk);renderBrandKit();toast('✓ Color saved')}
  else toast('Color already in kit');
}
function removeBrandColor(i){const bk=_loadBK();bk.colors.splice(i,1);_saveBK(bk);renderBrandKit()}
function applyBrandColor(c){pushHistory();setBgCustom(c);toast('✓ Brand color applied')}

function addBrandFont(){
  const sel=$('bkFontSel');if(!sel)return;
  const f=sel.value;const bk=_loadBK();
  if(!bk.fonts.includes(f)){bk.fonts.push(f);_saveBK(bk);renderBrandKit();toast('✓ Font saved')}
  else toast('Font already in kit');
}
function removeBrandFont(i){const bk=_loadBK();bk.fonts.splice(i,1);_saveBK(bk);renderBrandKit()}
function applyBrandFont(f){
  if($('lblFont')){$('lblFont').value=f;updateLabelStyle()}
  if($('newTxtFont'))$('newTxtFont').value=f;
  toast('✓ Brand font: '+f);
}

function exportBrandKit(){
  const bk=_loadBK();
  const blob=new Blob([JSON.stringify(bk,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='brand-kit.json';a.click();URL.revokeObjectURL(a.href);
  toast('✓ Brand Kit exported');
}

function importBrandKit(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.json';
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const bk=JSON.parse(ev.target.result);
        if(Array.isArray(bk.colors)&&Array.isArray(bk.fonts)){_saveBK(bk);renderBrandKit();toast('✓ Brand Kit imported')}
        else throw new Error();
      }catch{toast('✕ Invalid file')}
    };r.readAsText(f);
  };inp.click();
}
