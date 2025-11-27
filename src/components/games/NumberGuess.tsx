import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Leaderboard from '../Leaderboard';
import ScoreSubmitModal from '../ScoreSubmitModal';

export default function NumberGuess({ onBack }: { onBack: () => void }) {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Guess the lucky feast number (1-100)!');
  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all'>('all');

  const initializeGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setMessage('Guess the lucky feast number (1-100)!');
    setAttempts(0);
    setGameWon(false);
    setHistory([]);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numGuess = parseInt(guess);

    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      setMessage('Please enter a valid number between 1 and 100!');
      return;
    }

    setAttempts(prev => prev + 1);
    setHistory(prev => [...prev, numGuess]);

    if (numGuess === targetNumber) {
      setMessage(`You found it in ${attempts + 1} attempts!`);
      setGameWon(true);
    } else if (numGuess < targetNumber) {
      setMessage('Too low! Try a higher number.');
    } else {
      setMessage('Too high! Try a lower number.');
    }

    setGuess('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button
            onClick={initializeGame}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
          >
            <RotateCcw size={20} />
            New Game
          </button>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Feast Fortune 🔮</h2>

          <div className={`p-4 rounded-lg mb-6 text-center ${
            gameWon ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
          }`}>
            <p className="text-lg font-semibold">{message}</p>
            <p className="text-sm mt-2">Attempts: {attempts}</p>
          </div>

          {gameWon && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full mb-4 px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
            >
              Submit to Leaderboard
            </button>
          )}

          {!gameWon && (
            <form onSubmit={handleSubmit} className="mb-6">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none mb-4"
                min="1"
                max="100"
              />
              <button
                type="submit"
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
              >
                Submit Guess
              </button>
            </form>
          )}

          {history.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Your Guesses:</h3>
              <div className="flex flex-wrap gap-2">
                {history.map((h, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm ${
                      h === targetNumber
                        ? 'bg-orange-500 text-white'
                        : h < targetNumber
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
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
        <Leaderboard gameType="guess" timeframe={timeframe} />
      </div>

      <ScoreSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        gameType="guess"
        score={attempts}
        onSubmitSuccess={() => {}}
      />
    </div>
  );
}
