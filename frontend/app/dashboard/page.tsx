'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet } from '@/lib/api'
import { Users, Dog, Truck, CreditCard, TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, Calendar } from 'lucide-react'

interface Stats {
  totalStaff: number; totalDogs: number; totalVehicles: number
  monthlyPayroll: number; monthlyPayrollMonth: string
  totalIncome: number; totalExpenses: number; profitLoss: number
  breakdown: Record<string, number>
}

export default function DashboardPage() {
  const { t, theme } = useApp()
  const [stats, setStats] = useState<Stats | null>(null)
  const [activities, setActivities] = useState<{ id: string; timestamp: string; user: string; action: string }[]>([])
  const [loading, setLoading] = useState(true)
  const currentMonth = (() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })()
  const [monthFilter, setMonthFilterState] = useState(() => {
    if (typeof window === 'undefined') return currentMonth
    const saved = localStorage.getItem('sw_selected_month')
    return saved && /^\d{4}-\d{2}$/.test(saved) ? saved : currentMonth
  })

  const setSelectedMonth = (month: string) => {
    const nextMonth = month || currentMonth
    setMonthFilterState(nextMonth)
    localStorage.setItem('sw_selected_month', nextMonth)
    localStorage.setItem('sw_report_date', `${nextMonth}-01`)
  }

  useEffect(() => {
    const loadDashboard = () => {
      Promise.all([apiGet(`/dashboard/stats?month=${monthFilter}`), apiGet('/activities')]).then(([s, a]) => {
        setStats(s); setActivities(a || []); setLoading(false)
      }).catch(() => setLoading(false))
    }

    loadDashboard()

    const refreshWhenVisible = () => {
      if (!document.hidden) loadDashboard()
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)
    window.addEventListener('focus', loadDashboard)

    return () => {
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      window.removeEventListener('focus', loadDashboard)
    }
  }, [monthFilter])

  const isLight = theme === 'light'

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)' }}>Soo raraya...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </AppLayout>
  )

  const breakdown = stats?.breakdown || {}
  const bkItems = [
    { label: 'Mushaar', val: breakdown.payroll || 0, color: '#6366f1' },
    { label: 'Jiko', val: breakdown.kitchen || 0, color: '#f59e0b' },
    { label: 'Shidaal', val: breakdown.fuel || 0, color: '#f43f5e' },
    { label: 'Dayactir', val: breakdown.repairs || 0, color: '#8b5cf6' },
    { label: 'Eeyaha', val: breakdown.dogs || 0, color: '#10b981' },
    { label: 'Baabuurta', val: breakdown.vehicles || 0, color: '#06b6d4' },
    { label: 'Utility', val: breakdown.utilities || 0, color: '#a78bfa' },
    { label: 'Kale', val: breakdown.others || 0, color: '#fb923c' },
  ]
  const totalBk = bkItems.reduce((s, i) => s + i.val, 0) || 1
  const profit  = stats?.profitLoss || 0

  const statCards = [
    { label: t.activeStaff, value: stats?.totalStaff || 0, icon: Users, isNum: true, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', glow: 'rgba(99,102,241,0.3)', badge: '+2 bishaas' },
    { label: t.dogsTitleDashboard, value: stats?.totalDogs || 0, icon: Dog, isNum: true, gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', glow: 'rgba(244,63,94,0.3)', badge: 'Active' },
    { label: t.vehiclesDashboard, value: stats?.totalVehicles || 0, icon: Truck, isNum: true, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', glow: 'rgba(139,92,246,0.3)', badge: 'Ready' },
    { label: `Mushaar - ${stats?.monthlyPayrollMonth || monthFilter}`, value: stats?.monthlyPayroll || 0, icon: CreditCard, isNum: false, gradient: 'linear-gradient(135deg, #10b981, #059669)', glow: 'rgba(16,185,129,0.3)', badge: 'Bisha' },
    { label: `${t.totalIncome} - ${stats?.monthlyPayrollMonth || monthFilter}`, value: stats?.totalIncome || 0, icon: TrendingUp, isNum: false, gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', glow: 'rgba(6,182,212,0.3)', badge: 'Bisha' },
    { label: `${t.totalExpenses} - ${stats?.monthlyPayrollMonth || monthFilter}`, value: stats?.totalExpenses || 0, icon: TrendingDown, isNum: false, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.3)', badge: 'Bisha' },
  ]

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Hero Banner ── */}
        <div style={{
          borderRadius: 24, padding: '28px 32px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 8px 40px rgba(99,102,241,0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -40, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: 60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(165,180,252,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>SmartWay Security — Xog-Tooska</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 6, letterSpacing: '-0.8px' }}>{t.dashboardRealTime}</h2>
              <p style={{ fontSize: 13, color: 'rgba(196,181,253,0.75)' }}>{t.dashboardSubtitle}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(255,255,255,0.08)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.6)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>Nidaamku waa shaqaynayaa</span>
            </div>
          </div>
        </div>

        <div style={{
          background: isLight ? 'white' : 'rgba(13,20,36,0.8)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 16, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
        }}>
          <Calendar style={{ width: 16, height: 16, color: '#06b6d4' }} />
          <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>Bisha xogta dashboard-ka:</label>
          <input type="month" value={monthFilter} onChange={e => setSelectedMonth(e.target.value || currentMonth)}
            style={{
              width: 'auto', padding: '8px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: isLight ? '#f8faff' : 'rgba(7,11,20,0.8)',
              border: '1px solid rgba(99,102,241,0.2)', color: isLight ? '#0f172a' : 'white',
              outline: 'none', fontFamily: 'inherit'
            }} />
          {monthFilter !== currentMonth && (
            <button onClick={() => setSelectedMonth(currentMonth)} style={{
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
              borderRadius: 10, color: '#0891b2', padding: '7px 12px', fontSize: 12,
              cursor: 'pointer', fontWeight: 700
            }}>Bishan</button>
          )}
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {statCards.map((card, i) => (
            <div key={i} style={{
              borderRadius: 20, padding: '20px',
              background: isLight ? 'white' : 'rgba(13,20,36,0.8)',
              border: '1px solid rgba(99,102,241,0.12)',
              boxShadow: `0 4px 20px ${card.glow}`,
              transition: 'all 0.25s', cursor: 'default',
              animation: `fadeInUp 0.4s ease ${i * 0.06}s both`,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${card.glow}` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${card.glow}` }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${card.glow}` }}>
                  <card.icon style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <span style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', borderRadius: 100, fontWeight: 600 }}>{card.badge}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.8px', marginBottom: 4 }}>
                {card.isNum ? card.value : `$${Number(card.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{card.label}</div>
            </div>
          ))}

          {/* Profit/Loss card */}
          <div style={{
            borderRadius: 20, padding: '20px',
            background: profit >= 0 ? (isLight ? 'white' : 'rgba(13,20,36,0.8)') : (isLight ? 'white' : 'rgba(13,20,36,0.8)'),
            border: `1px solid ${profit >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
            boxShadow: profit >= 0 ? '0 4px 20px rgba(16,185,129,0.15)' : '0 4px 20px rgba(244,63,94,0.15)',
            transition: 'all 0.25s',
            animation: 'fadeInUp 0.4s ease 0.36s both',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: profit >= 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f43f5e, #e11d48)',
                boxShadow: profit >= 0 ? '0 0 20px rgba(16,185,129,0.4)' : '0 0 20px rgba(244,63,94,0.4)',
              }}>
                <DollarSign style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: profit >= 0 ? '#10b981' : '#f43f5e', background: profit >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', padding: '3px 10px', borderRadius: 100 }}>
                {profit >= 0 ? '▲ Faa\'iido' : '▼ Khasaare'}
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: profit >= 0 ? '#10b981' : '#f43f5e', letterSpacing: '-0.8px', marginBottom: 4 }}>
              ${Math.abs(profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{t.profitLoss}</div>
          </div>
        </div>

        {/* ── Bottom: Breakdown + Activity ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="lg:grid-cols-2 grid-cols-1">

          {/* Expense breakdown */}
          <div style={{
            borderRadius: 20, padding: 24,
            background: isLight ? 'white' : 'rgba(13,20,36,0.8)',
            border: '1px solid rgba(99,102,241,0.12)',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: isLight ? '#0f172a' : 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, borderRadius: 10, background: 'linear-gradient(180deg, #6366f1, #8b5cf6)', display: 'inline-block' }} />
              Kharashyada Goob kasta
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {bkItems.map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>${item.val.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 10, background: isLight ? '#f1f5ff' : 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 10,
                      width: `${Math.round((item.val / totalBk) * 100)}%`,
                      background: item.color,
                      boxShadow: `0 0 8px ${item.color}60`,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            borderRadius: 20, padding: 24,
            background: isLight ? 'white' : 'rgba(13,20,36,0.8)',
            border: '1px solid rgba(99,102,241,0.12)',
            display: 'flex', flexDirection: 'column',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: isLight ? '#0f172a' : 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, borderRadius: 10, background: 'linear-gradient(180deg, #06b6d4, #0891b2)', display: 'inline-block' }} />
              <Activity style={{ width: 15, height: 15, color: '#06b6d4' }} />
              {t.recentActivities}
            </h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340 }}>
              {activities.slice(0, 8).map((act, i) => (
                <div key={act.id} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 12,
                  background: isLight ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(99,102,241,0.07)',
                  animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  }}>
                    <Activity style={{ width: 13, height: 13, color: '#818cf8' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: isLight ? '#0f172a' : 'rgba(241,245,249,0.9)', lineHeight: 1.4, marginBottom: 3 }}>{act.action}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>{act.user}</span>
                      {' · '}{new Date(act.timestamp).toLocaleString('so-SO')}
                    </p>
                  </div>
                  <ArrowUpRight style={{ width: 12, height: 12, color: 'rgba(148,163,184,0.3)', flexShrink: 0, marginTop: 2 }} />
                </div>
              ))}
              {activities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 13 }}>{t.noActivities}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AppLayout>
  )
}
