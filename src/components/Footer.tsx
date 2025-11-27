import { Copy } from 'lucide-react';

export default function Footer() {
  const tokenAddress = 'BnqtDaCznLcPaPbfdpn1AngnbrGmhnd8Lo4FZH47pump';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tokenAddress);
  };

  return (
    <footer className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">🦃</span>
              FEAST.FUN
            </h3>
            <p className="text-orange-100">The meme coin that made it big on Solana.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-orange-100">
              <li>
                <a
                  href="https://pump.fun/coin/BnqtDaCznLcPaPbfdpn1AngnbrGmhnd8Lo4FZH47pump"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all"
                >
                  Buy on Pump.fun
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/FeastDotFun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all"
                >
                  Twitter/X
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contract Address</h4>
            <div className="bg-white/20 rounded-lg p-3 flex items-center justify-between">
              <span className="text-xs font-mono">{tokenAddress.slice(0, 12)}...</span>
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-white/30 rounded transition-all"
                title="Copy CA"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-orange-400 pt-6 text-center text-orange-100">
          <p>
            $FEAST Token - Built with love for the community.{' '}
            <span className="text-orange-50">Stop being poor.</span>
          </p>
          <p className="text-xs mt-2">Not financial advice. Do your own research.</p>
        </div>
      </div>
    </footer>
  );
}
