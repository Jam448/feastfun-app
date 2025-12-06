'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share } from 'lucide-react'

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    setIsIOS(isIOSDevice)
    setIsStandalone(isStandaloneMode)

    const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen')
    if (!hasSeenPrompt && !isStandaloneMode) {
      setTimeout(() => setShowPrompt(true), 3000)
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!hasSeenPrompt) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[Analytics] pwa_installed')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_seen', 'true')
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_seen', 'true')
  }

  if (isStandalone || !showPrompt) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 safe-top">
      <div className="max-w-md mx-auto glass rounded-2xl shadow-2xl p-4 border border-white/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-red-500 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Install FeastFun</h3>
              <p className="text-xs text-gray-600">Play offline anytime</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="text-sm text-gray-700 space-y-2 bg-blue-50 rounded-xl p-3">
            <p className="font-semibold flex items-center gap-2">
              <Share className="w-4 h-4" />
              Install on iPhone/iPad:
            </p>
            <ol className="text-xs space-y-1 ml-6 list-decimal">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
              <li>Tap &quot;Add&quot;</li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="w-full bg-gradient-to-r from-primary-500 to-red-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition"
          >
            Install Now
          </button>
        ) : (
          <div className="text-sm text-gray-700 space-y-2 bg-green-50 rounded-xl p-3">
            <p className="font-semibold">Install on Android:</p>
            <ol className="text-xs space-y-1 ml-4 list-decimal">
              <li>Tap the menu (⋮) in your browser</li>
              <li>Tap &quot;Install app&quot; or &quot;Add to Home screen&quot;</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
