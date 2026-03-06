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
  
  const labels=document.querySelectorAll('.ph-n,.ph-t,.ph-s');
  labels.forEach(el=>{
    el.style.fontFamily=font;
    el.style.fontSize=size;
    el.style.color=color;
    el.style.fontWeight=weight;
  });
}

function toggleLabelsVisible(){
  const visible=$('lblVisible').checked;
  const labels=document.querySelectorAll('.ph-n,.ph-t,.ph-s');
  labels.forEach(el=>{
    el.style.display=visible?'':'none';
  });
}
