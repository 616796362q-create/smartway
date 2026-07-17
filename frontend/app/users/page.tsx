'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { Shield, UserCheck, Users, Crown, Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react'

interface User { id: string; username: string; role: string; name: string }

const ROLE_CONFIG: Record<string, { color: string; icon: any; gradient: string }> = {
  Admin:     { color: '#f43f5e', icon: Crown,     gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
  Manager:   { color: '#6366f1', icon: Shield,    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  Accountant:{ color: '#8b5cf6', icon: UserCheck, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
}

const ACCESS_MAP: Record<string, string> = {
  Admin: 'Full System Access',
  Manager: 'Staff, Payroll, Reports',
  Accountant: 'Finance, Expenses, Payroll',
}

const EMPTY_FORM = { username: '', password: '', role: 'Manager', name: '' }

export default function UsersPage() {
  const { t, theme } = useApp()
  const [users, setUsers] = useState<User[]>([])
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm]       = useState({ ...EMPTY_FORM })
  const [showPw, setShowPw]   = useState(false)
  const [saving, setSaving]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]     = useState('')

  const getUser = () => { try { return JSON.parse(localStorage.getItem('sw_user') || '{}') } catch { return {} } }
  const isLight = theme === 'light'

  useEffect(() => {
    apiGet('/auth/users').then(d => setUsers(d || []))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setShowPw(false)
    setError('')
    setModal(true)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setForm({ username: u.username, password: '', role: u.role, name: u.name })
    setShowPw(false)
    setError('')
    setModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing && !form.password) { setError('Password waajib ah'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, requestUser: getUser().username || 'Admin' }
      const d = editing
        ? await apiPut(`/auth/users/${editing.id}`, payload)
        : await apiPost('/auth/users', payload)
      if (d.success) { setUsers(d.users); setModal(false) }
      else setError(d.message || 'Error')
    } catch { setError('Server error') }
    setSaving(false)
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const d = await apiDelete(`/auth/users/${confirmDelete.id}`, getUser().username || 'Admin')
      if (d.success) setUsers(d.users)
      setConfirmDelete(null)
    } catch {}
    setDeleting(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14,
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
          background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 60%, #1e1b4b 100%)',
          border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 8px 30px rgba(99,102,241,0.25)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{t.usersTitle}</h2>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(199,210,254,0.8)', position: 'relative' }}>{t.usersSub}</p>
          </div>
          <button onClick={openCreate} style={{
            position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: 14,
            backdropFilter: 'blur(8px)', transition: 'all 0.2s'
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}
          >
            <Plus style={{ width: 16, height: 16 }} /> User Cusub
          </button>
        </div>

        {/* User Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {users.map((u, i) => {
            const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.Accountant
            const IconComp = cfg.icon
            return (
              <div key={u.id} style={{
                borderRadius: 20, padding: 24, background: isLight ? 'white' : 'rgba(13,20,36,0.8)',
                border: `1px solid ${cfg.color}25`, boxShadow: `0 4px 24px ${cfg.color}12`,
                transition: 'all 0.25s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${cfg.color}25` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${cfg.color}12` }}
              >
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: cfg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${cfg.color}40`, flexShrink: 0 }}>
                    <IconComp style={{ width: 24, height: 24, color: 'white' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: 16, color: isLight ? '#0f172a' : 'white', marginBottom: 3 }}>{u.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', fontWeight: 500 }}>@{u.username}</p>
                  </div>
                </div>

                {/* Role badge */}
                <div style={{ marginBottom: 14 }}>
                  <span style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800, background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}35` }}>
                    {u.role}
                  </span>
                </div>

                <div style={{ height: 1, background: `linear-gradient(90deg, ${cfg.color}30, transparent)`, marginBottom: 14 }} />

                {/* Access info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.gradient, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.5)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.accessLabel}</p>
                    <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)', lineHeight: 1.5 }}>{ACCESS_MAP[u.role] || 'Limited Access'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(u)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)',
                    background: 'rgba(99,102,241,0.08)', color: '#6366f1', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.18)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'}
                  >
                    <Pencil style={{ width: 13, height: 13 }} /> Edit
                  </button>
                  <button onClick={() => setConfirmDelete(u)} style={{
                    width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 10, border: '1px solid rgba(244,63,94,0.2)',
                    background: 'rgba(244,63,94,0.08)', color: '#f43f5e', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.18)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            )
          })}
          {users.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: 'rgba(100,116,139,0.5)' }}>
              <Users style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.25 }} />
              <p>{t.noUsers}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: isLight ? 'white' : 'linear-gradient(135deg, #0d1424, #111827)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 24, width: '100%', maxWidth: 440, boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: isLight ? '#0f172a' : 'white' }}>
                {editing ? 'User Edit' : 'User Cusub'}
              </h3>
              <button onClick={() => setModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(148,163,184,0.7)', display: 'flex' }}><X style={{ width: 16, height: 16 }} /></button>
            </div>
            <form onSubmit={save} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e', fontSize: 13 }}>{error}</div>}

              {[
                { label: 'Magaca Buuxa (Name)', key: 'name', type: 'text', placeholder: 'Magaca buuxa' },
                { label: 'Username', key: 'username', type: 'text', placeholder: 'username' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                  <input type={type} required placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Password {editing ? '(banaan waa la dhaafsanayaa)' : ''}
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} placeholder={editing ? 'Cusboone hadaad bedeli rabto' : 'Password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ ...inp, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', display: 'flex' }}>
                    {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inp }}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'transparent', color: 'rgba(148,163,184,0.7)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Jooji
                </button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: saving ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Keydinaya...' : editing ? 'Kaydso' : 'Samee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: isLight ? 'white' : '#0d1424', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 20, padding: 28, maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 style={{ width: 24, height: 24, color: '#f43f5e' }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: isLight ? '#0f172a' : 'white', marginBottom: 8 }}>User tirtir?</h3>
            <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.7)', marginBottom: 24 }}>
              <strong style={{ color: '#f43f5e' }}>{confirmDelete.name}</strong> (@{confirmDelete.username}) waa la tirti doonaa. Xilkaas looma soo celin karo.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'transparent', color: 'rgba(148,163,184,0.7)', cursor: 'pointer', fontWeight: 600 }}>Jooji</button>
              <button onClick={doDelete} disabled={deleting} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                {deleting ? 'Tirtinaaya...' : 'Tirtir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
