'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Plus, Trash2, X, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calendar } from 'lucide-react'

interface Income { id: string; date: string; source: string; description: string; amount: number }

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'linear-gradient(135deg, #0d1424, #111827)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(148,163,184,0.7)', display: 'flex' }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

export default function FinancePage() {
  const { t, theme } = useApp()
  const [income, setIncome] = useState<Income[]>([])
  const [stats, setStats] = useState<{ totalIncome: number; totalExpenses: number; profitLoss: number } | null>(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ date: '', source: 'Client Payments', description: '', amount: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Income | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isLight = theme === 'light'
  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const today = formatDate(new Date())
  const currentMonth = today.slice(0, 7)
  const [monthFilter, setMonthFilterState] = useState(() => {
    if (typeof window === 'undefined') return currentMonth
    const saved = localStorage.getItem('sw_selected_month')
    return saved && /^\d{4}-\d{2}$/.test(saved) ? saved : currentMonth
  })

  const setSelectedMonth = (month: string) => {
    const nextMonth = month || currentMonth
    setMonthFilterState(nextMonth)
    localStorage.setItem('sw_selected_month', nextMonth)
    localStorage.setItem('sw_report_date', `${nextMonth}-01`)
  }

  const load = async (selectedMonth = monthFilter) => {
    try {
      const [i, s] = await Promise.all([apiGet('/income'), apiGet(`/dashboard/stats?month=${selectedMonth}`)])
      setIncome(i || []); setStats(s)
    } catch { setIncome([]); setStats(null) }
  }
  useEffect(() => { load() }, [monthFilter])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const d = await apiPost('/income', { ...form, username: getUser().username || 'admin' })
      if (d.success) {
        const savedMonth = form.date ? form.date.slice(0, 7) : monthFilter
        setSelectedMonth(savedMonth)
        await load(savedMonth)
        setModal(false)
      }
    } catch {}
    setSaving(false)
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const d = await apiDelete(`/income/${confirmDelete.id}`, getUser().username || 'admin')
      if (d.success) { setIncome(d.income); load() }
      setConfirmDelete(null)
    } catch {}
    setDeleting(false)
  }

  const pl = stats?.profitLoss || 0
  const filteredIncome = income.filter(item => (item.date || '').slice(0, 7) === monthFilter)

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500,
    background: isLight ? '#f8faff' : 'rgba(7,11,20,0.8)',
    border: '1px solid rgba(99,102,241,0.2)', color: isLight ? '#0f172a' : 'white',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  const summaryCards = [
    { label: t.totalIncome, value: stats?.totalIncome || 0, icon: TrendingUp, gradient: 'linear-gradient(135deg, #10b981, #059669)', glow: 'rgba(16,185,129,0.3)', border: 'rgba(16,185,129,0.2)' },
    { label: t.totalExpenses, value: stats?.totalExpenses || 0, icon: TrendingDown, gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', glow: 'rgba(244,63,94,0.3)', border: 'rgba(244,63,94,0.2)' },
    { label: t.profitLoss, value: pl, icon: DollarSign, gradient: pl >= 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f43f5e, #e11d48)', glow: pl >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)', border: pl >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', special: true },
  ]

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{
          borderRadius: 20, padding: '24px 28px',
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #064e3b 100%)',
          border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 8px 30px rgba(16,185,129,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{t.financeTitle}</h2>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(167,243,208,0.8)' }}>{t.financeSub}</p>
          </div>
          <button onClick={() => { setForm({ date: today, source: 'Client Payments', description: '', amount: '' }); setModal(true) }} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
          >
            <Plus style={{ width: 16, height: 16 }} /> {t.addIncome}
          </button>
        </div>

        <div style={{
          background: isLight ? 'white' : 'rgba(13,20,36,0.8)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 16, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
        }}>
          <Calendar style={{ width: 16, height: 16, color: '#10b981' }} />
          <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>Bisha income-ka:</label>
          <input type="month" value={monthFilter} onChange={e => setSelectedMonth(e.target.value || currentMonth)}
            style={{ ...inp, width: 'auto', padding: '8px 12px' }} />
          {monthFilter !== currentMonth && (
            <button onClick={() => setSelectedMonth(currentMonth)} style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 10, color: '#10b981', padding: '7px 12px', fontSize: 12,
              cursor: 'pointer', fontWeight: 700
            }}>Bishan</button>
          )}
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {summaryCards.map((c, i) => (
            <div key={i} style={{
              borderRadius: 18, padding: 20, background: isLight ? 'white' : 'rgba(13,20,36,0.8)',
              border: `1px solid ${c.border}`, boxShadow: `0 4px 20px ${c.glow}`, transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px ${c.glow}` }}>
                  <c.icon style={{ width: 18, height: 18, color: 'white' }} />
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.5px', marginBottom: 4 }}>
                ${Math.abs(c.value).toFixed(2)}
                {c.special && <span style={{ fontSize: 14, marginLeft: 6, fontWeight: 700, color: pl >= 0 ? '#10b981' : '#f43f5e' }}>{pl >= 0 ? '▲' : '▼'}</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Income table */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: isLight ? '#0f172a' : 'white', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 18, borderRadius: 10, background: 'linear-gradient(180deg, #10b981, #059669)', display: 'inline-block' }} />
            {t.registeredIncome}
          </h3>
          <div style={{ borderRadius: 20, overflow: 'hidden', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f1f5ff' : 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {[t.date, t.incomeSource, t.expenseDesc, t.amount, ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredIncome.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isLight ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.07)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', color: 'rgba(148,163,184,0.8)' }}>{item.date}</td>
                      <td style={{ padding: '14px 16px' }}><span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>{item.source}</span></td>
                      <td style={{ padding: '14px 16px', color: isLight ? '#0f172a' : 'rgba(241,245,249,0.85)' }}>{item.description}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#10b981', fontSize: 14 }}>${Number(item.amount).toFixed(2)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => setConfirmDelete(item)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 style={{ width: 13, height: 13 }} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredIncome.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'rgba(100,116,139,0.6)' }}>{t.noIncome}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Income Modal */}
      <Modal open={modal} title={t.addIncomeTitle} onClose={() => setModal(false)}>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: t.date, field: 'date', type: 'date', val: form.date, placeholder: '' },
            { label: t.expenseDesc, field: 'description', type: 'text', val: form.description, placeholder: 'Dahabshiil HQ Security Contract' },
            { label: t.amount, field: 'amount', type: 'number', val: form.amount, placeholder: '0.00' },
          ].map(f => (
            <div key={f.field}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <input type={f.type} value={f.val} onChange={e => setForm(prev => ({ ...prev, [f.field]: e.target.value }))} required placeholder={f.placeholder} style={inp}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.incomeSource}</label>
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} style={{ ...inp, appearance: 'none' }}>
              <option value="Client Payments">Client Payments</option>
              <option value="Contracts">Contracts</option>
              <option value="Other Income">Other Income</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', color: 'rgba(148,163,184,0.8)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: saving ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.35)' }}>
              {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={confirmDelete !== null} title={t.deleteIncomeTitle} onClose={() => setConfirmDelete(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16, background: 'rgba(244,63,94,0.06)', borderRadius: 14, border: '1px solid rgba(244,63,94,0.15)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AlertTriangle style={{ width: 20, height: 20, color: '#f43f5e' }} /></div>
            <div>
              <p style={{ fontWeight: 700, color: 'white', marginBottom: 5 }}>{t.areYouSure}</p>
              <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', lineHeight: 1.5 }}>{t.deleteIncomeMsg}</p>
              <p style={{ fontSize: 12, color: '#fb7185', marginTop: 6 }}>{confirmDelete?.source} · ${Number(confirmDelete?.amount).toFixed(2)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', color: 'rgba(148,163,184,0.8)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{t.cancel}</button>
            <button onClick={confirmAndDelete} disabled={deleting} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', fontWeight: 700, fontSize: 13, cursor: deleting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>
              {deleting ? t.deleting : t.confirm}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
