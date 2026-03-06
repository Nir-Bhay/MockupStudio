// ==================== UTILITIES ====================
const $=id=>document.getElementById(id);
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._to);t._to=setTimeout(()=>t.classList.remove('show'),2200)}

// Debounce helper for range sliders
function debounce(fn,ms){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>fn.apply(this,a),ms)}}

// requestAnimationFrame throttle for smooth drag
function rafThrottle(fn){let ticking=false;return function(...a){if(!ticking){ticking=true;requestAnimationFrame(()=>{fn.apply(this,a);ticking=false})}}}
