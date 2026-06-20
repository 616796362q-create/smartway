'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react'

interface Vehicle { id: string; driver: string; fuelCost: number; serviceCost: number; repairCost: number }

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

export default function VehiclesPage() {
  const { t, theme, lang } = useApp()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ id: '', driver: '', fuelCost: '0', serviceCost: '0', repairCost: '0' })
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)

  // Confirm delete modal state
  const [confirmDelete, setConfirmDelete] = useState<Vehicle | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }

  const load = async () => {
    try {
      const d = await apiGet('/vehicles')
      setVehicles(d || [])
    } catch {
      setVehicles([])
    }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setIsEdit(false); setForm({ id: '', driver: '', fuelCost: '0', serviceCost: '0', repairCost: '0' }); setModal(true) }
  const openEdit = (v: Vehicle) => { setIsEdit(true); setForm({ id: v.id, driver: v.driver, fuelCost: String(v.fuelCost), serviceCost: String(v.serviceCost), repairCost: String(v.repairCost) }); setModal(true) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const d = await apiPost('/vehicles', { ...form, username: getUser().username || 'admin' })
      if (d.success) { setVehicles(d.vehicles); setModal(false) }
    } catch {}
    setSaving(false)
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const username = getUser().username || 'admin'
      const d = await apiDelete(`/vehicles/${confirmDelete.id}`, username)
      if (d.success) setVehicles(d.vehicles)
      setConfirmDelete(null)
    } catch {}
    setDeleting(false)
  }

  const totalExpenses = vehicles.reduce((s, v) => s + Number(v.fuelCost) + Number(v.serviceCost) + Number(v.repairCost), 0)
  const isLight = theme === 'light'
  const inputCls = ipt(theme)

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.vehiclesTitle}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.total}: <span className="text-red-400 font-semibold">${totalExpenses.toFixed(2)}</span></p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Plus className="w-4 h-4"/> {t.addVehicle}
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: isLight ? 'var(--bg-card2)' : 'rgba(15,23,42,0.5)' }}>
                {[t.plateNumber, t.driver, t.fuel, t.service, t.repair, t.total, t.actions].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {vehicles.map(v => {
                const total = Number(v.fuelCost) + Number(v.serviceCost) + Number(v.repairCost)
                return (
                  <tr key={v.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border2)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                    <td className="px-4 py-3 font-bold text-blue-400">{v.id}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text)' }}>{v.driver}</td>
                    <td className="px-4 py-3 text-yellow-400 font-medium">${Number(v.fuelCost).toFixed(2)}</td>
                    <td className="px-4 py-3 text-blue-400 font-medium">${Number(v.serviceCost).toFixed(2)}</td>
                    <td className="px-4 py-3 text-orange-400 font-medium">${Number(v.repairCost).toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-red-400">${total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(v)} className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={() => setConfirmDelete(v)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {vehicles.length === 0 && <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--text-dim)' }}>{t.noVehicles}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} title={isEdit ? t.editVehicleTitle : t.addVehicleTitle} onClose={() => setModal(false)}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.plateNumber}</label><input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))} required readOnly={isEdit} placeholder="SOM-1234" className={inputCls}/></div>
          <div><label className="text-xs block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.driver}</label><input value={form.driver} onChange={e=>setForm(f=>({...f,driver:e.target.value}))} required placeholder="Farah Ahmed" className={inputCls}/></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs block mb-1.5 font-medium text-yellow-400">{t.fuel} ($)</label><input type="number" min="0" step="0.01" value={form.fuelCost} onChange={e=>setForm(f=>({...f,fuelCost:e.target.value}))} className={inputCls}/></div>
            <div><label className="text-xs block mb-1.5 font-medium text-blue-400">{t.service} ($)</label><input type="number" min="0" step="0.01" value={form.serviceCost} onChange={e=>setForm(f=>({...f,serviceCost:e.target.value}))} className={inputCls}/></div>
            <div><label className="text-xs block mb-1.5 font-medium text-orange-400">{t.repair} ($)</label><input type="number" min="0" step="0.01" value={form.repairCost} onChange={e=>setForm(f=>({...f,repairCost:e.target.value}))} className={inputCls}/></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">{saving ? t.saving : t.save}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={confirmDelete !== null} title={t.deleteVehicleTitle} onClose={() => setConfirmDelete(null)}>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{t.areYouSure}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {t.deleteVehicleMsg}
              </p>
              <p className="text-xs mt-2 font-semibold px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                {confirmDelete?.id} · {confirmDelete?.driver}
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
