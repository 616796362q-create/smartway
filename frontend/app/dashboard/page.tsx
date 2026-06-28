'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet } from '@/lib/api'
import { Users, Dog, Truck, CreditCard, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

interface Stats {
  totalStaff: number
  totalDogs: number
  totalVehicles: number
  monthlyPayroll: number
  monthlyPayrollMonth: string
  totalIncome: number
  totalExpenses: number
  profitLoss: number
  breakdown: Record<string, number>
}

const BLUE_SHADES = ['#0058b0', '#1a6fd4', '#3d8fd9', '#5ba3e0', '#7ab8e8', '#99ccef', '#0058b0', '#1a6fd4']

function StatCard({ title, value, icon: Icon, prefix = '$', isNum = false }:
  { title: string; value: number; icon: React.ElementType; prefix?: string; isNum?: boolean }) {
  return (
    <div className="rounded-2xl p-5 brand-glow transition-all duration-200"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
        {isNum ? value : `${prefix}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const { t, lang } = useApp()
  const [stats, setStats] = useState<Stats | null>(null)
  const [activities, setActivities] = useState<{ id: string; timestamp: string; user: string; action: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiGet('/dashboard/stats'), apiGet('/activities')]).then(([s, a]) => {
      setStats(s)
      setActivities(a || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#0058b0] border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  )

  const breakdown = stats?.breakdown || {}
  const bkItems = [
    { label: t.payroll, val: breakdown.payroll || 0 },
    { label: t.kitchenJiko, val: breakdown.kitchen || 0 },
    { label: t.fuelShidaal, val: breakdown.fuel || 0 },
    { label: t.repairsDayactir, val: breakdown.repairs || 0 },
    { label: t.dogsExpense, val: breakdown.dogs || 0 },
    { label: t.vehicles, val: breakdown.vehicles || 0 },
    { label: t.utilities, val: breakdown.utilities || 0 },
    { label: t.others, val: breakdown.others || 0 },
  ]
  const totalBk = bkItems.reduce((s, i) => s + i.val, 0) || 1
  const profit = stats?.profitLoss || 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page header — blue accent */}
        <div className="rounded-2xl p-6 brand-glow"
          style={{ background: 'linear-gradient(135deg, #0058b0 0%, #003d7a 100%)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{t.dashboardRealTime}</h2>
              <p className="text-sm mt-1 text-white/75">{t.dashboardSubtitle}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-medium">
              SmartWay Security
            </div>
          </div>
        </div>

        {/* Stats row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t.activeStaff} value={stats?.totalStaff || 0} icon={Users} isNum />
          <StatCard title={t.dogsTitleDashboard} value={stats?.totalDogs || 0} icon={Dog} isNum />
          <StatCard title={t.vehiclesDashboard} value={stats?.totalVehicles || 0} icon={Truck} isNum />
          <StatCard title={`${t.payroll} (${stats?.monthlyPayrollMonth || '—'})`} value={stats?.monthlyPayroll || 0} icon={CreditCard} />
        </div>

        {/* Stats row 2 — Finance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard title={t.totalIncome} value={stats?.totalIncome || 0} icon={TrendingUp} />
          <StatCard title={t.totalExpenses} value={stats?.totalExpenses || 0} icon={TrendingDown} />
          <div className="rounded-2xl p-5 brand-glow"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: `1px solid ${profit >= 0 ? '#b8d4f0' : '#fca5a5'}`,
            }}>
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{t.profitLoss}</p>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: profit >= 0 ? 'rgba(0,88,176,0.1)' : 'rgba(239,68,68,0.1)', color: profit >= 0 ? '#0058b0' : '#dc2626' }}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: profit >= 0 ? '#0058b0' : '#dc2626' }}>
              ${Math.abs(profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-sm ml-2 font-medium">
                {profit >= 0 ? '▲ Faa\'iido' : '▼ Khasaare'}
              </span>
            </p>
          </div>
        </div>

        {/* Charts + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-5 brand-glow"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#0058b0' }} />
              Kharashyada Goob kasta
            </h3>
            <div className="space-y-3">
              {bkItems.map((item, i) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>{item.label}</span>
                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>${item.val.toFixed(2)}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--brand-blue-soft, #e8f2fc)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((item.val / totalBk) * 100)}%`, backgroundColor: BLUE_SHADES[i % BLUE_SHADES.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5 brand-glow"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: '#0058b0' }} />
              <Activity className="w-4 h-4" style={{ color: '#0058b0' }} />
              {t.recentActivities}
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {activities.slice(0, 8).map(act => (
                <div key={act.id} className="flex gap-3 items-start p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: 'var(--bg-card2)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--accent-soft)' }}>
                    <Activity className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text)' }}>{act.action}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {act.user} · {new Date(act.timestamp).toLocaleString('so-SO')}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-dim)' }}>{t.noActivities}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
