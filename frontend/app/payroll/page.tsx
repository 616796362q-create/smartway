'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api'
import { Plus, X, DollarSign, Users, TrendingUp, Calendar, ChevronRight, Banknote, Pencil, Trash2, AlertTriangle } from 'lucide-react'

interface Staff { id: string; name: string; position: string; salary: number; status: string }
interface PayrollRecord { id: string; staffId: string; staffName: string; month: string; basicSalary: number; overtime: number; bonus: number; deduction: number; netSalary: number }

function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg shadow-2xl" style={{
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="flex items-center gap-3">
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', padding: '8px' }}>
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-base text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 transition-all hover:bg-white/10" style={{ color: 'rgba(148,163,184,0.8)' }}>
            <X className="w-5 h-5"/>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const ipt = () =>
  `w-full text-sm rounded-xl px-4 py-3 focus:outline-none transition-all placeholder:opacity-40 text-white font-medium`

export default function PayrollPage() {
  const { t, theme } = useApp()
  const [staff, setStaff] = useState<Staff[]>([])
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [monthFilter, setMonthFilter] = useState(() => {
    if (typeof window === 'undefined') return currentMonth
    const saved = localStorage.getItem('sw_selected_month')
    return saved && /^\d{4}-\d{2}$/.test(saved) ? saved : currentMonth
  })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ staffId: '', month: '', overtime: '0', bonus: '0', deduction: '0' })
  const [basicSalary, setBasicSalary] = useState(0)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<PayrollRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<PayrollRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }

  const load = async () => {
    try {
      const [s, p] = await Promise.all([apiGet('/staff'), apiGet('/payroll')])
      setStaff(s || []); setPayroll(p || [])
    } catch {
      setStaff([]); setPayroll([])
    }
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (form.staffId && form.month) {
      const alreadyPaid = payroll.some(p => p.staffId === form.staffId && p.month === form.month && p.id !== editing?.id)
      if (alreadyPaid) {
        setForm(f => ({ ...f, staffId: '' }))
        setBasicSalary(0)
      }
    }
  }, [editing?.id, form.month, form.staffId, payroll])

  const setSelectedMonth = (month: string) => {
    const nextMonth = month || currentMonth
    setMonthFilter(nextMonth)
    localStorage.setItem('sw_selected_month', nextMonth)
    localStorage.setItem('sw_report_date', `${nextMonth}-01`)
  }

  const openModal = () => {
    setEditing(null)
    setForm({ staffId: '', month: currentMonth, overtime: '0', bonus: '0', deduction: '0' })
    setBasicSalary(0)
    setModal(true)
  }

  const openEdit = (record: PayrollRecord) => {
    setEditing(record)
    setForm({
      staffId: record.staffId,
      month: record.month,
      overtime: String(record.overtime || 0),
      bonus: String(record.bonus || 0),
      deduction: String(record.deduction || 0)
    })
    setBasicSalary(Number(record.basicSalary) || 0)
    setModal(true)
  }

  const onStaffChange = (id: string) => {
    const s = staff.find(s => s.id === id)
    setBasicSalary(s ? Number(s.salary) : 0)
    setForm(f => ({ ...f, staffId: id }))
  }

  const net = basicSalary + (parseFloat(form.overtime) || 0) + (parseFloat(form.bonus) || 0) - (parseFloat(form.deduction) || 0)

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, username: getUser().username || 'admin' }
      const d = editing ? await apiPut(`/payroll/${editing.id}`, payload) : await apiPost('/payroll', payload)
      if (d.success) { setPayroll(d.payroll); setModal(false); setEditing(null) }
    } catch {}
    setSaving(false)
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const d = await apiDelete(`/payroll/${confirmDelete.id}`, getUser().username || 'admin')
      if (d.success) setPayroll(d.payroll)
      setConfirmDelete(null)
    } catch {}
    setDeleting(false)
  }

  const selectedPayrollMonth = monthFilter || currentMonth
  const filtered = payroll.filter(p => p.month === selectedPayrollMonth)
  const totalNet = filtered.reduce((s, p) => s + (Number(p.netSalary) || 0), 0)
  const totalBonuses = filtered.reduce((s, p) => s + (Number(p.bonus) || 0), 0)
  const totalDeductions = filtered.reduce((s, p) => s + (Number(p.deduction) || 0), 0)

  const isLight = theme === 'light'

  const inputStyle = {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
  }

  const positionColors: Record<string, string> = {
    Guard: '#3b82f6',
    Supervisor: '#8b5cf6',
    Driver: '#f59e0b',
    Cook: '#10b981',
    default: '#6366f1'
  }
  const posColor = (pos: string) => positionColors[pos] || positionColors.default

  return (
    <AppLayout>
      <div className="space-y-6" style={{ minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(15,23,42,0) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '20px',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '12px', padding: '10px',
                boxShadow: '0 0 20px rgba(99,102,241,0.4)'
              }}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                {t.payrollTitle}
              </h2>
            </div>
            <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '13px', margin: 0 }}>{t.payrollSub}</p>
          </div>
          <button onClick={openModal} style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: '14px', color: 'white',
            padding: '12px 22px', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
          >
            <Plus className="w-4 h-4" /> {t.addPayroll}
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: <DollarSign className="w-5 h-5" />, label: 'Mushaar Wadarta', value: `$${totalNet.toFixed(2)}`, gradient: 'linear-gradient(135deg, #10b981, #059669)', glow: 'rgba(16,185,129,0.3)' },
            { icon: <Users className="w-5 h-5" />, label: 'Shaqaalaha', value: filtered.length, gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', glow: 'rgba(99,102,241,0.3)' },
            { icon: <TrendingUp className="w-5 h-5" />, label: 'Haddiyad', value: `$${totalBonuses.toFixed(2)}`, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.3)' },
            { icon: <ChevronRight className="w-5 h-5" />, label: 'Goynta', value: `$${totalDeductions.toFixed(2)}`, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', glow: 'rgba(239,68,68,0.3)' },
          ].map((card, i) => (
            <div key={i} style={{
              background: isLight ? 'white' : 'linear-gradient(145deg, #1e293b, #0f172a)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: '18px', padding: '20px',
              boxShadow: `0 4px 20px ${card.glow}`,
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ background: card.gradient, borderRadius: '10px', padding: '8px', boxShadow: `0 0 15px ${card.glow}` }}>
                  <span style={{ color: 'white' }}>{card.icon}</span>
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>{card.value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.7)', fontWeight: 500 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          background: isLight ? 'white' : 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: '16px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar className="w-4 h-4" style={{ color: '#6366f1' }} />
            <label style={{ fontSize: '13px', color: 'rgba(148,163,184,0.9)', fontWeight: 600 }}>Bisha:</label>
            <input type="month" value={monthFilter} onChange={e => setSelectedMonth(e.target.value)}
              style={{ ...inputStyle, width: 'auto', padding: '8px 14px', fontSize: '13px' }} />
          </div>
          {monthFilter !== currentMonth && (
            <button onClick={() => setSelectedMonth(currentMonth)} style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '10px', color: '#34d399', padding: '6px 14px', fontSize: '12px',
              cursor: 'pointer', fontWeight: 600
            }}>Bishan</button>
          )}
        </div>

        {/* ── Table ── */}
        <div style={{
          background: isLight ? 'white' : 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  {['ID', 'Magaca', 'Bisha', 'Mushaar Asal', 'Dheeraad', 'Haddiyad', 'Goyn', 'Mushaar Neto', ''].map((h, i) => (
                    <th key={i} style={{
                      textAlign: 'left', padding: '14px 18px',
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                      color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} style={{
                    borderBottom: '1px solid rgba(99,102,241,0.07)',
                    transition: 'background 0.15s',
                    animation: `fadeInUp 0.3s ease ${idx * 0.04}s both`
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.06)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                        borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700
                      }}>{p.staffId}</span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>{p.staffName}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: 'rgba(6,182,212,0.12)', color: '#22d3ee',
                        borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 600
                      }}>{p.month}</span>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'rgba(148,163,184,0.9)', fontWeight: 500 }}>${Number(p.basicSalary).toFixed(2)}</td>
                    <td style={{ padding: '14px 18px', color: '#60a5fa', fontWeight: 600 }}>+${Number(p.overtime).toFixed(2)}</td>
                    <td style={{ padding: '14px 18px', color: '#34d399', fontWeight: 600 }}>+${Number(p.bonus).toFixed(2)}</td>
                    <td style={{ padding: '14px 18px', color: '#f87171', fontWeight: 600 }}>-${Number(p.deduction).toFixed(2)}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10b981', fontWeight: 800, fontSize: '14px',
                        borderRadius: '10px', padding: '5px 14px', display: 'inline-block'
                      }}>${Number(p.netSalary).toFixed(2)}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(p)} title="Wax ka bedel" style={{
                          width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.1)',
                          border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}><Pencil style={{ width: 13, height: 13 }} /></button>
                        <button onClick={() => setConfirmDelete(p)} title="Masax" style={{
                          width: 32, height: 32, borderRadius: 9, background: 'rgba(244,63,94,0.1)',
                          border: '1px solid rgba(244,63,94,0.22)', color: '#fb7185',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}><Trash2 style={{ width: 13, height: 13 }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '50%', padding: '20px' }}>
                          <DollarSign className="w-8 h-8" style={{ color: 'rgba(99,102,241,0.5)' }} />
                        </div>
                        <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '14px', margin: 0 }}>{t.noPayrollLogs}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <Modal open={modal} title={editing ? 'Wax ka bedel Mushaar' : t.enterPayroll} onClose={() => { setModal(false); setEditing(null) }}>
        <form onSubmit={save} className="space-y-4">

          {/* Staff Select */}
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(148,163,184,0.8)', fontWeight: 600, display: 'block', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t.selectStaff}</label>
            <select value={form.staffId} onChange={e => onStaffChange(e.target.value)} required
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.6)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <option value="" style={{ background: '#0f172a' }}>{t.selectStaffDefault}</option>
              {staff
                .filter(s => {
                  const isActive = s.status === 'Active' || s.status === 'Socda'
                  const alreadyPaid = payroll.some(p => p.staffId === s.id && p.month === form.month && p.id !== editing?.id)
                  return (isActive || s.id === editing?.staffId) && !alreadyPaid
                })
                .map(s => (
                  <option key={s.id} value={s.id} style={{ background: '#0f172a' }}>{s.name} ({s.position}) — ${s.salary}</option>
                ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(148,163,184,0.8)', fontWeight: 600, display: 'block', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Bisha</label>
            <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} required style={inputStyle}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.6)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            />
          </div>

          {/* Overtime / Bonus / Deduction */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Dheeraad', key: 'overtime' as const, color: '#60a5fa', prefix: '+' },
              { label: 'Haddiyad', key: 'bonus' as const, color: '#34d399', prefix: '+' },
              { label: 'Goyn', key: 'deduction' as const, color: '#f87171', prefix: '-' },
            ].map(({ label, key, color }) => (
              <div key={key}>
                <label style={{ fontSize: '11px', color, fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
                <input type="number" min="0" step="0.01" value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ ...inputStyle, borderColor: `${color}25` }}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${color}20` }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}25`; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                />
              </div>
            ))}
          </div>

          {/* Net Preview */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '16px', padding: '20px', textAlign: 'center',
            boxShadow: '0 0 20px rgba(16,185,129,0.1)'
          }}>
            <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.7)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.netSalary}</p>
            <p style={{ fontSize: '36px', fontWeight: 900, color: '#10b981', margin: 0, letterSpacing: '-1px',
              textShadow: '0 0 30px rgba(16,185,129,0.5)' }}>${net.toFixed(2)}</p>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.6)' }}>Asal: <strong style={{ color: 'white' }}>${basicSalary.toFixed(2)}</strong></span>
              <span style={{ fontSize: '12px', color: '#60a5fa' }}>+${(parseFloat(form.overtime)||0).toFixed(2)}</span>
              <span style={{ fontSize: '12px', color: '#34d399' }}>+${(parseFloat(form.bonus)||0).toFixed(2)}</span>
              <span style={{ fontSize: '12px', color: '#f87171' }}>-${(parseFloat(form.deduction)||0).toFixed(2)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button type="button" onClick={() => setModal(false)} style={{
              flex: 1, padding: '13px', borderRadius: '14px', border: '1px solid rgba(99,102,241,0.2)',
              background: 'rgba(99,102,241,0.08)', color: 'rgba(148,163,184,0.9)',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'}
            >{t.cancel}</button>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: '13px', borderRadius: '14px', border: 'none',
              background: saving ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', boxShadow: saving ? 'none' : '0 4px 15px rgba(99,102,241,0.4)'
            }}
              onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
            >{saving ? t.saving : t.save}</button>
          </div>
        </form>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Modal>

      <Modal open={confirmDelete !== null} title={t.deletePayrollTitle} onClose={() => setConfirmDelete(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16,
            background: 'rgba(244,63,94,0.06)', borderRadius: 14, border: '1px solid rgba(244,63,94,0.15)'
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: 'rgba(244,63,94,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <AlertTriangle style={{ width: 20, height: 20, color: '#f43f5e' }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: 'white', marginBottom: 5 }}>{t.areYouSure}</p>
              <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', lineHeight: 1.5 }}>{t.deletePayrollMsg}</p>
              <p style={{ fontSize: 12, color: '#fb7185', marginTop: 6 }}>
                {confirmDelete?.staffName} - {confirmDelete?.month} - ${Number(confirmDelete?.netSalary || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setConfirmDelete(null)} style={{
              flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)',
              background: 'rgba(99,102,241,0.06)', color: 'rgba(148,163,184,0.8)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}>{t.cancel}</button>
            <button onClick={confirmAndDelete} disabled={deleting} style={{
              flex: 1, padding: '12px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white',
              fontWeight: 700, fontSize: 13, cursor: deleting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(244,63,94,0.3)'
            }}>
              {deleting ? t.deleting : t.confirm}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AppLayout>
  )
}
