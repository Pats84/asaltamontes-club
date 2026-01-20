import { useState } from 'react'
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

export default function Register() {
  const [form, setForm] = useState({
    dni: '',
    email: '',
    password: '',
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    telefono: '',
    provincia: '',
    federacion: '',
    tipo_licencia: '',
    categoria: '',
    complementos: [],
    federado_otro_club: false
  })

  const [archivo, setArchivo] = useState(null)
  const [mensaje, setMensaje] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'complementos') {
      setForm(prev => ({
        ...prev,
        complementos: checked
          ? [...prev.complementos, value]
          : prev.complementos.filter(c => c !== value)
      }))
      return
    }

    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }))
      return
    }

    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')

    // 1️⃣ Validación: si está federado en otro club, archivo obligatorio
    if (form.federado_otro_club && !archivo) {
      setMensaje('Debes subir la licencia si estás federado en otro club')
      return
    }

    // 2️⃣ Comprobar DNI único
    const { data: existe } = await supabase
      .from('socios')
      .select('id')
      .eq('dni', form.dni)
      .maybeSingle()

    if (existe) {
      setMensaje('Este DNI ya está registrado')
      return
    }

    // 3️⃣ Crear usuario Auth (email técnico)
    const authEmail = `${form.dni}@asaltamontes.local`

    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: authEmail,
        password: form.password
      })

    if (authError) {
      setMensaje('Error creando el usuario')
      return
    }

    const user = authData.user

    // 4️⃣ Subida básica de licencia (si aplica)
    let licencia_path = null

    if (archivo) {
      licencia_path = `${user.id}/${Date.now()}_${archivo.name}`

      const { error: uploadError } = await supabase.storage
        .from('licencias')
        .upload(licencia_path, archivo)

      if (uploadError) {
        setMensaje('Error subiendo la licencia')
        return
      }
    }

    // 5️⃣ Crear socio
    await supabase.from('socios').insert([{
      user_id: user.id,
      dni: form.dni,
      email: form.email,
      nombre: form.nombre,
      apellidos: form.apellidos,
      fecha_nacimiento: form.fecha_nacimiento,
      telefono: form.telefono,
      provincia: form.provincia,
      federacion: form.federacion,
      tipo_licencia: form.tipo_licencia,
      categoria: form.categoria,
      complementos: form.complementos,
      federado_otro_club: form.federado_otro_club,
      licencia_path,
      rol: 'SOCIO'
    }])

    setMensaje('Registro completado correctamente')
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro socio</h2>

      <input name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} required />
      <input name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} />
      <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />

      <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
      <input name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
      <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} required />
      <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />

      <select name="provincia" value={form.provincia} onChange={handleChange} required>
        <option value="">Provincia</option>
        {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <select name="federacion" value={form.federacion} onChange={handleChange} required>
        <option value="">Federación</option>
        <option value="FMRM">FMRM</option>
        <option value="FEDME">FEDME</option>
        <option value="FERM">FERM</option>
      </select>

      {form.federacion && (
        <select name="tipo_licencia" value={form.tipo_licencia} onChange={handleChange} required>
          <option value="">Tipo licencia</option>
          {LICENCIAS_POR_FEDERACION[form.federacion].map(l =>
            <option key={l} value={l}>{l}</option>
          )}
        </select>
      )}

      <select name="categoria" value={form.categoria} onChange={handleChange} required>
        <option value="">Categoría</option>
        <option value="Infantil">Infantil</option>
        <option value="Juvenil">Juvenil</option>
        <option value="Adultos">Adultos</option>
        <option value="Tecnicos">Técnicos</option>
        <option value="Arbitros">Árbitros</option>
      </select>

      <fieldset>
        <legend>Complementos (opcional)</legend>
        <label><input type="checkbox" name="complementos" value="Bicicleta" onChange={handleChange} /> Bicicleta</label>
        <label><input type="checkbox" name="complementos" value="Esquí" onChange={handleChange} /> Esquí</label>
        <label><input type="checkbox" name="complementos" value="Snow" onChange={handleChange} /> Snow</label>
      </fieldset>

      <label>
        <input
          type="checkbox"
          name="federado_otro_club"
          checked={form.federado_otro_club}
          onChange={handleChange}
        />
        Estoy federado con otro club
      </label>

      {form.federado_otro_club && (
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={e => setArchivo(e.target.files[0])}
          required
        />
      )}

      <button type="submit">Registrarse</button>

      {mensaje && <p>{mensaje}</p>}
    </form>
  )
}