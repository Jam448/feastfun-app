import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'FeastFun - Holiday Match Game',
  description: 'Help Pockets the raccoon collect treats in this festive match-3 game!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-orange-500">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
