'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet } from '@/lib/api'
import { FileText, Download, Printer, TrendingUp, TrendingDown, DollarSign, Users, PawPrint, Truck } from 'lucide-react'

interface Stats {
  totalStaff: number; totalDogs: number; totalVehicles: number
  totalIncome: number; totalExpenses: number; profitLoss: number
  breakdown: Record<string, number>
}

export default function ReportsPage() {
  const { t, theme } = useApp()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/dashboard/stats').then(d => { setStats(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const isLight = theme === 'light'

  const printReport = () => window.print()

  const exportCSV = () => {
    if (!stats) return
    const rows = [
      ['SmartWay Security Company - Financial Report'], [''],
      ['Category', 'Amount ($)'],
      ['INCOME', ''],
      ['Total Income', stats.totalIncome.toFixed(2)], [''],
      ['EXPENSES', ''],
      ['Payroll', (stats.breakdown.payroll||0).toFixed(2)],
      ['Kitchen', (stats.breakdown.kitchen||0).toFixed(2)],
      ['Fuel', (stats.breakdown.fuel||0).toFixed(2)],
      ['Repairs', (stats.breakdown.repairs||0).toFixed(2)],
      ['Dogs', (stats.breakdown.dogs||0).toFixed(2)],
      ['Vehicles', (stats.breakdown.vehicles||0).toFixed(2)],
      ['Utilities', (stats.breakdown.utilities||0).toFixed(2)],
      ['Others', (stats.breakdown.others||0).toFixed(2)],
      ['Total Expenses', stats.totalExpenses.toFixed(2)], [''],
      ['NET PROFIT/LOSS', stats.profitLoss.toFixed(2)],
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `SmartWay_Report_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </AppLayout>
  )

  const pl = stats?.profitLoss || 0
  const rows = [
    { label: t.activeStaff, val: stats?.totalStaff || 0, isNum: true, icon: Users, color: '#6366f1' },
    { label: `${t.dogsExpense} (${t.active})`, val: stats?.totalDogs || 0, isNum: true, icon: PawPrint, color: '#8b5cf6' },
    { label: t.vehiclesDashboard, val: stats?.totalVehicles || 0, isNum: true, icon: Truck, color: '#a78bfa' },
  ]
  const expBreakdown = [
    { label: t.payroll, val: stats?.breakdown?.payroll || 0 },
    { label: t.kitchenJiko, val: stats?.breakdown?.kitchen || 0 },
    { label: t.fuelShidaal, val: stats?.breakdown?.fuel || 0 },
    { label: t.repairsDayactir, val: stats?.breakdown?.repairs || 0 },
    { label: t.dogsExpense, val: stats?.breakdown?.dogs || 0 },
    { label: t.vehicles, val: stats?.breakdown?.vehicles || 0 },
    { label: t.utilities, val: stats?.breakdown?.utilities || 0 },
    { label: t.others, val: stats?.breakdown?.others || 0 },
  ]

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{
          borderRadius: 20, padding: '24px 28px',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #1e3a5f 100%)',
          border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 8px 30px rgba(59,130,246,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          position: 'relative', overflow: 'hidden',
        }} className="print:hidden">
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{t.reportsTitle}</h2>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(191,219,254,0.8)' }}>{t.reportsSub}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 11, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)', color: '#6ee7b7', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.2)'}>
              <Download style={{ width: 15, height: 15 }} /> {t.excelExport}
            </button>
            <button onClick={printReport} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 11, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}>
              <Printer style={{ width: 15, height: 15 }} /> {t.printPdf}
            </button>
          </div>
        </div>

        {/* Summary metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ borderRadius: 16, padding: '18px 20px', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: `1px solid ${r.color}25`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: `${r.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <r.icon style={{ width: 18, height: 18, color: r.color }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: r.color }}>{r.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.7)', fontWeight: 600 }}>{r.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Income vs Expenses vs P/L */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 4px 20px rgba(16,185,129,0.1)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><TrendingUp style={{ width: 18, height: 18, color: 'white' }} /></div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#10b981', letterSpacing: '-0.5px' }}>${(stats?.totalIncome||0).toFixed(2)}</div>
            <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', fontWeight: 600, marginTop: 4 }}>{t.totalIncome}</div>
          </div>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(244,63,94,0.25)', boxShadow: '0 4px 20px rgba(244,63,94,0.1)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #f43f5e, #e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><TrendingDown style={{ width: 18, height: 18, color: 'white' }} /></div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#f43f5e', letterSpacing: '-0.5px' }}>${(stats?.totalExpenses||0).toFixed(2)}</div>
            <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', fontWeight: 600, marginTop: 4 }}>{t.totalExpenses}</div>
          </div>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: `1px solid ${pl >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`, boxShadow: `0 4px 20px ${pl >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)'}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: pl >= 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f43f5e, #e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><DollarSign style={{ width: 18, height: 18, color: 'white' }} /></div>
            <div style={{ fontSize: 26, fontWeight: 900, color: pl >= 0 ? '#10b981' : '#f43f5e', letterSpacing: '-0.5px' }}>{pl >= 0 ? '+' : '-'}${Math.abs(pl).toFixed(2)}</div>
            <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', fontWeight: 600, marginTop: 4 }}>{t.profitLoss}</div>
          </div>
        </div>

        {/* Detailed Expense Breakdown */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: isLight ? '#0f172a' : 'white', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 18, borderRadius: 10, background: 'linear-gradient(180deg, #6366f1, #8b5cf6)', display: 'inline-block' }} />
            {t.expensesTitle}
          </h3>
          <div style={{ borderRadius: 20, overflow: 'hidden', background: isLight ? 'white' : 'rgba(13,20,36,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', gap: 10, background: isLight ? '#f8faff' : 'rgba(99,102,241,0.06)' }}>
              <FileText style={{ width: 16, height: 16, color: '#6366f1' }} />
              <span style={{ fontWeight: 700, color: isLight ? '#0f172a' : 'white', fontSize: 14 }}>{t.companyReportHeader}</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>{t.reportDateLabel} {new Date().toLocaleDateString()}</span>
            </div>
            <div style={{ padding: '6px 0' }}>
              {expBreakdown.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isLight ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.07)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <span style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f43f5e' }}>${row.val.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: isLight ? '#fef2f2' : 'rgba(244,63,94,0.06)', borderTop: '1px solid rgba(244,63,94,0.15)' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: isLight ? '#0f172a' : 'white' }}>{t.totalExpenses}</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#f43f5e' }}>${(stats?.totalExpenses||0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
