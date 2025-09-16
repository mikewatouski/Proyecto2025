// registro.js — usa Supabase
import { supabase } from './auth.js'

const form = document.getElementById('form-registro')

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombre = (form.nombre?.value || '').trim()
    const email  = (form.email?.value  || '').trim().toLowerCase()
    const pass   = (form.password?.value || '').trim()

    if (!nombre) return alert('Por favor ingresá tu nombre.')
    if (!email)  return alert('Por favor ingresá tu email.')
    if (!pass || pass.length < 6) return alert('La contraseña debe tener al menos 6 caracteres.')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          // metadata opcional
          data: { nombre },
          // ⚠️ CAMBIÁ esto por tu IP/puerto o túnel si lo abrís desde el celu
          // ej: 'http://192.168.0.23:5500/confirm.html' o la URL de ngrok
          emailRedirectTo: 'http://localhost:5500/confirm.html'
        }
      })
      if (error) throw error

      if (data.session) {
        // (solo si tu proyecto está en "auto-confirm"; normalmente NO)
        await supabase.from('profiles').upsert(
          { id: data.user.id, email, nombre },
          { onConflict: 'id' }
        )
        // Guardá lo que tu app espera (email o id). Tu app usa email:
        localStorage.setItem('CURRENT_USER', email)
        alert('¡Cuenta creada y sesión iniciada!')
        window.location.href = 'index.html'
      } else {
        // Caso normal: requiere confirmar desde el mail
        alert('Te enviamos un mail para confirmar la cuenta. Abrilo y luego iniciá sesión.')
      }
    } catch (err) {
      console.error(err)
      alert(err.message || 'Error al registrarte.')
    }
  })
}
