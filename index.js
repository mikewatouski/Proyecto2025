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
  // Podés cambiar esto por la ruta real de tu app
  alert('¡Vamos a entrenar!');
});

// Parallax suave del boxeador (solo mueve al boxeador)
(() => {
  const wrap = document.getElementById('heroFigure');
  const img  = document.getElementById('boxer');
  if (!wrap || !img) return;

  let raf = null;
  let targetRotX = 0, targetRotY = 0, targetTransX = 0;

  function onMove(e){
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top  + rect.height/2;
    const dx = (e.clientX - cx) / rect.width;   // -0.5..0.5
    const dy = (e.clientY - cy) / rect.height;  // -0.5..0.5

    // límites suaves
    targetRotY   = dx * 10;   // giro Y (izq/der)
    targetRotX   = -dy * 8;   // giro X (arr/abajo)
    targetTransX = dx * 12;   // leve desplazamiento
    if (!raf) raf = requestAnimationFrame(update);
  }

  function onLeave(){
    targetRotX = targetRotY = targetTransX = 0;
    if (!raf) raf = requestAnimationFrame(update);
  }

  // interpolación para que se vea “butter”
  let rotX = 0, rotY = 0, transX = 0;
  function update(){
    const k = 0.12; // suavizado
    rotX   += (targetRotX - rotX) * k;
    rotY   += (targetRotY - rotY) * k;
    transX += (targetTransX - transX) * k;

    img.style.transform =
      `translate3d(${transX}px, 0, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

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

/* =========================================================
   MENÚ / AUTENTICACIÓN (versión robusta)
   Reemplaza TODOS los bloques authUI anteriores por éste.
   ========================================================= */
(function authMenu(){
  const KEY = 'CURRENT_USER';

  // Utils
  function ready(fn){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once:true });
    } else { fn(); }
  }
  function qs(id){ return document.getElementById(id); }

  // Crea botones si faltan y asegura el contenedor del menú
  function ensureButtons(){
    let menu = document.querySelector('#menuMain, .menu');
    if (!menu){
      // Si no existe el nav .menu, lo creamos (fallback)
      menu = document.createElement('nav');
      menu.id = 'menuMain';
      menu.className = 'menu';
      document.body.prepend(menu);
    }

    function ensure(id, label, href, hidden=false){
      let el = qs(id);
      if (!el){
        el = document.createElement('a');
        el.id = id;
        el.className = 'btn btn--ghost';
        el.textContent = label;
        if (href) el.href = href;
        el.hidden = hidden;
        menu.appendChild(el);
      }
      return el;
    }

    // Si ya existen, no se duplican; si faltan, se crean.
    ensure('btnLogin',    'Iniciar sesión', 'login.html',    false);
    ensure('btnRegister', 'Regístrate',     'registro.html', false);
    ensure('btnPerfil',   'Perfil',         'perfil.html',   true);
    ensure('btnLogout',   'Salir',          '#',             true);
  }

  // Determina si hay sesión
  function hasSession(){
    // Si existe getCurrentUser() en auth.js, lo usamos; sino, leemos localStorage.
    try {
      if (typeof getCurrentUser === 'function') {
        return !!getCurrentUser();
      }
    } catch(_e){}
    return !!localStorage.getItem(KEY);
  }

  // Cierra sesión (con fallback)
  function doLogout(){
    try {
      if (typeof logout === 'function') {
        logout();
        return;
      }
    } catch(_e){}
    localStorage.removeItem(KEY);
  }

  // Actualiza la UI del menú según login
  function refreshAuthUI(){
    const logged = hasSession();
    const $login = qs('btnLogin');
    const $reg   = qs('btnRegister');
    const $perf  = qs('btnPerfil');
    const $out   = qs('btnLogout');

    if ($login) $login.hidden = logged;
    if ($reg)   $reg.hidden   = logged;
    if ($perf)  $perf.hidden  = !logged;
    if ($out)   $out.hidden   = !logged;
  }

  // Init
  ready(()=>{
    ensureButtons();
    refreshAuthUI();

    const $out = qs('btnLogout');
    if ($out){
      $out.addEventListener('click', (e)=>{
        e.preventDefault();
        doLogout();
        refreshAuthUI();
        alert('Sesión cerrada.');
        // Si querés redireccionar al login:
        // window.location.href = 'login.html';
      });
    }
  });

  // Si cambia la sesión en otra pestaña
  window.addEventListener('storage', (e)=>{
    if (e.key === KEY) refreshAuthUI();
  });
})();
