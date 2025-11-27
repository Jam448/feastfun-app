import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Leaderboard from '../Leaderboard';
import ScoreSubmitModal from '../ScoreSubmitModal';

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const emojis = ['🦃', '🍗', '🥔', '🌽', '🥧', '💰', '🚀', '💎'];

export default function MemoryGame({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all'>('all');

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false,
      }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setGameWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices;
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prev =>
          prev.map((card, idx) =>
            idx === first || idx === second ? { ...card, matched: true } : card
          )
        );
        setFlippedIndices([]);

        if (cards.filter(c => !c.matched).length === 2) {
          setGameWon(true);
        }
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map((card, idx) =>
              idx === first || idx === second ? { ...card, flipped: false } : card
            )
          );
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [flippedIndices, cards]);

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      cards[index].flipped ||
      cards[index].matched ||
      flippedIndices.includes(index)
    ) {
      return;
    }

    setCards(prev =>
      prev.map((card, idx) =>
        idx === index ? { ...card, flipped: true } : card
      )
    );
    setFlippedIndices(prev => [...prev, index]);

    if (flippedIndices.length === 1) {
      setMoves(m => m + 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-slate-700">Moves: {moves}</span>
          <button
            onClick={initializeGame}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>
      </div>

      {gameWon && (
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6 text-center">
          <h3 className="text-xl font-bold text-orange-800 mb-2">Feast Complete! 🦃</h3>
          <p className="text-orange-700">You matched all the turkeys in {moves} moves!</p>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="mt-3 px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
          >
            Submit to Leaderboard
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`aspect-square rounded-xl text-5xl flex items-center justify-center transition-all duration-300 ${
              card.flipped || card.matched
                ? 'bg-white shadow-lg'
                : 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-md hover:shadow-xl hover:scale-105'
            }`}
            disabled={card.matched}
          >
            {card.flipped || card.matched ? card.emoji : '?'}
          </button>
        ))}
          </div>
        </div>
        <div>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeframe === 'daily'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeframe === 'weekly'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeframe === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              All Time
            </button>
          </div>
          <Leaderboard gameType="memory" timeframe={timeframe} />
        </div>
      </div>

      <ScoreSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        gameType="memory"
        score={moves}
        onSubmitSuccess={() => {}}
      />
    </div>
  );
}
