// ==================== FREE POSITION MODE ====================
let dragTarget=null,dragOff={x:0,y:0};

function togFree(){
  S.freeMode=!S.freeMode;
  $('freeBtn').style.background=S.freeMode?'rgba(201,149,107,.2)':'';
  $('freeBtn').style.borderColor=S.freeMode?'var(--accent)':'';
  $('freeBtn').title=S.freeMode?'Free mode ON':'Free mode OFF';
  toast(S.freeMode?'🔓 Free position mode ON':'🔒 Snapped to layout');
  if(!S.freeMode)applyLayout();
}

function initDrag(){
  const handles=['bfDrag','pfDrag','tfDrag'];
  const frames=['bf','pf','tf'];

  handles.forEach((hId,i)=>{
    const h=$(hId);const fr=$(frames[i]);
    if(!h||!fr)return;

    h.addEventListener('mousedown',e=>{
      if(!S.freeMode)return;
      e.preventDefault();
      dragTarget=fr;
      const rect=fr.getBoundingClientRect();
      const msRect=$('ms').getBoundingClientRect();
      const scale=S.zoom;
      dragOff.x=e.clientX-rect.left;
      dragOff.y=e.clientY-rect.top;
      fr.classList.add('dragging');
      document.addEventListener('mousemove',onDrag);
      document.addEventListener('mouseup',offDrag);
    });
  });

  // Resize handles
  const resizes=['bfResize','pfResize','tfResize'];
  resizes.forEach((rId,i)=>{
    const rh=$(rId);const fr=$(frames[i]);
    if(!rh||!fr)return;

    rh.addEventListener('mousedown',e=>{
      if(!S.freeMode)return;
      e.preventDefault();e.stopPropagation();
      const startW=fr.offsetWidth;
      const startH=fr.offsetHeight;
      const startX=e.clientX;
      const startY=e.clientY;
      const ar=startW/startH;

      function onResize(ev){
        const dx=(ev.clientX-startX)/S.zoom;
        const dy=(ev.clientY-startY)/S.zoom;
        const nw=Math.max(80,startW+dx);
        const nh=nw/ar;
        fr.style.width=nw+'px';
        fr.style.height=nh+'px';
      }
      function offResize(){
        document.removeEventListener('mousemove',onResize);
        document.removeEventListener('mouseup',offResize);
      }
      document.addEventListener('mousemove',onResize);
      document.addEventListener('mouseup',offResize);
    });
  });
}

function onDrag(e){
  if(!dragTarget)return;
  const msRect=$('ms').getBoundingClientRect();
  const scale=S.zoom;
  const x=(e.clientX-msRect.left)/scale-dragOff.x/scale;
  const y=(e.clientY-msRect.top)/scale-dragOff.y/scale;
  dragTarget.style.left=Math.max(0,x)+'px';
  dragTarget.style.top=Math.max(0,y)+'px';
  dragTarget.style.right='auto';
  dragTarget.style.bottom='auto';
  dragTarget.style.transform='none';
}

function offDrag(){
  if(dragTarget)dragTarget.classList.remove('dragging');
  dragTarget=null;
  document.removeEventListener('mousemove',onDrag);
  document.removeEventListener('mouseup',offDrag);
}
