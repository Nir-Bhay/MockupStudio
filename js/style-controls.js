// ==================== BACKGROUND ====================
function setBg(k) {
  pushHistory();
  S.bg = k; S.bgCustom = null;
  document.querySelectorAll('.bg-sw').forEach(el => el.classList.toggle('act', el.dataset.bg === k));
  $('ms').style.background = BGS[k];
}

function setBgCustom(v) {
  S.bgCustom = v; S.bg = 'custom';
  document.querySelectorAll('.bg-sw').forEach(el => el.classList.remove('act'));
  $('ms').style.background = v;
}

// ==================== THEME ====================
function setTheme(id) {
  pushHistory();
  S.theme = id;
  document.querySelectorAll('.theme-card').forEach(el => el.classList.toggle('act', el.dataset.theme === id));
  const ms = $('ms');
  THEMES.forEach(t => ms.classList.remove('th-' + t.id));
  if (id !== 'default') ms.classList.add('th-' + id);
}

// ==================== TEMPLATE ====================
function applyTemplate(i) {
  pushHistory();
  const t = TPLS[i];
  setLayout(t.lay);
  setBg(t.bg);
  setTheme(t.theme);
  toast('✓ Template "' + t.n + '" applied');
}

// ==================== FRAME COLOR ====================
function setFrmCol(c) {
  S.frameColor = c;
  $('bf').style.backgroundColor = c;
  $('pf').style.backgroundColor = c;
  $('tf').style.backgroundColor = c;
  if ($('pf2')) $('pf2').style.backgroundColor = c;
  const dk = c === '#000000' || c === '#1a1a1e';
  $('bBar').style.background = dk ? 'rgba(30,30,30,.95)' : 'rgba(245,245,245,.95)';
  $('bNav').style.background = dk ? 'rgba(30,30,30,.9)' : 'rgba(250,250,250,.9)';
  document.querySelectorAll('.b-ctrl span').forEach(s => s.style.color = dk ? '#555' : '#ccc');
  document.querySelectorAll('.addr span').forEach(s => s.style.color = dk ? '#666' : '#aaa');
  document.querySelectorAll('.b-nav span').forEach(s => s.style.color = dk ? '#666' : '#999');
}

// ==================== STYLE CONTROLS ====================
function setRnd(v) { S.round = v; $('rvR').textContent = v + 'px'; $('bf').style.borderRadius = v + 'px' }
function setShd(v) { S.shadow = v; $('rvS').textContent = v + '%'; applyShadow() }
function setPSc(v) { S.phoneScale = v; $('rvP').textContent = v + '%'; applyLayout() }
function setPad(v) { S.pad = v; $('rvPd').textContent = v + '%'; applyLayout() }
function setBgBlur(v) { S.bgBlur = v; $('rvBl').textContent = v + 'px'; $('msBgImg').style.filter = 'blur(' + v + 'px)' }

function applyShadow() {
  const i = S.shadow / 100;
  // Premium multi-layer diffused shadow
  const bs = [
    `0 ${Math.round(2 * i)}px ${Math.round(4 * i)}px rgba(0,0,0,${(.04 * i).toFixed(3)})`,
    `0 ${Math.round(8 * i)}px ${Math.round(16 * i)}px rgba(0,0,0,${(.06 * i).toFixed(3)})`,
    `0 ${Math.round(20 * i)}px ${Math.round(48 * i)}px rgba(0,0,0,${(.1 * i).toFixed(3)})`,
    `0 ${Math.round(32 * i)}px ${Math.round(72 * i)}px rgba(0,0,0,${(.14 * i).toFixed(3)})`
  ].join(',');
  const ps = [
    `0 ${Math.round(2 * i)}px ${Math.round(4 * i)}px rgba(0,0,0,${(.05 * i).toFixed(3)})`,
    `0 ${Math.round(10 * i)}px ${Math.round(20 * i)}px rgba(0,0,0,${(.08 * i).toFixed(3)})`,
    `0 ${Math.round(24 * i)}px ${Math.round(52 * i)}px rgba(0,0,0,${(.14 * i).toFixed(3)})`,
    `0 ${Math.round(36 * i)}px ${Math.round(80 * i)}px rgba(0,0,0,${(.18 * i).toFixed(3)})`
  ].join(',');
  $('bf').style.boxShadow = bs;
  $('pf').style.boxShadow = ps;
  $('tf').style.boxShadow = bs;
  if ($('pf2')) $('pf2').style.boxShadow = ps;
}

// ==================== TOGGLES ====================
function togNav() { S.showNav = !S.showNav; $('tN').classList.toggle('on'); $('bNav').style.display = S.showNav ? 'flex' : 'none'; const h = S.showNav ? 48 : 28; $('bBody').style.height = 'calc(100% - ' + h + 'px)' }
function togIsland() { S.showIsland = !S.showIsland; $('tI').classList.toggle('on'); $('pIsl').style.display = S.showIsland ? 'block' : 'none'; if ($('pIsl2')) $('pIsl2').style.display = S.showIsland ? 'block' : 'none' }
function togRefl() { S.showRefl = !S.showRefl; $('tR').classList.toggle('on'); $('ms').classList.toggle('reflection') }
function togWm() { S.showWm = !S.showWm; $('tW').classList.toggle('on'); $('wm').style.display = S.showWm ? 'block' : 'none' }
function togBgOv() { S.showBgOv = !S.showBgOv; $('tOv').classList.toggle('on'); $('msBgOv').style.background = S.showBgOv ? 'rgba(0,0,0,.3)' : 'none' }
