// perfil.js — con foto de perfil en Supabase Storage (jpg/png/webp)
import { supabase } from './auth.js'

const form           = document.getElementById('profileForm')
const btnLogout      = document.getElementById('logoutBtn')
const btnDelete      = document.getElementById('deleteBtn')
const avatarImg      = document.getElementById('avatarImg')
const avatarFallback = document.getElementById('avatarFallback')
const avatarInput    = document.getElementById('avatarInput')   // <input type="file" id="avatarInput">

const $ = (name) => form.elements[name]
const AVATAR_BUCKET = 'avatars'     // bucket en Supabase (recomendado público)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] // formatos permitidos
const MAX_MB = 5

let user = null
let currentAvatarUrl = null   // conserva la foto previa si no se sube una nueva

// ===== helpers =====
function fileExt(file) {
  const n = file.name || ''
  const parts = n.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg'
}

async function uploadAvatar(file) {
  // validaciones
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato no permitido. Usá JPG, PNG o WEBP.')
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`El archivo supera ${MAX_MB} MB`)
  }

  const ext = fileExt(file)
  // ruta única para evitar cache: userId/timestamp.ext
  const path = `${user.id}/${Date.now()}.${ext}`

  const { error: upErr } = await supabase
    .storage.from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type || 'image/jpeg'
    })

  if (upErr) throw upErr

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// Preview local inmediato
avatarInput?.addEventListener('change', () => {
  const f = avatarInput.files?.[0]
  if (!f) return
  const url = URL.createObjectURL(f)
  avatarImg.src = url
  avatarImg.style.display = 'block'
  avatarFallback.style.display = 'none'
})

// ===== CARGA INICIAL =====
async function load() {
  const { data: { user: u }, error } = await supabase.auth.getUser()
  if (error || !u) {
    alert('Tenés que iniciar sesión.')
    location.href = 'login.html'
    return
  }
  user = u
  avatarFallback.textContent = (u.email?.[0] || 'U').toLowerCase()

  const { data: row, error: selErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (selErr) {
    console.error(selErr)
    alert('Error cargando tu perfil.')
    return
  }

  $('email').value       = user.email || ''
  $('nombre').value      = row?.nombre      ?? ''
  $('deporte').value     = row?.deporte     ?? ''
  $('objetivo').value    = row?.objetivo    ?? ''
  $('dificultad').value  = row?.dificultad  ?? ''
  $('edad').value        = row?.edad        ?? ''
  $('peso').value        = row?.peso        ?? ''
  $('altura').value      = row?.altura      ?? ''

  currentAvatarUrl = row?.avatar_url ?? null
  if (currentAvatarUrl) {
    avatarImg.src = currentAvatarUrl
    avatarImg.style.display = 'block'
    avatarFallback.style.display = 'none'
  } else {
    avatarImg.style.display = 'none'
    avatarFallback.style.display = 'grid'
  }
}

load()

// ===== GUARDAR PERFIL =====
form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!user) return

  const nombre = $('nombre').value.trim()
  if (!nombre) return alert('Ingresá tu nombre.')

  try {
    // 1) si seleccionó nuevo archivo, lo subo
    let avatarUrl = currentAvatarUrl
    const file = avatarInput?.files?.[0]
    if (file) {
      avatarUrl = await uploadAvatar(file)
    }

    // 2) upsert perfil (⚠️ corregido: usar avatarUrl)
    const payload = {
      id: user.id,
      email: user.email,
      nombre,
      deporte: $('deporte').value.trim(),
      objetivo: $('objetivo').value,
      dificultad: $('dificultad').value,
      edad: $('edad').value ? Number($('edad').value) : null,
      peso: $('peso').value ? Number($('peso').value) : null,
      altura: $('altura').value ? Number($('altura').value) : null,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })

    if (error) throw error

    currentAvatarUrl = avatarUrl
    if (avatarUrl) {
      avatarImg.src = avatarUrl
      avatarImg.style.display = 'block'
      avatarFallback.style.display = 'none'
    }

    alert('Perfil guardado ✅')
  } catch (err) {
    console.error(err)
    alert('No pude guardar los cambios: ' + (err?.message || 'Error'))
  }
})

// ===== CERRAR SESIÓN =====
btnLogout?.addEventListener('click', async () => {
  if (!confirm('¿Cerrar sesión?')) return
  await supabase.auth.signOut()
  localStorage.removeItem('CURRENT_USER')
  location.href = 'login.html'
})

// ===== BORRAR PERFIL (NO borra la cuenta de Auth) =====
btnDelete?.addEventListener('click', async () => {
  if (!user) return
  if (!confirm('Esto borra tu PERFIL (no la cuenta). ¿Continuar?')) return

  const { error } = await supabase.from('profiles').delete().eq('id', user.id)
  if (error) {
    console.error(error)
    return alert('No pude borrar el perfil: ' + error.message)
  }

  alert('Perfil borrado. Cerrando sesión…')
  await supabase.auth.signOut()
  localStorage.removeItem('CURRENT_USER')
  location.href = 'login.html'
})
