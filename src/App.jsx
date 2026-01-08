// src/App.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

// 1. Configurar URL Base
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
axios.defaults.baseURL = apiUrl;

function App() {
  // 2. Leemos el token
  const [token, setToken] = useState(localStorage.getItem('token_crm') || null)

  // --- CORRECCIÓN CRÍTICA ---
  // Configuramos Axios INMEDIATAMENTE si hay token, sin esperar al useEffect.
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
  // ---------------------------

  useEffect(() => {
    // Solo usamos este efecto para guardar/borrar en localStorage cuando cambia
    if (token) {
      localStorage.setItem('token_crm', token)
    } else {
      localStorage.removeItem('token_crm')
    }
  }, [token])

  const handleLogout = () => {
    setToken(null)
    // Forzamos recarga para limpiar estados de memoria
    window.location.reload()
  }

  return (
    <>
      {token ? (
        <Dashboard logout={handleLogout} /> 
      ) : (
        <Login setToken={setToken} />
      )}
    </>
  )
}

export default App