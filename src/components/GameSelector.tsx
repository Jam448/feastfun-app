import { useState } from 'react';
import MemoryGame from './games/MemoryGame';
import NumberGuess from './games/NumberGuess';
import ReactionTest from './games/ReactionTest';

type GameType = 'memory' | 'guess' | 'reaction' | null;

export default function GameSelector() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);

  if (selectedGame === 'memory') {
    return <MemoryGame onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'guess') {
    return <NumberGuess onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'reaction') {
    return <ReactionTest onBack={() => setSelectedGame(null)} />;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Turkey Games</h2>
      <p className="text-slate-600 mb-6">Play games, compete, and win $FEAST rewards!</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setSelectedGame('memory')}
          className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group border-2 border-transparent hover:border-orange-500"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
            <span className="text-2xl">🦃</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Turkey Memory</h3>
          <p className="text-slate-600">Match the Thanksgiving feast pairs!</p>
        </button>

        <button
          onClick={() => setSelectedGame('guess')}
          className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group border-2 border-transparent hover:border-amber-500"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
            <span className="text-2xl">🔮</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Feast Fortune</h3>
          <p className="text-slate-600">Guess the lucky feast number!</p>
        </button>

        <button
          onClick={() => setSelectedGame('reaction')}
          className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group border-2 border-transparent hover:border-red-500"
        >
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Turkey Speed Test</h3>
          <p className="text-slate-600">Beat the turkey's reaction time!</p>
        </button>
      </div>
    </div>
  );
}
