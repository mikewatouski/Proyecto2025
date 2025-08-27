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
document.getElementById('cta').addEventListener('click', (e)=>{
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
