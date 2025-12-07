'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Music, Music2 } from 'lucide-react'
import { enhancedSoundManager } from '@/lib/enhanced-sound-manager'

export function SoundControls() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(true)

  useEffect(() => {
    setSoundEnabled(enhancedSoundManager.getSoundEnabled())
    setMusicEnabled(enhancedSoundManager.getMusicEnabled())
  }, [])

  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    enhancedSoundManager.setSoundEnabled(newState)
    if (newState) {
      enhancedSoundManager.playSound('click')
    }
  }

  const toggleMusic = () => {
    const newState = !musicEnabled
    setMusicEnabled(newState)
    enhancedSoundManager.setMusicEnabled(newState)
    if (newState) {
      enhancedSoundManager.playMusic('jingleBells')
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <button
        onClick={toggleSound}
        className="bg-white/90 backdrop-blur-sm text-red-600 p-3 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-red-200"
        aria-label="Toggle sound effects"
      >
        {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>

      <button
        onClick={toggleMusic}
        className="bg-white/90 backdrop-blur-sm text-red-600 p-3 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-red-200"
        aria-label="Toggle music"
      >
        {musicEnabled ? <Music className="w-6 h-6" /> : <Music2 className="w-6 h-6" />}
      </button>
    </div>
  )
}
