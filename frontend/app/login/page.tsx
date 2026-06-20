'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPost } from '@/lib/api'
import { useApp } from '@/lib/AppContext'
import { Shield, Sun, Moon } from 'lucide-react'

const ipt = (theme: string) =>
  `w-full text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0058b0]/20 transition-all placeholder:opacity-40 ${
    theme === 'light'
      ? 'bg-white border border-[#b8d4f0] text-[#0a2540] focus:border-[#0058b0]'
      : 'bg-[#081a2e] border border-[#1a3d66] text-white focus:border-[#1a6fd4]'
  }`

export default function LoginPage() {
  const { t, theme, toggleTheme, lang, setLang } = useApp()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await apiPost('/auth/login', { username, password })
      if (res.success) {
        localStorage.setItem('sw_user', JSON.stringify(res.user))
        router.push('/dashboard')
      } else {
        setError(t.loginError)
      }
    } catch {
      setError(t.loginServerError)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = ipt(theme)

  return (
    <div className="min-h-screen flex transition-all duration-300 relative" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Left — Blue brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0058b0 0%, #003d7a 100%)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 border border-white/30 rounded-3xl mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">SmartWay Security</h1>
          <p className="text-white/75 text-sm leading-relaxed">
            {lang === 'so'
              ? 'Nidaam xogeed oo aamin ah, casri ah, oo xirfad leh — maamulka shirkada ilaalada.'
              : 'Trusted, intelligent, and reliable — security company management system.'}
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-white/60 text-xs">
            <span>🔒 Secure</span>
            <span>·</span>
            <span>🏢 Corporate</span>
            <span>·</span>
            <span>✓ Reliable</span>
          </div>
        </div>
      </div>

      {/* Right — White login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden z-10">
          <button onClick={() => setLang(lang === 'en' ? 'so' : 'en')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            {lang === 'en' ? 'SOM' : 'ENG'}
          </button>
          <button onClick={toggleTheme}
            className="p-2 rounded-lg border transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ background: 'linear-gradient(135deg, #0058b0, #003d7a)' }}>
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.loginTitle}</h1>
          </div>

          <div className="rounded-2xl p-8 brand-glow transition-all"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{t.loginTitle}</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t.loginSub}</p>
            </div>
            <div className="lg:hidden text-center mb-6">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.loginSub}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t.usernameLabel}</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="admin / manager / accountant" required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t.passwordLabel}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required className={inputCls} />
              </div>
              <button type="submit" disabled={loading}
                className="sw-btn-primary w-full font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : t.loginButton}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-center mb-2" style={{ color: 'var(--text-dim)' }}>Default Credentials:</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[['Admin (Emre)','Emre','1234'],['Manager','manager','manager123'],['Accountant','accountant','accountant123']].map(([role, u, p]) => (
                  <button key={role} onClick={() => { setUsername(u); setPassword(p) }}
                    className="border rounded-lg p-2 text-center transition-all cursor-pointer hover:border-[#0058b0]"
                    style={{ backgroundColor: 'var(--bg-card2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    <div className="font-semibold" style={{ color: 'var(--accent)' }}>{role}</div>
                    <div className="text-xs opacity-60 mt-0.5">{u}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
