'use client'

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private enabled: boolean = true
  private initialized: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private init() {
    if (this.initialized) return
    this.initialized = true

    // Preload audio files
    const audioFiles = {
      chomp: '/audio/chomp.mp3',
      match: '/audio/match.mp3',
      combo: '/audio/combo.mp3',
      win: '/audio/win.mp3',
      fail: '/audio/fail.mp3',
    }

    for (const [name, path] of Object.entries(audioFiles)) {
      try {
        const audio = new Audio(path)
        audio.preload = 'auto'
        audio.volume = 0.5
        this.sounds.set(name, audio)
      } catch (error) {
        console.warn(`Failed to load sound: ${name}`, error)
      }
    }
  }

  private play(name: string, volume: number = 0.5) {
    if (!this.enabled) return

    try {
      const sound = this.sounds.get(name)
      if (sound) {
        // Clone for overlapping sounds
        const clone = sound.cloneNode() as HTMLAudioElement
        clone.volume = Math.min(1, Math.max(0, volume))
        clone.play().catch(() => {
          // Ignore autoplay errors
        })
      }
    } catch (error) {
      // Silently fail
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }

  // Game sounds
  playClick() {
    this.play('match', 0.3)
  }

  playChomp() {
    this.play('chomp', 0.6)
  }

  playMunch() {
    this.play('chomp', 0.6)
  }

  playMatch() {
    this.play('match', 0.5)
  }

  playCombo(level: number = 1) {
    // Play combo with increasing volume based on combo level
    const volume = Math.min(0.8, 0.4 + (level * 0.1))
    this.play('combo', volume)
  }

  playWin() {
    this.play('win', 0.7)
  }

  playFail() {
    this.play('fail', 0.5)
  }

  playWhoops() {
    // Short fail sound for invalid moves
    this.play('fail', 0.3)
  }

  playSpecial() {
    this.play('combo', 0.7)
  }

  playLevelComplete() {
    this.play('win', 0.8)
  }

  playLevelFail() {
    this.play('fail', 0.6)
  }
}

// Singleton instance
export const soundManager = new SoundManager()