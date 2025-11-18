import { useEffect, useState } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const [auth, setAuth] = useState(()=>{
    const raw = localStorage.getItem('auth')
    return raw ? JSON.parse(raw) : null
  })

  const onAuthed = (data)=>{
    setAuth(data)
    localStorage.setItem('auth', JSON.stringify(data))
  }

  const logout = ()=>{
    localStorage.removeItem('auth')
    setAuth(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="py-4 mb-6 flex items-center justify-between">
          <div className="text-white font-semibold text-lg">UniAttend</div>
          {auth && (<button onClick={logout} className="text-blue-200 hover:text-white text-sm">Logout</button>)}
        </header>

        {!auth ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Auth onAuthed={onAuthed} />
          </div>
        ) : (
          <Dashboard auth={auth} onLogout={logout} />
        )}

        <footer className="mt-10 text-center text-blue-200/50 text-xs">Attendance tracker • Asia/Kolkata</footer>
      </div>
    </div>
  )
}

export default App
