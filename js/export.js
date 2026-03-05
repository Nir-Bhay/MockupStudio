// ==================== EXPORT ====================
async function doExport(){
  $('expOv').classList.add('show');
  try{
    const scale=parseInt($('expSc').value);
    const fmt=$('expFmt').value;
    const prevZ=S.zoom;
    $('stageCv').style.transform='scale(1)';

    // Hide selection outlines on texts
    document.querySelectorAll('.txt-el').forEach(e=>e.classList.remove('sel'));
    // Hide drag handles and resize handles visibility
    document.querySelectorAll('.drag-h,.resize-h').forEach(e=>e.style.visibility='hidden');

    await new Promise(r=>setTimeout(r,300));
    const canvas=await html2canvas($('ms'),{scale,useCORS:true,allowTaint:true,backgroundColor:null,logging:false,width:960,height:600});

    // Restore
    document.querySelectorAll('.drag-h,.resize-h').forEach(e=>e.style.visibility='');
    $('stageCv').style.transform='scale('+prevZ+')';
    if(S.selTxt)$(S.selTxt).classList.add('sel');

    const link=document.createElement('a');
    link.download='mockup-'+S.layout+'-'+Date.now()+'.'+fmt;
    link.href=canvas.toDataURL(fmt==='jpeg'?'image/jpeg':'image/png',.95);
    link.click();
    toast('✓ Exported successfully!');
  }catch(err){
    console.error(err);toast('✕ Export failed');
  }
  $('expOv').classList.remove('show');
}

async function doCopy(){
  try{
    const prevZ=S.zoom;
    $('stageCv').style.transform='scale(1)';
    document.querySelectorAll('.drag-h,.resize-h').forEach(e=>e.style.visibility='hidden');
    await new Promise(r=>setTimeout(r,300));
    const canvas=await html2canvas($('ms'),{scale:2,useCORS:true,allowTaint:true,backgroundColor:null,logging:false});
    document.querySelectorAll('.drag-h,.resize-h').forEach(e=>e.style.visibility='');
    $('stageCv').style.transform='scale('+prevZ+')';
    canvas.toBlob(async b=>{
      try{await navigator.clipboard.write([new ClipboardItem({'image/png':b})]);toast('✓ Copied!')}
      catch(e){toast('✕ Clipboard denied')}
    });
  }catch(e){toast('✕ Copy failed')}
}
