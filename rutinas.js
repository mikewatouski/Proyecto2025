/* =========================================================
   RUTINAS – Lógica de UI + Estado (localStorage)
   ========================================================= */

   const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
   const STORAGE_KEY = "rutinas:data:v1";
   
   /* ---------- Estado ---------- */
   let data = loadData();
   let mode = "view";                   // 'view' | 'edit'
   let day = DAYS[0];                   // día activo
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
         idx = 0;
         markActiveDay(dayBtnsView, day, 'dia');
         renderView();
       });
     });
   
     // Día (editor)
     dayBtnsEdit.forEach(b=>{
       b.addEventListener('click', ()=>{
         day = b.dataset.diaEdit;
         editDiaSpan.textContent = day;
         markActiveDay(dayBtnsEdit, day, 'diaEdit');
         renderEdit();
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
       arr.push({ nombre:"Nuevo ejercicio", peso:0, reps:8, img:"" });
       idx = Math.max(0, arr.length - 1);
       renderEdit();
       renderLists();
     });
   
     // Guardar (persistencia)
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
     // pills
     pillView.classList.toggle('active', mode === 'view');
     pillEdit.classList.toggle('active', mode === 'edit');
     // secciones
     modeView.classList.toggle('visible', mode === 'view');
     modeEdit.classList.toggle('visible', mode === 'edit');
     if (!opts.skipRender){
       if (mode === 'view') { renderView(); }
       else { renderEdit(); }
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
       ? `<ol class="list-ol">${arr.map(li => `<li>${escapeHtml(li.nombre)} - ${safeNum(li.peso)} kg x ${safeNum(li.reps)} reps</li>`).join('')}</ol>`
       : `<p class="muted">No hay ejercicios cargados para ${day}.</p>`;
   
     // Editor (preview)
     listaEdit.innerHTML = arr.length
       ? `<ol class="list-ol">${arr.map(li => `<li>${escapeHtml(li.nombre)} - ${safeNum(li.peso)} kg x ${safeNum(li.reps)} reps</li>`).join('')}</ol>`
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
         <input class="input" type="text"   placeholder="Ejercicio"   value="${escapeAttr(ex.nombre)}">
         <input class="input" type="number" placeholder="Peso (kg)"   value="${Number(ex.peso) || 0}" min="0" step="1">
         <input class="input" type="number" placeholder="Reps"        value="${Number(ex.reps) || 0}" min="1" step="1">
         <input class="input" type="text"   placeholder="Imagen (URL)" value="${escapeAttr(ex.img || '')}">
         <button class="btn btn-danger" type="button" aria-label="Eliminar">Eliminar</button>
       `;
       const [inpNom, inpPeso, inpReps, inpImg, btnDel] = row.querySelectorAll('input,button');
   
       // Handlers por fila
       inpNom.addEventListener('input',  e=>{ ex.nombre = e.target.value; syncAfterEdit(i); });
       inpPeso.addEventListener('input', e=>{ ex.peso   = toNumber(e.target.value, 0); syncAfterEdit(i); });
       inpReps.addEventListener('input', e=>{ ex.reps   = toNumber(e.target.value, 8); syncAfterEdit(i); });
       inpImg.addEventListener('input',  e=>{ ex.img    = e.target.value.trim(); syncAfterEdit(i); });
   
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
     return data[day];
   }
   
   function setDayList(newArr){
     data[day] = newArr;
   }
   
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
     // Re-render preview y vista (si corresponde)
     renderLists();
     if (idx === i) renderViewer();
     saveDataDebounced();
   }
   
   function loadData(){
     try{
       const raw = localStorage.getItem(STORAGE_KEY);
       if (raw) return JSON.parse(raw);
     }catch(_e){}
     // Datos de ejemplo
     return {
       "Lunes": [
         { nombre:"Press banca",        peso:40, reps:10, img:"" },
         { nombre:"Remo con barra",     peso:35, reps:12, img:"" }
       ],
       "Martes":[],
       "Miércoles":[],
       "Jueves":[],
       "Viernes":[],
       "Sábado":[],
       "Domingo":[]
     };
   }
   
   function saveData(){
     try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(_e){}
   }
   
   /* Debounce simple para no saturar localStorage */
   let saveTimer = null;
   function saveDataDebounced(){
     clearTimeout(saveTimer);
     saveTimer = setTimeout(saveData, 300);
   }
   