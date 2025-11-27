import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ScoreSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'memory' | 'guess' | 'reaction';
  score: number;
  onSubmitSuccess: () => void;
}

export default function ScoreSubmitModal({
  isOpen,
  onClose,
  gameType,
  score,
  onSubmitSuccess,
}: ScoreSubmitModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from('leaderboard_entries')
        .insert({
          game_type: gameType,
          player_name: playerName.trim(),
          score,
          wallet_address: walletAddress.trim() || null,
        });

      if (submitError) throw submitError;

      onSubmitSuccess();
      onClose();
      setPlayerName('');
      setWalletAddress('');
    } catch (err) {
      console.error('Error submitting score:', err);
      setError('Failed to submit score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getGameTitle = () => {
    switch (gameType) {
      case 'memory':
        return 'Turkey Memory';
      case 'guess':
        return 'Feast Fortune';
      case 'reaction':
        return 'Turkey Speed Test';
    }
  };

  const getScoreLabel = () => {
    switch (gameType) {
      case 'memory':
        return `${score} moves`;
      case 'guess':
        return `${score} attempts`;
      case 'reaction':
        return `${score}ms`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-all"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Submit Your Score</h2>
        <p className="text-slate-600 mb-4">
          {getGameTitle()} - <span className="font-semibold text-orange-600">{getScoreLabel()}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Solana Wallet Address (Optional)
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="For prize eligibility"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-sm font-mono"
            />
            <p className="text-xs text-slate-500 mt-1">
              Add your wallet to be eligible for $FEAST rewards!
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
