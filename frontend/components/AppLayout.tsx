'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, CreditCard, DollarSign,
  Dog, Truck, TrendingUp, FileText, UserCheck, LogOut, Shield, Menu, X,
  Sun, Moon, Languages
} from 'lucide-react'
import { useApp } from '@/lib/AppContext'

const NAV_ITEMS = [
  { href: '/dashboard', labelKey: 'dashboard' as const, icon: LayoutDashboard, roles: ['Admin','Manager','Accountant'] },
  { href: '/staff',     labelKey: 'staff' as const,     icon: Users,           roles: ['Admin','Manager'] },
  { href: '/payroll',   labelKey: 'payroll' as const,   icon: CreditCard,      roles: ['Admin','Manager','Accountant'] },
  { href: '/expenses',  labelKey: 'expenses' as const,  icon: DollarSign,      roles: ['Admin','Accountant'] },
  { href: '/dogs',      labelKey: 'dogs' as const,      icon: Dog,             roles: ['Admin'] },
  { href: '/vehicles',  labelKey: 'vehicles' as const,  icon: Truck,           roles: ['Admin'] },
  { href: '/finance',   labelKey: 'finance' as const,   icon: TrendingUp,      roles: ['Admin','Accountant'] },
  { href: '/reports',   labelKey: 'reports' as const,   icon: FileText,        roles: ['Admin','Manager'] },
  { href: '/users',     labelKey: 'users' as const,     icon: UserCheck,       roles: ['Admin'] },
]

const DAYS_SO = ['Axad','Isniin','Talaado','Arbaco','Khamiis','Jimce','Sabti']
const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function BrandBlock({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
        <Shield className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <span className="font-bold text-base block leading-tight text-white">SmartWay</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/75">Security</span>
      </div>
      {onClose && (
        <button className="ml-auto text-white/70 hover:text-white" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, lang, setLang, theme, toggleTheme } = useApp()

  const [user, setUser] = useState<{ name: string; role: string; username: string } | null>(null)
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const DAYS = lang === 'so' ? DAYS_SO : DAYS_EN
  const isLight = theme === 'light'

  const tick = useCallback(() => {
    const now = new Date()
    let h = now.getHours(); const m = String(now.getMinutes()).padStart(2,'0'); const s = String(now.getSeconds()).padStart(2,'0')
    const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12
    setTime(`${String(h).padStart(2,'0')}:${m}:${s} ${ampm}`)
    setDate(`${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`)
  }, [lang])

  useEffect(() => {
    const stored = localStorage.getItem('sw_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [router, tick])

  const logout = () => {
    localStorage.removeItem('sw_user')
    router.push('/login')
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="w-8 h-8 border-4 border-[#0058b0] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const allowed = NAV_ITEMS.filter(n => n.roles.includes(user.role))

  const headerControls = (
    <>
      <button className="lg:hidden transition-colors" style={{ color: 'var(--text-muted)' }} onClick={() => setSidebarOpen(true)}>
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden lg:flex items-center gap-3 min-w-0 mr-auto">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: '#0058b0' }}>
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text)' }}>{user.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.role}</p>
        </div>
      </div>
      <div className="flex-1 lg:hidden" />
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ backgroundColor: 'var(--bg-card2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <button onClick={() => setLang(lang === 'so' ? 'en' : 'so')}
          className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all"
          style={{ backgroundColor: 'var(--bg-card2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <Languages className="w-3.5 h-3.5" />
          {lang === 'so' ? 'SO' : 'EN'}
        </button>
      </div>
      <div className="text-right ml-2">
        <p className="text-sm font-bold tabular-nums leading-tight" style={{ color: 'var(--text)' }}>{time}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{date}</p>
      </div>
    </>
  )

  const navLinks = (mobile = false) => allowed.map(({ href, labelKey, icon: Icon }) => {
    const active = pathname === href
    return (
      <Link key={href} href={href} onClick={() => mobile && setSidebarOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
        style={active
          ? { backgroundColor: 'var(--sidebar-active)', color: 'var(--sidebar-active-text)', fontWeight: 600 }
          : { color: 'var(--sidebar-muted)' }
        }
        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-hover)'; (e.currentTarget as HTMLElement).style.color = '#ffffff' } }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-muted)' } }}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {t[labelKey]}
      </Link>
    )
  })

  const sidebarFooter = (
    <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
      <button onClick={toggleTheme}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all lg:hidden"
        style={{ color: 'var(--sidebar-muted)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-hover)'; (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-muted)' }}
      >
        {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        {isLight ? (lang === 'so' ? 'Habeynta Madow' : 'Dark Mode') : (lang === 'so' ? 'Maalinta Cad' : 'Light Mode')}
      </button>
      <button onClick={() => setLang(lang === 'so' ? 'en' : 'so')}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all lg:hidden"
        style={{ color: 'var(--sidebar-muted)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-hover)'; (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-muted)' }}
      >
        <Languages className="w-4 h-4" />
        {lang === 'so' ? '🇸🇴 Somali → English' : '🇬🇧 English → Somali'}
      </button>
      <button onClick={logout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ color: 'var(--sidebar-muted)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLElement).style.color = '#fca5a5' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-muted)' }}
      >
        <LogOut className="w-4 h-4" />
        {t.logout}
      </button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Top bar — sidebar brand + header same row, same height */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0">
        <div
          className="hidden lg:flex w-64 shrink-0 items-center px-6 h-16"
          style={{ backgroundColor: 'var(--sidebar-bg)', borderBottom: '2px solid #003d7a' }}
        >
          <BrandBlock />
        </div>
        <header
          className="flex-1 flex items-center px-4 lg:px-6 gap-3 h-16 min-w-0"
          style={{ backgroundColor: 'var(--header-bg)', borderBottom: '2px solid #0058b0' }}
        >
          {headerControls}
        </header>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Mobile overlay sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside
          className={`fixed top-0 left-0 h-full w-64 flex flex-col z-50 transform transition-transform duration-300 lg:hidden
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ backgroundColor: 'var(--sidebar-bg)' }}
        >
          <div className="flex items-center px-6 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <BrandBlock onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-white/80">{user.role}</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">{navLinks(true)}</nav>
          {sidebarFooter}
        </aside>

        {/* Desktop sidebar — nav only, aligns under brand */}
        <aside
          className="hidden lg:flex w-64 shrink-0 flex-col"
          style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid rgba(255,255,255,0.1)' }}
        >
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">{navLinks()}</nav>
          {sidebarFooter}
        </aside>

        <main className="flex-1 p-4 lg:p-6 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
