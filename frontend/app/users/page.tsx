'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet } from '@/lib/api'
import { Shield, UserCheck } from 'lucide-react'

interface User { id: string; username: string; role: string; name: string }

const ROLE_COLOR: Record<string, string> = {
  Admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  Manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Accountant: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export default function UsersPage() {
  const { t, theme } = useApp()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    apiGet('/auth/users').then(d => setUsers(d || []))
  }, [])

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t.usersTitle}</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.usersSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map(u => (
            <div key={u.id} className="border rounded-2xl p-5" 
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                borderColor: u.role === 'Admin' ? 'rgba(239,68,68,0.3)' : u.role === 'Manager' ? 'rgba(59,130,246,0.3)' : 'rgba(147,51,234,0.3)' 
              }}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${ROLE_COLOR[u.role] || ''}`}>
                  {u.role === 'Admin' ? <Shield className="w-6 h-6"/> : <UserCheck className="w-6 h-6"/>}
                </div>
                <div>
                  <p className="font-bold" style={{ color: 'var(--text)' }}>{u.name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>@{u.username}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ROLE_COLOR[u.role] || ''}`}>{u.role}</span>
              </div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border2)' }}>
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>ID: {u.id}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {t.accessLabel} {u.role === 'Admin' ? 'Full System' : u.role === 'Manager' ? 'Staff, Payroll, Reports' : 'Finance, Expenses, Payroll'}
                </p>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: 'var(--text-dim)' }}>
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30"/>
              <p>{t.noUsers}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
