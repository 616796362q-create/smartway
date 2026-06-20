'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const user = localStorage.getItem('sw_user')
    if (user) router.push('/dashboard')
    else router.push('/login')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#0058b0] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
