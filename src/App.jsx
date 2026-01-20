import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import MisDatos from './pages/MisDatos'
import Admin from './pages/Admin'

export default function App() {
  const [pantalla, setPantalla] = useState('login')
  const [rol, setRol] = useState(null)

  const handleLogin = ({ rol }) => {
    setRol(rol)
    if (rol === 'ADMIN') setPantalla('admin')
    else setPantalla('mis-datos')
  }

  if (pantalla === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setPantalla('register')}
      />
    )
  }

  if (pantalla === 'register') {
    return <Register />
  }

  if (pantalla === 'admin') {
    return <Admin />
  }

  return <MisDatos />
}