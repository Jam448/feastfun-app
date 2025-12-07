class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.3
  private initialized: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (e) {
        console.warn('Web Audio API not supported')
      }
    }
  }

  async initialize() {
    if (this.initialized || !this.audioContext) return

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume()
        this.initialized = true
        console.log('Audio initialized')
      } catch (e) {
        console.warn('Failed to initialize audio:', e)
      }
    } else {
      this.initialized = true
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (enabled && !this.initialized) {
      this.initialize()
    }
  }

  getEnabled(): boolean {
    return this.enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  private async playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume?: number) {
    if (!this.enabled || !this.audioContext) return

    await this.initialize()
    if (!this.initialized) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    const finalVolume = (volume ?? this.volume) * 0.5
    gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  async playMatch() {
    if (!this.enabled || !this.audioContext) return
    await this.initialize()
    if (!this.initialized) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(400, now)
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1)

    gainNode.gain.setValueAtTime(this.volume * 0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    oscillator.start(now)
    oscillator.stop(now + 0.15)
  }

  async playChomp() {
    if (!this.enabled || !this.audioContext) return
    await this.initialize()
    if (!this.initialized) return

    const now = this.audioContext.currentTime

    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      const filter = this.audioContext.createBiquadFilter()

      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.type = 'square'
      filter.type = 'lowpass'
      filter.frequency.value = 800

      const startTime = now + (i * 0.08)
      oscillator.frequency.setValueAtTime(200 - i * 30, startTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, startTime + 0.06)

      gainNode.gain.setValueAtTime(this.volume * 0.4, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.06)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.06)
    }
  }

  async playWhoops() {
    if (!this.enabled || !this.audioContext) return
    await this.initialize()
    if (!this.initialized) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(300, now)
    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.2)

    gainNode.gain.setValueAtTime(this.volume * 0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)

    oscillator.start(now)
    oscillator.stop(now + 0.2)
  }

  async playCombo(comboLevel: number) {
    if (!this.enabled || !this.audioContext) return
    await this.initialize()
    if (!this.initialized) return

    const baseFreq = 400 + (comboLevel * 100)
    const now = this.audioContext.currentTime

    for (let i = 0; i < comboLevel; i++) {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.type = 'sine'
      const startTime = now + (i * 0.05)
      oscillator.frequency.setValueAtTime(baseFreq + (i * 50), startTime)

      gainNode.gain.setValueAtTime(this.volume * 0.25, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.1)
    }
  }

  async playSuccess() {
    if (!this.enabled || !this.audioContext) return
    await this.initialize()
    if (!this.initialized) return

    const now = this.audioContext.currentTime
    const frequencies = [523.25, 659.25, 783.99, 1046.50]

    frequencies.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)

      oscillator.type = 'sine'
      const startTime = now + (i * 0.1)
      oscillator.frequency.value = freq

      gainNode.gain.setValueAtTime(this.volume * 0.3, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.2)
    })
  }

  playClick() {
    this.playTone(600, 0.05, 'sine', this.volume * 0.2)
  }

  async playMunch() {
    if (!this.enabled || !this.audioContext) return
    await this.initialize()
    if (!this.initialized) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = 'square'
    filter.type = 'lowpass'
    filter.frequency.value = 1200

    oscillator.frequency.setValueAtTime(350, now)
    oscillator.frequency.exponentialRampToValueAtTime(250, now + 0.08)

    gainNode.gain.setValueAtTime(this.volume * 0.35, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

    oscillator.start(now)
    oscillator.stop(now + 0.08)
  }

  async playYuck() {
    if (!this.enabled || !this.audioContext) return
    await this.initialize()
    if (!this.initialized) return

    const now = this.audioContext.currentTime

    for (let i = 0; i < 2; i++) {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      const filter = this.audioContext.createBiquadFilter()

      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.type = 'sawtooth'
      filter.type = 'lowpass'
      filter.frequency.value = 600

      const startTime = now + (i * 0.12)
      oscillator.frequency.setValueAtTime(180 - i * 20, startTime)
      oscillator.frequency.exponentialRampToValueAtTime(120, startTime + 0.1)

      gainNode.gain.setValueAtTime(this.volume * 0.4, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.1)
    }
  }
}

export const soundManager = new SoundManager()
