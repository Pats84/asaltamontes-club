import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const PROVINCIAS = [
  'Álava','Albacete','Alicante','Almería','Asturias','Ávila','Badajoz','Barcelona',
  'Burgos','Cáceres','Cádiz','Cantabria','Castellón','Ciudad Real','Córdoba','Cuenca',
  'Girona','Granada','Guadalajara','Guipúzcoa','Huelva','Huesca','Islas Baleares',
  'Jaén','La Coruña','La Rioja','Las Palmas','León','Lleida','Lugo','Madrid','Málaga',
  'Murcia','Navarra','Ourense','Palencia','Pontevedra','Salamanca','Santa Cruz de Tenerife',
  'Segovia','Sevilla','Soria','Tarragona','Teruel','Toledo','Valencia','Valladolid',
  'Vizcaya','Zamora','Zaragoza'
]

const LICENCIAS_POR_FEDERACION = {
  FMRM: ['A','B','C','D','E','OT','AU','HAB'],
  FEDME: ['A','B','C','D','E','OT','AU','HAB'],
  FERM: ['BÁSICA A','BÁSICA B','BÁSICA B1','PLUS A','PLUS B','PLUS B1']
}

export default function MisDatos() {
  const [form, setForm] = useState(null)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('socios')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setForm(data)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const guardarCambios = async (e) => {
    e.preventDefault()
    setMensaje('')

    const { error } = await supabase
      .from('socios')
      .update({
        nombre: form.nombre,
        apellidos: form.apellidos,
        email: form.email,
        fecha_nacimiento: form.fecha_nacimiento,
        telefono: form.telefono,
        provincia: form.provincia,
        federacion: form.federacion,
        tipo_licencia: form.tipo_licencia,
        categoria: form.categoria
      })
      .eq('id', form.id)

    if (error) {
      setMensaje(error.message)
      return
    }

    setMensaje('Datos guardados correctamente')
  }

  if (!form) return <p>Cargando datos…</p>

  return (
    <form onSubmit={guardarCambios}>
      <h2>Mis datos</h2>

      <input value={form.dni} disabled />

      <input
        name="email"
        placeholder="Correo electrónico"
        value={form.email || ''}
        onChange={handleChange}
        required
      />

      <input
        name="nombre"
        placeholder="Nombre"
        value={form.nombre || ''}
        onChange={handleChange}
        required
      />

      <input
        name="apellidos"
        placeholder="Apellidos"
        value={form.apellidos || ''}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="fecha_nacimiento"
        value={form.fecha_nacimiento || ''}
        onChange={handleChange}
        required
      />

      <input
        name="telefono"
        placeholder="Teléfono"
        value={form.telefono || ''}
        onChange={handleChange}
        required
      />

      <select
        name="provincia"
        value={form.provincia || ''}
        onChange={handleChange}
        required
      >
        <option value="">Provincia</option>
        {PROVINCIAS.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        name="federacion"
        value={form.federacion}
        onChange={handleChange}
        required
      >
        <option value="FMRM">FMRM</option>
        <option value="FEDME">FEDME</option>
        <option value="FERM">FERM</option>
      </select>

      <select
        name="tipo_licencia"
        value={form.tipo_licencia}
        onChange={handleChange}
        required
      >
        <option value="">Tipo de licencia</option>
        {LICENCIAS_POR_FEDERACION[form.federacion].map(l => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <select
        name="categoria"
        value={form.categoria}
        onChange={handleChange}
        required
      >
        <option value="">Categoría</option>
        <option value="Infantil">Infantil</option>
        <option value="Juvenil">Juvenil</option>
        <option value="Adultos">Adultos</option>
        <option value="Tecnicos">Técnicos</option>
        <option value="Arbitros">Árbitros</option>
      </select>

      <button type="submit">Guardar cambios</button>

      {mensaje && <p>{mensaje}</p>}
    </form>
  )
}