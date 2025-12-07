'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Play, Trophy, ShoppingBag, Settings } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/match3', icon: Play, label: 'Feast' },
    { href: '/play', icon: Trophy, label: 'Arcade' },
    { href: '/challenges', icon: Trophy, label: 'Ranks' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass safe-bottom z-50 card-elevated">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
              isActive(href)
                ? 'text-white scale-110'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <Icon className="w-6 h-6 mb-1" strokeWidth={isActive(href) ? 2.5 : 2} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
