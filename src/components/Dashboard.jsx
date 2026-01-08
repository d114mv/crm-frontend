import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ logout }) {
  const [leads, setLeads] = useState([])
  const [carreras, setCarreras] = useState([])
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    estado: 'NUEVO',
    carrera_interes: ''
  })

  useEffect(() => {
    fetchLeads();
    fetchCarreras();
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/leads/')
      setLeads(res.data)
    } catch (error) { console.error(error) }
  }

  const fetchCarreras = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/carreras/')
      setCarreras(res.data)
    } catch (error) { console.error(error) }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://127.0.0.1:8000/api/leads/', formData)
      alert("Lead registrado correctamente")
      fetchLeads()
      setFormData({ nombre: '', apellido: '', email: '', telefono: '', estado: 'NUEVO', carrera_interes: '' })
    } catch (error) {
      console.error(error)
      alert("Error al guardar. Verifica que seleccionaste una carrera.")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Confirmas la eliminación?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/leads/${id}/`)
        fetchLeads()
      } catch (error) { console.error(error) }
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER CON BOTÓN DE LOGOUT Y KPI */}
        <header className="mb-10 flex justify-between items-center border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-500">EMI CRM</h1>
            <p className="text-slate-400 text-sm">Gestión de Admisiones e Interesados</p>
          </div>
          
          <div className="flex gap-4 items-center">
            {/* Botón Cerrar Sesión */}
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-white font-medium text-sm border border-slate-600 px-3 py-2 rounded hover:bg-slate-800 transition"
            >
              Cerrar Sesión
            </button>

            {/* Tarjeta de contador */}
            <div className="bg-blue-600 px-6 py-2 rounded-lg shadow-lg font-bold flex flex-col items-center">
              <span className="text-xs text-blue-200 uppercase">Total Leads</span>
              <span className="text-2xl">{leads.length}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 h-fit">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <span>🚀</span> Nuevo Registro
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition text-white placeholder-slate-400"
                  type="text" name="nombre" placeholder="Nombre" required 
                  value={formData.nombre} onChange={handleChange} 
                />
                <input 
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition text-white placeholder-slate-400"
                  type="text" name="apellido" placeholder="Apellido" required 
                  value={formData.apellido} onChange={handleChange}
                />
              </div>

              <input 
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition text-white placeholder-slate-400"
                type="email" name="email" placeholder="Correo Electrónico" required 
                value={formData.email} onChange={handleChange}
              />
              
              <input 
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition text-white placeholder-slate-400"
                type="text" name="telefono" placeholder="Teléfono / WhatsApp" required 
                value={formData.telefono} onChange={handleChange}
              />

              {/* SELECT DINÁMICO DE CARRERAS */}
              <div className="relative">
                <select 
                  name="carrera_interes" 
                  value={formData.carrera_interes} 
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition text-white appearance-none cursor-pointer"
                  required
                >
                  <option value="">-- Selecciona una Carrera --</option>
                  {carreras.map(carrera => (
                    <option key={carrera.id} value={carrera.id}>
                      {carrera.nombre}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-md mt-4"
              >
                Guardar Aspirante
              </button>
            </form>
          </div>

          {/* COLUMNA DERECHA: TABLA DE DATOS */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
                      <th className="p-4 font-medium">Aspirante</th>
                      <th className="p-4 font-medium">Carrera</th>
                      <th className="p-4 font-medium">Estado</th>
                      <th className="p-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-700/50 transition duration-150 group">
                        <td className="p-4">
                          <div className="font-bold text-white group-hover:text-blue-400 transition">{lead.nombre} {lead.apellido}</div>
                          <div className="text-xs text-slate-400">{lead.email}</div>
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                          {lead.nombre_carrera || <span className="text-slate-600 italic">Sin definir</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border 
                            ${lead.estado === 'NUEVO' ? 'bg-blue-900/30 text-blue-200 border-blue-800' : 
                              lead.estado === 'MATRICULADO' ? 'bg-green-900/30 text-green-200 border-green-800' : 
                              lead.estado === 'PERDIDO' ? 'bg-red-900/30 text-red-200 border-red-800' : 
                              'bg-slate-700 text-slate-300 border-slate-600'}`}>
                            {lead.estado}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDelete(lead.id)}
                            className="text-red-400 hover:text-red-200 hover:bg-red-900/50 px-3 py-1 rounded transition text-sm"
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
    </div>
  )
}

export default Dashboard