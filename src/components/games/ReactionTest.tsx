import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Leaderboard from '../Leaderboard';
import ScoreSubmitModal from '../ScoreSubmitModal';

type GameState = 'idle' | 'waiting' | 'ready' | 'clicked' | 'tooEarly';

export default function ReactionTest({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all'>('all');
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setGameState('waiting');
    setReactionTime(null);

    const delay = Math.random() * 3000 + 2000;
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      setGameState('tooEarly');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else if (gameState === 'ready') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setGameState('clicked');
      setAttempts(prev => [...prev, time]);

      if (bestTime === null || time < bestTime) {
        setBestTime(time);
      }
    } else if (gameState === 'idle' || gameState === 'clicked' || gameState === 'tooEarly') {
      startGame();
    }
  };

  const reset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setGameState('idle');
    setReactionTime(null);
    setBestTime(null);
    setAttempts([]);
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting':
        return 'bg-red-500';
      case 'ready':
        return 'bg-green-500';
      case 'tooEarly':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getMessage = () => {
    switch (gameState) {
      case 'idle':
        return 'Click to Start';
      case 'waiting':
        return 'Wait for green...';
      case 'ready':
        return 'CLICK NOW!';
      case 'clicked':
        return `${reactionTime}ms`;
      case 'tooEarly':
        return 'Too early! Click to try again';
      default:
        return '';
    }
  };

  const averageTime = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
    : null;

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
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Reaction Speed Test</h2>

          <button
            onClick={handleClick}
            className={`w-full aspect-video rounded-xl ${getBackgroundColor()} text-white text-4xl font-bold transition-all duration-200 hover:scale-105 shadow-lg`}
          >
            {getMessage()}
          </button>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Last Time</p>
              <p className="text-2xl font-bold text-slate-800">
                {reactionTime ? `${reactionTime}ms` : '-'}
              </p>
            </div>
            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Best Time</p>
              <p className="text-2xl font-bold text-green-600">
                {bestTime ? `${bestTime}ms` : '-'}
              </p>
            </div>
            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Average</p>
              <p className="text-2xl font-bold text-blue-600">
                {averageTime ? `${averageTime}ms` : '-'}
              </p>
            </div>
          </div>
        </div>

        {attempts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Attempt History</h3>
            <div className="flex flex-wrap gap-2">
              {attempts.map((time, idx) => (
                <span
                  key={idx}
                  className="px-3 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium"
                >
                  #{idx + 1}: {time}ms
                </span>
              ))}
            </div>
          </div>
        )}

        {bestTime && (
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mt-6 text-center">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
            >
              Submit Best Time to Leaderboard
            </button>
          </div>
        )}

        <div className="mt-6 bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-sm text-slate-600">
            Beat the turkey! Average reaction time is around 250ms. Can you do better?
          </p>
        </div>
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
        <Leaderboard gameType="reaction" timeframe={timeframe} />
      </div>

      <ScoreSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        gameType="reaction"
        score={bestTime || 0}
        onSubmitSuccess={() => {}}
      />
    </div>
  );
}
