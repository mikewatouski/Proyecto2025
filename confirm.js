// confirm.js (MÓDULO)
import { supabase } from './auth.js'

const $msg = document.getElementById('msg')

;(async () => {
  try {
    // Supabase v2: intercambia el code del URL por la sesión
    const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)

    if (error) {
      console.error(error)
      $msg.textContent = 'Hubo un problema al confirmar tu cuenta: ' + error.message
      return
    }

    $msg.textContent = '¡Cuenta confirmada! Redirigiendo…'
    // Si querés, guardá algo en tu localStorage para tu UI actual:
    const email = data?.user?.email || ''
    if (email) localStorage.setItem('CURRENT_USER', email)

    setTimeout(() => { window.location.href = 'index.html' }, 1200)
  } catch (e) {
    console.error(e)
    $msg.textContent = 'Error inesperado durante la confirmación.'
  }
})()
