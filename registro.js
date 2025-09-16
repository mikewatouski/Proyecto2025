import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://<project-ref>.supabase.co'
const SUPABASE_ANON_KEY = '<TU_ANON_PUBLIC_KEY>'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const form = document.getElementById('form-registro')
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = form.email.value
  const password = form.password.value

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:5500/confirm.html'
    }
  })

  if (error) {
    console.error(error)
    alert(error.message)
  } else {
    alert('Revisá tu email para confirmar la cuenta')
  }
})