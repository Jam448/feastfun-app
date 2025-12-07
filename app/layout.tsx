import './globals.css'
import type { Metadata } from 'next'
import { SnowfallEffect } from '@/components/SnowfallEffect'
import { SoundControls } from '@/components/SoundControls'

export const metadata: Metadata = {
  title: 'FeastFun',
  description: 'Festive food-themed arcade & puzzle game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white antialiased">
        {/* Global decorative layers */}
        <SnowfallEffect />
        <SoundControls />

        <div className="min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  )
}
