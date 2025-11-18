import { useState } from 'react'

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [semester, setSemester] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('choice')
  const [loading, setLoading] = useState(false)
  const api = import.meta.env.VITE_BACKEND_URL

  const submitEmail = async () => {
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await fetch(`${api}/auth/register-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, phone, course, semester: Number(semester) }) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed')
        onAuthed(data)
      } else {
        const res = await fetch(`${api}/auth/login-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed')
        onAuthed(data)
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const requestOtp = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${api}/auth/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      setStep('verify')
      if (data.dev_code) {
        console.log('Dev OTP:', data.dev_code)
      }
    } catch (e) { alert(e.message) } finally { setLoading(false) }
  }

  const verifyOtp = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${api}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, code: otp, name, email, password, course, semester: Number(semester) }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      onAuthed(data)
    } catch (e) { alert(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="bg-white max-w-md w-full mx-auto rounded-2xl shadow-lg p-6">
      <div className="flex justify-center gap-2 mb-4">
        <button onClick={() => { setMode('login'); setStep('choice') }} className={`px-3 py-1 rounded ${mode==='login'?'bg-blue-600 text-white':'bg-slate-100'}`}>Login</button>
        <button onClick={() => { setMode('register'); setStep('choice') }} className={`px-3 py-1 rounded ${mode==='register'?'bg-blue-600 text-white':'bg-slate-100'}`}>Register</button>
      </div>

      {step === 'choice' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="you@college.edu" />
          </div>
          {mode==='register' && (
            <>
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium">Course</label>
                <input value={course} onChange={e=>setCourse(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="B.Tech CSE" />
              </div>
              <div>
                <label className="block text-sm font-medium">Semester</label>
                <select value={semester} onChange={e=>setSemester(e.target.value)} className="w-full border rounded px-3 py-2">
                  {Array.from({length:8}).map((_,i)=> <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="••••••••" />
          </div>
          <button disabled={loading} onClick={submitEmail} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2">{mode==='register'?'Create account':'Login with Email'}</button>

          <div className="relative text-center my-2"><span className="bg-white px-2 text-xs text-slate-400">or</span><div className="h-px bg-slate-200" /></div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="10-digit mobile" />
          </div>
          <button disabled={loading} onClick={requestOtp} className="w-full border border-blue-600 text-blue-700 hover:bg-blue-50 rounded py-2">Get OTP</button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">OTP sent to {phone}. Enter it below.</p>
          <input value={otp} onChange={e=>setOtp(e.target.value)} className="w-full border rounded px-3 py-2 tracking-widest text-center" placeholder="000000" />
          {mode==='register' && (
            <>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Full name" />
              <input value={course} onChange={e=>setCourse(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Course" />
              <select value={semester} onChange={e=>setSemester(e.target.value)} className="w-full border rounded px-3 py-2">
                {Array.from({length:8}).map((_,i)=> <option key={i+1} value={i+1}>{i+1}</option>)}
              </select>
            </>
          )}
          <button disabled={loading} onClick={verifyOtp} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2">Verify & Continue</button>
          <button onClick={()=>setStep('choice')} className="w-full text-slate-500 text-sm">Back</button>
        </div>
      )}
    </div>
  )
}
