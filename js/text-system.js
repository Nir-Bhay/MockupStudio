// ==================== TEXT ON STAGE ====================
let txtIdCounter=0;
const SNAP_THRESHOLD=8;

function addText(){
  const txt=$('newTxtVal').value||'Your Text';
  const font=$('newTxtFont').value;
  const size=$('newTxtSize').value;
  const weight=$('newTxtW').value;
  const color=$('newTxtCol').value;
  const opacity=parseInt($('newTxtOp').value)/100;
  const ls=parseInt($('newTxtLs').value);
  const align=$('newTxtAlign')?$('newTxtAlign').value:'center';

  const id='txt_'+(++txtIdCounter);
  const obj={id,text:txt,font,size:parseInt(size),weight:parseInt(weight),color,opacity,ls,align,x:50,y:50};
  S.texts.push(obj);

  const el=document.createElement('div');
  el.className='txt-el';
  el.id=id;
  el.textContent=txt;
  el.style.fontFamily=font;
  el.style.fontSize=size+'px';
  el.style.fontWeight=weight;
  el.style.color=color;
  el.style.opacity=opacity;
  el.style.letterSpacing=ls+'px';
  el.style.textAlign=align;
  el.style.left='50%';
  el.style.top='50%';
  el.style.transform='translate(-50%,-50%)';

  // Draggable with snap guides
  el.addEventListener('mousedown',e=>{
    e.preventDefault();
    selectText(id);
    const rect=el.getBoundingClientRect();
    const msRect=$('ms').getBoundingClientRect();
    const ox=e.clientX-rect.left;
    const oy=e.clientY-rect.top;
    el.classList.add('dragging');
    
    // Create snap guides
    const ms=$('ms');
    let guideH=ms.querySelector('.snap-guide.h');
    let guideV=ms.querySelector('.snap-guide.v');
    if(!guideH){guideH=document.createElement('div');guideH.className='snap-guide h';guideH.style.opacity='0';ms.appendChild(guideH)}
    if(!guideV){guideV=document.createElement('div');guideV.className='snap-guide v';guideV.style.opacity='0';ms.appendChild(guideV)}

    function mv(ev){
      let x=(ev.clientX-msRect.left)/S.zoom-ox/S.zoom;
      let y=(ev.clientY-msRect.top)/S.zoom-oy/S.zoom;
      
      // Snap to center
      const msW=960,msH=600;
      const elW=el.offsetWidth,elH=el.offsetHeight;
      const cx=x+elW/2,cy=y+elH/2;
      
      if(Math.abs(cx-msW/2)<SNAP_THRESHOLD){
        x=msW/2-elW/2;
        guideV.style.left='50%';guideV.style.opacity='1';
      }else{guideV.style.opacity='0'}
      
      if(Math.abs(cy-msH/2)<SNAP_THRESHOLD){
        y=msH/2-elH/2;
        guideH.style.top='50%';guideH.style.opacity='1';
      }else{guideH.style.opacity='0'}
      
      el.style.left=x+'px';
      el.style.top=y+'px';
      el.style.transform='none';
      const tObj=S.texts.find(t=>t.id===id);
      if(tObj){tObj.x=x;tObj.y=y}
    }
    function up(){
      el.classList.remove('dragging');
      guideH.style.opacity='0';guideV.style.opacity='0';
      document.removeEventListener('mousemove',mv);
      document.removeEventListener('mouseup',up);
    }
    document.addEventListener('mousemove',mv);
    document.addEventListener('mouseup',up);
  });

  $('ms').appendChild(el);
  renderTextList();
  selectText(id);
  toast('✓ Text added');
}

function selectText(id){
  S.selTxt=id;
  document.querySelectorAll('.txt-el').forEach(e=>e.classList.toggle('sel',e.id===id));
  document.querySelectorAll('.txt-item').forEach(e=>e.classList.toggle('sel',e.dataset.id===id));

  const obj=S.texts.find(t=>t.id===id);
  if(obj){
    $('txtEditSec').style.display='flex';
    $('edTxtVal').value=obj.text;
    $('edTxtSz').value=obj.size;
    $('edTxtCol').value=obj.color;
  }
}

function editTxtProp(prop){
  if(!S.selTxt)return;
  const obj=S.texts.find(t=>t.id===S.selTxt);
  const el=$(S.selTxt);
  if(!obj||!el)return;

  if(prop==='text'){obj.text=$('edTxtVal').value;el.textContent=obj.text;renderTextList()}
  if(prop==='size'){obj.size=parseInt($('edTxtSz').value);el.style.fontSize=obj.size+'px'}
  if(prop==='color'){obj.color=$('edTxtCol').value;el.style.color=obj.color}
  if(prop==='align'){const a=$('edTxtAlign').value;obj.align=a;el.style.textAlign=a}
}

function deleteTxt(){
  if(!S.selTxt)return;
  const el=$(S.selTxt);
  if(el)el.remove();
  S.texts=S.texts.filter(t=>t.id!==S.selTxt);
  S.selTxt=null;
  $('txtEditSec').style.display='none';
  renderTextList();
  toast('✕ Text removed');
}

function duplicateTxt(){
  if(!S.selTxt)return;
  const obj=S.texts.find(t=>t.id===S.selTxt);
  if(!obj)return;
  $('newTxtVal').value=obj.text;
  $('newTxtFont').value=obj.font;
  $('newTxtSize').value=obj.size;
  $('newTxtW').value=obj.weight;
  $('newTxtCol').value=obj.color;
  addText();
}

function renderTextList(){
  const list=$('txtList');
  if(S.texts.length===0){
    list.innerHTML='<div style="font-size:9px;color:var(--muted);text-align:center;padding:10px">No text added yet</div>';
    return;
  }
  list.innerHTML='';
  S.texts.forEach(t=>{
    const d=document.createElement('div');
    d.className='txt-item'+(S.selTxt===t.id?' sel':'');
    d.dataset.id=t.id;
    d.innerHTML=`<span class="ti-t">${t.text}</span><span class="ti-del" onclick="event.stopPropagation();S.selTxt='${t.id}';deleteTxt()">✕</span>`;
    d.onclick=()=>selectText(t.id);
    list.appendChild(d);
  });
}
