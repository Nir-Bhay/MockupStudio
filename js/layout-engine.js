// ==================== LAYOUT ENGINE ====================
function setLayout(k){
  pushHistory();
  S.layout=k;
  document.querySelectorAll('.lay-opt').forEach(el=>el.classList.toggle('act',el.dataset.lay===k));
  $('layName').textContent=LAYS[k].n;
  applyLayout();
}

function applyLayout(){
  const L=LAYS[S.layout];
  const ms=$('ms'),bf=$('bf'),pf=$('pf'),tf=$('tf');
  const p=S.pad;

  // Browser
  if(L.bf){
    bf.classList.remove('hidden');
    if(!S.freeMode){
      bf.style.left=L.bf.l+'%';bf.style.top=L.bf.t+'%';
      bf.style.width=L.bf.w+'%';bf.style.height=L.bf.h+'%';
      bf.style.right='auto';bf.style.bottom='auto';
      bf.style.transform='none';
    }
    const navH=S.showNav?48:28;
    $('bBody').style.height='calc(100% - '+navH+'px)';
  }else{
    bf.classList.add('hidden');
  }

  // Phone
  if(L.pf&&(S.mobileImg||S.layout==='phone'||S.layout==='phones'||S.layout==='duo'||S.layout==='duoR'||S.layout==='trio'||S.layout==='stack'||S.layout==='overlap'||S.layout==='grid'||S.layout==='float')){
    pf.classList.remove('hidden');
    if(!S.freeMode){
      pf.style.left=L.pf.l+'%';pf.style.top=L.pf.t+'%';
      pf.style.width=L.pf.w+'%';pf.style.height=L.pf.h+'%';
      pf.style.right='auto';pf.style.bottom='auto';
      const sc=S.phoneScale/100;
      pf.style.transform='scale('+sc+')';
      pf.style.transformOrigin='top left';
    }
  }else{
    pf.classList.add('hidden');
  }

  // Tablet
  if(L.tf&&(S.tabletImg||S.layout==='trio'||S.layout==='grid'||S.layout==='float'||S.layout==='tabDesk')){
    tf.classList.remove('hidden');
    if(!S.freeMode){
      tf.style.left=L.tf.l+'%';tf.style.top=L.tf.t+'%';
      tf.style.width=L.tf.w+'%';tf.style.height=L.tf.h+'%';
      tf.style.right='auto';tf.style.bottom='auto';
      tf.style.transform='none';
    }
  }else{
    tf.classList.add('hidden');
  }

  applyShadow();
}
