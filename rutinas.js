/* =========================================================
   RUTINAS – Lógica de UI + Estado (server fetch + localStorage cache)
   ========================================================= */

const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const STORAGE_KEY = "rutinas:data:v1";

/* ---------- Estado ---------- */
let data = loadData();               // carga base (y luego actualiza con fetch)
let mode = "view";                   // 'view' | 'edit'
let day = DAYS[0];                   // día activo (arranca en Lunes)
let lastDayView = DAYS[0];           // último día usado en Rutina (vista)
let lastDayEdit = DAYS[0];           // último día usado en Editar
let idx = 0;                         // index de ejercicio en "view"

/* ---------- Referencias DOM ---------- */
// Toggle modo
const pillView  = document.querySelector('.pill[data-mode="view"]');
const pillEdit  = document.querySelector('.pill[data-mode="edit"]');
const modeView  = document.getElementById('mode-view');
const modeEdit  = document.getElementById('mode-edit');

// Viewer (modo vista)
const tituloEj  = document.getElementById('titulo-ejercicio');
const imgEj     = document.getElementById('img-ejercicio');
const metaNom   = document.getElementById('meta-nombre');
const metaPeso  = document.getElementById('meta-peso');
const metaReps  = document.getElementById('meta-reps');
const metaSets  = document.getElementById('meta-sets'); // Series
const btnPrev   = document.getElementById('prev');
const btnNext   = document.getElementById('next');
const listaView = document.getElementById('lista-view');
const dayBtnsView = document.querySelectorAll('.day[data-dia]');

// Editor (modo editar)
const editDiaSpan = document.getElementById('edit-dia');
const dayBtnsEdit = document.querySelectorAll('.day[data-dia-edit]');
const rowsWrap    = document.getElementById('form-rows');
const btnAdd      = document.getElementById('btn-add');
const btnSave     = document.getElementById('btn-save');
const listaEdit   = document.getElementById('lista-edit');

/* =========================================================
   INIT
   ========================================================= */
attachEvents();
renderAll();

/* =========================================================
   Eventos
   ========================================================= */

function attachEvents(){
  // Toggle modo
  pillView.addEventListener('click', ()=> setMode('view'));
  pillEdit.addEventListener('click', ()=> setMode('edit'));

  // Día (vista)
  dayBtnsView.forEach(b=>{
    b.addEventListener('click', ()=>{
      day = b.dataset.dia;
      lastDayView = day;
      idx = 0;
      markActiveDay(dayBtnsView, day, 'dia');
      renderView();
    });
  });

  // Día (editor)
  dayBtnsEdit.forEach(b=>{
    b.addEventListener('click', ()=>{
      day = b.dataset.diaEdit;
      lastDayEdit = day;
      idx = 0;
      editDiaSpan.textContent = day;
      markActiveDay(dayBtnsEdit, day, 'diaEdit');
      renderEdit();
      renderLists();
    });
  });

  // Navegación ejercicios
  btnPrev.addEventListener('click', ()=> {
    const arr = getDayList();
    if (!arr.length) return;
    idx = (idx - 1 + arr.length) % arr.length;
    renderViewer();
  });
  btnNext.addEventListener('click', ()=> {
    const arr = getDayList();
    if (!arr.length) return;
    idx = (idx + 1) % arr.length;
    renderViewer();
  });

  // Agregar fila en editor
  btnAdd.addEventListener('click', ()=>{
    const arr = getDayList();
    arr.push({ nombre:"Nuevo ejercicio", peso:0, sets:3, reps:8, img:"" });
    idx = Math.max(0, arr.length - 1);
    renderEdit();
    renderLists();
  });

  // Guardar (persistencia real en plan.js vía fetch)
  btnSave.addEventListener('click', ()=>{
    saveData();
    pulse(btnSave);
  });
}

/* =========================================================
   Render
   ========================================================= */

function renderAll(){
  // Toggle UI
  setMode(mode, {skipRender:true});
  // Marca día por defecto en ambos
  markActiveDay(dayBtnsView, day, 'dia');
  markActiveDay(dayBtnsEdit, day, 'diaEdit');
  editDiaSpan.textContent = day;
  // Renders
  renderViewer();
  renderLists();
  renderEdit();
}

function setMode(nextMode, opts={}){
  mode = nextMode;
  pillView.classList.toggle('active', mode === 'view');
  pillEdit.classList.toggle('active', mode === 'edit');
  modeView.classList.toggle('visible', mode === 'view');
  modeEdit.classList.toggle('visible', mode === 'edit');

  if (!opts.skipRender){
    if (mode === 'view') {
      day = lastDayView || DAYS[0];
      idx = 0;
      markActiveDay(dayBtnsView, day, 'dia');
      renderView();
    } else {
      day = lastDayEdit || DAYS[0];
      idx = 0;
      editDiaSpan.textContent = day;
      markActiveDay(dayBtnsEdit, day, 'diaEdit');
      renderEdit();
      renderLists();
    }
  }
}

function renderView(){
  renderViewer();
  renderLists();
}

function renderViewer(){
  const arr = getDayList();
  if (!arr.length){
    tituloEj.textContent = `Ejercicio: —`;
    metaNom.textContent  = '—';
    metaPeso.textContent = '—';
    metaReps.textContent = '—';
    if (metaSets) metaSets.textContent = '—';
    imgEj.src = '';
    imgEj.style.display = 'none';
    return;
  }
  idx = clamp(idx, 0, arr.length-1);
  const ex = arr[idx];

  tituloEj.textContent = `Ejercicio: ${ex.nombre || '—'}`;
  metaNom.textContent  = ex.nombre || '—';
  metaPeso.textContent = safeNum(ex.peso);
  metaReps.textContent = safeNum(ex.reps);
  if (metaSets) metaSets.textContent = safeNum(ex.sets ?? 3);

  if (ex.img){
    imgEj.src = ex.img;
    imgEj.alt = ex.nombre || 'Ejercicio';
    imgEj.style.display = 'block';
    imgEj.onerror = ()=>{ imgEj.style.display='none'; };
  } else {
    imgEj.src = '';
    imgEj.style.display = 'none';
  }
}

function renderLists(){
  // Vista (lista)
  const arr = getDayList();
  listaView.innerHTML = arr.length
    ? `<ol class="list-ol">${arr.map(li =>
        `<li>${escapeHtml(li.nombre)} - ${safeNum(li.peso)} kg • ${safeNum(li.sets ?? 3)}x${safeNum(li.reps)}</li>`
      ).join('')}</ol>`
    : `<p class="muted">No hay ejercicios cargados para ${day}.</p>`;

  // Editor (preview)
  listaEdit.innerHTML = arr.length
    ? `<ol class="list-ol">${arr.map(li =>
        `<li>${escapeHtml(li.nombre)} - ${safeNum(li.peso)} kg • ${safeNum(li.sets ?? 3)}x${safeNum(li.reps)}</li>`
      ).join('')}</ol>`
    : `<p class="muted">Agregá ejercicios para ${day}.</p>`;
}

function renderEdit(){
  const arr = getDayList();
  rowsWrap.innerHTML = '';

  if (!arr.length){
    rowsWrap.innerHTML = `<p class="muted">No hay ejercicios. Presioná <strong>Agregar ejercicio</strong>.</p>`;
    return;
  }

  arr.forEach((ex, i)=>{
    const row = document.createElement('div');
    row.className = 'form-row fade-in';
    row.innerHTML = `
      <input class="input" type="text"   placeholder="Ejercicio"     value="${escapeAttr(ex.nombre)}">
      <input class="input" type="number" placeholder="Peso (kg)"     value="${Number(ex.peso) || 0}" min="0" step="1">
      <input class="input" type="number" placeholder="Series"        value="${Number(ex.sets) || 3}" min="1" step="1">
      <input class="input" type="number" placeholder="Reps"          value="${Number(ex.reps) || 0}" min="1" step="1">
      <input class="input" type="text"   placeholder="Imagen (URL)"  value="${escapeAttr(ex.img || '')}">
      <button class="btn btn-danger" type="button" aria-label="Eliminar">Eliminar</button>
    `;
    const [inpNom, inpPeso, inpSets, inpReps, inpImg, btnDel] = row.querySelectorAll('input,button');

    // Handlers por fila
    inpNom.addEventListener('input',  e=>{ ex.nombre = e.target.value;              syncAfterEdit(i); });
    inpPeso.addEventListener('input', e=>{ ex.peso   = toNumber(e.target.value, 0); syncAfterEdit(i); });
    inpSets.addEventListener('input', e=>{ ex.sets   = toNumber(e.target.value, 3); syncAfterEdit(i); });
    inpReps.addEventListener('input', e=>{ ex.reps   = toNumber(e.target.value, 8); syncAfterEdit(i); });
    inpImg.addEventListener('input',  e=>{ ex.img    = e.target.value.trim();       syncAfterEdit(i); });

    btnDel.addEventListener('click', ()=>{
      const list = getDayList();
      list.splice(i,1);
      idx = 0;
      renderEdit();
      renderView();
      saveData();
    });

    rowsWrap.appendChild(row);
  });
}

/* =========================================================
   Helpers
   ========================================================= */

function getDayList(){
  if (!data[day]) data[day] = [];
  // Migración suave: si falta sets, asignar 3
  data[day].forEach(ex => {
    if (typeof ex.sets !== 'number' || !Number.isFinite(ex.sets)) ex.sets = 3;
  });
  return data[day];
}

function setDayList(newArr){ data[day] = newArr; }

function markActiveDay(nodeList, current, attr){
  nodeList.forEach(b=>{
    const val = b.dataset[attr];
    b.classList.toggle('active', val === current);
  });
}

function clamp(n, min, max){ return Math.min(Math.max(n, min), max); }
function toNumber(v, def=0){ const n = Number(v); return Number.isFinite(n) ? n : def; }
function safeNum(v){ const n = Number(v); return Number.isFinite(n) ? n : 0; }

function escapeHtml(str=''){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function escapeAttr(str=''){ return escapeHtml(str).replace(/"/g,'&quot;'); }

function pulse(el){
  el.style.transform = 'scale(0.98)';
  setTimeout(()=> el.style.transform = '', 140);
}

/* Guardado automático ligero tras editar inputs */
function syncAfterEdit(i){
  renderLists();
  if (idx === i) renderViewer();
  saveDataDebounced();
}

/* =========================================================
   Fetch al servidor + cache local
   ========================================================= */

// Carga inicial: devuelve algo sincrónico (base o cache local) y en paralelo intenta traer del server.
// Cuando llega la respuesta del server, actualiza `data` y rerenderiza.
function loadData(){
  const local = tryLoadLocal();
  // intento de actualización desde server (en background)
  setTimeout(async () => {
    try{
      const r = await fetch('/api/plan');
      if (r.ok){
        const serverPlan = await r.json();
        data = serverPlan || {};
        saveDataLocalCache();
        renderAll();
      }
    }catch(_e){}
  }, 0);

  return local || basePlan();
}

// Guarda en server y también cachea local por resiliencia
function saveData(){
  saveDataLocalCache(); // cache local siempre
  fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(data)
  })
  .then(r => {
    if (!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  })
  .catch(err => {
    console.error('No se pudo guardar en servidor, quedó en localStorage:', err);
    alert('No se pudo guardar en el servidor. Quedó en localStorage.');
  });
}

// Debounce para no spamear el server
let saveTimer = null;
function saveDataDebounced(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveData, 300);
}

function saveDataLocalCache(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(_e){}
}

function tryLoadLocal(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  }catch(_e){}
  return null;
}

function basePlan(){
  return {
    "Lunes": [
      { nombre:"Press banca", peso:40, reps:10, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2kJveq9794cySMXGh6ehsJFpWybIuKfLIqw&s" },
      { nombre:"Fondos en paralelas", peso:0, reps:12, sets:3, img:"https://cdn.shopify.com/s/files/1/0269/5551/3900/files/Parallel-Dip-Bar_600x600.png?v=1619977962" },
      { nombre:"Aperturas mancuernas", peso:12, reps:12, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrabpVzpblaU1F6moowgaOi-fRtRtHqJX7cw&s" },
      { nombre:"Press francés", peso:20, reps:12, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmow6avBz9xLDXWrkmkJbmOgMUTm1KF02Qaw&s" },
      { nombre:"Flexiones", peso:0, reps:15, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVE7tL3hzV7iHS_mXrdvZMwF6uLgwrvCHNaw&s" }
    ],
    "Martes":[ 
      { nombre:"Dominadas", peso:0, reps:8,  sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZPLlcjjt940717bn-skYs5Dqi_fwtTxv9Fw&s" },
      { nombre:"Remo con barra", peso:35, reps:10, sets:3, img:"https://eresfitness.com/wp-content/uploads/00271105-Barbell-Bent-Over-Row_Back-FIX_max.webp" },
      { nombre:"Peso muerto", peso:50, reps:8,  sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOnpkWeSiPDf-7vuxYUP3EoZXYDPr4Vf5GYg&s" },
      { nombre:"Curl bíceps barra", peso:20, reps:12, sets:3, img:"https://static.strengthlevel.com/images/exercises/barbell-curl/barbell-curl-800.jpg" },
      { nombre:"Curl martillo", peso:12, reps:12, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVaRHl3zzhXaLFoW0UhI915d6KcONr-2pOAw&s" }
    ],
    "Miércoles":[
      { nombre:"Sentadilla", peso:45, reps:10, sets:3, img:"https://static.strengthlevel.com/images/exercises/squat/squat-800.jpg" },
      { nombre:"Prensa de piernas", peso:80, reps:12, sets:3, img:"https://static.strengthlevel.com/images/exercises/sled-leg-press/sled-leg-press-800.jpg" },
      { nombre:"Peso muerto rumano", peso:40, reps:12, sets:3, img:"https://cdn.shopify.com/s/files/1/0425/7667/4983/files/3_3b9d091a-c44e-4875-8a5c-58b024b403c1.png?v=1706627159" },
      { nombre:"Estocadas", peso:10, reps:12, sets:3, img:"https://eresfitness.com/wp-content/uploads/03361105-Dumbbell-Lunge_Hips_max.jpg.webp" },
      { nombre:"Elevaciones de talones", peso:20, reps:15, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjyXrWtNdJhW0X8BfWMumw25VCsl3fdhHdlw&s" }
    ],
    "Jueves":[
      { nombre:"Press militar", peso:25, reps:10, sets:3, img:"https://mundoentrenamiento.com/wp-content/uploads/2019/06/press-militar-con-mancuernas.jpg" },
      { nombre:"Elevaciones laterales", peso:8, reps:12, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrll1Mgfd3s72BZXrmYAzL-DXEi0EluYutEg&s" },
      { nombre:"Pájaros posteriores", peso:8, reps:12, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWixPAgvd9nLqxT3qrHurWhyydFPP-c19PRA&s" },
      { nombre:"Encogimientos trapecio", peso:30, reps:15, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2oQyBE16PNlgvOkgA6BskcG9VFLQodjSQVg&s" },
      { nombre:"Plancha abdominal", peso:0, reps:45, sets:3, img:"https://mejorconsalud.as.com/wp-content/uploads/2016/11/Hacer-plank-todos-los-di%CC%81as.jpg?auto=webp&quality=7500&width=1920&crop=16:9,smart,safe&format=webp&optimize=medium&dpr=2&fit=cover&fm=webp&q=75&w=1920&h=1080" },
      { nombre:"Crunch abdominal", peso:0, reps:20, sets:3, img:"https://www.mayoclinic.org/-/media/kcms/gbs/patient-consumer/images/2017/01/25/20/47/sm00047-abdominal-crunch-8col.jpg" }
    ],
    "Viernes":[
      { nombre:"Burpees", peso:0, reps:12, sets:3, img:"https://media.sitioandino.com.ar/p/f1abfb8b141b6cf85bc8824bce964bc5/adjuntos/335/imagenes/000/639/0000639943/790x0/smart/burpees-musculos-1024x622jpg.jpg" },
      { nombre:"Kettlebell swing", peso:16, reps:15, sets:3, img:"https://weighttraining.guide/wp-content/uploads/2017/03/Kettlebell-Swing-resized.png" },
      { nombre:"Sentadilla + press", peso:12, reps:12, sets:3, img:"https://media.vogue.es/photos/601c1690b77a65d7f908a0cb/master/w_1600%2Cc_limit/tabla%2520de%2520ejercicios7_Mesa%2520de%2520trabajo%25201%2520copia%25208.jpg" },
      { nombre:"Dominadas", peso:0, reps:10, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZPLlcjjt940717bn-skYs5Dqi_fwtTxv9Fw&s" },
      { nombre:"Fondos en banco", peso:0, reps:12, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKWrxwCyQvG5EMhUQNoUuICoj2-fQq9QM-Uw&s" },
      { nombre:"Cardio (cinta/bici)", peso:0, reps:20, sets:1, img:"https://www.sportvicious.com/wp-content/uploads/2019/05/%C2%BFCINTA-DE-CORRER-O-BICICLETA-EL%C3%8DPTICA-PONTE-EN-FORMA-EN-TU-HOGAR-2019-Sportvicious-700x350.jpg" }
    ],
    "Sábado":[
      { nombre:"Correr/Bici", peso:0, reps:40, sets:1, img:"https://cdn.brujulabike.com/media/50718/conversions/captura-captura-1600.jpg" },
      { nombre:"Plancha lateral", peso:0, reps:30, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx_ftFtrE6GIZebe_qQbYPZK_DtIZ7wCp2Bw&s" },
      { nombre:"Mountain climbers", peso:0, reps:20, sets:3, img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC2p0agPwrmfXcKThj00k3uWOft2A4oLnUTg&s" },
      { nombre:"Elevaciones de piernas", peso:0, reps:15, sets:3, img:"https://fitcron.com/wp-content/uploads/2024/05/04841301-Hip-Raise-bent-knee_waist_720.gif" }
    ],
    "Domingo":[
      { nombre:"Caminata/Yoga/Estiramientos", peso:0, reps:30, sets:1, img:"https://i0.wp.com/quiurevista.com/wp-content/uploads/2023/06/estiramientos-brazos.png?resize=1280%2C640&ssl=1" }
    ]
  };
}

/* ==================== Visor Ampliado (Lightbox) ==================== */
(function initLightbox(){
  const openBtn = document.getElementById('open-zoom');
  const imgSmall = document.getElementById('img-ejercicio');

  // Crear overlay una sola vez
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <div class="lightbox__imgwrap">
      <img class="lightbox__img" alt="Ejercicio ampliado"/>
      <button class="lightbox__close" aria-label="Cerrar">✕</button>
      <div class="lightbox__controls">
        <button class="ctrl" data-zoom="in">+</button>
        <button class="ctrl" data-zoom="out">−</button>
        <button class="ctrl" data-zoom="reset">⤾</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const bigImg = overlay.querySelector('.lightbox__img');
  const closeBtn = overlay.querySelector('.lightbox__close');
  const ctrls = overlay.querySelectorAll('.ctrl');

  let scale = 1;
  let pos = { x:0, y:0 };
  let dragging = false;
  let start = { x:0, y:0 };

  function open(){
    if (!imgSmall.src) return;
    bigImg.src = imgSmall.src;
    scale = 1; pos = {x:0, y:0}; applyTransform();
    overlay.classList.add('is-open');
  }
  function close(){ overlay.classList.remove('is-open'); }

  function applyTransform(){
    bigImg.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale})`;
  }

  // Zoom con botones
  ctrls.forEach(b=>{
    b.addEventListener('click', ()=>{
      const type = b.dataset.zoom;
      if (type==='in')   scale = Math.min(scale+0.2, 5);
      if (type==='out')  scale = Math.max(scale-0.2, 0.4);
      if (type==='reset'){ scale = 1; pos = {x:0,y:0}; }
      applyTransform();
    });
  });

  // Zoom con rueda
  overlay.addEventListener('wheel', (e)=>{
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * -0.1; // arriba = acerca
    scale = Math.min(Math.max(scale + delta, 0.4), 5);
    applyTransform();
  }, {passive:false});

  // Drag
  bigImg.addEventListener('mousedown', (e)=>{
    dragging = true; start.x = e.clientX - pos.x; start.y = e.clientY - pos.y;
    bigImg.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', (e)=>{
    if (!dragging) return;
    pos.x = e.clientX - start.x; pos.y = e.clientY - start.y;
    applyTransform();
  });
  window.addEventListener('mouseup', ()=>{
    dragging = false; bigImg.style.cursor = 'grab';
  });

  // Abrir/cerrar
  if (openBtn) openBtn.addEventListener('click', open);
  imgSmall.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e)=>{ if (e.target === overlay) close(); });
})();
