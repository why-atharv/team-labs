/**
 * Mobile Haptics and Audio Synthesizer
 * teamLab Wildlife Living Sanctuary
 * Synthesizes biometric sonar locks, wild predator calls, and celebratory fanfares.
 */

class MobileHapticsAudio {
  constructor() {
    this.ctx = null;
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

  // Tactile Haptic Vibration
  vibrate(pattern = [60, 40, 60]) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Safe fallback if browser restricts
      }
    }
  }

  // Scan detection beep
  playScanBeep() {
    this.init();
    if (!this.ctx) return;
    this.vibrate([40]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.1); // E6

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Biometric radar sonar ping
  playTelemetryLock() {
    this.init();
    if (!this.ctx) return;
    this.vibrate([80]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // Backward compatibility alias
  playPokeballWobble() {
    this.playTelemetryLock();
  }

  // Deep guttural predator roar for Apex beasts
  playPredatorRoar() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.4);
  }

  // Celebratory Wildlife Documented Fanfare
  playWildlifeSuccess() {
    this.init();
    if (!this.ctx) return;
    this.vibrate([100, 50, 100, 50, 250]);

    const notes = [
      { f: 587.33, d: 0.12 }, // D5
      { f: 739.99, d: 0.12 }, // F#5
      { f: 880.00, d: 0.12 }, // A5
      { f: 1174.66, d: 0.2 }, // D6
      { f: 1479.98, d: 0.5 }  // F#6
    ];

    let start = this.ctx.currentTime + 0.05;
    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.38, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + n.d);
      start += n.d * 0.75;
    });
  }

  // Backward compatibility alias
  playGotchaFanfare() {
    this.playWildlifeSuccess();
  }

  // Buzzer when scan target already documented by another ranger
  playBuzzer() {
    this.init();
    if (!this.ctx) return;
    this.vibrate([200, 100, 200]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

export const mobileAudio = new MobileHapticsAudio();
