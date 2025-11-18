import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function Toast({ message, onClose }){
  if(!message) return null
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-emerald-600 text-white px-4 py-2 rounded shadow">
        <div className="flex items-center gap-3">
          <span>{message}</span>
          <button className="text-white/80 text-sm" onClick={onClose}>×</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [auth, setAuth] = useState(()=>{
    const raw = localStorage.getItem('auth')
    return raw ? JSON.parse(raw) : null
  })
  const [toast, setToast] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const onAuthed = (data)=>{
    setAuth(data)
    localStorage.setItem('auth', JSON.stringify(data))
    setToast('Login successful')
    navigate('/dashboard', { replace: true })
  }

  const logout = ()=>{
    localStorage.removeItem('auth')
    setAuth(null)
    navigate('/', { replace: true })
  }

  useEffect(()=>{
    // Guard routes
    if(!auth && location.pathname !== '/'){
      navigate('/', { replace: true })
    }
    if(auth && location.pathname === '/'){
      navigate('/dashboard', { replace: true })
    }
  }, [auth, location.pathname, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <Toast message={toast} onClose={()=>setToast('')} />
      <div className="max-w-5xl mx-auto">
        <header className="py-4 mb-6 flex items-center justify-between">
          <div className="text-white font-semibold text-lg">UniAttend</div>
          <nav className="flex items-center gap-4 text-sm">
            {auth && (
              <>
                <Link to="/dashboard" className="text-blue-200 hover:text-white">Dashboard</Link>
                <button onClick={logout} className="text-blue-200 hover:text-white">Logout</button>
              </>
            )}
          </nav>
        </header>

        {location.pathname === '/' && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Auth onAuthed={onAuthed} />
          </div>
        )}
        {location.pathname === '/dashboard' && auth && (
          <Dashboard auth={auth} onLogout={logout} />
        )}

        <footer className="mt-10 text-center text-blue-200/50 text-xs">Attendance tracker • Asia/Kolkata</footer>
      </div>
    </div>
  )
}

export default App
