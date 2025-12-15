// Sound & Waves Interactive Components

(function() {
  const SPEED_OF_SOUND = 343; // m/s in air at 20°C

  // ===== Audio Context (shared) =====
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Mobile browsers require resume() after user gesture
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // ===== Waveform Explorer =====
  const waveformExplorer = {
    canvas: null,
    ctx: null,
    waveType: 'sine',
    frequency: 440,
    amplitude: 50,
    oscillator: null,
    gainNode: null,
    animationId: null,
    phase: 0,

    init() {
      this.canvas = document.getElementById('waveform-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.bindEvents();
      this.animate();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    },

    bindEvents() {
      document.querySelectorAll('.wave-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.wave-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.waveType = btn.dataset.wave;
          if (this.oscillator) {
            this.oscillator.type = this.waveType;
          }
        });
      });

      document.getElementById('frequency-slider')?.addEventListener('input', (e) => {
        this.frequency = parseInt(e.target.value);
        document.querySelector('.frequency-value').textContent = this.frequency;
        this.updateInfo();
        if (this.oscillator) {
          this.oscillator.frequency.setValueAtTime(this.frequency, getAudioContext().currentTime);
        }
      });

      document.getElementById('amplitude-slider')?.addEventListener('input', (e) => {
        this.amplitude = parseInt(e.target.value);
        document.querySelector('.amplitude-value').textContent = this.amplitude;
        if (this.gainNode) {
          this.gainNode.gain.setValueAtTime(this.amplitude / 100 * 0.3, getAudioContext().currentTime);
        }
      });

      document.querySelector('.play-sound-btn')?.addEventListener('click', () => this.playSound());
      document.querySelector('.stop-sound-btn')?.addEventListener('click', () => this.stopSound());

      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });

      this.updateInfo();
    },

    updateInfo() {
      const period = 1000 / this.frequency; // ms
      const wavelength = SPEED_OF_SOUND / this.frequency;

      document.querySelector('.period-value').textContent = period.toFixed(2) + ' ms';
      document.querySelector('.wavelength-value').textContent = wavelength.toFixed(2) + ' m';
    },

    playSound() {
      this.stopSound();

      const ctx = getAudioContext();
      this.oscillator = ctx.createOscillator();
      this.gainNode = ctx.createGain();

      this.oscillator.type = this.waveType;
      this.oscillator.frequency.setValueAtTime(this.frequency, ctx.currentTime);
      this.gainNode.gain.setValueAtTime(this.amplitude / 100 * 0.3, ctx.currentTime);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(ctx.destination);
      this.oscillator.start();
    },

    stopSound() {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    },

    getWaveValue(x, type) {
      const t = x * Math.PI * 2;
      switch (type) {
        case 'sine':
          return Math.sin(t);
        case 'square':
          return Math.sin(t) > 0 ? 1 : -1;
        case 'triangle':
          return Math.asin(Math.sin(t)) * (2 / Math.PI);
        case 'sawtooth':
          return 2 * (t / (2 * Math.PI) - Math.floor(0.5 + t / (2 * Math.PI)));
        default:
          return Math.sin(t);
      }
    },

    animate() {
      this.render();
      this.phase += 0.02;
      this.animationId = requestAnimationFrame(() => this.animate());
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerY = height / 2;

      // Clear
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#f5f5f5';
      this.ctx.fillRect(0, 0, width, height);

      // Draw grid
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#e5e5e5';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, centerY);
      this.ctx.lineTo(width, centerY);
      this.ctx.stroke();

      // Draw wave
      const ampScale = (this.amplitude / 100) * (height * 0.4);
      const cycles = 3;
      const step = width / 200;

      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      for (let x = 0; x <= width; x += step) {
        const normalizedX = (x / width) * cycles + this.phase;
        const y = centerY - this.getWaveValue(normalizedX, this.waveType) * ampScale;

        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.stroke();

      // Labels
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#999';
      this.ctx.font = '11px sans-serif';
      this.ctx.fillText(this.waveType.charAt(0).toUpperCase() + this.waveType.slice(1) + ' Wave', 10, 20);
      this.ctx.fillText(this.frequency + ' Hz', 10, 36);
    }
  };

  // ===== Harmonics Explorer =====
  const harmonicsExplorer = {
    canvas: null,
    ctx: null,
    fundamental: 220,
    harmonics: [100, 0, 0, 0, 0], // Amplitudes for harmonics 1-5
    oscillators: [],
    gainNodes: [],
    masterGain: null,
    animationId: null,
    phase: 0,

    init() {
      this.canvas = document.getElementById('harmonics-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.bindEvents();
      this.animate();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    },

    bindEvents() {
      document.getElementById('fundamental-slider')?.addEventListener('input', (e) => {
        this.fundamental = parseInt(e.target.value);
        document.querySelector('.fundamental-value').textContent = this.fundamental;
        this.updateOscillators();
      });

      document.querySelectorAll('.harmonic-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
          const harmonic = parseInt(e.target.dataset.harmonic) - 1;
          this.harmonics[harmonic] = parseInt(e.target.value);
          e.target.parentElement.querySelector('.harmonic-value').textContent = this.harmonics[harmonic] + '%';
          this.updateOscillators();
        });
      });

      document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const preset = btn.dataset.preset;
          this.applyPreset(preset);
        });
      });

      document.querySelector('.play-harmonics-btn')?.addEventListener('click', () => this.playSound());
      document.querySelector('.stop-harmonics-btn')?.addEventListener('click', () => this.stopSound());

      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });
    },

    applyPreset(preset) {
      const presets = {
        pure: [100, 0, 0, 0, 0],
        clarinet: [100, 0, 75, 0, 50], // Odd harmonics only
        brass: [100, 80, 60, 40, 20],
        string: [100, 50, 33, 25, 20]
      };

      this.harmonics = presets[preset] || presets.pure;

      // Update sliders
      document.querySelectorAll('.harmonic-slider').forEach((slider, i) => {
        slider.value = this.harmonics[i];
        slider.parentElement.querySelector('.harmonic-value').textContent = this.harmonics[i] + '%';
      });

      this.updateOscillators();
    },

    playSound() {
      this.stopSound();

      const ctx = getAudioContext();
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
      this.masterGain.connect(ctx.destination);

      for (let i = 0; i < 5; i++) {
        if (this.harmonics[i] > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.fundamental * (i + 1), ctx.currentTime);
          gain.gain.setValueAtTime(this.harmonics[i] / 100 / (i + 1), ctx.currentTime);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start();

          this.oscillators.push(osc);
          this.gainNodes.push(gain);
        }
      }
    },

    updateOscillators() {
      if (!this.masterGain) return;

      const ctx = getAudioContext();

      // Update existing oscillators
      this.oscillators.forEach((osc, i) => {
        osc.frequency.setValueAtTime(this.fundamental * (i + 1), ctx.currentTime);
      });

      this.gainNodes.forEach((gain, i) => {
        gain.gain.setValueAtTime(this.harmonics[i] / 100 / (i + 1), ctx.currentTime);
      });
    },

    stopSound() {
      this.oscillators.forEach(osc => {
        osc.stop();
        osc.disconnect();
      });
      this.gainNodes.forEach(gain => {
        gain.disconnect();
      });
      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }
      this.oscillators = [];
      this.gainNodes = [];
    },

    animate() {
      this.render();
      this.phase += 0.02;
      this.animationId = requestAnimationFrame(() => this.animate());
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerY = height / 2;

      // Clear
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#f5f5f5';
      this.ctx.fillRect(0, 0, width, height);

      // Draw center line
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#e5e5e5';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, centerY);
      this.ctx.lineTo(width, centerY);
      this.ctx.stroke();

      // Calculate combined wave
      const cycles = 2;
      const step = width / 300;
      const ampScale = height * 0.35;

      // Normalize harmonics
      const totalAmp = this.harmonics.reduce((a, b) => a + b, 0) || 1;

      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      for (let x = 0; x <= width; x += step) {
        const normalizedX = (x / width) * cycles + this.phase;
        let y = 0;

        for (let i = 0; i < 5; i++) {
          if (this.harmonics[i] > 0) {
            y += (this.harmonics[i] / totalAmp) * Math.sin(normalizedX * Math.PI * 2 * (i + 1));
          }
        }

        const screenY = centerY - y * ampScale;

        if (x === 0) {
          this.ctx.moveTo(x, screenY);
        } else {
          this.ctx.lineTo(x, screenY);
        }
      }

      this.ctx.stroke();

      // Draw individual harmonics (faded)
      const colors = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
      for (let i = 0; i < 5; i++) {
        if (this.harmonics[i] > 5) {
          this.ctx.strokeStyle = colors[i];
          this.ctx.globalAlpha = 0.3;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();

          for (let x = 0; x <= width; x += step) {
            const normalizedX = (x / width) * cycles + this.phase;
            const y = Math.sin(normalizedX * Math.PI * 2 * (i + 1)) * (this.harmonics[i] / totalAmp);
            const screenY = centerY - y * ampScale;

            if (x === 0) {
              this.ctx.moveTo(x, screenY);
            } else {
              this.ctx.lineTo(x, screenY);
            }
          }

          this.ctx.stroke();
        }
      }
      this.ctx.globalAlpha = 1;

      // Labels
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#999';
      this.ctx.font = '11px sans-serif';
      this.ctx.fillText('Combined Waveform', 10, 20);
      this.ctx.fillText('Fundamental: ' + this.fundamental + ' Hz', 10, 36);
    }
  };

  // ===== Interference =====
  const interference = {
    canvas: null,
    ctx: null,
    freq1: 440,
    freq2: 445,
    oscillators: [],
    gainNodes: [],
    masterGain: null,
    animationId: null,
    phase: 0,

    init() {
      this.canvas = document.getElementById('interference-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.bindEvents();
      this.animate();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    },

    bindEvents() {
      document.getElementById('freq1-slider')?.addEventListener('input', (e) => {
        this.freq1 = parseInt(e.target.value);
        document.querySelector('.freq1-value').textContent = this.freq1;
        this.updateInfo();
        this.updateOscillators();
      });

      document.getElementById('freq2-slider')?.addEventListener('input', (e) => {
        this.freq2 = parseInt(e.target.value);
        document.querySelector('.freq2-value').textContent = this.freq2;
        this.updateInfo();
        this.updateOscillators();
      });

      document.querySelector('.play-interference-btn')?.addEventListener('click', () => this.playSound());
      document.querySelector('.stop-interference-btn')?.addEventListener('click', () => this.stopSound());

      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });

      this.updateInfo();
    },

    updateInfo() {
      const diff = Math.abs(this.freq1 - this.freq2);
      document.querySelector('.freq-diff-value').textContent = diff + ' Hz';
      document.querySelector('.beat-freq-value').textContent = diff + ' beats/sec';
    },

    playSound() {
      this.stopSound();

      const ctx = getAudioContext();
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
      this.masterGain.connect(ctx.destination);

      [this.freq1, this.freq2].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();

        this.oscillators.push(osc);
        this.gainNodes.push(gain);
      });
    },

    updateOscillators() {
      if (this.oscillators.length === 2) {
        const ctx = getAudioContext();
        this.oscillators[0].frequency.setValueAtTime(this.freq1, ctx.currentTime);
        this.oscillators[1].frequency.setValueAtTime(this.freq2, ctx.currentTime);
      }
    },

    stopSound() {
      this.oscillators.forEach(osc => {
        osc.stop();
        osc.disconnect();
      });
      this.gainNodes.forEach(gain => {
        gain.disconnect();
      });
      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }
      this.oscillators = [];
      this.gainNodes = [];
    },

    animate() {
      this.render();
      this.phase += 0.5;
      this.animationId = requestAnimationFrame(() => this.animate());
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#f5f5f5';
      this.ctx.fillRect(0, 0, width, height);

      const row1Y = height * 0.2;
      const row2Y = height * 0.5;
      const row3Y = height * 0.8;
      const rowHeight = height * 0.25;

      // Draw center lines
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#e5e5e5';
      this.ctx.lineWidth = 1;
      [row1Y, row2Y, row3Y].forEach(y => {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(width, y);
        this.ctx.stroke();
      });

      const step = width / 400;
      const ampScale = rowHeight * 0.35;

      // Scale frequencies for visualization (show ~2-3 visible periods of beat)
      const scaleFactor = 100 / Math.max(this.freq1, this.freq2);
      const scaledFreq1 = this.freq1 * scaleFactor;
      const scaledFreq2 = this.freq2 * scaleFactor;

      // Wave 1
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        const t = (x / width) * 4 + this.phase * scaleFactor * 0.01;
        const y = row1Y - Math.sin(t * scaledFreq1 * 0.1) * ampScale;
        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();

      // Wave 2
      this.ctx.strokeStyle = '#ef4444';
      this.ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        const t = (x / width) * 4 + this.phase * scaleFactor * 0.01;
        const y = row2Y - Math.sin(t * scaledFreq2 * 0.1) * ampScale;
        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();

      // Combined wave (sum)
      this.ctx.strokeStyle = '#10b981';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        const t = (x / width) * 4 + this.phase * scaleFactor * 0.01;
        const y1 = Math.sin(t * scaledFreq1 * 0.1);
        const y2 = Math.sin(t * scaledFreq2 * 0.1);
        const y = row3Y - (y1 + y2) * 0.5 * ampScale;
        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();

      // Draw beat envelope
      const beatFreq = Math.abs(this.freq1 - this.freq2) * scaleFactor;
      if (beatFreq > 0.1) {
        this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);

        // Upper envelope
        this.ctx.beginPath();
        for (let x = 0; x <= width; x += step) {
          const t = (x / width) * 4 + this.phase * scaleFactor * 0.01;
          const envelope = Math.abs(Math.cos(t * beatFreq * 0.05));
          const y = row3Y - envelope * ampScale;
          if (x === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();

        // Lower envelope
        this.ctx.beginPath();
        for (let x = 0; x <= width; x += step) {
          const t = (x / width) * 4 + this.phase * scaleFactor * 0.01;
          const envelope = Math.abs(Math.cos(t * beatFreq * 0.05));
          const y = row3Y + envelope * ampScale;
          if (x === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      // Labels
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#999';
      this.ctx.font = '11px sans-serif';
      this.ctx.fillText('Wave 1: ' + this.freq1 + ' Hz', 10, row1Y - rowHeight * 0.3);
      this.ctx.fillText('Wave 2: ' + this.freq2 + ' Hz', 10, row2Y - rowHeight * 0.3);
      this.ctx.fillText('Combined (beats visible)', 10, row3Y - rowHeight * 0.3);
    }
  };

  // ===== Initialize =====
  function init() {
    waveformExplorer.init();
    harmonicsExplorer.init();
    interference.init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    waveformExplorer.stopSound();
    harmonicsExplorer.stopSound();
    interference.stopSound();
    if (audioCtx) {
      audioCtx.close();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIP = window.TIP || {};
  window.TIP.soundWaves = { waveformExplorer, harmonicsExplorer, interference };
})();
