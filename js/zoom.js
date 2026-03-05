// ==================== ZOOM ====================
function zIn(){S.zoom=Math.min(S.zoom+.1,2.5);applyZoom()}
function zOut(){S.zoom=Math.max(S.zoom-.1,.2);applyZoom()}
function zFit(){
  const a=$('stageArea').getBoundingClientRect();
  const zx=(a.width-40)/960;const zy=(a.height-40)/600;
  S.zoom=Math.min(zx,zy,1.2);applyZoom();
}
function applyZoom(){$('stageCv').style.transform='scale('+S.zoom+')';$('zDisp').textContent=Math.round(S.zoom*100)+'%'}
