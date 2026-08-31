/**
 * High-Fidelity Rhythmic Lo-Fi & Synthwave Audio Engine
 * Generates rich, crisp beats with punchy kick, snare, hi-hats, deep 808 bass,
 * lush polyphonic synth chords, and arpeggios at full, clear volume.
 */

class LoFiSoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private isPlaying = false
  private timerId: number | null = null
  private step = 0
  private tempo = 84 // BPM
  private volume = 0.65 // Clear, loud, crisp volume level

  // Chord progression: Am9 -> Fmaj7 -> Cmaj7 -> Gsus4
  private chordProgression = [
    // Am9 (A2, E3, G3, B3, C4)
    { root: 55, freqs: [110, 164.81, 196.0, 246.94, 261.63] },
    // Fmaj7 (F2, C3, E3, A3, C4)
    { root: 43.65, freqs: [87.31, 130.81, 164.81, 220.0, 261.63] },
    // Cmaj7 (C2, G2, E3, B3, D4)
    { root: 65.41, freqs: [130.81, 196.0, 329.63, 493.88, 587.33] },
    // Gsus4 -> G (G2, D3, G3, C4, D4)
    { root: 48.99, freqs: [97.99, 146.83, 196.0, 261.63, 293.66] },
  ]

  // Lead arpeggio notes (Pentatonic A-minor)
  private leadScale = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()

      // Master Compressor for punchy, loud, modern master output without distortion
      this.compressor = this.ctx.createDynamicsCompressor()
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime)
      this.compressor.knee.setValueAtTime(8, this.ctx.currentTime)
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime)
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime)
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime)

      // Master Gain
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime)

      // Connect: Compressor -> Master Gain -> Output
      this.compressor.connect(this.masterGain)
      this.masterGain.connect(this.ctx.destination)
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  /* ─── SYNTHESIS VOICES ─── */

  // 1. Punchy Sub 808 Kick Drum
  private playKick(time: number) {
    if (!this.ctx || !this.compressor) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    // Pitch sweep: 150Hz -> 42Hz
    osc.frequency.setValueAtTime(140, time)
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12)

    gain.gain.setValueAtTime(0.75, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35)

    osc.connect(gain)
    gain.connect(this.compressor)

    osc.start(time)
    osc.stop(time + 0.36)
  }

  // 2. Crisp Lo-Fi Snare / Rim Clack
  private playSnare(time: number) {
    if (!this.ctx || !this.compressor) return

    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.18
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1800, time)
    filter.Q.setValueAtTime(1.2, time)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.4, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.compressor)

    // Snare tone body
    const body = this.ctx.createOscillator()
    const bodyGain = this.ctx.createGain()
    body.type = 'triangle'
    body.frequency.setValueAtTime(190, time)
    body.frequency.exponentialRampToValueAtTime(80, time + 0.08)
    bodyGain.gain.setValueAtTime(0.3, time)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1)

    body.connect(bodyGain)
    bodyGain.connect(this.compressor)

    noise.start(time)
    body.start(time)
    body.stop(time + 0.12)
  }

  // 3. Shimmering Hi-Hat
  private playHiHat(time: number, isAccent = false) {
    if (!this.ctx || !this.compressor) return

    const bufferSize = this.ctx.sampleRate * 0.06
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(7500, time)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(isAccent ? 0.22 : 0.12, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isAccent ? 0.07 : 0.04))

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.compressor)

    noise.start(time)
  }

  // 4. Warm Sub 808 Bassline
  private playBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.compressor) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, time)

    gain.gain.setValueAtTime(0.001, time)
    gain.gain.linearRampToValueAtTime(0.45, time + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration)

    osc.connect(gain)
    gain.connect(this.compressor)

    osc.start(time)
    osc.stop(time + duration + 0.05)
  }

  // 5. Lush Polyphonic Synth / Rhodes Chord
  private playChord(time: number, freqs: number[], duration: number) {
    if (!this.ctx || !this.compressor) return

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    // Filter sweep from 1400Hz -> 650Hz
    filter.frequency.setValueAtTime(1400, time)
    filter.frequency.exponentialRampToValueAtTime(650, time + duration)
    filter.Q.setValueAtTime(1.8, time)
    filter.connect(this.compressor)

    freqs.forEach((f) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(f, time)
      osc.detune.setValueAtTime((Math.random() - 0.5) * 10, time)

      gain.gain.setValueAtTime(0.001, time)
      gain.gain.linearRampToValueAtTime(0.055, time + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration)

      osc.connect(gain)
      gain.connect(filter)

      osc.start(time)
      osc.stop(time + duration + 0.05)
    })
  }

  // 6. Melodic Lead Arpeggio
  private playLead(time: number, freq: number) {
    if (!this.ctx || !this.compressor) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, time)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, time)
    filter.Q.setValueAtTime(2.0, time)

    gain.gain.setValueAtTime(0.001, time)
    gain.gain.linearRampToValueAtTime(0.09, time + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.compressor)

    osc.start(time)
    osc.stop(time + 0.38)
  }

  /* ─── 16-STEP SEQUENCER SCHEDULER ─── */
  private tick() {
    if (!this.isPlaying || !this.ctx) return

    const stepDuration = (60 / this.tempo) / 4 // 16th note duration (~178ms at 84 BPM)
    const now = this.ctx.currentTime

    const barStep = this.step % 16 // 0 to 15
    const chordIndex = Math.floor((this.step / 16) % this.chordProgression.length)
    const chord = this.chordProgression[chordIndex]

    // 1. Chords & Bass on Bar Start
    if (barStep === 0) {
      this.playChord(now, chord.freqs, stepDuration * 14)
      this.playBass(now, chord.root, stepDuration * 7)
    } else if (barStep === 8) {
      this.playChord(now + 0.02, chord.freqs, stepDuration * 6)
      this.playBass(now, chord.root * 1.5, stepDuration * 6)
    }

    // 2. Drum Pattern (Boom-Bap / Lo-Fi Groove)
    // Kicks on steps: 0, 6, 10
    if (barStep === 0 || barStep === 6 || barStep === 10) {
      this.playKick(now)
    }

    // Snares on steps: 4, 12 (Beats 2 & 4)
    if (barStep === 4 || barStep === 12) {
      this.playSnare(now)
    }

    // Hi-Hats on every even 16th note + swing
    if (barStep % 2 === 0) {
      this.playHiHat(now, barStep % 4 === 0)
    }

    // 3. Melodic chimes on syncopated steps (3, 7, 11, 14)
    if (barStep === 3 || barStep === 7 || barStep === 11 || barStep === 14) {
      const note = this.leadScale[(this.step * 3) % this.leadScale.length]
      this.playLead(now, note)
    }

    this.step = (this.step + 1) % (16 * this.chordProgression.length)
  }

  public play() {
    if (this.isPlaying) return
    this.init()
    if (!this.ctx || !this.masterGain) return

    this.isPlaying = true
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime)

    const stepIntervalMs = ((60 / this.tempo) / 4) * 1000
    this.tick()
    this.timerId = window.setInterval(() => {
      this.tick()
    }, stepIntervalMs)
  }

  public pause() {
    if (!this.isPlaying) return
    this.isPlaying = false
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause()
      return false
    } else {
      this.play()
      return true
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val))
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
    }
  }

  public getVolume(): number {
    return this.volume
  }

  public getIsPlaying(): boolean {
    return this.isPlaying
  }
}

export const ambientAudio = new LoFiSoundEngine()
