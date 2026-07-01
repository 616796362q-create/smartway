'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { Plus, Search, Pencil, Trash2, X, Users, AlertTriangle, CheckCircle } from 'lucide-react'

interface Staff {
  id: string; name: string; phone: string; position: string
  salary: number; joinDate: string; status: string
}

const POSITIONS = ['Guard', 'Supervisor', 'Driver', 'Cook']

const POS_COLOR: Record<string, string> = {
  Guard: '#6366f1', Supervisor: '#8b5cf6', Driver: '#f59e0b', Cook: '#f43f5e',
}

const EMPTY = { name: '', phone: '', position: 'Guard', salary: '', joinDate: '', status: 'Active' }

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'linear-gradient(135deg, #0d1424, #111827)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(148,163,184,0.7)', display: 'flex' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

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

  const isLight = theme === 'light'
  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }

  const load = async () => {
    setLoading(true)
    try { const data = await apiGet('/staff'); setStaff(Array.isArray(data) ? data : []) } catch { setStaff([]) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, joinDate: new Date().toISOString().split('T')[0] }); setModal(true) }
  const openEdit = (s: Staff) => { setEditing(s); setForm({ name: s.name, phone: s.phone, position: s.position, salary: String(s.salary), joinDate: s.joinDate, status: s.status }); setModal(true) }

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
    } catch {}
    setSaving(false)
  }

  const confirmAndDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const d = await apiDelete(`/staff/${confirmDelete.id}`, getUser().username || 'admin')
      if (d.success) { setStaff(d.staff); setConfirmDelete(null) }
    } catch {}
    setDeleting(false)
  }

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.position.toLowerCase().includes(search.toLowerCase())
  )

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
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%)',
          border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 8px 30px rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{t.staffReg}</h2>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(196,181,253,0.75)' }}>{staff.length} {t.staffCount}</p>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
          >
            <Plus style={{ width: 16, height: 16 }} /> {t.addStaff}
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 320 }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(148,163,184,0.5)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
            style={{ ...inp, paddingLeft: 40 }}
            onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
            onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'}
          />
        </div>

        {/* Table */}
        <div style={{ borderRadius: 20, overflow: 'hidden', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isLight ? '#f1f5ff' : 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  {[t.staffId, t.name, t.phone, t.position, t.salary, t.startDate, t.status, t.actions].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'rgba(148,163,184,0.5)' }}>{t.loading}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'rgba(100,116,139,0.6)' }}>
                    <Users style={{ width: 36, height: 36, margin: '0 auto 10px', opacity: 0.25 }} />
                    <div>{t.noRecords}</div>
                  </td></tr>
                ) : filtered.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', transition: 'background 0.15s', animationDelay: `${i * 0.04}s` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isLight ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.07)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 11, color: '#818cf8', fontWeight: 700 }}>{s.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: isLight ? '#0f172a' : 'white', whiteSpace: 'nowrap' }}>{s.name}</td>
                    <td style={{ padding: '14px 16px', color: 'rgba(148,163,184,0.8)' }}>{s.phone}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: `${POS_COLOR[s.position] || '#6366f1'}18`, color: POS_COLOR[s.position] || '#6366f1', border: `1px solid ${POS_COLOR[s.position] || '#6366f1'}30` }}>{s.position}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 700 }}>${Number(s.salary).toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', color: 'rgba(148,163,184,0.7)' }}>{s.joinDate}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: s.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)', color: s.status === 'Active' ? '#10b981' : '#64748b', border: `1px solid ${s.status === 'Active' ? 'rgba(16,185,129,0.25)' : 'rgba(100,116,139,0.2)'}` }}>{s.status === 'Active' ? t.active : t.inactive}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(s)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.2)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'}
                        ><Pencil style={{ width: 13, height: 13 }} /></button>
                        <button onClick={() => setConfirmDelete(s)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.18)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
                        ><Trash2 style={{ width: 13, height: 13 }} /></button>
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
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.name}</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Full Name" style={inp}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.phone}</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="+252 61 555 0000" style={inp}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.position}</label>
              <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} style={{ ...inp, appearance: 'none' }}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.salary}</label>
              <input type="number" min="0" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} required placeholder="300" style={inp}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.startDate}</label>
              <input type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} required style={inp}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.status}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inp, appearance: 'none' }}>
                <option value="Active">{t.active}</option>
                <option value="Inactive">{t.inactive}</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', color: 'rgba(148,163,184,0.8)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{t.cancel}</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: saving ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: saving ? 'none' : '0 4px 15px rgba(99,102,241,0.35)' }}>
              {saving ? t.saving : editing ? t.update : t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={confirmDelete !== null} title={t.deleteStaffTitle} onClose={() => setConfirmDelete(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px', background: 'rgba(244,63,94,0.06)', borderRadius: 14, border: '1px solid rgba(244,63,94,0.15)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle style={{ width: 20, height: 20, color: '#f43f5e' }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: 'white', marginBottom: 5 }}>{t.areYouSure}</p>
              <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', lineHeight: 1.5 }}>{t.deleteStaffMsg} <span style={{ color: 'white', fontWeight: 700 }}>{confirmDelete?.name}</span></p>
              <p style={{ fontSize: 11, color: 'rgba(100,116,139,0.7)', marginTop: 5 }}>ID: {confirmDelete?.id} · {confirmDelete?.position}</p>
              <p style={{ fontSize: 12, color: '#fb7185', marginTop: 8 }}>{t.deleteStaffWarn}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', color: 'rgba(148,163,184,0.8)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{t.cancel}</button>
            <button onClick={confirmAndDelete} disabled={deleting} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: deleting ? 'rgba(244,63,94,0.4)' : 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', fontWeight: 700, fontSize: 13, cursor: deleting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>
              {deleting ? t.deleting : t.confirmDelete}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
