import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_30%,white,transparent_30%),radial-gradient(circle_at_60%_90%,white,transparent_35%)]" />

        <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25">
              🎄 Seasonal Events • Daily Challenges • Leaderboards
            </div>

            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              FeastFun
            </h1>

            <p className="mt-3 text-white/90 text-lg">
              Mini-games + match-3 levels. Help Pockets swipe treats, stack combos, and climb monthly leaderboards.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/play"
                className="rounded-2xl bg-white px-5 py-3 font-bold text-red-700 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Arcade Mode
              </Link>

              <Link
                href="/levels"
                className="rounded-2xl bg-white/15 px-5 py-3 font-bold text-white ring-1 ring-white/25 hover:bg-white/20 transition"
              >
                World Map
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
<div className="relative h-64 w-64 sm:h-80 sm:w-80 animate-bounce [animation-duration:3s]">
              <Image
                src="/santa_pockets.png"
                alt="Pockets"
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

       
      </section>
    </main>
  )
}
