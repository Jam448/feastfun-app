import { Zap, TrendingUp } from 'lucide-react';

interface HeroProps {
  onPlayGames: () => void;
}

export default function Hero({ onPlayGames }: HeroProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="mb-6">
            <span className="text-sm font-bold text-orange-600 bg-orange-100 px-4 py-2 rounded-full">
              The Meme Coin That Made It
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-4 leading-tight">
            Stop Being <span className="text-orange-600">Poor</span>
          </h1>
          <p className="text-xl text-slate-700 mb-8 leading-relaxed">
            Join the Thanksgiving feast with $FEAST Token, the hottest meme coin on Solana. Built with Alon Cohen (founder of pump.fun) vibes, 100% community-driven and absolutely legendary.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
              <Zap className="text-orange-500 mb-2" size={28} />
              <p className="text-sm text-slate-600">Fast</p>
              <p className="text-lg font-bold text-slate-900">Built on Solana</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-amber-500">
              <TrendingUp className="text-amber-500 mb-2" size={28} />
              <p className="text-sm text-slate-600">Community</p>
              <p className="text-lg font-bold text-slate-900">To The Moon</p>
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href="https://pump.fun/coin/BnqtDaCznLcPaPbfdpn1AngnbrGmhnd8Lo4FZH47pump"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Buy $FEAST Now
            </a>
            <button
              onClick={onPlayGames}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg border-2 border-orange-500 hover:bg-orange-50 transition-all"
            >
              Play Games
            </button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
            <img
              src="/62fb32b0-f86a-4473-a84b-f7f1b2478f10.png"
              alt="FEAST Turkey Mascot - Stop Being Poor"
              className="relative w-full max-w-md rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Choose $FEAST?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-4xl mb-3">🦃</div>
            <h3 className="font-bold text-slate-900 mb-2">Community Vibes</h3>
            <p className="text-slate-600">Built by the community, for the community. This is real Thanksgiving energy.</p>
          </div>
          <div>
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-bold text-slate-900 mb-2">Lightning Fast</h3>
            <p className="text-slate-600">Powered by Solana blockchain for near-instant transactions and minimal fees.</p>
          </div>
          <div>
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="font-bold text-slate-900 mb-2">Have Fun</h3>
            <p className="text-slate-600">Play turkey games, earn engagement, and be part of something special.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
