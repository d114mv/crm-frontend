// src/App.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
axios.defaults.baseURL = apiUrl;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token_crm') || null)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token_crm', token)
      axios.defaults.headers.common['Authorization'] = `Token ${token}`
    } else {
      localStorage.removeItem('token_crm')
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  const handleLogout = () => {
    setToken(null)
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