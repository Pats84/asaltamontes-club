import { useState } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    const email = `${dni}@asaltamontes.local`

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      setError('Usuario o contraseña incorrectos')
      return
    }

    // Login correcto → Mis Datos
    navigate('/mis-datos')
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Acceso socios</h2>

      <input
        placeholder="DNI"
        value={dni}
        onChange={e => setDni(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <button type="submit">Entrar</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}