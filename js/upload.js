//  Shahar Dil Se Surendra bhai mafi mangta hun
// ==================== FILE UPLOADS ====================
$('fD').addEventListener('change', e => handleUpload(e, 'desktop'));
$('fM').addEventListener('change', e => handleUpload(e, 'mobile'));
$('fT').addEventListener('change', e => handleUpload(e, 'tablet'));
$('fBg').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  if (!checkFileSize(f)) return;
  $('upBg').classList.add('uploading');
  const r = new FileReader();
  r.onload = ev => {
    S.bgImgUrl = ev.target.result;
    $('pvBg').src = ev.target.result;
    $('upBg').classList.remove('uploading');
    $('upBg').classList.add('has', 'just-uploaded');
    $('msBgImg').src = ev.target.result;
    $('msBgImg').style.display = 'block';
    setTimeout(() => $('upBg').classList.remove('just-uploaded'), 400);
    toast('✓ Background image set');
  }; r.readAsDataURL(f);
});

function handleUpload(e, type) {
  const f = e.target.files[0]; if (!f) return;
  if (!checkFileSize(f)) return;
  const upId = { desktop: 'upD', mobile: 'upM', tablet: 'upT' }[type];
  $(upId).classList.add('uploading');
  const r = new FileReader();
  r.onload = ev => {
    const url = ev.target.result;
    S[type + 'Img'] = url;
    const pvId = { desktop: 'pvD', mobile: 'pvM', tablet: 'pvT' }[type];
    $(pvId).src = url;
    $(upId).classList.remove('uploading');
    $(upId).classList.add('has', 'just-uploaded');
    setTimeout(() => $(upId).classList.remove('just-uploaded'), 400);
    const imgId = { desktop: 'imgD', mobile: 'imgM', tablet: 'imgTb' }[type];
    const phId = { desktop: 'phD', mobile: 'phM', tablet: 'phTb' }[type];
    $(imgId).src = url;
    $(imgId).style.display = 'block';
    applyImgStyle(type);
    $(phId).style.display = 'none';
    applyLayout();
    toast('✓ ' + cap(type) + ' uploaded');
  }; r.readAsDataURL(f);
}

function rmImg(type) {
  S[type + 'Img'] = null;
  const pvId = { desktop: 'pvD', mobile: 'pvM', tablet: 'pvT' }[type];
  const upId = { desktop: 'upD', mobile: 'upM', tablet: 'upT' }[type];
  const fId = { desktop: 'fD', mobile: 'fM', tablet: 'fT' }[type];
  const imgId = { desktop: 'imgD', mobile: 'imgM', tablet: 'imgTb' }[type];
  const phId = { desktop: 'phD', mobile: 'phM', tablet: 'phTb' }[type];
  $(pvId).src = ''; $(upId).classList.remove('has'); $(fId).value = '';
  $(imgId).style.display = 'none'; $(imgId).src = '';
  $(phId).style.display = 'flex';
  applyLayout();
  toast('✕ ' + cap(type) + ' removed');
}

function rmBgImg() {
  S.bgImgUrl = null;
  $('pvBg').src = ''; $('upBg').classList.remove('has'); $('fBg').value = '';
  $('msBgImg').style.display = 'none'; $('msBgImg').src = '';
  toast('✕ Background image removed');
}
