// src/components/Login.jsx
import { useState } from 'react'
import axios from 'axios'

function Login({ setToken }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api-token-auth/', {
        username: username,
        password: password
      })
      
      const tokenRecibido = response.data.token
      
      setToken(tokenRecibido)
      
    } catch (err) {
      console.error(err)
      setError('Credenciales incorrectas. Intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-500 mb-2">Bienvenido</h1>
          <p className="text-slate-400">Ingresa tus credenciales del Sistema</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Usuario</label>
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="Ej. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Contraseña</label>
            <input 
              type="password" 
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.02]"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login