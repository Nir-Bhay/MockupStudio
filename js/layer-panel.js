// ==================== LAYER PANEL ====================
// Z-order management, lock/hide frames, layer reordering

const _layers={
  bf:{z:10,locked:false,visible:true,name:'Desktop'},
  pf:{z:20,locked:false,visible:true,name:'Phone'},
  tf:{z:15,locked:false,visible:true,name:'Tablet'}
};

function renderLayerPanel(){
  const list=$('layerList');
  if(!list)return;
  list.innerHTML='';
  
  // Sort by z-index descending (top layer first)
  const sorted=Object.keys(_layers).sort((a,b)=>_layers[b].z-_layers[a].z);
  
  sorted.forEach(id=>{
    const ly=_layers[id];
    const fr=$(id);
    const isHidden=fr&&fr.classList.contains('hidden');
    
    const d=document.createElement('div');
    d.className='layer-item'+(ly.locked?' locked':'');
    d.dataset.layer=id;
    d.innerHTML=`
      <span class="ly-grip" title="Drag to reorder">⠿</span>
      <span class="ly-name">${ly.name}</span>
      <button class="ly-btn${ly.visible&&!isHidden?' act':''}" onclick="toggleLayerVis('${id}')" title="${ly.visible?'Hide':'Show'}">
        ${ly.visible&&!isHidden?'👁':'👁‍🗨'}
      </button>
      <button class="ly-btn${ly.locked?' act':''}" onclick="toggleLayerLock('${id}')" title="${ly.locked?'Unlock':'Lock'}">
        ${ly.locked?'🔒':'🔓'}
      </button>
    `;
    list.appendChild(d);
  });
}

function toggleLayerVis(id){
  const ly=_layers[id];
  const fr=$(id);
  if(!fr)return;
  ly.visible=!ly.visible;
  if(!ly.visible){
    fr.style.opacity='0';
    fr.style.pointerEvents='none';
  }else{
    fr.style.opacity='';
    fr.style.pointerEvents='';
  }
  renderLayerPanel();
}

function toggleLayerLock(id){
  const ly=_layers[id];
  ly.locked=!ly.locked;
  const fr=$(id);
  if(fr){
    fr.style.pointerEvents=ly.locked?'none':'';
    fr.classList.toggle('frame-locked',ly.locked);
  }
  renderLayerPanel();
  toast(ly.locked?'🔒 '+ly.name+' locked':'🔓 '+ly.name+' unlocked');
}

function bringToFront(id){
  const maxZ=Math.max(...Object.values(_layers).map(l=>l.z));
  _layers[id].z=maxZ+1;
  $(id).style.zIndex=_layers[id].z;
  renderLayerPanel();
}

function sendToBack(id){
  const minZ=Math.min(...Object.values(_layers).map(l=>l.z));
  _layers[id].z=Math.max(1,minZ-1);
  $(id).style.zIndex=_layers[id].z;
  renderLayerPanel();
}

function isFrameLocked(frameId){
  return _layers[frameId]&&_layers[frameId].locked;
}
