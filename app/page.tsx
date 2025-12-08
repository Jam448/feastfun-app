'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-800 via-red-600 to-rose-600 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Glow halo */}
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,0.3),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(255,255,255,0.2),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.1),transparent_55%)]" />

        {/* Garlands / top border */}
        <div className="pointer-events-none absolute -top-6 inset-x-0 flex justify-center gap-6 text-2xl">
          <span className="animate-jingle">🎄</span>
          <span className="animate-jingle [animation-delay:0.1s]">🎁</span>
          <span className="animate-jingle [animation-delay:0.2s]">⭐</span>
          <span className="animate-jingle [animation-delay:0.3s]">🦌</span>
          <span className="animate-jingle [animation-delay:0.4s]">🍰</span>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-center gap-8">
          {/* Left column */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs sm:text-sm font-semibold text-white ring-1 ring-white/25 shadow-candy animate-glow">
              🎄 Limited-Time Christmas Event • ❄️ Daily Snowfall Streaks • 🏆 Monthly Leaderboards
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
              FeastFun: <span className="text-yellow-200">Holiday Heist</span>
            </h1>

            <p className="text-white/90 text-base sm:text-lg max-w-xl">
              Help <span className="font-semibold">Pockets the snack-thief raccoon</span> swipe
              cookies, cakes, and cocoa while you climb through 4 festive worlds and 40 tasty levels.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/play"
                className="flex-1 rounded-2xl bg-white text-red-700 px-6 py-4 text-lg font-black shadow-candy hover:scale-[1.02] active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
              >
                🍰 Arcade Sprint
              </Link>

              <Link
                href="/worlds"
                className="flex-1 rounded-2xl bg-red-900/30 px-6 py-4 text-sm sm:text-base font-bold text-white ring-1 ring-white/20 hover:bg-red-900/40 hover:scale-[1.02] active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
              >
                🗺️ World Map
                <span className="rounded-full bg-yellow-300 text-red-800 px-2 py-0.5 text-xs font-black">
                  40 Levels
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs sm:text-sm text-white/85 pt-2">
              <div className="bg-black/20 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/10">
                <div className="font-semibold">Winter Wonderland</div>
                <div className="text-white/70">Snowy puzzles & icy treats</div>
              </div>
              <div className="bg-black/20 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/10">
                <div className="font-semibold">Candy Cane Lane</div>
                <div className="text-white/70">Sweet chains & sugar storms</div>
              </div>
              <div className="bg-black/20 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/10">
                <div className="font-semibold">Gingerbread Grove</div>
                <div className="text-white/70">Festive challenges ahead</div>
              </div>
            </div>
          </div>

          {/* Right column - Pockets hero */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64">
              <div className="absolute -inset-6 rounded-full bg-gradient-to-b from-yellow-200/60 via-red-200/20 to-transparent blur-3xl opacity-70 animate-pulse" />
              <div className="relative w-full h-full animate-float">
                <Image
                  src="/image copy.png"
                  alt="Pockets the Christmas Raccoon"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_18px_50px_rgba(0,0,0,0.65)]"
                />
              </div>

              {/* Floating goodies */}
              <div className="absolute -left-3 top-4 text-3xl animate-twinkle">🍪</div>
              <div className="absolute -right-2 top-10 text-3xl animate-twinkle [animation-delay:0.3s]">
                🍰
              </div>
              <div className="absolute left-6 -bottom-3 text-2xl animate-wiggle">⭐</div>
              <div className="absolute right-5 -bottom-2 text-2xl animate-wiggle [animation-delay:0.2s]">
                🎁
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/challenges"
          className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-4 shadow-candy hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="text-3xl mb-2">🏆</div>
          <div className="font-bold text-white">Challenges</div>
          <div className="text-xs text-white/80">Daily quests</div>
        </Link>

        <Link
          href="/locker"
          className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl p-4 shadow-candy hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="text-3xl mb-2">🛍️</div>
          <div className="font-bold text-white">Locker</div>
          <div className="text-xs text-white/80">Customize Pockets</div>
        </Link>

        <Link
          href="/settings"
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 shadow-candy hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="text-3xl mb-2">⚙️</div>
          <div className="font-bold text-white">Settings</div>
          <div className="text-xs text-white/80">Audio & more</div>
        </Link>

        <Link
          href="/feast"
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 shadow-candy hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="text-3xl mb-2">🎯</div>
          <div className="font-bold text-white">Feast Fun</div>
          <div className="text-xs text-white/80">Match-3 mode</div>
        </Link>
      </section>
    </main>
  )
}