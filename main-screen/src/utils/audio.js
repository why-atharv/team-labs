/**
 * Procedural Audio Synthesizer for teamLab Wildlife Living Sanctuary
 * Operates purely via Web Audio API - zero external assets needed, 100% offline resilient.
 * Synthesizes realistic wild animal calls, ambient forest soundscapes, and telemetry chimes.
 */

class InstallationAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /**
   * Generative Ambient Forest Soundscape
   * Deep harmonic forest drone + rustling foliage + distant stream murmur
   */
  startAmbientForest() {
    if (this.isMuted || this.ambientGain) return;
    this.init();

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // Low warm pad (forest canopy harmonics)
      const freqs = [82.41, 123.47, 164.81, 246.94]; // E2, B2, E3, B3
      freqs.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);

        // Slow LFO for organic wind breathing effect
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.08 + Math.random() * 0.05;
        lfoGain.gain.value = 110;
        lfo.connect(filter.frequency);
        lfo.start();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        osc.connect(filter);
        filter.connect(this.ambientGain);
        osc.start();
      });
    } catch (e) {
      console.warn('Audio autoplay deferred until first user interaction');
    }
  }

  /**
   * Crystal chime when an animal wanders or spawns
   */
  playChime(freq = 587.33) {
    if (this.isMuted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 1.2);

    filter.type = 'bandpass';
    filter.frequency.value = freq * 1.2;
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 2.0);
  }

  /**
   * Dramatic Apex Beast Arrival
   * Resonant low-frequency predator roar + celestial harmonic fanfare
   */
  playApexArrival() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;

    // 1. Deep Predator Throat Roar / Sub-Bass Growl
    const roarOsc = this.ctx.createOscillator();
    const roarGain = this.ctx.createGain();
    const roarFilter = this.ctx.createBiquadFilter();

    roarOsc.type = 'sawtooth';
    roarOsc.frequency.setValueAtTime(95, now);
    roarOsc.frequency.exponentialRampToValueAtTime(55, now + 0.8);
    roarOsc.frequency.exponentialRampToValueAtTime(40, now + 2.2);

    roarFilter.type = 'lowpass';
    roarFilter.frequency.setValueAtTime(350, now);
    roarFilter.frequency.linearRampToValueAtTime(750, now + 0.4);
    roarFilter.frequency.exponentialRampToValueAtTime(180, now + 2.2);
    roarFilter.Q.value = 5.0;

    roarGain.gain.setValueAtTime(0.001, now);
    roarGain.gain.linearRampToValueAtTime(0.55, now + 0.3);
    roarGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

    roarOsc.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(this.ctx.destination);

    roarOsc.start(now);
    roarOsc.stop(now + 2.4);

    // 2. Ascending Celestial Sanctuary Chords
    const chords = [392, 493.88, 587.33, 783.99, 987.77, 1174.66]; // G major
    chords.forEach((note, idx) => {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now + idx * 0.1);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.setValueAtTime(0.22, now + idx * 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(noteGain);
      noteGain.connect(this.ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + 3.2);
    });
  }

  // Backward compatibility alias
  playLegendaryArrival() {
    this.playApexArrival();
  }

  /**
   * Biometric Particle Dissolve & Sanctuary Telemetry Return
   */
  playCaptureAbsorption() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;

    // Rising Telemetry Beam Tone
    const beamOsc = this.ctx.createOscillator();
    const beamGain = this.ctx.createGain();
    beamOsc.type = 'sawtooth';
    beamOsc.frequency.setValueAtTime(220, now);
    beamOsc.frequency.exponentialRampToValueAtTime(1760, now + 2.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(3500, now + 2.5);
    filter.Q.value = 6.0;

    beamGain.gain.setValueAtTime(0.001, now);
    beamGain.gain.linearRampToValueAtTime(0.32, now + 0.5);
    beamGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    beamOsc.connect(filter);
    filter.connect(beamGain);
    beamGain.connect(this.ctx.destination);

    beamOsc.start(now);
    beamOsc.stop(now + 3.2);

    // Final Biometric Confirmation Chime
    setTimeout(() => {
      this.playCaptureClick();
    }, 2400);
  }

  playCaptureClick() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

export const installationAudio = new InstallationAudio();
