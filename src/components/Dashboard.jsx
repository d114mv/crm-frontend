import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ logout }) {
  const [leads, setLeads] = useState([])
  const [carreras, setCarreras] = useState([])
  
  // Estado para Edición
  const [leadAEditar, setLeadAEditar] = useState(null)

  // --- NUEVO: ESTADOS PARA EL MODAL DE SEGUIMIENTO ---
  const [modalOpen, setModalOpen] = useState(false)
  const [leadSeleccionado, setLeadSeleccionado] = useState(null)
  const [nuevaInteraccion, setNuevaInteraccion] = useState({
    tipo: 'Llamada Telefónica',
    notas: ''
  })

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    estado: 'NUEVO', carrera_interes: '', colegio: '', origen: 'Pagina Web'
  })

  useEffect(() => {
    fetchLeads();
    fetchCarreras();
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await axios.get('/api/leads/')
      setLeads(res.data)
      
      // Si el modal está abierto, actualizamos también el lead seleccionado para ver la nota nueva al instante
      if (leadSeleccionado) {
        const leadActualizado = res.data.find(l => l.id === leadSeleccionado.id)
        setLeadSeleccionado(leadActualizado)
      }
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

  // --- FUNCIONES DEL FORMULARIO PRINCIPAL ---
  const cargarParaEditar = (lead) => {
    setLeadAEditar(lead.id)
    setFormData({
      nombre: lead.nombre, apellido: lead.apellido, email: lead.email, telefono: lead.telefono,
      estado: lead.estado, carrera_interes: lead.carrera_interes, 
      colegio: lead.colegio || '', origen: lead.origen || 'Pagina Web'
    })
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
        await axios.put(`/api/leads/${leadAEditar}/`, formData)
        alert("Lead actualizado correctamente")
        setLeadAEditar(null)
      } else {
        await axios.post('/api/leads/', formData)
        alert("Lead registrado correctamente")
      }
      fetchLeads()
      setFormData({ nombre: '', apellido: '', email: '', telefono: '', estado: 'NUEVO', carrera_interes: '', colegio: '', origen: 'Pagina Web' })
    } catch (error) { console.error(error); alert("Error al guardar.") }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await axios.delete(`/api/leads/${id}/`)
        fetchLeads()
      } catch (error) { console.error(error) }
    }
  }

  // --- FUNCIONES DE INTERACCIONES (SEGUIMIENTO) ---
  const abrirSeguimiento = (lead) => {
    setLeadSeleccionado(lead)
    setModalOpen(true)
    setNuevaInteraccion({ tipo: 'Llamada Telefónica', notas: '' })
  }

  const guardarInteraccion = async (e) => {
    e.preventDefault()
    if(!nuevaInteraccion.notas) return alert("Escribe una nota primero")

    try {
      await axios.post('/api/interacciones/', {
        lead: leadSeleccionado.id,
        tipo: nuevaInteraccion.tipo,
        notas: nuevaInteraccion.notas,
        // Django pone la fecha automática (auto_now_add)
      })
      alert("Seguimiento guardado")
      setNuevaInteraccion({ tipo: 'Llamada Telefónica', notas: '' })
      fetchLeads() // Recarga para ver la nueva nota en la lista
    } catch (error) {
      console.error(error)
      alert("Error guardando interacción")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-10 flex justify-between items-center border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-500">EMI CRM</h1>
            <p className="text-slate-400 text-sm">Gestión Avanzada de Leads</p>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={logout} className="text-slate-400 hover:text-white border border-slate-600 px-3 py-2 rounded hover:bg-slate-800 transition text-sm">Cerrar Sesión</button>
            <div className="bg-blue-600 px-6 py-2 rounded-lg shadow-lg font-bold flex flex-col items-center">
              <span className="text-xs text-blue-200 uppercase">Total</span>
              <span className="text-2xl">{leads.length}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULARIO */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 h-fit">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <span>{leadAEditar ? '✏️ Editando' : '🚀 Nuevo Registro'}</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <input className="input-std" type="text" name="nombre" placeholder="Nombre" required value={formData.nombre} onChange={handleChange} />
                <input className="input-std" type="text" name="apellido" placeholder="Apellido" required value={formData.apellido} onChange={handleChange} />
              </div>
              <input className="input-std" type="email" name="email" placeholder="Correo" required value={formData.email} onChange={handleChange} />
              <input className="input-std" type="text" name="telefono" placeholder="Teléfono" required value={formData.telefono} onChange={handleChange} />
              
              <div className="pt-2 border-t border-slate-700">
                <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Datos Académicos</label>
                <input className="input-std mb-2" type="text" name="colegio" placeholder="Colegio" value={formData.colegio} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-2">
                  <select name="carrera_interes" value={formData.carrera_interes} onChange={handleChange} className="input-std" required>
                    <option value="">-- Carrera --</option>
                    {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <select name="origen" value={formData.origen} onChange={handleChange} className="input-std">
                    <option value="Pagina Web">Pagina Web</option>
                    <option value="Facebook Ads">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referido">Referido</option>
                    <option value="Feria">Feria</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                 <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Estado</label>
                 <select name="estado" value={formData.estado} onChange={handleChange} className="input-std w-full bg-slate-900 border-blue-900/50">
                    <option value="NUEVO">NUEVO</option>
                    <option value="INTERESADO">INTERESADO</option>
                    <option value="EN_PROCESO">EN PROCESO</option>
                    <option value="MATRICULADO">MATRICULADO</option>
                    <option value="PERDIDO">PERDIDO</option>
                 </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className={`flex-1 font-bold py-3 px-4 rounded-lg transition shadow-md text-white ${leadAEditar ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                  {leadAEditar ? 'Actualizar' : 'Guardar'}
                </button>
                {leadAEditar && <button type="button" onClick={cancelarEdicion} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg">Cancelar</button>}
              </div>
            </form>
          </div>

          {/* TABLA */}
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
                          <div className="text-blue-400 font-medium">{lead.nombre_carrera}</div>
                          <div className="text-xs text-slate-500">{lead.colegio}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${lead.estado === 'MATRICULADO' ? 'bg-green-900/30 text-green-200 border-green-800' : lead.estado === 'PERDIDO' ? 'bg-red-900/30 text-red-200 border-red-800' : 'bg-blue-900/30 text-blue-200 border-blue-800'}`}>{lead.estado}</span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          {/* BOTÓN SEGUIMIENTO */}
                          <button onClick={() => abrirSeguimiento(lead)} className="text-cyan-400 hover:text-cyan-200 hover:bg-cyan-900/30 px-3 py-1 rounded transition text-sm flex items-center gap-1">
                            <span>💬</span> Seguimiento
                          </button>
                          
                          <button onClick={() => cargarParaEditar(lead)} className="text-orange-400 hover:text-orange-200 hover:bg-orange-900/30 px-3 py-1 rounded transition text-sm">Editar</button>
                          <button onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-200 hover:bg-red-900/30 px-3 py-1 rounded transition text-sm">Eliminar</button>
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

      {/* --- MODAL DE SEGUIMIENTO --- */}
      {modalOpen && leadSeleccionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-600 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Historial de {leadSeleccionado.nombre}</h3>
                <p className="text-sm text-slate-400">Registra llamadas, reuniones y notas.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>

            {/* Modal Body (Scrollable History) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-800/50">
              {leadSeleccionado.interacciones && leadSeleccionado.interacciones.length > 0 ? (
                leadSeleccionado.interacciones.map((interaccion, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-full bg-slate-700 rounded-t"></div>
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs shadow-lg z-10">
                         {interaccion.tipo === 'Llamada Telefónica' ? '📞' : interaccion.tipo === 'Mensaje de WhatsApp' ? '📱' : '📝'}
                      </div>
                      <div className="w-2 h-full bg-slate-700 rounded-b"></div>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg flex-1 border border-slate-600">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-blue-300">{interaccion.tipo}</span>
                        <span className="text-xs text-slate-400">{new Date(interaccion.fecha_creacion).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-200 text-sm">{interaccion.notas}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 italic">
                  No hay interacciones registradas aún. ¡Sé el primero en contactar!
                </div>
              )}
            </div>

            {/* Modal Footer (Formulario) */}
            <div className="bg-slate-900 p-4 border-t border-slate-700">
              <form onSubmit={guardarInteraccion} className="flex gap-2 items-start">
                <select 
                  className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  value={nuevaInteraccion.tipo}
                  onChange={(e) => setNuevaInteraccion({...nuevaInteraccion, tipo: e.target.value})}
                >
                  <option>Llamada Telefónica</option>
                  <option>Mensaje de WhatsApp</option>
                  <option>Correo Electrónico</option>
                  <option>Reunión Presencial</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Escribe una nota sobre la interacción..." 
                  className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={nuevaInteraccion.notas}
                  onChange={(e) => setNuevaInteraccion({...nuevaInteraccion, notas: e.target.value})}
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .input-std {
          width: 100%; background-color: #334155; border: 1px solid #475569;
          border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: white; transition: all 0.2s;
        }
        .input-std:focus { outline: none; border-color: #3b82f6; ring: 2px solid #3b82f6; }
      `}</style>
    </div>
  )
}

export default Dashboard