// ==================== FILE UPLOADS ====================
$('fD').addEventListener('change', e => handleUpload(e, 'desktop'));
$('fM').addEventListener('change', e => handleUpload(e, 'mobile'));
$('fT').addEventListener('change', e => handleUpload(e, 'tablet'));
$('fM2').addEventListener('change', e => handleUpload(e, 'mobile2'));
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
  const upId = { desktop: 'upD', mobile: 'upM', tablet: 'upT', mobile2: 'upM2' }[type];
  $(upId).classList.add('uploading');
  const r = new FileReader();
  r.onload = ev => {
    const url = ev.target.result;
    S[type + 'Img'] = url;
    const pvId = { desktop: 'pvD', mobile: 'pvM', tablet: 'pvT', mobile2: 'pvM2' }[type];
    $(pvId).src = url;
    $(upId).classList.remove('uploading');
    $(upId).classList.add('has', 'just-uploaded');
    setTimeout(() => $(upId).classList.remove('just-uploaded'), 400);
    const imgId = { desktop: 'imgD', mobile: 'imgM', tablet: 'imgTb', mobile2: 'imgM2' }[type];
    const phId = { desktop: 'phD', mobile: 'phM', tablet: 'phTb', mobile2: 'phM2' }[type];
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
  const pvId = { desktop: 'pvD', mobile: 'pvM', tablet: 'pvT', mobile2: 'pvM2' }[type];
  const upId = { desktop: 'upD', mobile: 'upM', tablet: 'upT', mobile2: 'upM2' }[type];
  const fId = { desktop: 'fD', mobile: 'fM', tablet: 'fT', mobile2: 'fM2' }[type];
  const imgId = { desktop: 'imgD', mobile: 'imgM', tablet: 'imgTb', mobile2: 'imgM2' }[type];
  const phId = { desktop: 'phD', mobile: 'phM', tablet: 'phTb', mobile2: 'phM2' }[type];
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
