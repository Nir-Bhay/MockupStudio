// ==================== ZOOM ====================
function zIn(){S.zoom=Math.min(S.zoom+.1,2.5);applyZoom()}
function zOut(){S.zoom=Math.max(S.zoom-.1,.2);applyZoom()}
function zFit(){
  const a=$('stageArea').getBoundingClientRect();
  const zx=(a.width-40)/960;const zy=(a.height-40)/600;
  S.zoom=Math.min(zx,zy,1.2);applyZoom();
}
function applyZoom(){$('stageCv').style.transform='scale('+S.zoom+')';$('zDisp').textContent=Math.round(S.zoom*100)+'%'}

// Scroll wheel zoom on stage
document.addEventListener('DOMContentLoaded',()=>{
  const stage=$('stageArea');
  if(stage)stage.addEventListener('wheel',e=>{
    if(!e.ctrlKey&&!e.metaKey)return;
    e.preventDefault();
    const delta=e.deltaY>0?-.05:.05;
    S.zoom=Math.min(Math.max(S.zoom+delta,.2),2.5);
    applyZoom();
  },{passive:false});
});
