'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Plus, Trash2, X, UtensilsCrossed, Fuel, Wrench, Zap, MoreHorizontal, AlertTriangle } from 'lucide-react'

const TABS = (t: any) => [
  { key: 'Kitchen', label: t.kitchenJiko, icon: UtensilsCrossed },
  { key: 'Fuel', label: t.fuelShidaal, icon: Fuel },
  { key: 'Repairs', label: t.repairsDayactir, icon: Wrench },
  { key: 'Utilities', label: t.utilities, icon: Zap },
  { key: 'Others', label: t.others, icon: MoreHorizontal },
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

  // Confirm delete modal state
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'kitchen' | 'expense'; desc?: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }
  const today = new Date().toISOString().split('T')[0]

  const load = async () => {
    try {
      const [e, k] = await Promise.all([
        apiGet('/expenses'),
        apiGet('/kitchen-daily'),
      ])
      setExpenses(e || []); setKitchenDaily(k || [])
    } catch {
      setExpenses([]); setKitchenDaily([])
    }
  }
  useEffect(() => {
    load()
    setSelectedDate(new Date().toISOString().split('T')[0])
  }, [])

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
  const kitTotal = filteredKitchen.reduce((s, k) => s + k.amount, 0)

  const isLight = theme === 'light'
  const inputCls = ipt(theme)
  const tabs = TABS(t)

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.expensesTitle}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.expensesSubtitle}</p>
          </div>
          <button onClick={openModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Plus className="w-4 h-4"/> {t.addExpense}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1 overflow-x-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${activeTab === key ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/10'}`}
              style={{ color: activeTab === key ? '#ffffff' : 'var(--text-muted)' }}>
              <Icon className="w-4 h-4"/>{label}
            </button>
          ))}
        </div>

        {/* Date filter picker */}
        <div className="flex items-center gap-3 rounded-2xl p-4 flex-wrap" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <label className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{t.selectDate}</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className={inputCls} style={{ width: 'auto' }}/>
          {selectedDate !== today && (
            <button onClick={() => setSelectedDate(today)}
              className="text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-medium px-3 py-2 rounded-xl transition-all cursor-pointer">
              {t.returnToToday}
            </button>
          )}
        </div>

        {/* Kitchen: Daily price view */}
        {activeTab === 'Kitchen' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.kitchenExpTotal}</p>
                <p className="text-2xl font-bold text-red-400">${kitTotal.toFixed(2)}</p>
              </div>
              <UtensilsCrossed className="w-8 h-8 opacity-30" style={{ color: 'var(--text-muted)' }}/>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: isLight ? 'var(--bg-card2)' : 'rgba(15,23,42,0.5)' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.date}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.kitchenAmountLabel}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.note}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                  {filteredKitchen.map(k => (
                    <tr key={k.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border2)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                      <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{k.date}</td>
                      <td className="px-4 py-3 text-red-400 font-bold text-base">${k.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 italic" style={{ color: 'var(--text-muted)' }}>{k.note || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setConfirmDelete({ id: k.id, type: 'kitchen', desc: `$${k.amount.toFixed(2)} (${k.note || 'Kitchen'})` })} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredKitchen.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 italic" style={{ color: 'var(--text-dim)' }}>
                        {t.noKitchenExp}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other tabs: standard expense list */}
        {activeTab !== 'Kitchen' && (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: isLight ? 'var(--bg-card2)' : 'rgba(15,23,42,0.5)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.date}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.expenseSubcat}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.expenseDesc}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t.amount}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border2)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{e.date}</td>
                    <td className="px-4 py-3"><span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-lg font-medium">{e.subCategory}</span></td>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{e.description}</td>
                    <td className="px-4 py-3 text-red-400 font-bold">${e.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setConfirmDelete({ id: e.id, type: 'expense', desc: `${e.subCategory}: $${e.amount.toFixed(2)} (${e.description})` })} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 italic" style={{ color: 'var(--text-dim)' }}>
                      {t.noExpenses}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Kitchen Modal */}
      <Modal open={modal && activeTab === 'Kitchen'} title={t.kitchenModalTitle} onClose={() => setModal(false)}>
        <form onSubmit={saveKitchen} className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs text-slate-500">📅 {t.date}:</span>
            <span className="text-sm font-semibold text-blue-400">{selectedDate || today}</span>
            <span className="text-xs text-slate-500 ml-auto">{t.automatic}</span>
          </div>
          <div>
            <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.kitchenAmountLabel}</label>
            <input type="number" min="0.01" step="0.01" value={kitForm.amount}
              onChange={e => setKitForm(f => ({ ...f, amount: e.target.value }))} required
              placeholder="Tusaale: 10" className={inputCls}/>
            <p className="text-xs text-slate-500 mt-1">{t.kitchenAmountHint}</p>
          </div>
          <div>
            <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.noteOptional}</label>
            <input type="text" value={kitForm.note} onChange={e => setKitForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Tusaale: Rice, Hilib iyo Caano..." className={inputCls}/>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Other Expense Modal */}
      <Modal open={modal && activeTab !== 'Kitchen'} title={`${t.addExpenseFor} ${activeTab}`} onClose={() => setModal(false)}>
        <form onSubmit={saveExpense} className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs text-slate-500">📅 {t.date}:</span>
            <span className="text-sm font-semibold text-blue-400">{selectedDate || today}</span>
            <span className="text-xs text-slate-500 ml-auto">{t.automatic}</span>
          </div>
          <div>
            <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.expenseSubcat}</label>
            <select value={form.subCategory} onChange={e => setForm(f => ({ ...f, subCategory: e.target.value }))} className={inputCls}>
              {(SUBCATS[activeTab] || []).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.expenseDesc}</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Sharaxaad..." className={inputCls}/>
          </div>
          <div>
            <label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.amount}</label>
            <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required placeholder="0.00" className={inputCls}/>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={confirmDelete !== null} title={t.deleteExpenseTitle} onClose={() => setConfirmDelete(null)}>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{t.areYouSure}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {t.deleteExpenseMsg}
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
