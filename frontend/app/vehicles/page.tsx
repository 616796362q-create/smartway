'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Plus, Pencil, Trash2, X, Truck, Fuel, Wrench, Settings, AlertTriangle } from 'lucide-react'

interface Vehicle { id: string; driver: string; fuelCost: number; serviceCost: number; repairCost: number }

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

export default function VehiclesPage() {
  const { t, theme } = useApp()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ id: '', driver: '', fuelCost: '0', serviceCost: '0', repairCost: '0' })
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Vehicle | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isLight = theme === 'light'
  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }

  const load = async () => { try { const d = await apiGet('/vehicles'); setVehicles(d || []) } catch { setVehicles([]) } }
  useEffect(() => { load() }, [])

  const openAdd = () => { setIsEdit(false); setForm({ id: '', driver: '', fuelCost: '0', serviceCost: '0', repairCost: '0' }); setModal(true) }
  const openEdit = (v: Vehicle) => { setIsEdit(true); setForm({ id: v.id, driver: v.driver, fuelCost: String(v.fuelCost), serviceCost: String(v.serviceCost), repairCost: String(v.repairCost) }); setModal(true) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try { const d = await apiPost('/vehicles', { ...form, username: getUser().username || 'admin' }); if (d.success) { setVehicles(d.vehicles); setModal(false) } } catch {}
    setSaving(false)
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try { const d = await apiDelete(`/vehicles/${confirmDelete.id}`, getUser().username || 'admin'); if (d.success) setVehicles(d.vehicles); setConfirmDelete(null) } catch {}
    setDeleting(false)
  }

  const totalExpenses = vehicles.reduce((s, v) => s + Number(v.fuelCost) + Number(v.serviceCost) + Number(v.repairCost), 0)

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
          background: 'linear-gradient(135deg, #3b0764 0%, #4c1d95 60%, #3b0764 100%)',
          border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 8px 30px rgba(139,92,246,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{t.vehiclesTitle}</h2>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(221,214,254,0.8)' }}>{t.total}: <span style={{ fontWeight: 800, color: '#f87171' }}>${totalExpenses.toFixed(2)}</span></p>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
          >
            <Plus style={{ width: 16, height: 16 }} /> {t.addVehicle}
          </button>
        </div>

        {/* Stats mini cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { label: t.fuel, val: vehicles.reduce((s, v) => s + Number(v.fuelCost), 0), color: '#f59e0b', icon: Fuel },
            { label: t.service, val: vehicles.reduce((s, v) => s + Number(v.serviceCost), 0), color: '#06b6d4', icon: Settings },
            { label: t.repair, val: vehicles.reduce((s, v) => s + Number(v.repairCost), 0), color: '#f43f5e', icon: Wrench },
          ].map(c => (
            <div key={c.label} style={{ borderRadius: 16, padding: '16px 18px', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: `1px solid ${c.color}25`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <c.icon style={{ width: 17, height: 17, color: c.color }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>${c.val.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.7)', fontWeight: 600 }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ borderRadius: 20, overflow: 'hidden', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isLight ? '#f1f5ff' : 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  {[t.plateNumber, t.driver, t.fuel, t.service, t.repair, t.total, t.actions].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => {
                  const total = Number(v.fuelCost) + Number(v.serviceCost) + Number(v.repairCost)
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isLight ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.07)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 800, color: '#a78bfa' }}>{v.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: isLight ? '#0f172a' : 'white' }}>{v.driver}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f59e0b' }}>${Number(v.fuelCost).toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#06b6d4' }}>${Number(v.serviceCost).toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f43f5e' }}>${Number(v.repairCost).toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#fb7185', fontSize: 14 }}>${total.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(v)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Pencil style={{ width: 13, height: 13 }} /></button>
                          <button onClick={() => setConfirmDelete(v)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 style={{ width: 13, height: 13 }} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {vehicles.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'rgba(100,116,139,0.6)' }}>{t.noVehicles}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} title={isEdit ? t.editVehicleTitle : t.addVehicleTitle} onClose={() => setModal(false)}>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.plateNumber}</label>
            <input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} required readOnly={isEdit} placeholder="SOM-1234" style={{ ...inp, opacity: isEdit ? 0.6 : 1 }}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.driver}</label>
            <input value={form.driver} onChange={e => setForm(f => ({ ...f, driver: e.target.value }))} required placeholder="Farah Ahmed" style={inp}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: `${t.fuel} ($)`, field: 'fuelCost', val: form.fuelCost, color: '#f59e0b' },
              { label: `${t.service} ($)`, field: 'serviceCost', val: form.serviceCost, color: '#06b6d4' },
              { label: `${t.repair} ($)`, field: 'repairCost', val: form.repairCost, color: '#f43f5e' },
            ].map(f => (
              <div key={f.field}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: f.color, marginBottom: 7 }}>{f.label}</label>
                <input type="number" min="0" step="0.01" value={f.val} onChange={e => setForm(prev => ({ ...prev, [f.field]: e.target.value }))} style={{ ...inp, borderColor: `${f.color}30` }}
                  onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = f.color}
                  onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = `${f.color}30`} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', color: 'rgba(148,163,184,0.8)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: saving ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(139,92,246,0.35)' }}>
              {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={confirmDelete !== null} title={t.deleteVehicleTitle} onClose={() => setConfirmDelete(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16, background: 'rgba(244,63,94,0.06)', borderRadius: 14, border: '1px solid rgba(244,63,94,0.15)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AlertTriangle style={{ width: 20, height: 20, color: '#f43f5e' }} /></div>
            <div>
              <p style={{ fontWeight: 700, color: 'white', marginBottom: 5 }}>{t.areYouSure}</p>
              <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)' }}>{t.deleteVehicleMsg}</p>
              <p style={{ fontSize: 12, color: '#a78bfa', marginTop: 6, fontWeight: 700 }}>{confirmDelete?.id} · {confirmDelete?.driver}</p>
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
