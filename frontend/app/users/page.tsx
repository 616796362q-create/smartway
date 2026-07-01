'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useApp } from '@/lib/AppContext'
import { apiGet } from '@/lib/api'
import { Shield, UserCheck, Users, Crown } from 'lucide-react'

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

export default function UsersPage() {
  const { t, theme } = useApp()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    apiGet('/auth/users').then(d => setUsers(d || []))
  }, [])

  const isLight = theme === 'light'

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{
          borderRadius: 20, padding: '24px 28px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 60%, #1e1b4b 100%)',
          border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 8px 30px rgba(99,102,241,0.25)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{t.usersTitle}</h2>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(199,210,254,0.8)', position: 'relative' }}>{t.usersSub}</p>
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
                transition: 'all 0.25s', cursor: 'default',
                animationDelay: `${i * 0.08}s`,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${cfg.color}25` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${cfg.color}12` }}
              >
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: cfg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${cfg.color}40`, flexShrink: 0 }}>
                    <IconComp style={{ width: 24, height: 24, color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 16, color: isLight ? '#0f172a' : 'white', marginBottom: 3 }}>{u.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)', fontWeight: 500 }}>@{u.username}</p>
                  </div>
                </div>

                {/* Role badge */}
                <div style={{ marginBottom: 14 }}>
                  <span style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800, background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}35`, letterSpacing: '0.03em' }}>
                    {u.role}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: `linear-gradient(90deg, ${cfg.color}30, transparent)`, marginBottom: 14 }} />

                {/* Access info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.gradient, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.5)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.accessLabel}</p>
                    <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)', lineHeight: 1.5 }}>{ACCESS_MAP[u.role] || 'Limited Access'}</p>
                  </div>
                </div>

                {/* ID */}
                <p style={{ fontSize: 10, color: 'rgba(100,116,139,0.5)', marginTop: 12, fontFamily: 'monospace' }}>ID: {u.id}</p>
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
    </AppLayout>
  )
}
