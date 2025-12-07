'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogIn, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AuthButton() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="max-w-[150px] truncate">{user.email}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-white/20 backdrop-blur-md hover:bg-white/30 px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => router.push('/auth/login')}
      className="bg-white hover:bg-white/90 px-6 py-3 rounded-full text-red-600 font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 active:scale-95 transition-all"
    >
      <LogIn className="w-5 h-5" />
      Sign In
    </button>
  )
}
