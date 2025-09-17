// index.js
import { getSession, signOut } from "./auth.js";

// Helpers simples
function qs(id){ return document.getElementById(id); }
function ready(fn){ 
  if(document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

// Animación de aparición (reveal)
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      en.target.classList.add('is-visible');
      io.unobserve(en.target);
    }
  });
},{threshold:0.2});
revealEls.forEach(el=>io.observe(el));

// (Opcional) acciones de botones de login / registro
document.querySelectorAll('[data-open]').forEach(btn=>{
  btn.addEventListener('click', ()=> alert(btn.textContent));
});

// CTA sin navegación (solo demo visual)
document.getElementById('cta')?.addEventListener('click', (e)=>{
  e.preventDefault();
  alert('¡Vamos a entrenar!');
});

// Parallax suave del boxeador
(()=>{
  const wrap = document.getElementById('heroFigure');
  const img  = document.getElementById('boxer');
  if (!wrap || !img) return;

  let raf = null;
  let targetRotX = 0, targetRotY = 0, targetTransX = 0;

  function onMove(e){
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top  + rect.height/2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;

    targetRotY   = dx * 10;
    targetRotX   = -dy * 8;
    targetTransX = dx * 12;
    if (!raf) raf = requestAnimationFrame(update);
  }
  function onLeave(){
    targetRotX = targetRotY = targetTransX = 0;
    if (!raf) raf = requestAnimationFrame(update);
  }

  let rotX = 0, rotY = 0, transX = 0;
  function update(){
    const k = 0.12;
    rotX   += (targetRotX - rotX) * k;
    rotY   += (targetRotY - rotY) * k;
    transX += (targetTransX - transX) * k;

    img.style.transform =
      `translate3d(${transX}px,0,0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

    if (Math.abs(rotX-targetRotX) > .01 ||
        Math.abs(rotY-targetRotY) > .01 ||
        Math.abs(transX-targetTransX) > .1){
      raf = requestAnimationFrame(update);
    } else {
      raf = null;
    }
  }

  wrap.addEventListener('mousemove', onMove);
  wrap.addEventListener('mouseleave', onLeave);
})();

// ==================== MENÚ AUTH ====================
async function hasSession(){
  const s = await getSession();
  return !!s;
}
async function doLogout(){
  try { await signOut(); } catch(_){}
}

async function refreshAuthUI(){
  const logged = await hasSession();
  const $login = qs('btnLogin');
  const $reg   = qs('btnRegister');
  const $perf  = qs('btnPerfil');
  const $out   = qs('btnLogout');

  if ($login) $login.hidden = logged;
  if ($reg)   $reg.hidden   = logged;
  if ($perf)  $perf.hidden  = !logged;
  if ($out)   $out.hidden   = !logged;
}

ready(async ()=>{
  await refreshAuthUI();
  const $out = qs('btnLogout');
  if ($out){
    $out.addEventListener('click', async (e)=>{
      e.preventDefault();
      await doLogout();
      await refreshAuthUI();
      alert('Sesión cerrada.');
      window.location.href = 'index.html';
    });
  }
});
