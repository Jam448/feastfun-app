import { useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Header from './components/Header';
import Hero from './components/Hero';
import GameSelector from './components/GameSelector';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import RewardsDisplay from './components/RewardsDisplay';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'games' | 'admin'>('home');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const handleAdminAccess = () => {
    if (adminKey === 'feast2024') {
      setCurrentView('admin');
      setShowAdminKey(false);
      setAdminKey('');
    } else {
      alert('Invalid admin key');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <Header />
      <main>
        {currentView === 'home' && (
          <>
            <Hero onPlayGames={() => setCurrentView('games')} />
            <div className="container mx-auto px-4 py-12">
              <RewardsDisplay />
            </div>
          </>
        )}
        {currentView === 'games' && (
          <div className="container mx-auto px-4 py-8">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-slate-700 font-medium"
            >
              ← Back to Home
            </button>
            <GameSelector />
          </div>
        )}
        {currentView === 'admin' && <AdminPanel />}
      </main>

      {!showAdminKey && currentView !== 'admin' && (
        <button
          onClick={() => setShowAdminKey(true)}
          className="fixed bottom-4 right-4 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800 transition-all"
        >
          Admin
        </button>
      )}

      {showAdminKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Admin Access</h2>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAdminKey(false);
                  setAdminKey('');
                }}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminAccess}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
              >
                Access
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <SpeedInsights />
    </div>
  );
}

export default App;
