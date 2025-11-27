import { Copy } from 'lucide-react';

export default function Header() {
  const tokenAddress = 'BnqtDaCznLcPaPbfdpn1AngnbrGmhnd8Lo4FZH47pump';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tokenAddress);
  };

  return (
    <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🦃</span>
            <div>
              <h1 className="text-3xl font-black text-white">FEAST.FUN</h1>
              <p className="text-orange-100 text-sm font-semibold">$FEAST Token on Solana</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="https://pump.fun/coin/BnqtDaCznLcPaPbfdpn1AngnbrGmhnd8Lo4FZH47pump"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-all shadow-md"
            >
              Buy $FEAST
            </a>
            <a
              href="https://x.com/FeastDotFun"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-all shadow-md"
            >
              Twitter
            </a>
          </div>
        </div>
        <div className="bg-white/90 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-600 font-semibold">Contract Address (CA):</p>
            <p className="text-sm font-mono text-slate-800 font-bold">{tokenAddress}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="ml-2 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
            title="Copy CA"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
