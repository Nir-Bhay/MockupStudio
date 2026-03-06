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

// ==================== ADVANCED IMAGE CONTROLS ====================
function setImgRotation(type,v){
  S.imgRotation[type]=parseInt(v);
  const rvId={desktop:'rvDRot',mobile:'rvMRot',tablet:'rvTRot'}[type];
  if($(rvId))$(rvId).textContent=v+'°';
  applyImgStyle(type);
}

function setImgOpacity(type,v){
  S.imgOpacity[type]=parseInt(v);
  const rvId={desktop:'rvDOp',mobile:'rvMOp',tablet:'rvTOp'}[type];
  if($(rvId))$(rvId).textContent=v+'%';
  applyImgStyle(type);
}

function setImgFilter(type,prop,v){
  S.imgFilters[type][prop]=parseInt(v);
  const rvId='rv'+type.charAt(0).toUpperCase()+prop.charAt(0).toUpperCase();
  applyImgStyle(type);
}

function flipImg(type,axis){
  if(axis==='h')S.imgFlip[type].h=!S.imgFlip[type].h;
  else S.imgFlip[type].v=!S.imgFlip[type].v;
  applyImgStyle(type);
  toast('↔ Image flipped');
}

function autoFitImg(type){
  const imgId={desktop:'imgD',mobile:'imgM',tablet:'imgTb'}[type];
  const img=$(imgId);if(!img||!img.naturalWidth)return;
  
  const frameId={desktop:'bf',mobile:'pf',tablet:'tf'}[type];
  const frame=$(frameId);if(!frame)return;
  
  const iw=img.naturalWidth,ih=img.naturalHeight;
  const fw=frame.clientWidth,fh=frame.clientHeight;
  const imgAR=iw/ih,frameAR=fw/fh;
  
  // Choose cover or contain based on aspect ratio similarity
  const fit=Math.abs(imgAR-frameAR)<0.5?'cover':'contain';
  S.imgFit[type]=fit;
  S.imgScale[type]=100;
  S.imgOff[type]={x:0,y:0};
  
  // Update UI controls
  const fitSelect={desktop:'dFit',mobile:'mFit'}[type];
  if($(fitSelect))$(fitSelect).value=fit;
  
  applyImgStyle(type);
  toast('✓ Auto-fit applied');
}

function resetImgControls(type){
  S.imgFit[type]='cover';
  S.imgScale[type]=100;
  S.imgOff[type]={x:0,y:0};
  S.imgRad[type]=0;
  S.imgRotation[type]=0;
  S.imgOpacity[type]=100;
  S.imgFlip[type]={h:false,v:false};
  S.imgFilters[type]={brightness:100,contrast:100,saturation:100,blur:0};
  applyImgStyle(type);
  toast('↺ Image reset');
}

function applyImgStyle(type){
  const imgId={desktop:'imgD',mobile:'imgM',tablet:'imgTb'}[type];
  const img=$(imgId);if(!img)return;
  const sc=S.imgScale[type]/100;
  const ox=S.imgOff[type].x;
  const oy=S.imgOff[type].y;
  const fit=S.imgFit[type];
  const rad=S.imgRad[type]||0;
  const rot=S.imgRotation[type]||0;
  const op=(S.imgOpacity[type]!=null?S.imgOpacity[type]:100)/100;
  const flip=S.imgFlip[type]||{h:false,v:false};
  const filters=S.imgFilters[type]||{brightness:100,contrast:100,saturation:100,blur:0};

  img.style.objectFit=fit;
  img.style.width='100%';
  img.style.height='100%';
  
  const sx=flip.h?-sc:sc;
  const sy=flip.v?-sc:sc;
  img.style.transform=`scale(${sx},${sy}) translate(${ox}px, ${oy}px) rotate(${rot}deg)`;
  img.style.borderRadius=rad+'px';
  img.style.opacity=op;
  img.style.filter=`brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`;
  img.style.transition='transform .2s var(--ease-out),filter .2s,opacity .2s,border-radius .2s';
}
