// ==================== REALISTIC DEVICE BEZELS ====================
let _bezelsEnabled=false;

function toggleBezels(){
  _bezelsEnabled=!_bezelsEnabled;
  if(_bezelsEnabled){
    _applyBezel('pf','iphone');
    _applyBezel('tf','ipad');
    _applyBezel('bf','macbook');
    if($('bezelsBtn'))$('bezelsBtn').classList.add('act');
  }else{
    ['bf','pf','tf'].forEach(id=>{
      const el=$(id);if(!el)return;
      const b=el.querySelector('.device-bezel');if(b)b.remove();
    });
    if($('bezelsBtn'))$('bezelsBtn').classList.remove('act');
  }
  toast(_bezelsEnabled?'✓ Detailed bezels ON':'Bezels minimal');
}

function _applyBezel(frameId,type){
  const el=$(frameId);
  if(!el||el.classList.contains('hidden'))return;
  const existing=el.querySelector('.device-bezel');if(existing)existing.remove();
  const div=document.createElement('div');
  div.className='device-bezel device-bezel-'+type;
  if(type==='iphone'){
    div.innerHTML=`
      <div class="bz-btn bz-vol-1"></div>
      <div class="bz-btn bz-vol-2"></div>
      <div class="bz-btn bz-silent"></div>
      <div class="bz-btn bz-power"></div>
      <div class="bz-home-bar"></div>`;
  }else if(type==='macbook'){
    div.innerHTML=`
      <div class="bz-webcam"></div>
      <div class="bz-kbhint"></div>`;
  }else if(type==='ipad'){
    div.innerHTML=`
      <div class="bz-cam-ipad"></div>
      <div class="bz-btn bz-power-ipad"></div>`;
  }
  el.appendChild(div);
}

function refreshBezels(){
  if(!_bezelsEnabled)return;
  ['bf','pf','tf'].forEach(id=>{const el=$(id);if(el){const b=el.querySelector('.device-bezel');if(b)b.remove()}});
  _applyBezel('pf','iphone');_applyBezel('tf','ipad');_applyBezel('bf','macbook');
}
