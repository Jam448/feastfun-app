// lib/enhanced-sound-manager.ts
export type SoundEffect =
  | 'match' | 'special' | 'combo' | 'levelComplete' | 'levelFailed'
  | 'click' | 'unlock' | 'bell' | 'whoosh' | 'sparkle'

export type MusicTrack = 'jingleBells' | 'silentNight' | 'deckTheHalls'

class EnhancedSoundManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundEffect, AudioBuffer> = new Map()
  private musicTracks: Map<MusicTrack, HTMLAudioElement> = new Map()
  private currentMusic: HTMLAudioElement | null = null
  private soundEnabled = true
  private musicEnabled = true
  private musicVolume = 0.3
  private sfxVolume = 0.5

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
      this.loadSettings()
      this.setupMusic()
    }
  }

  private initialize() {
    try {
      this.audioContext =
        new (window.AudioContext || (window as any).webkitAudioContext)()
      this.generateSounds()
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  private setupMusic() {
    // EXPECTED FILES (put MP3s here):
    // /public/audio/jingle-bells.mp3
    // /public/audio/silent-night.mp3
    // /public/audio/deck-the-halls.mp3
    const safeCreate = (path: string) => {
      try {
        const el = new Audio(path)
        el.loop = true
        el.volume = this.musicVolume
        return el
      } catch {
        return null
      }
    }

    const jb = safeCreate('/audio/jingle-bells.mp3')
    const sn = safeCreate('/audio/silent-night.mp3')
    const dth = safeCreate('/audio/deck-the-halls.mp3')

    if (jb) this.musicTracks.set('jingleBells', jb)
    if (sn) this.musicTracks.set('silentNight', sn)
    if (dth) this.musicTracks.set('deckTheHalls', dth)
  }

  private loadSettings() {
    const soundEnabled = typeof window !== 'undefined'
      ? window.localStorage.getItem('soundEnabled')
      : null
    const musicEnabled = typeof window !== 'undefined'
      ? window.localStorage.getItem('musicEnabled')
      : null
    const musicVolume = typeof window !== 'undefined'
      ? window.localStorage.getItem('musicVolume')
      : null
    const sfxVolume = typeof window !== 'undefined'
      ? window.localStorage.getItem('sfxVolume')
      : null

    if (soundEnabled !== null) this.soundEnabled = soundEnabled === 'true'
    if (musicEnabled !== null) this.musicEnabled = musicEnabled === 'true'
    if (musicVolume !== null) this.musicVolume = parseFloat(musicVolume)
    if (sfxVolume !== null) this.sfxVolume = parseFloat(sfxVolume)
  }

  private saveSettings() {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('soundEnabled', String(this.soundEnabled))
    window.localStorage.setItem('musicEnabled', String(this.musicEnabled))
    window.localStorage.setItem('musicVolume', String(this.musicVolume))
    window.localStorage.setItem('sfxVolume', String(this.sfxVolume))
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
    const ctx = this.audioContext!
    const duration = 0.15
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 800 + Math.sin(t * 40) * 200
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.3
    }

    return buffer
  }

  private createSpecialSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.3
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 600 + t * 1200
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5) * 0.4
    }

    return buffer
  }

  private createComboSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.25
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 1000 + Math.sin(t * 60) * 400
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 6) * 0.35
    }

    return buffer
  }

  private createClickSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.05
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      data[i] = Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 50) * 0.2
    }

    return buffer
  }

  private createBellSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.6
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)
    const frequencies = [1046.5, 1318.5, 1568]

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      let sample = 0
      frequencies.forEach((freq, index) => {
        sample += Math.sin(2 * Math.PI * freq * t) *
          Math.exp(-t * (3 + index)) * 0.2
      })
      data[i] = sample
    }

    return buffer
  }

  private createWhooshSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.2
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 1500 - t * 1200
      const noise = Math.random() * 2 - 1
      data[i] = (Math.sin(2 * Math.PI * frequency * t) * 0.3 +
        noise * 0.1) * Math.exp(-t * 8)
    }

    return buffer
  }

  private createSparkleSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.4
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      const frequency = 2000 + Math.sin(t * 80) * 500
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 7) * 0.25
    }

    return buffer
  }

  playSound(effect: SoundEffect, volume = 1.0) {
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
    const pattern = [0, 120, 260, 420, 650, 900]
    pattern.forEach(delay => {
      window.setTimeout(() => this.playSound('bell', 0.9), delay)
    })
  }

  playLevelComplete() {
    this.playBells()
    const melody = [523.25, 659.25, 783.99, 1046.5]
    this.playMelody(melody, 150)
  }

  playMelody(notes: number[], tempo = 200) {
    if (!this.soundEnabled || !this.audioContext) return
    notes.forEach((note, index) => {
      window.setTimeout(() => {
        this.playTone(note, 0.2, 0.4)
      }, index * tempo)
    })
  }

  private playTone(frequency: number, duration: number, volume = 0.5) {
    if (!this.audioContext) return
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(
      this.sfxVolume * volume,
      this.audioContext.currentTime
    )
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    )

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // music control
  playMusic(track: MusicTrack) {
    if (!this.musicEnabled) return
    const newTrack = this.musicTracks.get(track)
    if (!newTrack) return

    if (this.currentMusic && this.currentMusic !== newTrack) {
      this.currentMusic.pause()
      this.currentMusic.currentTime = 0
    }

    this.currentMusic = newTrack
    this.currentMusic.volume = this.musicVolume
    this.currentMusic.play().catch(() => {})
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause()
      this.currentMusic.currentTime = 0
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
    this.saveSettings()
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    if (!enabled) {
      this.stopMusic()
    } else if (this.currentMusic) {
      this.currentMusic.play().catch(() => {})
    } else {
      this.playMusic('jingleBells')
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

  getSoundEnabled() {
    return this.soundEnabled
  }

  getMusicEnabled() {
    return this.musicEnabled
  }

  getMusicVolume() {
    return this.musicVolume
  }

  getSfxVolume() {
    return this.sfxVolume
  }

  stopAllSounds() {
    this.stopMusic()
  }
}

export const enhancedSoundManager = new EnhancedSoundManager()
