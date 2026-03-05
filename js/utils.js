// ==================== UTILITIES ====================
const $=id=>document.getElementById(id);
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._to);t._to=setTimeout(()=>t.classList.remove('show'),2200)}
