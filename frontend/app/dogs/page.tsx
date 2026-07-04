'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { Plus, Pencil, Trash2, X, Beef, Milk, Egg, Shield, MapPin, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

interface Dog { id: string; name: string; age: number; vaccinationDate: string; medicalExpense: number; status: string }
interface DogFood { id: string; date: string; cowMeat: number; milk: number; egg: number; total: number }
interface Staff { id: string; name: string; position: string; status: string }
interface CheckpointLog {
  id: string
  date: string
  location: string
  dispatchTime: string
  returnTime: string
  dogIds: string[]
  staffIds: string[]
  status: 'Dispatched' | 'Returned'
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'linear-gradient(135deg, #0d1424, #111827)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(148,163,184,0.7)', display: 'flex' }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
        <div style={{ padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  )
}

const BADGE: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400',
  Inactive: 'bg-slate-500/20 text-slate-400',
  Sick: 'bg-red-500/20 text-red-400',
}

const CP_BADGE: Record<string, string> = {
  Dispatched: 'bg-yellow-500/20 text-yellow-400',
  Returned: 'bg-emerald-500/20 text-emerald-400',
}

const ipt = (theme: string) =>
  `w-full text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:opacity-40 ${theme === 'light'
    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500'
    : 'bg-slate-900 border border-slate-600 text-white focus:border-blue-500'
  }`

export default function DogsPage() {
  const { t, theme, lang } = useApp()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [dogFood, setDogFood] = useState<DogFood[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [checkpointLogs, setCheckpointLogs] = useState<CheckpointLog[]>([])
  const [tab, setTab] = useState<'dogs' | 'food' | 'checkpoint'>('dogs')
  const [selectedDate, setSelectedDate] = useState('')

  const [dogModal, setDogModal] = useState(false)
  const [foodModal, setFoodModal] = useState(false)
  const [cpModal, setCpModal] = useState(false)

  const [editing, setEditing] = useState<Dog | null>(null)
  const [cpEditing, setCpEditing] = useState<CheckpointLog | null>(null)

  const [dogForm, setDogForm] = useState({ breed: '', age: '', vaccinationDate: '', medicalExpense: '0', status: 'Active' })
  const [foodForm, setFoodForm] = useState({ cowMeat: '0', milk: '0', egg: '0' })
  const [cpForm, setCpForm] = useState({
    location: '',
    date: '',
    dispatchTime: '',
    returnTime: '',
    status: 'Dispatched',
    selectedDogs: [] as string[],
    selectedStaff: [] as string[]
  })

  const [saving, setSaving] = useState(false)

  // Unified deletion modal state
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'dog' | 'food' | 'checkpoint'; desc?: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }
  const today = new Date().toISOString().split('T')[0]

  const load = async () => {
    try {
      const [d, f, s, c] = await Promise.all([
        apiGet('/dogs'),
        apiGet('/dog-food'),
        apiGet('/staff'),
        apiGet('/checkpoint-logs'),
      ])
      setDogs(d || []); setDogFood(f || []); setStaff(s || []); setCheckpointLogs(c || [])
    } catch {
      setDogs([]); setDogFood([]); setStaff([]); setCheckpointLogs([])
    }
  }
  useEffect(() => {
    load()
    setSelectedDate(new Date().toISOString().split('T')[0])
  }, [])

  // Dog handlers
  const openAddDog = () => {
    setEditing(null)
    setDogForm({ breed: '', age: '', vaccinationDate: today, medicalExpense: '0', status: 'Active' })
    setDogModal(true)
  }
  const openEditDog = (d: Dog) => {
    setEditing(d)
    setDogForm({ breed: d.breed, age: String(d.age), vaccinationDate: d.vaccinationDate, medicalExpense: String(d.medicalExpense), status: d.status })
    setDogModal(true)
  }
  const saveDog = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...dogForm, username: getUser().username || 'admin' }
      const d = editing
        ? await apiPut(`/dogs/${editing.id}`, payload)
        : await apiPost('/dogs', payload)
      if (d.success) { setDogs(d.dogs); setDogModal(false) }
    } catch { }
    setSaving(false)
  }

  // Food handlers
  const saveFood = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const d = await apiPost('/dog-food', { ...foodForm, date: today, username: getUser().username || 'admin' })
      if (d.success) { setDogFood(d.dogFood); setFoodModal(false) }
    } catch { }
    setSaving(false)
  }

  // Checkpoint handlers
  const openAddCheckpoint = () => {
    setCpEditing(null)
    const now = new Date()
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setCpForm({
      location: '',
      date: selectedDate || today,
      dispatchTime: hhmm,
      returnTime: '',
      status: 'Dispatched',
      selectedDogs: [],
      selectedStaff: []
    })
    setCpModal(true)
  }
  const openEditCheckpoint = (log: CheckpointLog) => {
    setCpEditing(log)
    setCpForm({
      location: log.location,
      date: log.date,
      dispatchTime: log.dispatchTime,
      returnTime: log.returnTime,
      status: log.status,
      selectedDogs: log.dogIds,
      selectedStaff: log.staffIds
    })
    setCpModal(true)
  }
  const saveCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = {
        location: cpForm.location,
        date: cpForm.date,
        dispatchTime: cpForm.dispatchTime,
        returnTime: cpForm.returnTime,
        dogIds: cpForm.selectedDogs,
        staffIds: cpForm.selectedStaff,
        status: cpForm.status,
        username: getUser().username || 'admin'
      }
      const d = cpEditing
        ? await apiPut(`/checkpoint-logs/${cpEditing.id}`, payload)
        : await apiPost('/checkpoint-logs', payload)
      if (d.success) {
        setCheckpointLogs(d.checkpointLogs)
        setCpModal(false)
      }
    } catch { }
    setSaving(false)
  }
  const handleMarkReturned = async (log: CheckpointLog) => {
    const now = new Date()
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    try {
      const payload = {
        ...log,
        returnTime: hhmm,
        status: 'Returned',
        username: getUser().username || 'admin'
      }
      const d = await apiPut(`/checkpoint-logs/${log.id}`, payload)
      if (d.success) setCheckpointLogs(d.checkpointLogs)
    } catch { }
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const username = getUser().username || 'admin'
      if (confirmDelete.type === 'dog') {
        const d = await apiDelete(`/dogs/${confirmDelete.id}`, username)
        if (d.success) setDogs(d.dogs)
      } else if (confirmDelete.type === 'food') {
        const d = await apiDelete(`/dog-food/${confirmDelete.id}`, username)
        if (d.success) setDogFood(d.dogFood)
      } else if (confirmDelete.type === 'checkpoint') {
        const d = await apiDelete(`/checkpoint-logs/${confirmDelete.id}`, username)
        if (d.success) setCheckpointLogs(d.checkpointLogs)
      }
      setConfirmDelete(null)
    } catch { }
    setDeleting(false)
  }

  const toggleSelectDog = (id: string) => {
    setCpForm(f => ({
      ...f,
      selectedDogs: f.selectedDogs.includes(id) ? f.selectedDogs.filter(x => x !== id) : [...f.selectedDogs, id]
    }))
  }

  const toggleSelectStaff = (id: string) => {
    setCpForm(f => ({
      ...f,
      selectedStaff: f.selectedStaff.includes(id) ? f.selectedStaff.filter(x => x !== id) : [...f.selectedStaff, id]
    }))
  }

  const getDogStatusLabel = (status: string) => {
    if (status === 'Active') return t.active
    if (status === 'Inactive') return t.inactive
    return 'Xanuunsan'
  }

  const getCPStatusLabel = (status: string) => {
    if (status === 'Dispatched') return 'La geeyay'
    return 'La soo celiyay'
  }

  const foodTotal = dogFood.reduce((s, f) => s + (Number(f.total) || 0), 0)
  const isLight = theme === 'light'
  const inputCls = ipt(theme)

  const TAB_CFG = [
    { key: 'dogs', label: t.dogsTab, color: '#6366f1' },
    { key: 'food', label: t.dogFood, color: '#10b981' },
    { key: 'checkpoint', label: t.checkpointLogs, color: '#f59e0b' },
  ]

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Premium Header */}
        <div style={{
          borderRadius: 20, padding: '24px 28px',
          background: 'linear-gradient(135deg, #1c1435 0%, #2e1065 60%, #1c1435 100%)',
          border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 8px 30px rgba(139,92,246,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', marginBottom: 5 }}>{t.dogsTitle}</h2>
            <p style={{ fontSize: 13, color: 'rgba(221,214,254,0.75)' }}>
              {tab === 'checkpoint' ? `${checkpointLogs.length} ${t.checkpointLogs}` : `${dogs.length} ${t.dogsSubtitle}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
            {tab === 'checkpoint' ? (
              <button onClick={openAddCheckpoint} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Plus style={{ width: 16, height: 16 }} /> {t.registerCheckpoint}
              </button>
            ) : (
              <>
                <button onClick={() => { setFoodForm({ cowMeat: '0', milk: '0', egg: '0' }); setFoodModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 12, color: '#6ee7b7', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  <Beef style={{ width: 16, height: 16 }} /> {t.addFoodLog}
                </button>
                <button onClick={openAddDog} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  <Plus style={{ width: 16, height: 16 }} /> {t.addDog}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Premium Sub Tabs */}
        <div style={{ display: 'flex', gap: 6, background: isLight ? 'white' : 'rgba(13,20,36,0.8)', padding: 6, borderRadius: 16, border: '1px solid rgba(99,102,241,0.12)', width: 'fit-content' }}>
          {TAB_CFG.map(({ key, label, color }) => (
            <button key={key} onClick={() => setTab(key as any)} style={{
              padding: '9px 18px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: tab === key ? `${color}18` : 'transparent',
              color: tab === key ? color : 'rgba(148,163,184,0.7)',
              border: tab === key ? `1px solid ${color}35` : '1px solid transparent',
            }}>{label}</button>
          ))}
        </div>

        {/* Dogs table */}
        {tab === 'dogs' && (
        <div style={{ borderRadius: 20, overflow: 'hidden', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isLight ? '#f1f5ff' : 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  {[t.name, t.age, t.vaccination, t.medicalExp, t.status, t.actions].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dogs.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isLight ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.07)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: isLight ? '#0f172a' : 'white' }}>{d.breed}</td>
                    <td style={{ padding: '14px 16px', color: 'rgba(148,163,184,0.8)', fontWeight: 600 }}>{d.age} yrs</td>
                    <td style={{ padding: '14px 16px', color: 'rgba(148,163,184,0.7)' }}>{d.vaccinationDate}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f43f5e' }}>${Number(d.medicalExpense).toFixed(2)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                        background: d.status === 'Active' ? 'rgba(16,185,129,0.12)' : d.status === 'Sick' ? 'rgba(244,63,94,0.12)' : 'rgba(100,116,139,0.12)',
                        color: d.status === 'Active' ? '#10b981' : d.status === 'Sick' ? '#f43f5e' : '#64748b',
                        border: `1px solid ${d.status === 'Active' ? 'rgba(16,185,129,0.25)' : d.status === 'Sick' ? 'rgba(244,63,94,0.25)' : 'rgba(100,116,139,0.2)'}`,
                      }}>{getDogStatusLabel(d.status)}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEditDog(d)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Pencil style={{ width: 13, height: 13 }} /></button>
                        <button onClick={() => setConfirmDelete({ id: d.id, type: 'dog', desc: `${d.breed} (${d.id})` })} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 style={{ width: 13, height: 13 }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {dogs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'rgba(100,116,139,0.6)' }}>{t.noDogsRegistered}</td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Dog Food Log */}
        {tab === 'food' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t.cowMeatLabel, icon: Beef, color: 'text-red-400', val: dogFood.reduce((s, f) => s + Number(f.cowMeat), 0) },
                { label: t.milkLabel, icon: Milk, color: 'text-blue-300', val: dogFood.reduce((s, f) => s + Number(f.milk), 0) },
                { label: t.eggLabel, icon: Egg, color: 'text-yellow-400', val: dogFood.reduce((s, f) => s + Number(f.egg), 0) },
              ].map(({ label, icon: Icon, color, val }) => (
                <div key={label} className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${color}`} /><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span></div>
                  <p className={`text-xl font-bold ${color}`}>${val.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-card2, var(--bg-hover))', borderColor: 'var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.totalFoodExpenses}: </span>
              <span className="text-lg font-bold text-emerald-400">${foodTotal.toFixed(2)}</span>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: isLight ? 'var(--bg-card2)' : 'rgba(15,23,42,0.5)' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.date}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.cowMeatLabel}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.milkLabel}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.eggLabel}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.total}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                  {dogFood.map(f => (
                    <tr key={f.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border2)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                      <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{f.date}</td>
                      <td className="px-4 py-3 text-red-400">${Number(f.cowMeat).toFixed(2)}</td>
                      <td className="px-4 py-3 text-blue-300">${Number(f.milk).toFixed(2)}</td>
                      <td className="px-4 py-3 text-yellow-400">${Number(f.egg).toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">${Number(f.total).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setConfirmDelete({ id: f.id, type: 'food', desc: `Food Log (${f.date}): $${Number(f.total).toFixed(2)}` })} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                  {dogFood.length === 0 && <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--text-dim)' }}>{t.noFoodLogs}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Checkpoint Dispatch & Return Log */}
        {tab === 'checkpoint' && (
          <div className="space-y-6">
            {/* Date filter picker */}
            <div className="flex items-center gap-3 rounded-2xl p-4 flex-wrap" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <label className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{t.selectDate}</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                className={inputCls} style={{ width: 'auto' }} />
              {selectedDate !== today && (
                <button onClick={() => setSelectedDate(today)}
                  className="text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-medium px-3 py-2 rounded-xl transition-all cursor-pointer">
                  {t.returnToToday}
                </button>
              )}
            </div>

            {/* 1. Active Deployments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-yellow-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                  {t.activeDeploymentsLabel}
                </h3>
                <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2.5 py-0.5 rounded-full font-medium">
                  {checkpointLogs.filter(l => l.status === 'Dispatched' && l.date === selectedDate).length} {t.away}
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: isLight ? 'var(--bg-card2)' : 'rgba(15,23,42,0.5)' }}>
                      {[t.date, t.location, t.dogsCol, t.staff, t.dispatchCol, t.actions].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {checkpointLogs.filter(l => l.status === 'Dispatched' && l.date === selectedDate).map(log => {
                      const resolvedDogs = log.dogIds.map(id => dogs.find(d => d.id === id)?.breed || id).join(', ')
                      const resolvedStaff = log.staffIds.map(id => staff.find(s => s.id === id)?.name || id).join(', ')
                      return (
                        <tr key={log.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border2)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text)' }}>{log.date}</td>
                          <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text)' }}>
                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />{log.location}</div>
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }} title={resolvedDogs}>{resolvedDogs || '—'}</td>
                          <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }} title={resolvedStaff}>{resolvedStaff || '—'}</td>
                          <td className="px-4 py-3 font-mono" style={{ color: 'var(--text)' }}><div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" />{log.dispatchTime}</div></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleMarkReturned(log)} title={t.markReturned}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center gap-1 text-xs font-semibold transition-all">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {t.markReturned}
                              </button>
                              <button onClick={() => openEditCheckpoint(log)} className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setConfirmDelete({ id: log.id, type: 'checkpoint', desc: `Checkpoint (${log.location})` })} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {checkpointLogs.filter(l => l.status === 'Dispatched' && l.date === selectedDate).length === 0 && (
                      <tr><td colSpan={6} className="text-center py-8 italic" style={{ color: 'var(--text-dim)' }}>{t.noActiveDeployments}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Returned History */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {t.returnHistoryLabel}
                </h3>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium">
                  {checkpointLogs.filter(l => l.status === 'Returned' && l.date === selectedDate).length} {t.returned}
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: isLight ? 'var(--bg-card2)' : 'rgba(15,23,42,0.5)' }}>
                      {[t.date, t.location, t.dogsCol, t.staff, t.dispatchCol, t.returnCol, t.actions].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {checkpointLogs.filter(l => l.status === 'Returned' && l.date === selectedDate).map(log => {
                      const resolvedDogs = log.dogIds.map(id => dogs.find(d => d.id === id)?.breed || id).join(', ')
                      const resolvedStaff = log.staffIds.map(id => staff.find(s => s.id === id)?.name || id).join(', ')
                      return (
                        <tr key={log.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border2)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text)' }}>{log.date}</td>
                          <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text)' }}>
                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />{log.location}</div>
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }} title={resolvedDogs}>{resolvedDogs || '—'}</td>
                          <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }} title={resolvedStaff}>{resolvedStaff || '—'}</td>
                          <td className="px-4 py-3 font-mono" style={{ color: 'var(--text)' }}><div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" />{log.dispatchTime}</div></td>
                          <td className="px-4 py-3 font-mono" style={{ color: 'var(--text)' }}><div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-500" />{log.returnTime}</div></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => openEditCheckpoint(log)} className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setConfirmDelete({ id: log.id, type: 'checkpoint', desc: `Checkpoint (${log.location})` })} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {checkpointLogs.filter(l => l.status === 'Returned' && l.date === selectedDate).length === 0 && (
                      <tr><td colSpan={7} className="text-center py-8 italic" style={{ color: 'var(--text-dim)' }}>{t.noReturnedDeployments}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dog Register Modal */}
      <Modal open={dogModal} title={editing ? t.editDogTitle : t.addDogTitle} onClose={() => setDogModal(false)}>
        <form onSubmit={saveDog} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.breed}</label><input value={dogForm.breed} onChange={e => setDogForm(f => ({ ...f, breed: e.target.value }))} required placeholder="German Shepherd" className={inputCls} /></div>
            <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.age}</label><input type="number" min="0" value={dogForm.age} onChange={e => setDogForm(f => ({ ...f, age: e.target.value }))} required className={inputCls} /></div>
          </div>
          <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.vaccination}</label><input type="date" value={dogForm.vaccinationDate} onChange={e => setDogForm(f => ({ ...f, vaccinationDate: e.target.value }))} required className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.medicalExp}</label><input type="number" min="0" value={dogForm.medicalExpense} onChange={e => setDogForm(f => ({ ...f, medicalExpense: e.target.value }))} className={inputCls} /></div>
            <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.status}</label>
              <select value={dogForm.status} onChange={e => setDogForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                <option value="Active">{t.active}</option>
                <option value="Inactive">{t.inactive}</option>
                <option value="Sick">Xanuunsan</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setDogModal(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">{saving ? t.saving : t.save}</button>
          </div>
        </form>
      </Modal>

      {/* Dog Food Modal */}
      <Modal open={foodModal} title={t.enterFoodLog} onClose={() => setFoodModal(false)}>
        <form onSubmit={saveFood} className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs text-slate-500">📅 {t.date}:</span>
            <span className="text-sm font-semibold text-blue-400">{today}</span>
            <span className="text-xs text-slate-500 ml-auto">{t.automatic}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <Beef className="w-5 h-5 text-red-400 shrink-0" />
              <div className="flex-1"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.cowMeatLabel}</p></div>
              <input type="number" min="0" step="0.01" value={foodForm.cowMeat} onChange={e => setFoodForm(f => ({ ...f, cowMeat: e.target.value }))} className="w-24 border rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 text-right" style={{ backgroundColor: 'var(--bg-card2)', color: 'var(--text)', borderColor: 'var(--border)' }} />
            </div>
            <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <Milk className="w-5 h-5 text-blue-300 shrink-0" />
              <div className="flex-1"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.milkLabel}</p></div>
              <input type="number" min="0" step="0.01" value={foodForm.milk} onChange={e => setFoodForm(f => ({ ...f, milk: e.target.value }))} className="w-24 border rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 text-right" style={{ backgroundColor: 'var(--bg-card2)', color: 'var(--text)', borderColor: 'var(--border)' }} />
            </div>
            <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <Egg className="w-5 h-5 text-yellow-400 shrink-0" />
              <div className="flex-1"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.eggLabel}</p></div>
              <input type="number" min="0" step="0.01" value={foodForm.egg} onChange={e => setFoodForm(f => ({ ...f, egg: e.target.value }))} className="w-24 border rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 text-right" style={{ backgroundColor: 'var(--bg-card2)', color: 'var(--text)', borderColor: 'var(--border)' }} />
            </div>
          </div>
          <div className="border rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-card2, var(--bg-hover))', borderColor: 'var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t.total}</p>
            <p className="text-2xl font-bold text-emerald-400">
              ${((parseFloat(foodForm.cowMeat) || 0) + (parseFloat(foodForm.milk) || 0) + (parseFloat(foodForm.egg) || 0)).toFixed(2)}
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setFoodModal(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">{saving ? t.saving : t.save}</button>
          </div>
        </form>
      </Modal>

      {/* Checkpoint Register Modal */}
      <Modal open={cpModal} title={cpEditing ? t.editCheckpointTitle : t.addCheckpointTitle} onClose={() => setCpModal(false)}>
        <form onSubmit={saveCheckpoint} className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 flex items-center gap-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">📅</span>
              <span className="text-sm font-semibold text-blue-400">{cpForm.date || today}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">⏰</span>
              <span className="text-sm font-semibold text-emerald-400">{cpForm.dispatchTime}</span>
            </div>
            <span className="text-xs text-slate-500 ml-auto">{t.automatic}</span>
          </div>
          <div>
            <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.location}</label>
            <input value={cpForm.location} onChange={e => setCpForm(f => ({ ...f, location: e.target.value }))} required placeholder="Tusaale: Madaxtooyada ama Jazeera" className={inputCls} />
          </div>
          <div>
            <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.status}</label>
            <select value={cpForm.status} onChange={e => setCpForm(f => ({ ...f, status: e.target.value as 'Dispatched' | 'Returned' }))} className={inputCls}>
              <option value="Dispatched">{getCPStatusLabel('Dispatched')}</option>
              <option value="Returned">{getCPStatusLabel('Returned')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs block mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>{t.selectDogs}</label>
            <div className="border rounded-xl p-3 max-h-36 overflow-y-auto space-y-2" style={{ backgroundColor: 'var(--bg-card2)', borderColor: 'var(--border)' }}>
              {dogs.map(d => (
                <label key={d.id} className="flex items-center gap-2 text-sm hover:text-white cursor-pointer select-none" style={{ color: 'var(--text)' }}>
                  <input type="checkbox" checked={cpForm.selectedDogs.includes(d.id)} onChange={() => toggleSelectDog(d.id)}
                    className="rounded border-slate-600 text-blue-600 focus:ring-blue-500/20 bg-slate-800" />
                  <span>{d.breed} <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>({d.id})</span></span>
                </label>
              ))}
              {dogs.length === 0 && <p className="text-xs italic" style={{ color: 'var(--text-dim)' }}>{t.noDogsReg}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs block mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>{t.selectStaff}</label>
            <div className="border rounded-xl p-3 max-h-36 overflow-y-auto space-y-2" style={{ backgroundColor: 'var(--bg-card2)', borderColor: 'var(--border)' }}>
              {staff.map(s => (
                <label key={s.id} className="flex items-center gap-2 text-sm hover:text-white cursor-pointer select-none" style={{ color: 'var(--text)' }}>
                  <input type="checkbox" checked={cpForm.selectedStaff.includes(s.id)} onChange={() => toggleSelectStaff(s.id)}
                    className="rounded border-slate-600 text-blue-600 focus:ring-blue-500/20 bg-slate-800" />
                  <span>{s.name} <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>({s.position})</span></span>
                </label>
              ))}
              {staff.length === 0 && <p className="text-xs italic" style={{ color: 'var(--text-dim)' }}>{t.noStaffReg}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCpModal(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">{saving ? t.saving : t.save}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={confirmDelete !== null} title={confirmDelete?.type === 'dog' ? t.deleteDogTitle : confirmDelete?.type === 'food' ? t.deleteExpenseTitle : t.deleteCheckpointTitle} onClose={() => setConfirmDelete(null)}>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{t.areYouSure}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {confirmDelete?.type === 'dog' ? t.deleteDogMsg : confirmDelete?.type === 'food' ? t.noFoodLogs : t.deleteCheckpointMsg}
              </p>
              <p className="text-xs mt-2 font-semibold px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                {confirmDelete?.desc}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>
              {t.cancel}
            </button>
            <button onClick={confirmAndDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
              {deleting ? t.deleting : <><Trash2 className="w-4 h-4" /> {t.confirm}</>}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
