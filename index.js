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
