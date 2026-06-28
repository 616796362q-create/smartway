import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/lib/AppContext'

export const metadata: Metadata = {
  title: 'SmartWay - Nidaamka Maamulka Shirkadda Ilaalada',
  description: 'Nidaamka Maamulka Shirkada Ilaalada SmartWay',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="so" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen font-[Inter,system-ui]" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text)' }}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
