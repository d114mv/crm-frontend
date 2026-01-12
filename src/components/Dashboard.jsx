import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ logout }) {
  const [leads, setLeads] = useState([])
  const [carreras, setCarreras] = useState([])
  
  // Estado para Edición
  const [leadAEditar, setLeadAEditar] = useState(null)

  // Estados para Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [leadSeleccionado, setLeadSeleccionado] = useState(null)
  const [nuevaInteraccion, setNuevaInteraccion] = useState({
    tipo: 'LLAMADA',
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

  // --- FUNCIONES DEL FORMULARIO ---
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

  // --- FUNCIONES SEGUIMIENTO ---
  const abrirSeguimiento = (lead) => {
    setLeadSeleccionado(lead)
    setModalOpen(true)
    setNuevaInteraccion({ tipo: 'LLAMADA', notas: '' })
  }

  const guardarInteraccion = async (e) => {
    e.preventDefault()
    if(!nuevaInteraccion.notas) return alert("Escribe una nota primero")

    try {
      await axios.post('/api/interacciones/', {
        lead: leadSeleccionado.id,
        tipo: nuevaInteraccion.tipo,
        notas: nuevaInteraccion.notas,
      })
      alert("Seguimiento guardado")
      setNuevaInteraccion({ tipo: 'LLAMADA', notas: '' })
      fetchLeads()
    } catch (error) {
      console.error(error)
      alert("Error guardando interacción")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER EMI --- */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-slate-800 p-6 rounded-2xl shadow-lg border-b-4 border-yellow-500">
          <div className="flex items-center gap-6">
            {/* LOGO EMI */}
            <div className="bg-white p-2 rounded-lg shadow-md">
                <img 
                    src="https://emi.edu.bo/images/inicio/main.png" 
                    alt="Logo EMI" 
                    className="h-16 object-contain" 
                />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">
                EMI <span className="text-yellow-500">CONSULTAS</span>
              </h1>
              <p className="text-slate-400 text-sm uppercase tracking-widest">Unidad de Extensión y Bienestar Universitario</p>
            </div>
          </div>

          <div className="flex gap-6 items-center mt-4 md:mt-0">
            <div className="text-right hidden md:block">
               <p className="text-xs text-yellow-500 font-bold uppercase">Estado del Sistema</p>
               <p className="text-sm text-green-400 flex items-center justify-end gap-1">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En Línea
               </p>
            </div>
            
            <div className="bg-blue-900/50 px-6 py-2 rounded-lg border border-blue-800 text-center">
              <span className="text-xs text-blue-300 uppercase font-bold block">Total Registros</span>
              <span className="text-2xl font-bold text-white">{leads.length}</span>
            </div>

            <button onClick={logout} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 px-4 py-2 rounded transition text-sm font-semibold">
              Salir
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- FORMULARIO CON ESTILO MILITAR --- */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 h-fit relative overflow-hidden">
            {/* Banda Decorativa */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-yellow-500 to-blue-900"></div>

            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2 border-b border-slate-700 pb-3">
              <span className="text-2xl">{leadAEditar ? '✏️' : '📝'}</span>
              <span>{leadAEditar ? 'Editar Registro' : 'Nuevo Aspirante'}</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <input className="input-std" type="text" name="nombre" placeholder="Nombre" required value={formData.nombre} onChange={handleChange} />
                <input className="input-std" type="text" name="apellido" placeholder="Apellido" required value={formData.apellido} onChange={handleChange} />
              </div>
              <input className="input-std" type="email" name="email" placeholder="Correo Electrónico" required value={formData.email} onChange={handleChange} />
              <input className="input-std" type="text" name="telefono" placeholder="Teléfono / Celular" required value={formData.telefono} onChange={handleChange} />
              
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <label className="text-xs text-yellow-500 uppercase font-bold mb-2 block tracking-wider">Información Académica</label>
                <input className="input-std mb-2" type="text" name="colegio" placeholder="Unidad Educativa" value={formData.colegio} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-2">
                  <select name="carrera_interes" value={formData.carrera_interes} onChange={handleChange} className="input-std cursor-pointer" required>
                    <option value="">-- Carrera --</option>
                    {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <select name="origen" value={formData.origen} onChange={handleChange} className="input-std cursor-pointer">
                    <option value="Pagina Web">Pagina Web</option>
                    <option value="Facebook Ads">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referido">Referido</option>
                    <option value="Feria">Feria</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                 <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Estado Actual</label>
                 <select name="estado" value={formData.estado} onChange={handleChange} className="input-std w-full bg-slate-900 font-medium">
                    <option value="NUEVO">NUEVO</option>
                    <option value="INTERESADO">INTERESADO</option>
                    <option value="EN_PROCESO">EN PROCESO</option>
                    <option value="MATRICULADO">MATRICULADO</option>
                    <option value="PERDIDO">PERDIDO</option>
                 </select>
              </div>

              <div className="flex gap-2 pt-4">
                {/* BOTÓN EMI GOLD */}
                <button type="submit" className={`flex-1 font-bold py-3 px-4 rounded-lg transition shadow-lg text-slate-900 uppercase tracking-wide
                  ${leadAEditar ? 'bg-orange-500 hover:bg-orange-400' : 'bg-yellow-500 hover:bg-yellow-400'}`}>
                  {leadAEditar ? 'Guardar Cambios' : 'Registrar Postulante'}
                </button>
                
                {leadAEditar && (
                  <button type="button" onClick={cancelarEdicion} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg border border-slate-600">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* --- TABLA DE DATOS --- */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden min-h-full">
               {/* Header Tabla */}
               <div className="bg-blue-900/30 p-4 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Lista de Aspirantes</h3>
                  <div className="flex gap-2 text-xs">
                     <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded border border-green-800">Matriculados</span>
                     <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-800">Nuevos</span>
                  </div>
               </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
                      <th className="p-4">Postulante</th>
                      <th className="p-4">Carrera / Colegio</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-700/50 transition duration-150 group">
                        <td className="p-4">
                          <div className="font-bold text-white text-lg">{lead.nombre} {lead.apellido}</div>
                          <div className="text-xs text-yellow-500/80 mb-1">{lead.email}</div>
                          <div className="inline-flex items-center gap-1 bg-slate-700/50 px-2 py-0.5 rounded text-xs text-slate-300">
                            <span>📞</span> {lead.telefono}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                          <div className="text-blue-400 font-bold">{lead.nombre_carrera || 'Sin definir'}</div>
                          <div className="text-xs text-slate-500 mt-1 uppercase">{lead.colegio || '---'}</div>
                          <span className="text-[10px] text-slate-600 mt-1 block">{lead.origen}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm
                            ${lead.estado === 'MATRICULADO' ? 'bg-green-900/40 text-green-300 border-green-700' : 
                              lead.estado === 'PERDIDO' ? 'bg-red-900/30 text-red-300 border-red-800' : 
                              'bg-blue-900/40 text-blue-300 border-blue-700'}`}>
                            {lead.estado}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                             {/* BOTÓN SEGUIMIENTO AZUL */}
                             <button onClick={() => abrirSeguimiento(lead)} 
                                className="bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-300 border border-cyan-800/50 px-3 py-1.5 rounded transition text-xs font-bold flex items-center gap-1">
                                💬 Seg.
                             </button>
                             
                             <button onClick={() => cargarParaEditar(lead)} 
                                className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition border border-slate-600" title="Editar">
                                ✏️
                             </button>
                             <button onClick={() => handleDelete(lead.id)} 
                                className="bg-red-900/20 hover:bg-red-900/50 text-red-400 p-2 rounded transition border border-red-900/50" title="Eliminar">
                                🗑️
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center p-8 text-slate-500">
                                No hay registros. Comienza agregando uno nuevo.
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {modalOpen && leadSeleccionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl border-2 border-slate-600 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-yellow-500">📂</span> Historial: {leadSeleccionado.nombre} {leadSeleccionado.apellido}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-800">
              {leadSeleccionado.interacciones && leadSeleccionado.interacciones.length > 0 ? (
                leadSeleccionado.interacciones.map((interaccion, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-[2px] h-full bg-slate-700 group-last:h-4"></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg z-10 border-2 border-slate-600
                         ${interaccion.tipo === 'REUNION' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                         {interaccion.tipo === 'LLAMADA' ? '📞' : interaccion.tipo === 'WHATSAPP' ? '📱' : interaccion.tipo === 'EMAIL' ? '✉️' : '🤝'}
                      </div>
                      <div className="w-[2px] h-full bg-slate-700 group-last:hidden"></div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg flex-1 border border-slate-600 hover:border-slate-500 transition">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-blue-300 text-xs uppercase tracking-wider">{interaccion.tipo}</span>
                        <span className="text-[10px] text-slate-400 border border-slate-600 px-2 rounded-full">
                          {new Date(interaccion.fecha).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm">{interaccion.notas}</p>
                      <p className="text-[10px] text-slate-500 mt-2 text-right italic">Registrado por: {interaccion.usuario}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                  <p className="text-slate-500 italic">Sin historial de interacciones.</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-4 border-t border-slate-700">
              <form onSubmit={guardarInteraccion} className="flex gap-2 items-start">
                <select 
                  className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 outline-none"
                  value={nuevaInteraccion.tipo}
                  onChange={(e) => setNuevaInteraccion({...nuevaInteraccion, tipo: e.target.value})}
                >
                  <option value="LLAMADA">Llamada</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="EMAIL">Correo</option>
                  <option value="REUNION">Reunión</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Nueva nota de seguimiento..." 
                  className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 outline-none"
                  value={nuevaInteraccion.notas}
                  onChange={(e) => setNuevaInteraccion({...nuevaInteraccion, notas: e.target.value})}
                />
                <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-6 rounded-lg uppercase text-xs tracking-wider">
                  Grabar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Estilos Base */}
      <style>{`
        .input-std {
          width: 100%; background-color: #1e293b; border: 1px solid #475569;
          border-radius: 0.5rem; padding: 0.6rem 0.75rem; color: white; transition: all 0.2s;
          font-size: 0.9rem;
        }
        .input-std:focus { outline: none; border-color: #eab308; ring: 1px solid #eab308; } /* Focus Dorado EMI */
        .input-std::placeholder { color: #64748b; }
      `}</style>
    </div>
  )
}

export default Dashboard