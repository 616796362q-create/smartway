'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost } from '@/lib/api'
import { Plus, X } from 'lucide-react'

interface Staff { id: string; name: string; position: string; salary: number; status: string }
interface PayrollRecord { id: string; staffId: string; staffName: string; month: string; basicSalary: number; overtime: number; bonus: number; deduction: number; netSalary: number }

function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl w-full max-w-md shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-base" style={{ color: 'var(--text)' }}>{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

const ipt = (theme: string) =>
  `w-full text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:opacity-40 ${
    theme === 'light'
      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500'
      : 'bg-slate-900 border border-slate-600 text-white focus:border-blue-500'
  }`

export default function PayrollPage() {
  const { t, theme, lang } = useApp()
  const [staff, setStaff] = useState<Staff[]>([])
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [monthFilter, setMonthFilter] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ staffId: '', month: '', overtime: '0', bonus: '0', deduction: '0' })
  const [basicSalary, setBasicSalary] = useState(0)
  const [saving, setSaving] = useState(false)

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

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const openModal = () => {
    setForm({ staffId: '', month: currentMonth, overtime: '0', bonus: '0', deduction: '0' })
    setBasicSalary(0)
    setModal(true)
  }

  const onStaffChange = (id: string) => {
    const s = staff.find(s => s.id === id)
    setBasicSalary(s ? s.salary : 0)
    setForm(f => ({ ...f, staffId: id }))
  }

  const net = basicSalary + (parseFloat(form.overtime) || 0) + (parseFloat(form.bonus) || 0) - (parseFloat(form.deduction) || 0)

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const d = await apiPost('/payroll', { ...form, username: getUser().username || 'admin' })
      if (d.success) { setPayroll(d.payroll); setModal(false) }
    } catch {}
    setSaving(false)
  }

  const filtered = monthFilter ? payroll.filter(p => p.month === monthFilter) : payroll
  const totalNet = filtered.reduce((s, p) => s + p.netSalary, 0)

  const isLight = theme === 'light'
  const inputCls = ipt(theme)

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.payrollTitle}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.payrollSub}</p>
          </div>
          <button onClick={openModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Plus className="w-4 h-4"/> {t.addPayroll}
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-xs mr-2 font-medium" style={{ color: 'var(--text-muted)' }}>{t.selectMonth}</label>
            <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              className={inputCls} style={{ width: 'auto' }}/>
          </div>
          {monthFilter && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.totalNet} </span>
              <span className="text-emerald-400 font-bold">${totalNet.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: isLight ? 'var(--bg-card2)' : 'rgba(15,23,42,0.5)' }}>
                  {[t.staffId, t.name, lang==='so'?'Bisha':'Month', t.basicSalary, t.overtime, t.bonus, t.deduction, t.netSalaryLabel].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {filtered.map(p => (
                  <tr key={p.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border2)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">{p.staffId}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text)' }}>{p.staffName}</td>
                    <td className="px-4 py-3"><span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-lg">{p.month}</span></td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>${p.basicSalary.toFixed(2)}</td>
                    <td className="px-4 py-3 text-blue-400">+${p.overtime.toFixed(2)}</td>
                    <td className="px-4 py-3 text-emerald-400">+${p.bonus.toFixed(2)}</td>
                    <td className="px-4 py-3 text-red-400">-${p.deduction.toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-emerald-500">${p.netSalary.toFixed(2)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12" style={{ color: 'var(--text-dim)' }}>
                      {t.noPayrollLogs}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modal} title={t.enterPayroll} onClose={() => setModal(false)}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.selectStaff}</label>
            <select value={form.staffId} onChange={e => onStaffChange(e.target.value)} required className={inputCls}>
              <option value="">{t.selectStaffDefault}</option>
              {staff.filter(s => s.status === 'Active' || s.status === 'Socda').map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.position}) — ${s.salary}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{lang==='so'?'Bisha':'Month'}</label>
            <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} required className={inputCls}/>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs block mb-1.5 font-medium animate-pulse text-blue-400">{lang==='so'?'Dheeraad':'Overtime'}</label>
              <input type="number" min="0" step="0.01" value={form.overtime} onChange={e => setForm(f => ({ ...f, overtime: e.target.value }))} className={inputCls}/>
            </div>
            <div>
              <label className="text-xs block mb-1.5 font-medium animate-pulse text-emerald-400">{lang==='so'?'Haddiyad':'Bonus'}</label>
              <input type="number" min="0" step="0.01" value={form.bonus} onChange={e => setForm(f => ({ ...f, bonus: e.target.value }))} className={inputCls}/>
            </div>
            <div>
              <label className="text-xs block mb-1.5 font-medium animate-pulse text-red-400">{lang==='so'?'Goyn':'Deduction'}</label>
              <input type="number" min="0" step="0.01" value={form.deduction} onChange={e => setForm(f => ({ ...f, deduction: e.target.value }))} className={inputCls}/>
            </div>
          </div>
          {/* Net Preview */}
          <div className="border rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--bg-card2)', borderColor: 'var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t.netSalary}</p>
            <p className="text-3xl font-bold text-emerald-400">${net.toFixed(2)}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
