// ==================== IMAGE CONTROLS ====================
function setImgFit(type,v){
  S.imgFit[type]=v;
  applyImgStyle(type);
}
function setImgScale(type,v){
  S.imgScale[type]=parseInt(v);
  const rvId={desktop:'rvDS',mobile:'rvMS',tablet:'rvTS'}[type];
  $(rvId).textContent=v+'%';
  applyImgStyle(type);
}
function setImgOff(type,axis,v){
  S.imgOff[type][axis]=parseInt(v);
  const rvId={desktop:{x:'rvDX',y:'rvDY'},mobile:{x:'rvMX',y:'rvMY'},tablet:{x:'rvTX',y:'rvTY'}}[type][axis];
  $(rvId).textContent=v+'px';
  applyImgStyle(type);
}
function setImgRad(type,v){
  S.imgRad[type]=parseInt(v);
  if(type==='desktop')$('rvDR').textContent=v+'px';
  applyImgStyle(type);
}

function applyImgStyle(type){
  const imgId={desktop:'imgD',mobile:'imgM',tablet:'imgTb'}[type];
  const img=$(imgId);if(!img)return;
  const sc=S.imgScale[type]/100;
  const ox=S.imgOff[type].x;
  const oy=S.imgOff[type].y;
  const fit=S.imgFit[type];
  const rad=S.imgRad[type]||0;

  img.style.objectFit=fit;
  img.style.width='100%';
  img.style.height='100%';
  img.style.transform=`scale(${sc}) translate(${ox}px, ${oy}px)`;
  img.style.borderRadius=rad+'px';
}
