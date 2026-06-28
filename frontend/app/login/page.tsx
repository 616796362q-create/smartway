'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiPost, pingBackend } from '@/lib/api'
import { useApp } from '@/lib/AppContext'
import { Shield, Sun, Moon, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { t, theme, toggleTheme } = useApp()
  const router   = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [waking,   setWaking]   = useState(true)

  useEffect(() => {
    pingBackend().finally(() => setWaking(false))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await apiPost('/auth/login', { username, password })
      if (res.success) {
        localStorage.setItem('sw_user', JSON.stringify(res.user))
        router.push('/dashboard')
      } else {
        setError(t.loginError)
      }
    } catch {
      setError(t.loginServerError + ' Dib u isku day.')
    } finally {
      setLoading(false)
    }
  }

  const isLight = theme === 'light'

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 18px', borderRadius: 14, fontSize: 14, fontWeight: 500,
    background: isLight ? 'rgba(249,250,251,1)' : 'rgba(13,20,36,0.9)',
    border: `1px solid ${isLight ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.2)'}`,
    color: isLight ? '#0f172a' : 'white', outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: isLight ? '#f8faff' : '#070b14', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1, display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f1628 0%, #1a1040 40%, #0d1424 100%)',
        position: 'relative', overflow: 'hidden', padding: 48,
      }}
        className="lg:flex"
      >
        {/* Glowing orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '55%', left: '10%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <div style={{
            width: 90, height: 90, borderRadius: 28, margin: '0 auto 28px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2)',
          }}>
            <Shield style={{ width: 48, height: 48, color: 'white' }} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'white', marginBottom: 12, letterSpacing: '-1px' }}>SmartWay</h1>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.7)', lineHeight: 1.7, marginBottom: 40 }}>
            Nidaam xogeed oo aamin ah, casri ah, oo xirfad leh — maamulka shirkada ilaalada.
          </p>
          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', label: 'Aamin' },
              { icon: '⚡', label: 'Degdeg' },
              { icon: '📊', label: 'Casri' },
              { icon: '✓',  label: 'Xirfad' },
            ].map(f => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                background: 'rgba(255,255,255,0.06)', borderRadius: 100,
                border: '1px solid rgba(255,255,255,0.1)', fontSize: 12,
                color: 'rgba(255,255,255,0.7)', fontWeight: 500,
              }}>
                <span>{f.icon}</span>{f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          position: 'absolute', top: 20, right: 20,
          width: 38, height: 38, borderRadius: 11, border: `1px solid ${isLight ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.2)'}`,
          background: isLight ? 'white' : 'rgba(13,20,36,0.8)',
          color: isLight ? '#475569' : 'rgba(148,163,184,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
        }}>
          {isLight ? <Moon style={{ width: 16, height: 16 }} /> : <Sun style={{ width: 16, height: 16 }} />}
        </button>

        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }} className="lg:hidden">
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(99,102,241,0.4)',
            }}>
              <Shield style={{ width: 32, height: 32, color: 'white' }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: isLight ? '#0f172a' : 'white' }}>SmartWay Security</h1>
          </div>

          {/* Form card */}
          <div style={{
            background: isLight ? 'white' : 'rgba(13,20,36,0.9)',
            border: `1px solid ${isLight ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)'}`,
            borderRadius: 24, padding: 36,
            boxShadow: isLight ? '0 20px 60px rgba(99,102,241,0.1)' : '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: isLight ? '#0f172a' : 'white', marginBottom: 6, letterSpacing: '-0.5px' }}>{t.loginTitle}</h2>
              <p style={{ fontSize: 13, color: isLight ? '#64748b' : 'rgba(148,163,184,0.7)' }}>{t.loginSub}</p>
            </div>

            {waking && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 12,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                color: isLight ? '#6366f1' : '#a5b4fc',
              }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                Server la xidayo... fadlan sug
              </div>
            )}

            {error && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 12,
                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
                fontSize: 13, color: '#f43f5e', textAlign: 'center', fontWeight: 500,
              }}>{error}</div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isLight ? '#64748b' : 'rgba(148,163,184,0.8)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {t.usernameLabel}
                </label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="username" required style={inp}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isLight ? '#64748b' : 'rgba(148,163,184,0.8)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {t.passwordLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required style={{ ...inp, paddingRight: 48 }}
                    onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
                    onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.2)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'rgba(148,163,184,0.5)', display: 'flex',
                  }}>
                    {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || waking} style={{
                width: '100%', padding: '15px', borderRadius: 14, border: 'none',
                background: (loading || waking) ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontWeight: 700, fontSize: 15, cursor: (loading || waking) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', letterSpacing: '-0.2px',
                boxShadow: (loading || waking) ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
              }}
                onMouseEnter={e => { if (!loading && !waking) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(99,102,241,0.5)' } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)' }}
              >
                {loading
                  ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} /> Galaya...</>
                  : waking ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} /> Server la xidayo...</>
                  : t.loginButton}
              </button>
            </form>

            {/* Quick fill */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${isLight ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'}` }}>
              <p style={{ fontSize: 11, textAlign: 'center', color: isLight ? '#94a3b8' : 'rgba(100,116,139,0.7)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Xulashada Degdeg</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[['Admin','Emre','1234','#6366f1'],['Maamule','manager','manager123','#06b6d4'],['Xisaab','accountant','accountant123','#10b981']].map(([role, u, p, color]) => (
                  <button key={role} onClick={() => { setUsername(u); setPassword(p) }} style={{
                    padding: '10px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    background: `${color}0d`, border: `1px solid ${color}30`,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${color}18`; (e.currentTarget as HTMLElement).style.borderColor = `${color}60` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${color}0d`; (e.currentTarget as HTMLElement).style.borderColor = `${color}30` }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 2 }}>{role}</div>
                    <div style={{ fontSize: 10, color: isLight ? '#94a3b8' : 'rgba(100,116,139,0.7)', fontFamily: 'monospace' }}>{u}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
