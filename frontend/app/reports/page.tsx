'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet } from '@/lib/api'
import { FileText, Download, Printer } from 'lucide-react'

interface Stats { totalStaff: number; totalDogs: number; totalVehicles: number; totalIncome: number; totalExpenses: number; profitLoss: number; breakdown: Record<string, number> }

export default function ReportsPage() {
  const { t, theme, lang } = useApp()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/dashboard/stats').then(d => { setStats(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const printReport = () => window.print()

  const exportCSV = () => {
    if (!stats) return
    const rows = [
      ['SmartWay Security Company - Financial Report'],
      [''],
      ['Category', 'Amount ($)'],
      ['INCOME', ''],
      ['Total Income', stats.totalIncome.toFixed(2)],
      [''],
      ['EXPENSES', ''],
      ['Payroll', (stats.breakdown.payroll||0).toFixed(2)],
      ['Kitchen', (stats.breakdown.kitchen||0).toFixed(2)],
      ['Fuel', (stats.breakdown.fuel||0).toFixed(2)],
      ['Repairs', (stats.breakdown.repairs||0).toFixed(2)],
      ['Dogs', (stats.breakdown.dogs||0).toFixed(2)],
      ['Vehicles', (stats.breakdown.vehicles||0).toFixed(2)],
      ['Utilities', (stats.breakdown.utilities||0).toFixed(2)],
      ['Others', (stats.breakdown.others||0).toFixed(2)],
      ['Total Expenses', stats.totalExpenses.toFixed(2)],
      [''],
      ['NET PROFIT/LOSS', stats.profitLoss.toFixed(2)],
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `SmartWay_Report_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  if (loading) return <AppLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></div></AppLayout>

  const rows = [
    { label: t.activeStaff, val: stats?.totalStaff || 0, isNum: true },
    { label: `${t.dogsExpense} (${t.active})`, val: stats?.totalDogs || 0, isNum: true },
    { label: t.vehiclesDashboard, val: stats?.totalVehicles || 0, isNum: true },
    { label: '──────────────', val: 0, divider: true },
    { label: t.totalIncome, val: stats?.totalIncome || 0, color: 'text-emerald-400' },
    { label: '──────────────', val: 0, divider: true },
    { label: t.payroll, val: stats?.breakdown?.payroll || 0, color: 'text-red-400' },
    { label: t.kitchenJiko, val: stats?.breakdown?.kitchen || 0, color: 'text-red-400' },
    { label: t.fuelShidaal, val: stats?.breakdown?.fuel || 0, color: 'text-red-400' },
    { label: t.repairsDayactir, val: stats?.breakdown?.repairs || 0, color: 'text-red-400' },
    { label: t.dogsExpense, val: stats?.breakdown?.dogs || 0, color: 'text-red-400' },
    { label: t.vehicles, val: stats?.breakdown?.vehicles || 0, color: 'text-red-400' },
    { label: t.utilities, val: stats?.breakdown?.utilities || 0, color: 'text-red-400' },
    { label: t.others, val: stats?.breakdown?.others || 0, color: 'text-red-400' },
    { label: t.totalExpenses, val: stats?.totalExpenses || 0, color: 'text-red-400', bold: true },
    { label: '──────────────', val: 0, divider: true },
    { label: t.profitLoss, val: stats?.profitLoss || 0, color: (stats?.profitLoss||0) >= 0 ? 'text-emerald-400' : 'text-red-400', bold: true },
  ]

  const isLight = theme === 'light'

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.reportsTitle}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.reportsSub}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
              <Download className="w-4 h-4"/> {t.excelExport}
            </button>
            <button onClick={printReport} className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
              <Printer className="w-4 h-4"/> {t.printPdf}
            </button>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border print:border-0 print:bg-white print:text-black" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <FileText className="w-5 h-5 text-blue-400 print:text-slate-800"/>
            <div>
              <p className="font-bold print:text-slate-900" style={{ color: 'var(--text)' }}>{t.companyReportHeader}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.reportDateLabel} {new Date().toLocaleDateString('so-SO')}</p>
            </div>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row, i) => {
                  if ((row as { divider?: boolean }).divider) return (
                    <tr key={i}><td colSpan={2} className="py-2"><div className="border-t" style={{ borderColor: 'var(--border2)' }}/></td></tr>
                  )
                  return (
                    <tr key={i} className="hover:bg-slate-700/10 print:hover:bg-transparent transition-colors">
                      <td className={`py-3 pl-2 ${(row as { bold?: boolean }).bold ? 'font-bold' : ''}`} style={{ color: (row as { bold?: boolean }).bold ? 'var(--text)' : 'var(--text-muted)' }}>{row.label}</td>
                      <td className={`py-3 pr-2 text-right font-${(row as { bold?: boolean }).bold ? 'bold' : 'medium'} ${(row as { color?: string }).color || ''}`} style={{ color: (row as { color?: string }).color ? undefined : 'var(--text)' }}>
                        {(row as { isNum?: boolean }).isNum ? row.val : `$${Number(row.val).toFixed(2)}`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
