import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Test from './Test'
import './index.css'

function RequireAuth({ children }){
  const raw = localStorage.getItem('auth')
  const auth = raw ? JSON.parse(raw) : null
  if(!auth){
    return <Navigate to="/" replace />
  }
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<RequireAuth><App /></RequireAuth>} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
