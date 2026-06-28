'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Plus, Trash2, X, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react'

interface Income { id: string; date: string; source: string; description: string; amount: number }

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
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

export default function FinancePage() {
  const { t, theme, lang } = useApp()
  const [income, setIncome] = useState<Income[]>([])
  const [stats, setStats] = useState<{ totalIncome: number; totalExpenses: number; profitLoss: number } | null>(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ date: '', source: 'Client Payments', description: '', amount: '' })
  const [saving, setSaving] = useState(false)

  // Confirm delete modal state
  const [confirmDelete, setConfirmDelete] = useState<Income | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }
  const today = new Date().toISOString().split('T')[0]

  const load = async () => {
    try {
      const [i, s] = await Promise.all([
        apiGet('/income'),
        apiGet('/dashboard/stats'),
      ])
      setIncome(i || []); setStats(s)
    } catch {
      setIncome([]); setStats(null)
    }
  }
  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const d = await apiPost('/income', { ...form, username: getUser().username || 'admin' })
      if (d.success) { await load(); setModal(false) }
    } catch {}
    setSaving(false)
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const username = getUser().username || 'admin'
      const d = await apiDelete(`/income/${confirmDelete.id}`, username)
      if (d.success) { setIncome(d.income); load() }
      setConfirmDelete(null)
    } catch {}
    setDeleting(false)
  }

  const pl = stats?.profitLoss || 0
  const isLight = theme === 'light'
  const inputCls = ipt(theme)

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.financeTitle}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.financeSub}</p>
          </div>
          <button onClick={() => { setForm({ date: today, source: 'Client Payments', description: '', amount: '' }); setModal(true) }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Plus className="w-4 h-4"/> {t.addIncome}
          </button>
        </div>

        {/* Finance Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="border rounded-2xl p-5 border-emerald-500/30" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.totalIncome}</p>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><TrendingUp className="w-5 h-5"/></div>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${(stats?.totalIncome||0).toFixed(2)}</p>
          </div>
          <div className="border rounded-2xl p-5 border-red-500/30" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.totalExpenses}</p>
              <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center"><TrendingDown className="w-5 h-5"/></div>
            </div>
            <p className="text-2xl font-bold text-red-400">${(stats?.totalExpenses||0).toFixed(2)}</p>
          </div>
          <div className="border rounded-2xl p-5 transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: pl >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'
            }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.profitLoss}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pl >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}><DollarSign className="w-5 h-5"/></div>
            </div>
            <p className="text-2xl font-bold" style={{ color: pl >= 0 ? 'var(--emerald-text, #10b981)' : '#ef4444' }}>
              ${Math.abs(pl).toFixed(2)} {pl >= 0 ? '▲' : '▼'}
            </p>
          </div>
        </div>

        {/* Income table */}
        <div>
          <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>{t.registeredIncome}</h3>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: isLight ? 'var(--bg-card2)' : 'rgba(15,23,42,0.5)' }}>
                  {[t.date, t.incomeSource, t.expenseDesc, t.amount, ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {income.map(i => (
                  <tr key={i.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border2)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{i.date}</td>
                    <td className="px-4 py-3"><span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-lg font-medium">{i.source}</span></td>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{i.description}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">${Number(i.amount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setConfirmDelete(i)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5"/></button>
                    </td>
                  </tr>
                ))}
                {income.length === 0 && <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-dim)' }}>{t.noIncome}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modal} title={t.addIncomeTitle} onClose={() => setModal(false)}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.date}</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} required className={inputCls}/></div>
          <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.incomeSource}</label>
            <select value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))} className={inputCls}>
              <option value="Client Payments">Lacagaha Macmiilka</option>
              <option value="Contracts">Qandaraasyada</option>
              <option value="Other Income">Dakhli Kale</option>
            </select>
          </div>
          <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.expenseDesc}</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required placeholder="Tusaale: Dahabshiil HQ Security Contract" className={inputCls}/></div>
          <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.amount}</label><input type="number" min="0.01" step="0.01" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} required placeholder="0.00" className={inputCls}/></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">{saving ? t.saving : t.save}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={confirmDelete !== null} title={t.deleteIncomeTitle} onClose={() => setConfirmDelete(null)}>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{t.areYouSure}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {t.deleteIncomeMsg}
              </p>
              <p className="text-xs mt-2 font-semibold px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                {confirmDelete?.source} · ${Number(confirmDelete?.amount).toFixed(2)} ({confirmDelete?.description})
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
