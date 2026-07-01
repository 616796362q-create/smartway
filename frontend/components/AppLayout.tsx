'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, CreditCard, DollarSign,
  Dog, Truck, TrendingUp, FileText, UserCheck, LogOut, Shield, Menu, X,
  Sun, Moon, ChevronRight, Languages
} from 'lucide-react'
import { useApp } from '@/lib/AppContext'

const NAV_ITEMS = [
  { href: '/dashboard', labelKey: 'dashboard' as const, icon: LayoutDashboard, roles: ['Admin','Manager','Accountant'], color: '#6366f1' },
  { href: '/staff',     labelKey: 'staff' as const,     icon: Users,           roles: ['Admin','Manager'],            color: '#06b6d4' },
  { href: '/payroll',   labelKey: 'payroll' as const,   icon: CreditCard,      roles: ['Admin','Manager','Accountant'],color: '#10b981' },
  { href: '/expenses',  labelKey: 'expenses' as const,  icon: DollarSign,      roles: ['Admin','Accountant'],          color: '#f59e0b' },
  { href: '/dogs',      labelKey: 'dogs' as const,      icon: Dog,             roles: ['Admin'],                       color: '#f43f5e' },
  { href: '/vehicles',  labelKey: 'vehicles' as const,  icon: Truck,           roles: ['Admin'],                       color: '#8b5cf6' },
  { href: '/finance',   labelKey: 'finance' as const,   icon: TrendingUp,      roles: ['Admin','Accountant'],          color: '#06b6d4' },
  { href: '/reports',   labelKey: 'reports' as const,   icon: FileText,        roles: ['Admin','Manager'],             color: '#a78bfa' },
  { href: '/users',     labelKey: 'users' as const,     icon: UserCheck,       roles: ['Admin'],                       color: '#f59e0b' },
]

const DAYS_SO = ['Axad','Isniin','Talaado','Arbaco','Khamiis','Jimce','Sabti']
const MONTHS  = ['Jan','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Okt','Nof','Dis']

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { t, lang, setLang, theme, toggleTheme } = useApp()

  const [user, setUser]               = useState<{ name: string; role: string; username: string } | null>(null)
  const [time, setTime]               = useState('')
  const [date, setDate]               = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isLight = theme === 'light'

  const tick = useCallback(() => {
    const now = new Date()
    let h = now.getHours()
    const m    = String(now.getMinutes()).padStart(2,'0')
    const s    = String(now.getSeconds()).padStart(2,'0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    setTime(`${String(h).padStart(2,'0')}:${m}:${s} ${ampm}`)
    setDate(`${DAYS_SO[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('sw_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [router, tick])

  const logout = () => { localStorage.removeItem('sw_user'); router.push('/login') }

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: 13 }}>Soo raacaya...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  const allowed = NAV_ITEMS.filter(n => n.roles.includes(user.role))

  /* ── Sidebar Content ── */
  const SidebarNav = ({ mobile = false }: { mobile?: boolean }) => (
    <nav style={{ padding: '8px 12px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <div style={{ marginBottom: 8, padding: '0 8px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase' }}>{lang === 'so' ? 'Maamulka' : 'Navigation'}</p>
      </div>
      {allowed.map(({ href, labelKey, icon: Icon, color }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} onClick={() => mobile && setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, marginBottom: 2,
              fontSize: 13, fontWeight: active ? 600 : 500,
              textDecoration: 'none', transition: 'all 0.2s',
              background: active ? `${color}18` : 'transparent',
              color: active ? color : 'rgba(148,163,184,0.8)',
              border: active ? `1px solid ${color}30` : '1px solid transparent',
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = `${color}10`; (e.currentTarget as HTMLElement).style.color = color } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.8)' } }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? `${color}20` : 'rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}>
              <Icon style={{ width: 15, height: 15, color: active ? color : 'rgba(148,163,184,0.6)' }} />
            </div>
            <span style={{ flex: 1 }}>{t[labelKey]}</span>
            {active && <ChevronRight style={{ width: 14, height: 14, opacity: 0.6 }} />}
          </Link>
        )
      })}
    </nav>
  )

  const SidebarFooter = () => (
    <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={toggleTheme} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: 'transparent', color: 'rgba(148,163,184,0.7)', fontSize: 13, fontWeight: 500,
        transition: 'all 0.2s', marginBottom: 4,
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'; (e.currentTarget as HTMLElement).style.color = '#a5b4fc' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.7)' }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
          {isLight ? <Moon style={{ width: 14, height: 14 }} /> : <Sun style={{ width: 14, height: 14 }} />}
        </div>
        {isLight ? 'Habeynta Madow' : 'Maalinta Cad'}
      </button>
      <button onClick={logout} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: 'transparent', color: 'rgba(148,163,184,0.7)', fontSize: 13, fontWeight: 500,
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.12)'; (e.currentTarget as HTMLElement).style.color = '#fb7185' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.7)' }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <LogOut style={{ width: 14, height: 14 }} />
        </div>
        {t.logout}
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100%', width: 256, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        background: isLight ? '#0f172a' : 'linear-gradient(180deg, #0a0f1e 0%, #070b14 100%)',
        borderRight: '1px solid rgba(99,102,241,0.12)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
        className="lg:hidden"
      >
        {/* Brand */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}>
              <Shield style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>SmartWay</div>
              <div style={{ fontSize: 10, color: 'rgba(165,180,252,0.7)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Security</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.6)', padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        {/* User */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: 'white',
          }}>{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{user.name}</div>
            <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>{user.role}</span>
          </div>
        </div>
        <SidebarNav mobile />
        <SidebarFooter />
      </aside>

      {/* ── Desktop Sidebar ── */}
      <aside style={{
        width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: isLight ? '#0f172a' : 'linear-gradient(180deg, #0a0f1e 0%, #070b14 100%)',
        borderRight: '1px solid rgba(99,102,241,0.12)',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
      }}
        className="hidden lg:flex"
      >
        {/* Brand */}
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 13,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 25px rgba(99,102,241,0.5)',
            flexShrink: 0,
          }}>
            <Shield style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>SmartWay</div>
            <div style={{ fontSize: 10, color: 'rgba(165,180,252,0.7)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Security System</div>
          </div>
        </div>
        {/* User card */}
        <div style={{ padding: '14px 16px 12px', margin: '12px', borderRadius: 14, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: 'white',
          }}>{user.name.charAt(0).toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: 6, padding: '1px 8px', fontWeight: 600 }}>{user.role}</span>
          </div>
        </div>
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16,
          background: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(7,11,20,0.9)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99,102,241,0.12)',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          {/* Mobile menu btn */}
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            className="lg:hidden">
            <Menu style={{ width: 22, height: 22 }} />
          </button>

          {/* Breadcrumb */}
          <div style={{ flex: 1 }} className="hidden lg:block">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>SmartWay</span>
              <ChevronRight style={{ width: 12, height: 12, color: 'var(--text-dim)' }} />
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                {allowed.find(n => n.href === pathname)?.labelKey ? t[allowed.find(n => n.href === pathname)!.labelKey] : ''}
              </span>
            </div>
          </div>
          <div style={{ flex: 1 }} className="lg:hidden" />

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Clock */}
            <div style={{ textAlign: 'right' }} className="hidden lg:block">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px' }}>{time}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date}</div>
            </div>
            {/* Language toggle */}
            <button onClick={() => setLang(lang === 'en' ? 'so' : 'en')} style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--bg-card2)', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
            >
              <Languages style={{ width: 15, height: 15 }} />
            </button>
            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--bg-card2)', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
            >
              {isLight ? <Moon style={{ width: 15, height: 15 }} /> : <Sun style={{ width: 15, height: 15 }} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
