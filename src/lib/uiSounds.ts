/**
 * Micro UI sound effects using Web Audio API
 * Provides subtle, tactile feedback on hover, click, and modal events.
 */

class UISoundEngine {
  private ctx: AudioContext | null = null

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Soft high-tech hover click
  public hover() {
    try {
      this.init()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04)

      gain.gain.setValueAtTime(0.015, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.045)
    } catch {
      // Audio not permitted yet
    }
  }

  // Satisfying futuristic select/click beep
  public click() {
    try {
      this.init()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.08)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.095)
    } catch {
      // Audio not permitted yet
    }
  }

  // Modal open pop
  public modalOpen() {
    try {
      this.init()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.12)

      gain.gain.setValueAtTime(0.035, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.15)
    } catch {
      // Audio not permitted yet
    }
  }

  /**
   * A tone with a shaped envelope, which is what every sound below is.
   *
   * Collapsing them onto one helper keeps the movement sounds from drifting
   * apart in level — the loudest thing in a portfolio should never be a
   * footstep.
   */
  private tone(opts: {
    type: OscillatorType
    from: number
    to: number
    seconds: number
    gain: number
    delay?: number
  }) {
    try {
      this.init()
      if (!this.ctx) return
      const now = this.ctx.currentTime + (opts.delay ?? 0)
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = opts.type
      osc.frequency.setValueAtTime(opts.from, now)
      osc.frequency.exponentialRampToValueAtTime(opts.to, now + opts.seconds)

      gain.gain.setValueAtTime(opts.gain, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.seconds)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + opts.seconds + 0.01)
    } catch {
      // Audio not permitted yet
    }
  }

  /** Push off the deck. */
  public jump() {
    this.tone({ type: 'sine', from: 260, to: 520, seconds: 0.12, gain: 0.022 })
  }

  /** The mid-air thruster boost — deliberately airier than the first jump. */
  public boost() {
    this.tone({ type: 'sawtooth', from: 180, to: 720, seconds: 0.26, gain: 0.014 })
  }

  /** Touchdown. */
  public land() {
    this.tone({ type: 'sine', from: 190, to: 70, seconds: 0.16, gain: 0.03 })
  }

  /** Clearing the edge: two notes, so leaving reads as a decision. */
  public launch() {
    this.tone({ type: 'triangle', from: 320, to: 90, seconds: 0.5, gain: 0.03 })
    this.tone({ type: 'sine', from: 90, to: 900, seconds: 0.9, gain: 0.022, delay: 0.18 })
  }
}

export const uiSounds = new UISoundEngine()
