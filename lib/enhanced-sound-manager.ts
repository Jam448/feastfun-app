export type SoundEffect =
  | 'match' | 'special' | 'combo' | 'levelComplete' | 'levelFailed'
  | 'click' | 'unlock' | 'bell' | 'whoosh' | 'sparkle'

export type MusicTrack = 'jingleBells' | 'silentNight' | 'deckTheHalls'

class EnhancedSoundManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundEffect, AudioBuffer> = new Map()
  private musicTracks: Map<MusicTrack, HTMLAudioElement> = new Map()
  private currentMusic: HTMLAudioElement | null = null
  private soundEnabled: boolean = true
  private musicEnabled: boolean = true
  private musicVolume: number = 0.3
  private sfxVolume: number = 0.5

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
      this.loadSettings()
    }
  }

  private initialize() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.generateSounds()
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  private loadSettings() {
    const soundEnabled = localStorage.getItem('soundEnabled')
    const musicEnabled = localStorage.getItem('musicEnabled')
    const musicVolume = localStorage.getItem('musicVolume')
    const sfxVolume = localStorage.getItem('sfxVolume')

    if (soundEnabled !== null) this.soundEnabled = soundEnabled === 'true'
    if (musicEnabled !== null) this.musicEnabled = musicEnabled === 'true'
    if (musicVolume !== null) this.musicVolume = parseFloat(musicVolume)
    if (sfxVolume !== null) this.sfxVolume = parseFloat(sfxVolume)
  }

  private saveSettings() {
    localStorage.setItem('soundEnabled', String(this.soundEnabled))
    localStorage.setItem('musicEnabled', String(this.musicEnabled))
    localStorage.setItem('musicVolume', String(this.musicVolume))
    localStorage.setItem('sfxVolume', String(this.sfxVolume))
  }

  private generateSounds() {
    if (!this.audioContext) return

    this.sounds.set('match', this.createMatchSound())
    this.sounds.set('special', this.createSpecialSound())
    this.sounds.set('combo', this.createComboSound())
    this.sounds.set('click', this.createClickSound())
    this.sounds.set('bell', this.createBellSound())
    this.sounds.set('whoosh', this.createWhooshSound())
    this.sounds.set('sparkle', this.createSparkleSound())
  }

  private createMatchSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 })

    const duration = 0.15
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 800 + Math.sin(t * 40) * 200
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.3
    }

    return buffer
  }

  private createSpecialSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 })

    const duration = 0.3
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 600 + t * 1200
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5) * 0.4
    }

    return buffer
  }

  private createComboSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 })

    const duration = 0.25
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 1000 + Math.sin(t * 60) * 400
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 6) * 0.35
    }

    return buffer
  }

  private createClickSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 })

    const duration = 0.05
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      data[i] = Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 50) * 0.2
    }

    return buffer
  }

  private createBellSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 })

    const duration = 0.6
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    const frequencies = [1046.5, 1318.5, 1568]

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      let sample = 0

      frequencies.forEach((freq, index) => {
        sample += Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * (3 + index)) * 0.2
      })

      data[i] = sample
    }

    return buffer
  }

  private createWhooshSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 })

    const duration = 0.2
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 1500 - t * 1200
      const noise = Math.random() * 2 - 1
      data[i] = (Math.sin(2 * Math.PI * frequency * t) * 0.3 + noise * 0.1) * Math.exp(-t * 8)
    }

    return buffer
  }

  private createSparkleSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 })

    const duration = 0.4
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 2000 + Math.sin(t * 80) * 500
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 7) * 0.25
    }

    return buffer
  }

  playSound(effect: SoundEffect, volume: number = 1.0) {
    if (!this.soundEnabled || !this.audioContext) return

    const buffer = this.sounds.get(effect)
    if (!buffer) return

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()

    source.buffer = buffer
    gainNode.gain.value = this.sfxVolume * volume

    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    source.start(0)
  }

  playBells() {
    if (!this.soundEnabled) return

    const pattern = [0, 100, 200, 400, 600, 800]
    pattern.forEach(delay => {
      setTimeout(() => this.playSound('bell', 0.8), delay)
    })
  }

  playMelody(notes: number[], tempo: number = 200) {
    if (!this.soundEnabled || !this.audioContext) return

    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note, 0.2, 0.4)
      }, index * tempo)
    })
  }

  private playTone(frequency: number, duration: number, volume: number = 0.5) {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(this.sfxVolume * volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  playLevelComplete() {
    this.playBells()
    const melody = [523.25, 659.25, 783.99, 1046.50]
    this.playMelody(melody, 150)
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
    this.saveSettings()
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    if (!enabled && this.currentMusic) {
      this.currentMusic.pause()
    } else if (enabled && this.currentMusic) {
      this.currentMusic.play().catch(() => {})
    }
    this.saveSettings()
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume
    }
    this.saveSettings()
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  getSoundEnabled(): boolean {
    return this.soundEnabled
  }

  getMusicEnabled(): boolean {
    return this.musicEnabled
  }

  getMusicVolume(): number {
    return this.musicVolume
  }

  getSfxVolume(): number {
    return this.sfxVolume
  }

  stopAllSounds() {
    if (this.currentMusic) {
      this.currentMusic.pause()
      this.currentMusic.currentTime = 0
    }
  }
}

export const enhancedSoundManager = new EnhancedSoundManager()
