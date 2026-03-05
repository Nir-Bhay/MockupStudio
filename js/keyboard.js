// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
  if(e.ctrlKey||e.metaKey){
    if(e.key==='='||e.key==='+'){e.preventDefault();zIn()}
    if(e.key==='-'){e.preventDefault();zOut()}
    if(e.key==='0'){e.preventDefault();zFit()}
    if(e.key==='s'){e.preventDefault();doExport()}
    if(e.key==='c'){e.preventDefault();doCopy()}
    if(e.key==='z'){e.preventDefault();doReset()}
  }
  if(e.key==='Delete'||e.key==='Backspace'){if(S.selTxt)deleteTxt()}
  if(e.key==='Escape'){
    S.selTxt=null;document.querySelectorAll('.txt-el').forEach(e=>e.classList.remove('sel'));
    $('txtEditSec').style.display='none';
    document.querySelectorAll('.txt-item').forEach(e=>e.classList.remove('sel'));
  }
});
