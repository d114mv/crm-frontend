import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ logout }) {
  const [leads, setLeads] = useState([])
  const [carreras, setCarreras] = useState([])
  
  // Estado para saber si estamos editando (null = modo crear)
  const [leadAEditar, setLeadAEditar] = useState(null)

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    estado: 'NUEVO',
    carrera_interes: '',
    // --- CAMPOS NUEVOS ---
    colegio: '',
    origen: 'Pagina Web' // Valor por defecto
  })

  useEffect(() => {
    fetchLeads();
    fetchCarreras();
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await axios.get('/api/leads/')
      setLeads(res.data)
    } catch (error) { console.error(error) }
  }

  const fetchCarreras = async () => {
    try {
      const res = await axios.get('/api/carreras/')
      setCarreras(res.data)
    } catch (error) { console.error(error) }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // --- LÓGICA DE EDICIÓN ---
  const cargarParaEditar = (lead) => {
    setLeadAEditar(lead.id) // Marcamos que estamos editando este ID
    setFormData({
      nombre: lead.nombre,
      apellido: lead.apellido,
      email: lead.email,
      telefono: lead.telefono,
      estado: lead.estado,
      carrera_interes: lead.carrera_interes, // Asegúrate de que Django envíe el ID aquí
      colegio: lead.colegio || '', // Si es null, ponemos string vacío
      origen: lead.origen || 'Pagina Web'
    })
    // Hacemos scroll hacia arriba para ver el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelarEdicion = () => {
    setLeadAEditar(null)
    setFormData({ nombre: '', apellido: '', email: '', telefono: '', estado: 'NUEVO', carrera_interes: '', colegio: '', origen: 'Pagina Web' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (leadAEditar) {
        // --- MODO EDICIÓN (PUT) ---
        await axios.put(`/api/leads/${leadAEditar}/`, formData)
        alert("Lead actualizado correctamente")
        setLeadAEditar(null) // Salimos del modo edición
      } else {
        // --- MODO CREACIÓN (POST) ---
        await axios.post('/api/leads/', formData)
        alert("Lead registrado correctamente")
      }
      
      fetchLeads()
      // Limpiar formulario
      setFormData({ nombre: '', apellido: '', email: '', telefono: '', estado: 'NUEVO', carrera_interes: '', colegio: '', origen: 'Pagina Web' })
    } catch (error) {
      console.error(error)
      alert("Error al guardar. Revisa la consola.")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await axios.delete(`/api/leads/${id}/`)
        fetchLeads()
      } catch (error) { console.error(error) }
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-10 flex justify-between items-center border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-500">EMI CRM</h1>
            <p className="text-slate-400 text-sm">Gestión Avanzada de Leads</p>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={logout} className="text-slate-400 hover:text-white border border-slate-600 px-3 py-2 rounded hover:bg-slate-800 transition text-sm">
              Cerrar Sesión
            </button>
            <div className="bg-blue-600 px-6 py-2 rounded-lg shadow-lg font-bold flex flex-col items-center">
              <span className="text-xs text-blue-200 uppercase">Total Leads</span>
              <span className="text-2xl">{leads.length}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- FORMULARIO ROBUSTO --- */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 h-fit">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <span>{leadAEditar ? '✏️ Editando Aspirante' : '🚀 Nuevo Registro'}</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-2">
                <input className="input-std" type="text" name="nombre" placeholder="Nombre" required value={formData.nombre} onChange={handleChange} />
                <input className="input-std" type="text" name="apellido" placeholder="Apellido" required value={formData.apellido} onChange={handleChange} />
              </div>

              {/* Contacto */}
              <input className="input-std" type="email" name="email" placeholder="Correo Electrónico" required value={formData.email} onChange={handleChange} />
              <input className="input-std" type="text" name="telefono" placeholder="Teléfono" required value={formData.telefono} onChange={handleChange} />

              {/* Información Académica (NUEVO) */}
              <div className="pt-2 border-t border-slate-700">
                <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Datos Académicos</label>
                <input className="input-std mb-2" type="text" name="colegio" placeholder="Nombre del Colegio" value={formData.colegio} onChange={handleChange} />
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Select Carrera */}
                  <select name="carrera_interes" value={formData.carrera_interes} onChange={handleChange} className="input-std" required>
                    <option value="">-- Carrera --</option>
                    {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>

                  {/* Select Origen (NUEVO) */}
                  <select name="origen" value={formData.origen} onChange={handleChange} className="input-std">
                    <option value="Pagina Web">Pagina Web</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referido">Referido</option>
                    <option value="Feria">Feria</option>
                  </select>
                </div>
              </div>

              {/* Estado (Visible solo al editar o si quieres cambiarlo manualmente) */}
              <div className="pt-2">
                 <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Estado del Lead</label>
                 <select name="estado" value={formData.estado} onChange={handleChange} className="input-std w-full bg-slate-900 border-blue-900/50">
                    <option value="NUEVO">NUEVO</option>
                    <option value="INTERESADO">INTERESADO</option>
                    <option value="EN_PROCESO">EN PROCESO</option>
                    <option value="MATRICULADO">MATRICULADO</option>
                    <option value="PERDIDO">PERDIDO</option>
                 </select>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 pt-4">
                <button type="submit" className={`flex-1 font-bold py-3 px-4 rounded-lg transition shadow-md text-white
                  ${leadAEditar ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                  {leadAEditar ? 'Actualizar Datos' : 'Guardar Aspirante'}
                </button>
                
                {leadAEditar && (
                  <button type="button" onClick={cancelarEdicion} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* --- TABLA DE DATOS --- */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
                      <th className="p-4">Aspirante</th>
                      <th className="p-4">Info Académica</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-700/50 transition duration-150 group">
                        <td className="p-4">
                          <div className="font-bold text-white">{lead.nombre} {lead.apellido}</div>
                          <div className="text-xs text-slate-400">{lead.email}</div>
                          <div className="text-xs text-slate-500">{lead.telefono}</div>
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                          <div className="text-blue-400 font-medium">{lead.nombre_carrera || 'Sin carrera'}</div>
                          <div className="text-xs text-slate-500">{lead.colegio || 'Colegio no registrado'}</div>
                          <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-300">{lead.origen}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border 
                            ${lead.estado === 'MATRICULADO' ? 'bg-green-900/30 text-green-200 border-green-800' : 
                              lead.estado === 'PERDIDO' ? 'bg-red-900/30 text-red-200 border-red-800' : 
                              'bg-blue-900/30 text-blue-200 border-blue-800'}`}>
                            {lead.estado}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {/* BOTÓN EDITAR */}
                          <button 
                            onClick={() => cargarParaEditar(lead)}
                            className="text-orange-400 hover:text-orange-200 hover:bg-orange-900/30 px-3 py-1 rounded transition text-sm"
                          >
                            Editar
                          </button>
                          {/* BOTÓN ELIMINAR */}
                          <button 
                            onClick={() => handleDelete(lead.id)}
                            className="text-red-400 hover:text-red-200 hover:bg-red-900/30 px-3 py-1 rounded transition text-sm"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS rápidos inyectados para limpiar el código JSX */}
      <style>{`
        .input-std {
          width: 100%;
          background-color: #334155; /* slate-700 */
          border: 1px solid #475569; /* slate-600 */
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          color: white;
          transition: all 0.2s;
        }
        .input-std:focus {
          outline: none;
          border-color: #3b82f6; /* blue-500 */
          ring: 2px solid #3b82f6;
        }
        .input-std::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  )
}

export default Dashboard