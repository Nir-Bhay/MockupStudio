// ==================== TEXT ON STAGE ====================
let txtIdCounter=0;

function addText(){
  const txt=$('newTxtVal').value||'Your Text';
  const font=$('newTxtFont').value;
  const size=$('newTxtSize').value;
  const weight=$('newTxtW').value;
  const color=$('newTxtCol').value;
  const opacity=parseInt($('newTxtOp').value)/100;
  const ls=parseInt($('newTxtLs').value);

  const id='txt_'+(++txtIdCounter);
  const obj={id,text:txt,font,size:parseInt(size),weight:parseInt(weight),color,opacity,ls,x:50,y:50};
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
  el.style.left='50%';
  el.style.top='50%';
  el.style.transform='translate(-50%,-50%)';

  // Draggable
  el.addEventListener('mousedown',e=>{
    e.preventDefault();
    selectText(id);
    const rect=el.getBoundingClientRect();
    const msRect=$('ms').getBoundingClientRect();
    const ox=e.clientX-rect.left;
    const oy=e.clientY-rect.top;
    el.classList.add('dragging');

    function mv(ev){
      const x=(ev.clientX-msRect.left)/S.zoom-ox/S.zoom;
      const y=(ev.clientY-msRect.top)/S.zoom-oy/S.zoom;
      el.style.left=x+'px';
      el.style.top=y+'px';
      el.style.transform='none';
      const tObj=S.texts.find(t=>t.id===id);
      if(tObj){tObj.x=x;tObj.y=y}
    }
    function up(){
      el.classList.remove('dragging');
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
