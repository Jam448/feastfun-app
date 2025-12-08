'use client'

import Link from 'next/link'
import { Character3D } from '@/components/Character3D'

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-8 sm:p-12 shadow-2xl">
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_30%,white,transparent_30%),radial-gradient(circle_at_60%_90%,white,transparent_35%)]" />

      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25">
            🎄 Seasonal Worlds • Daily Challenges • Leaderboards
          </div>

          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            FeastFun
          </h1>

          <p className="mt-3 text-white/90 text-lg">
            Snack-sized chaos with Pockets — the clumsy, lovable raccoon who “borrows” treats and triggers combos.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/play"
              className="rounded-2xl bg-white px-5 py-3 font-bold text-red-700 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
            >
              Play Now
            </Link>

            <Link
              href="/feastfun"
              className="rounded-2xl bg-white/15 px-5 py-3 font-bold text-white ring-1 ring-white/25 hover:bg-white/20 transition"
            >
              Feast Crush
            </Link>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="h-72 w-72 sm:h-96 sm:w-96">
            <Character3D />
          </div>
        </div>
      </div>
    </section>
  )
}
