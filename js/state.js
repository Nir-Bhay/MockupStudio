// ==================== STATE ====================
const S={
  layout:'hero',bg:'sahara',bgCustom:null,bgImgUrl:null,theme:'default',
  desktopImg:null,mobileImg:null,tabletImg:null,
  frameColor:'#ffffff',round:10,shadow:50,phoneScale:100,pad:5,bgBlur:0,
  showNav:true,showIsland:true,showRefl:false,showWm:true,showBgOv:false,
  freeMode:false,zoom:1,
  imgFit:{desktop:'cover',mobile:'cover',tablet:'cover'},
  imgScale:{desktop:100,mobile:100,tablet:100},
  imgOff:{desktop:{x:0,y:0},mobile:{x:0,y:0},tablet:{x:0,y:0}},
  imgRad:{desktop:0,mobile:0,tablet:0},
  imgRotation:{desktop:0,mobile:0,tablet:0},
  imgOpacity:{desktop:100,mobile:100,tablet:100},
  imgFlip:{desktop:{h:false,v:false},mobile:{h:false,v:false},tablet:{h:false,v:false}},
  imgFilters:{desktop:{brightness:100,contrast:100,saturation:100,blur:0},mobile:{brightness:100,contrast:100,saturation:100,blur:0},tablet:{brightness:100,contrast:100,saturation:100,blur:0}},
  texts:[],selTxt:null,
  presets:JSON.parse(localStorage.getItem('mp_presets')||'[]'),
  // Artboard system
  artboards:[],
  activeArtboard:0,
  _abCounter:1
};

// ==================== UNDO/REDO ====================
const _history=[];
let _histIdx=-1;
const _maxHistory=40;

function _snapshotState(){
  return JSON.stringify({
    layout:S.layout,bg:S.bg,bgCustom:S.bgCustom,theme:S.theme,
    frameColor:S.frameColor,round:S.round,shadow:S.shadow,
    phoneScale:S.phoneScale,pad:S.pad,bgBlur:S.bgBlur,
    showNav:S.showNav,showIsland:S.showIsland,showRefl:S.showRefl,showWm:S.showWm,showBgOv:S.showBgOv,
    imgFit:{...S.imgFit},imgScale:{...S.imgScale},
    imgOff:{desktop:{...S.imgOff.desktop},mobile:{...S.imgOff.mobile},tablet:{...S.imgOff.tablet}},
    imgRad:{...S.imgRad}
  });
}

function pushHistory(){
  const snap=_snapshotState();
  if(_histIdx>=0&&_history[_histIdx]===snap)return;
  _history.splice(_histIdx+1);
  _history.push(snap);
  if(_history.length>_maxHistory)_history.shift();
  _histIdx=_history.length-1;
}

function undo(){
  if(_histIdx<=0)return;
  _histIdx--;
  _restoreState(JSON.parse(_history[_histIdx]));
  toast('↩ Undo');
}

function redo(){
  if(_histIdx>=_history.length-1)return;
  _histIdx++;
  _restoreState(JSON.parse(_history[_histIdx]));
  toast('↪ Redo');
}

function _restoreState(snap){
  Object.assign(S,snap);
  // Re-apply visuals
  setLayout(S.layout);
  if(S.bgCustom)setBgCustom(S.bgCustom);else setBg(S.bg);
  setTheme(S.theme);
  setFrmCol(S.frameColor);
  $('rngR').value=S.round;setRnd(S.round);
  $('rngS').value=S.shadow;setShd(S.shadow);
  $('rngP').value=S.phoneScale;setPSc(S.phoneScale);
  $('rngPd').value=S.pad;setPad(S.pad);
  $('rngBl').value=S.bgBlur;setBgBlur(S.bgBlur);
}

// ==================== BACKGROUNDS ====================
const BGS={
  sahara:'linear-gradient(145deg,#c9956b,#b8845d,#d4a57a)',
  midnight:'linear-gradient(145deg,#0f0c29,#302b63,#24243e)',
  aurora:'linear-gradient(145deg,#667eea,#764ba2)',
  ocean:'linear-gradient(145deg,#2193b0,#6dd5ed)',
  forest:'linear-gradient(145deg,#134e5e,#71b280)',
  sunset:'linear-gradient(145deg,#f093fb,#f5576c)',
  charcoal:'linear-gradient(145deg,#232526,#414345)',
  peach:'linear-gradient(145deg,#ffecd2,#fcb69f)',
  ice:'linear-gradient(145deg,#e6e9f0,#eef1f5)',
  rose:'linear-gradient(145deg,#fecfef,#ff9a9e)',
  emerald:'linear-gradient(145deg,#0d9488,#34d399)',
  lavender:'linear-gradient(145deg,#c471f5,#fa71cd)',
  slate:'linear-gradient(145deg,#373B44,#4286f4)',
  coffee:'linear-gradient(145deg,#3E2723,#795548)',
  wine:'linear-gradient(145deg,#4a0e2b,#8e2c5a)',
  arctic:'linear-gradient(145deg,#74ebd5,#ACB6E5)',
  honey:'linear-gradient(145deg,#f7971e,#ffd200)',
  blush:'linear-gradient(145deg,#fbc2eb,#a6c1ee)',
  noir:'linear-gradient(145deg,#0a0a0a,#1a1a1a)',
  cream:'linear-gradient(145deg,#f5f0eb,#e8ddd4)',
  sky:'linear-gradient(145deg,#89CFF0,#a0d8ef)',
  moss:'linear-gradient(145deg,#4a7c59,#8fbc8f)',
  coral:'linear-gradient(145deg,#ff7675,#fab1a0)',
  indigo:'linear-gradient(145deg,#4338ca,#6366f1)'
};

// ==================== LAYOUTS ====================
const LAYS={
  hero:{n:'Hero',bf:{l:5,t:5,w:90,h:90},pf:null,tf:null},
  duo:{n:'Duo',bf:{l:3,t:6,w:62,h:86},pf:{l:68,t:30,w:16,h:54},tf:null},
  duoR:{n:'Duo R',bf:{l:35,t:6,w:62,h:86},pf:{l:3,t:30,w:16,h:54},tf:null},
  trio:{n:'Trio',bf:{l:3,t:3,w:94,h:58},pf:{l:5,t:52,w:13,h:44},tf:{l:60,t:52,w:26,h:38}},
  stack:{n:'Stack',bf:{l:8,t:3,w:84,h:56},pf:{l:42,t:45,w:15,h:50},tf:null},
  phone:{n:'Phone',bf:null,pf:{l:35,t:5,w:18,h:90},tf:null},
  phones:{n:'2 Phones',bf:null,pf:{l:15,t:8,w:16,h:82},tf:null,pf2:{l:55,t:8,w:16,h:82}},
  tabDesk:{n:'Tab+Desk',bf:{l:30,t:3,w:66,h:75},pf:null,tf:{l:3,t:18,w:26,h:60}},
  overlap:{n:'Overlap',bf:{l:5,t:8,w:70,h:80},pf:{l:60,t:20,w:18,h:60},tf:null},
  grid:{n:'Grid',bf:{l:2,t:2,w:48,h:48},pf:{l:52,t:2,w:16,h:48},tf:{l:2,t:52,w:48,h:46}},
  center:{n:'Center',bf:{l:15,t:10,w:70,h:80},pf:null,tf:null},
  float:{n:'Float',bf:{l:8,t:12,w:55,h:70},pf:{l:66,t:5,w:15,h:50},tf:{l:50,t:55,w:25,h:36}}
};

// ==================== THEMES ====================
const THEMES=[
  {id:'default',n:'Default',bg:'linear-gradient(135deg,#f5f0eb,#e8ddd4)'},
  {id:'glass',n:'Glass',bg:'linear-gradient(135deg,rgba(100,100,255,.1),rgba(200,100,255,.05))'},
  {id:'dark',n:'Dark',bg:'linear-gradient(135deg,#1a1a1e,#0a0a0c)'},
  {id:'minimal',n:'Minimal',bg:'linear-gradient(135deg,#fafafa,#f0f0f0)'},
  {id:'neo',n:'Neon',bg:'linear-gradient(135deg,#0a0a1a,#1a0a2e)'},
  {id:'bento',n:'Bento',bg:'linear-gradient(135deg,#f8f8f8,#efefef)'}
];

// ==================== TEMPLATES ====================
const TPLS=[
  {n:'SaaS Landing',s:'For product pages',lay:'duo',bg:'midnight',theme:'glass'},
  {n:'Portfolio',s:'Showcase work',lay:'hero',bg:'cream',theme:'minimal'},
  {n:'App Launch',s:'Mobile first',lay:'phone',bg:'aurora',theme:'default'},
  {n:'Dashboard',s:'Admin panels',lay:'center',bg:'charcoal',theme:'dark'},
  {n:'E-Commerce',s:'Online stores',lay:'trio',bg:'peach',theme:'default'},
  {n:'Startup Pitch',s:'Investor decks',lay:'overlap',bg:'indigo',theme:'neo'},
  {n:'Agency',s:'Creative studios',lay:'float',bg:'sahara',theme:'default'},
  {n:'Multi Device',s:'Responsive',lay:'grid',bg:'ice',theme:'minimal'}
];
