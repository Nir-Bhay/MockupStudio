// ==================== LABELS ====================
function updateLabels(){
  const n=$('lblN').value,d=$('lblD').value,m=$('lblM').value,t=$('lblT').value,u=$('urlTxt').value;
  $('phDN').textContent=n;$('phDT').textContent=d;
  $('phMN').textContent=n;$('phMT').textContent=m;
  $('phTN').textContent=n;$('phTT').textContent=t;
  $('addrTxt').textContent=u;
}
