'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Plus, Trash2, X, UtensilsCrossed, Fuel, Wrench, Zap, MoreHorizontal, AlertTriangle, DollarSign } from 'lucide-react'

const TABS = (t: any) => [
  { key: 'Kitchen', label: t.kitchenJiko, icon: UtensilsCrossed, color: '#f43f5e' },
  { key: 'Fuel', label: t.fuelShidaal, icon: Fuel, color: '#f59e0b' },
  { key: 'Repairs', label: t.repairsDayactir, icon: Wrench, color: '#8b5cf6' },
  { key: 'Utilities', label: t.utilities, icon: Zap, color: '#06b6d4' },
  { key: 'Others', label: t.others, icon: MoreHorizontal, color: '#10b981' },
]

const SUBCATS: Record<string, string[]> = {
  Kitchen: ['Rice','Sugar','Oil','Meat','Water','Other'],
  Fuel: ['Diesel','Petrol','Generator Fuel'],
  Repairs: ['Vehicle Repair','Generator Repair','Building Maintenance'],
  Utilities: ['Electricity','Water Bill','Internet','Garbage'],
  Others: ['Office Supplies','Miscellaneous'],
}

interface Expense { id: string; date: string; category: string; subCategory: string; description: string; amount: number }
interface KitchenEntry { id: string; date: string; amount: number; note: string }

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

export default function ExpensesPage() {
  const { t, theme } = useApp()
  const [activeTab, setActiveTab] = useState('Kitchen')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [kitchenDaily, setKitchenDaily] = useState<KitchenEntry[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ subCategory: '', description: '', amount: '' })
  const [kitForm, setKitForm] = useState({ amount: '', note: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'kitchen' | 'expense'; desc?: string } | null>(null)
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
  const tabs = TABS(t)
  const activeColor = tabs.find(tb => tb.key === activeTab)?.color || '#6366f1'

  const getSavedDate = () => {
    if (typeof window === 'undefined') return today
    const savedDate = localStorage.getItem('sw_report_date')
    const savedMonth = localStorage.getItem('sw_selected_month')
    if (savedDate && /^\d{4}-\d{2}-\d{2}$/.test(savedDate)) return savedDate
    if (savedMonth && /^\d{4}-\d{2}$/.test(savedMonth)) return `${savedMonth}-01`
    return today
  }

  const setSharedDate = (date: string) => {
    const nextDate = date || today
    setSelectedDate(nextDate)
    localStorage.setItem('sw_report_date', nextDate)
    localStorage.setItem('sw_selected_month', nextDate.slice(0, 7))
  }

  const load = async () => {
    try {
      const [e, k] = await Promise.all([apiGet('/expenses'), apiGet('/kitchen-daily')])
      setExpenses(e || []); setKitchenDaily(k || [])
    } catch { setExpenses([]); setKitchenDaily([]) }
  }
  useEffect(() => { load(); setSharedDate(getSavedDate()) }, [])

  const openModal = () => {
    if (activeTab === 'Kitchen') setKitForm({ amount: '', note: '' })
    else setForm({ subCategory: SUBCATS[activeTab][0], description: '', amount: '' })
    setModal(true)
  }

  const saveKitchen = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const d = await apiPost('/kitchen-daily', { ...kitForm, date: selectedDate || today, username: getUser().username || 'admin' })
      if (d.success) { setKitchenDaily(d.kitchenDaily); setModal(false) }
    } catch {}
    setSaving(false)
  }

  const saveExpense = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const d = await apiPost('/expenses', { ...form, date: selectedDate || today, category: activeTab, username: getUser().username || 'admin' })
      if (d.success) { setExpenses(d.expenses); setModal(false) }
    } catch {}
    setSaving(false)
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const username = getUser().username || 'admin'
      if (confirmDelete.type === 'kitchen') {
        const d = await apiDelete(`/kitchen-daily/${confirmDelete.id}`, username)
        if (d.success) setKitchenDaily(d.kitchenDaily)
      } else {
        const d = await apiDelete(`/expenses/${confirmDelete.id}`, username)
        if (d.success) setExpenses(d.expenses)
      }
      setConfirmDelete(null)
    } catch {}
    setDeleting(false)
  }

  const filteredKitchen = kitchenDaily.filter(k => k.date === selectedDate)
  const filteredExpenses = expenses.filter(e => e.category === activeTab && e.date === selectedDate)
  const kitTotal = filteredKitchen.reduce((s, k) => s + (Number(k.amount) || 0), 0)

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500,
    background: isLight ? '#f8faff' : 'rgba(7,11,20,0.8)',
    border: '1px solid rgba(99,102,241,0.2)', color: isLight ? '#0f172a' : 'white',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{
          borderRadius: 20, padding: '24px 28px',
          background: 'linear-gradient(135deg, #7c1d1d 0%, #991b1b 60%, #7c1d1d 100%)',
          border: '1px solid rgba(244,63,94,0.3)', boxShadow: '0 8px 30px rgba(244,63,94,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{t.expensesTitle}</h2>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(254,202,202,0.8)' }}>{t.expensesSubtitle}</p>
          </div>
          <button onClick={openModal} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
          >
            <Plus style={{ width: 16, height: 16 }} /> {t.addExpense}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, background: isLight ? 'white' : 'rgba(13,20,36,0.8)', padding: 6, borderRadius: 16, border: '1px solid rgba(99,102,241,0.12)', overflowX: 'auto' }}>
          {tabs.map(({ key, label, icon: Icon, color }) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 11,
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === key ? `${color}18` : 'transparent',
              color: activeTab === key ? color : 'rgba(148,163,184,0.7)',
              border: activeTab === key ? `1px solid ${color}35` : '1px solid transparent',
            }}>
              <Icon style={{ width: 14, height: 14 }} />{label}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.12)', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: isLight ? '#0f172a' : 'white' }}>{t.selectDate}</label>
          <input type="date" value={selectedDate} onChange={e => setSharedDate(e.target.value)} style={{ ...inp, width: 'auto', padding: '8px 12px' }}
            onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
            onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
          {selectedDate !== today && (
            <button onClick={() => setSharedDate(today)} style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {t.returnToToday}
            </button>
          )}
        </div>

        {/* Kitchen view */}
        {activeTab === 'Kitchen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ borderRadius: 16, padding: '18px 20px', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(148,163,184,0.6)', marginBottom: 4, textTransform: 'uppercase' }}>{t.kitchenExpTotal}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#f43f5e' }}>${kitTotal.toFixed(2)}</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UtensilsCrossed style={{ width: 22, height: 22, color: '#f43f5e' }} />
              </div>
            </div>
            <div style={{ borderRadius: 18, overflow: 'hidden', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f1f5ff' : 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {[t.date, t.kitchenAmountLabel, t.note, ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredKitchen.map(k => (
                    <tr key={k.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isLight ? 'rgba(244,63,94,0.04)' : 'rgba(244,63,94,0.07)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px', color: 'rgba(148,163,184,0.8)' }}>{k.date}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#f43f5e', fontSize: 16 }}>${Number(k.amount).toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', color: 'rgba(148,163,184,0.6)', fontStyle: 'italic' }}>{k.note || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => setConfirmDelete({ id: k.id, type: 'kitchen', desc: `$${Number(k.amount).toFixed(2)} (${k.note || 'Kitchen'})` })} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 style={{ width: 13, height: 13 }} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredKitchen.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'rgba(100,116,139,0.6)', fontStyle: 'italic' }}>{t.noKitchenExp}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other expense tabs */}
        {activeTab !== 'Kitchen' && (
          <div style={{ borderRadius: 18, overflow: 'hidden', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isLight ? '#f1f5ff' : 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  {[t.date, t.expenseSubcat, t.expenseDesc, t.amount, ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.15s' }}
                    onMouseEnter={row => (row.currentTarget as HTMLElement).style.background = isLight ? `${activeColor}06` : `${activeColor}09`}
                    onMouseLeave={row => (row.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', color: 'rgba(148,163,184,0.8)' }}>{e.date}</td>
                    <td style={{ padding: '14px 16px' }}><span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: `${activeColor}15`, color: activeColor, border: `1px solid ${activeColor}30` }}>{e.subCategory}</span></td>
                    <td style={{ padding: '14px 16px', color: isLight ? '#0f172a' : 'rgba(241,245,249,0.85)' }}>{e.description}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#f43f5e' }}>${Number(e.amount).toFixed(2)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => setConfirmDelete({ id: e.id, type: 'expense', desc: `${e.subCategory}: $${Number(e.amount).toFixed(2)}` })} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 style={{ width: 13, height: 13 }} /></button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'rgba(100,116,139,0.6)', fontStyle: 'italic' }}>{t.noExpenses}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Kitchen Modal */}
      <Modal open={modal && activeTab === 'Kitchen'} title={t.kitchenModalTitle} onClose={() => setModal(false)}>
        <form onSubmit={saveKitchen} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 8 }}>
            📅 <span style={{ fontWeight: 700 }}>{selectedDate || today}</span><span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>{t.automatic}</span>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.kitchenAmountLabel}</label>
            <input type="number" min="0.01" step="0.01" value={kitForm.amount} onChange={e => setKitForm(f => ({ ...f, amount: e.target.value }))} required placeholder="10.00" style={inp}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,63,94,0.5)'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
            <p style={{ fontSize: 11, color: 'rgba(100,116,139,0.6)', marginTop: 4 }}>{t.kitchenAmountHint}</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.noteOptional}</label>
            <input value={kitForm.note} onChange={e => setKitForm(f => ({ ...f, note: e.target.value }))} placeholder="Rice, Meat, Milk..." style={inp}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', color: 'rgba(148,163,184,0.8)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: saving ? 'rgba(244,63,94,0.4)' : 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(244,63,94,0.35)' }}>{saving ? t.saving : t.save}</button>
          </div>
        </form>
      </Modal>

      {/* Other Expense Modal */}
      <Modal open={modal && activeTab !== 'Kitchen'} title={`${t.addExpenseFor} ${activeTab}`} onClose={() => setModal(false)}>
        <form onSubmit={saveExpense} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 8 }}>
            📅 <span style={{ fontWeight: 700 }}>{selectedDate || today}</span><span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>{t.automatic}</span>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.expenseSubcat}</label>
            <select value={form.subCategory} onChange={e => setForm(f => ({ ...f, subCategory: e.target.value }))} style={{ ...inp, appearance: 'none' }}>
              {(SUBCATS[activeTab] || []).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.expenseDesc}</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Description..." style={inp}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.amount}</label>
            <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required placeholder="0.00" style={inp}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', color: 'rgba(148,163,184,0.8)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: saving ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}>{saving ? t.saving : t.save}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={confirmDelete !== null} title={t.deleteExpenseTitle} onClose={() => setConfirmDelete(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16, background: 'rgba(244,63,94,0.06)', borderRadius: 14, border: '1px solid rgba(244,63,94,0.15)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AlertTriangle style={{ width: 20, height: 20, color: '#f43f5e' }} /></div>
            <div>
              <p style={{ fontWeight: 700, color: 'white', marginBottom: 5 }}>{t.areYouSure}</p>
              <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', lineHeight: 1.5 }}>{t.deleteExpenseMsg}</p>
              <p style={{ fontSize: 12, color: '#fb7185', marginTop: 6 }}>{confirmDelete?.desc}</p>
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
