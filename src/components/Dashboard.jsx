import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const tzOffsetMin = 330 // Asia/Kolkata +05:30

function todayKolkata() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset()*60000
  const ist = new Date(utc + tzOffsetMin*60000)
  return ist.toISOString().slice(0,10)
}

export default function Dashboard({ auth, onLogout }) {
  const api = import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate()

  const [semester, setSemester] = useState(auth?.student?.semester || 1)
  const [course] = useState(auth?.student?.course || '')
  const [name] = useState(auth?.student?.name || '')
  const [subjects, setSubjects] = useState([])
  const [date, setDate] = useState(todayKolkata())
  const [sessionsCount, setSessionsCount] = useState({})
  const [statsWeekly, setStatsWeekly] = useState(null)
  const [statsMonthly, setStatsMonthly] = useState(null)
  const [statsSemester, setStatsSemester] = useState(null)

  useEffect(()=>{
    if(!auth) {
      navigate('/', { replace: true })
      return
    }
  }, [auth, navigate])

  useEffect(()=>{
    const loadSubs = async ()=>{
      const res = await fetch(`${api}/subjects?semester=${semester}`)
      const data = await res.json()
      setSubjects(data.subjects||[])
    }
    loadSubs()
  }, [semester])

  useEffect(()=>{
    const loadStats = async ()=>{
      const [wRes, mRes, sRes] = await Promise.all([
        fetch(`${api}/attendance/stats?student_id=${auth.student.id}&period=weekly`),
        fetch(`${api}/attendance/stats?student_id=${auth.student.id}&period=monthly`),
        fetch(`${api}/attendance/stats?student_id=${auth.student.id}&period=semester`),
      ])
      setStatsWeekly(await wRes.json())
      setStatsMonthly(await mRes.json())
      setStatsSemester(await sRes.json())
    }
    loadStats()
  }, [auth.student.id])

  const mark = async (subject_code, status, increment=1)=>{
    const sessions_held = sessionsCount[subject_code] || 1
    const attended_count = status === 'attended' ? increment : 0
    await fetch(`${api}/attendance/mark`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ student_id: auth.student.id, subject_code, date, sessions_held, attended_count, status }) })
    // refresh stats quickly
    const res = await fetch(`${api}/attendance/stats?student_id=${auth.student.id}&period=weekly`)
    setStatsWeekly(await res.json())
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Dashboard</h2>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="text-blue-200 hover:text-white">Dashboard</Link>
          <Link to="/reports" className="text-blue-200/80 hover:text-white">Attendance Report</Link>
          <Link to="/settings" className="text-blue-200/80 hover:text-white">Settings</Link>
          <button onClick={onLogout} className="text-blue-200 hover:text-white">Logout</button>
        </nav>
      </div>

      <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-blue-100 text-xs">Student</div>
            <div className="text-white font-medium">{name || 'Student'}</div>
          </div>
          <div>
            <div className="text-blue-100 text-xs">Course</div>
            <div className="text-white font-medium">{course || '—'}</div>
          </div>
          <div>
            <label className="block text-blue-100 text-xs mb-1">Semester</label>
            <select value={semester} onChange={e=>setSemester(parseInt(e.target.value))} className="w-full bg-slate-900/60 text-white border border-white/10 rounded px-3 py-2">
              {Array.from({length:8}).map((_,i)=>(<option key={i+1} value={i+1}>Semester {i+1}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-blue-100 text-xs mb-1">Date (Asia/Kolkata)</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-slate-900/60 text-white border border-white/10 rounded px-3 py-2" />
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
        <h3 className="text-blue-100 font-medium mb-3">Subjects</h3>
        <div className="space-y-3">
          {subjects.map(s=> (
            <div key={s.id} className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-lg p-3">
              <div>
                <div className="text-white font-medium">{s.name}</div>
                <div className="text-xs text-blue-300/60">{s.code}</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={sessionsCount[s.code]||1} onChange={e=>setSessionsCount(prev=>({...prev, [s.code]: parseInt(e.target.value||'1')}))} className="w-16 bg-slate-800 text-white border border-white/10 rounded px-2 py-1 text-sm" />
                <button onClick={()=>mark(s.code, 'attended', sessionsCount[s.code]||1)} className="px-2 py-1 rounded bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm">Attended</button>
                <button onClick={()=>mark(s.code, 'not_attended', 0)} className="px-2 py-1 rounded bg-rose-500/80 hover:bg-rose-500 text-white text-sm">Not Attended</button>
                <button onClick={()=>mark(s.code, 'teacher_leave', 0)} className="px-2 py-1 rounded bg-amber-500/80 hover:bg-amber-500 text-white text-sm">Teacher Leave</button>
                <button onClick={()=>mark(s.code, 'holiday', 0)} className="px-2 py-1 rounded bg-sky-500/80 hover:bg-sky-500 text-white text-sm">Holiday</button>
                <button onClick={()=>mark(s.code, 'attended', 2)} className="px-2 py-1 rounded bg-indigo-500/80 hover:bg-indigo-500 text-white text-sm">+2</button>
              </div>
            </div>
          ))}
          {subjects.length===0 && (
            <div className="text-blue-200/70 text-sm">No subjects for this semester yet.</div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
          <div className="text-blue-100 text-xs">Weekly</div>
          <div className="text-2xl font-bold text-white">{statsWeekly?.overall?.percentage ?? 0}%</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
          <div className="text-blue-100 text-xs">Monthly</div>
          <div className="text-2xl font-bold text-white">{statsMonthly?.overall?.percentage ?? 0}%</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
          <div className="text-blue-100 text-xs">Semester</div>
          <div className="text-2xl font-bold text-white">{statsSemester?.overall?.percentage ?? 0}%</div>
        </div>
      </div>
    </div>
  )
}
