'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { Plus, Search, Pencil, Trash2, X, UserCheck, AlertTriangle } from 'lucide-react'

interface Staff {
  id: string; name: string; phone: string; position: string
  salary: number; joinDate: string; status: string
}

const POSITIONS = ['Guard', 'Supervisor', 'Driver', 'Cook']

const BADGE: Record<string, string> = {
  Guard: 'bg-blue-500/20 text-blue-400', Supervisor: 'bg-purple-500/20 text-purple-400',
  Driver: 'bg-yellow-500/20 text-yellow-400', Cook: 'bg-pink-500/20 text-pink-400',
  Active: 'bg-emerald-500/20 text-emerald-400', Inactive: 'bg-slate-500/20 text-slate-400',
  Socda: 'bg-emerald-500/20 text-emerald-400', 'La joojiyay': 'bg-slate-500/20 text-slate-400',
}

const ipt = (theme: string) =>
  `w-full text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:opacity-40 ${
    theme === 'light'
      ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500'
      : 'bg-slate-900 border border-slate-600 text-white focus:border-blue-500'
  }`

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl w-full max-w-md shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-base" style={{ color: 'var(--text)' }}>{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

const EMPTY = { name: '', phone: '', position: 'Guard', salary: '', joinDate: '', status: 'Active' }

export default function StaffPage() {
  const { t, theme } = useApp()
  const [staff, setStaff] = useState<Staff[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Staff | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<Staff | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiGet('/staff')
      setStaff(Array.isArray(data) ? data : [])
    } catch { setStaff([]) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY, joinDate: new Date().toISOString().split('T')[0] })
    setModal(true)
  }
  const openEdit = (s: Staff) => {
    setEditing(s)
    setForm({ name: s.name, phone: s.phone, position: s.position, salary: String(s.salary), joinDate: s.joinDate, status: s.status })
    setModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, username: getUser().username || 'admin' }
      if (editing) {
        const d = await apiPut(`/staff/${editing.id}`, payload)
        if (d.success) { setStaff(d.staff); setModal(false) }
      } else {
        const d = await apiPost('/staff', payload)
        if (d.success) { setStaff(d.staff); setModal(false) }
      }
    } catch { /* silent */ }
    setSaving(false)
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const username = getUser().username || 'admin'
      const d = await apiDelete(`/staff/${confirmDelete.id}`, username)
      if (d.success) { setStaff(d.staff); setConfirmDelete(null) }
    } catch { /* silent */ }
    setDeleting(false)
  }

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.position.toLowerCase().includes(search.toLowerCase())
  )

  const inputCls = ipt(theme)
  const isLight = theme === 'light'

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.staffReg}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{staff.length} {t.staffCount}</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Plus className="w-4 h-4" /> {t.addStaff}
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-dim)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
            className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: isLight ? 'var(--bg-card2)' : 'rgba(15,23,42,0.5)' }}>
                  {[t.staffId, t.name, t.phone, t.position, t.salary, t.startDate, t.status, t.actions].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12" style={{ color: 'var(--text-dim)' }}>{t.loading}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12" style={{ color: 'var(--text-dim)' }}>
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {t.noRecords}
                  </td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border2)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">{s.id}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text)' }}>{s.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{s.phone}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${BADGE[s.position] || ''}`}>{s.position}</span></td>
                    <td className="px-4 py-3 text-emerald-500 font-semibold">${Number(s.salary).toFixed(2)}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{s.joinDate}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${BADGE[s.status] || ''}`}>{s.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(s)} title={t.edit} className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 flex items-center justify-center transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete(s)} title={t.delete} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 flex items-center justify-center transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} title={editing ? `${t.editStaff}: ${editing.name}` : t.addStaff} onClose={() => setModal(false)}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.name}</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Maxamed Xasan / Mohamed Hassan" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.phone}</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="+252 61 555 0000" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.position}</label>
              <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className={inputCls}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.salary}</label>
              <input type="number" min="0" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} required placeholder="300" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.startDate}</label>
              <input type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{t.status}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
                <option value="Active">{t.active}</option>
                <option value="Inactive">{t.inactive}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>
              {t.cancel}
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              {saving ? t.saving : editing ? t.update : t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={confirmDelete !== null} title={t.deleteStaffTitle} onClose={() => setConfirmDelete(null)}>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{t.areYouSure}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {t.deleteStaffMsg}
                <span className="font-semibold ml-1" style={{ color: 'var(--text)' }}>{confirmDelete?.name}</span>
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>ID: {confirmDelete?.id} · {confirmDelete?.position}</p>
              <p className="text-xs text-red-400 mt-2">{t.deleteStaffWarn}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>
              {t.stopDelete}
            </button>
            <button onClick={confirmAndDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
              {deleting ? t.deleting : <><Trash2 className="w-4 h-4" /> {t.confirmDelete}</>}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
