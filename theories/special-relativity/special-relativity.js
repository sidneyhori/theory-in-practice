// Special Relativity Interactive Components

(function() {
  const c = 299792458; // Speed of light in m/s

  // ===== Time Dilation Calculator =====
  const timeDilation = {
    init() {
      this.bindEvents();
      this.update(0);
    },

    bindEvents() {
      const slider = document.getElementById('velocity-slider');
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.update(parseFloat(e.target.value));
        });
      }

      document.querySelectorAll('.speed-presets .preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const speed = parseFloat(btn.dataset.speed);
          const slider = document.getElementById('velocity-slider');
          if (slider) {
            slider.value = speed;
            this.update(speed);
          }
        });
      });
    },

    lorentzFactor(v) {
      // v is percentage of c
      const vFraction = v / 100;
      if (vFraction >= 1) return Infinity;
      return 1 / Math.sqrt(1 - vFraction * vFraction);
    },

    update(velocityPercent) {
      document.querySelector('.velocity-value').textContent = velocityPercent.toFixed(2) + '%';

      const gamma = this.lorentzFactor(velocityPercent);

      // Update Lorentz factor
      if (gamma === Infinity) {
        document.querySelector('.lorentz-factor').textContent = '∞';
      } else {
        document.querySelector('.lorentz-factor').textContent = gamma.toFixed(4);
      }

      // Time dilation: moving clock appears slower
      if (gamma === Infinity) {
        document.querySelector('.time-ratio').textContent = '∞ seconds';
      } else {
        const dilatedTime = gamma;
        if (dilatedTime < 10) {
          document.querySelector('.time-ratio').textContent = dilatedTime.toFixed(4) + ' seconds';
        } else {
          document.querySelector('.time-ratio').textContent = dilatedTime.toFixed(2) + ' seconds';
        }
      }

      // Length contraction
      if (gamma === Infinity) {
        document.querySelector('.length-ratio').textContent = '0%';
      } else {
        const contractedLength = (1 / gamma) * 100;
        document.querySelector('.length-ratio').textContent = contractedLength.toFixed(2) + '%';
      }

      // Trip calculator (Alpha Centauri - 4.37 light years)
      const distance = 4.37; // light years
      const vFraction = velocityPercent / 100;

      if (vFraction <= 0) {
        document.querySelector('.earth-time').textContent = '∞ (not moving)';
        document.querySelector('.ship-time').textContent = '∞ (not moving)';
        document.querySelector('.age-difference').textContent = '0';
      } else if (gamma === Infinity) {
        document.querySelector('.earth-time').textContent = '4.37 years';
        document.querySelector('.ship-time').textContent = '0 (at light speed)';
        document.querySelector('.age-difference').textContent = '4.37 years less';
      } else {
        const earthTime = distance / vFraction; // years
        const shipTime = earthTime / gamma;
        const ageDiff = earthTime - shipTime;

        document.querySelector('.earth-time').textContent = earthTime.toFixed(2) + ' years';
        document.querySelector('.ship-time').textContent = shipTime.toFixed(2) + ' years';
        document.querySelector('.age-difference').textContent = ageDiff.toFixed(2) + ' years less';
      }
    }
  };

  // ===== Twin Paradox Visualizer =====
  const twinParadox = {
    canvas: null,
    ctx: null,
    running: false,
    animationId: null,
    tripSpeed: 80,
    earthAge: 20,
    spaceAge: 20,
    phase: 'waiting', // waiting, outbound, inbound, finished
    progress: 0,

    init() {
      this.canvas = document.getElementById('twin-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.bindEvents();
      this.render();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    },

    bindEvents() {
      document.getElementById('trip-speed')?.addEventListener('input', (e) => {
        this.tripSpeed = parseInt(e.target.value);
        document.querySelector('.trip-speed-value').textContent = this.tripSpeed;
      });

      document.querySelector('.start-trip-btn')?.addEventListener('click', () => {
        if (!this.running) {
          this.running = true;
          this.phase = 'outbound';
          this.progress = 0;
          this.earthAge = 20;
          this.spaceAge = 20;
          this.animate();
        }
      });

      document.querySelector('.reset-trip-btn')?.addEventListener('click', () => {
        this.reset();
      });

      window.addEventListener('resize', () => {
        this.resizeCanvas();
        this.render();
      });
    },

    reset() {
      this.running = false;
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.phase = 'waiting';
      this.progress = 0;
      this.earthAge = 20;
      this.spaceAge = 20;
      this.updateAges();
      this.render();
    },

    lorentzFactor() {
      const v = this.tripSpeed / 100;
      return 1 / Math.sqrt(1 - v * v);
    },

    animate() {
      if (!this.running) return;

      const gamma = this.lorentzFactor();
      const earthTimePerFrame = 0.1; // years per frame
      const shipTimePerFrame = earthTimePerFrame / gamma;

      if (this.phase === 'outbound' || this.phase === 'inbound') {
        this.earthAge += earthTimePerFrame;
        this.spaceAge += shipTimePerFrame;
        this.progress += 0.02;

        if (this.progress >= 1) {
          this.progress = 0;
          if (this.phase === 'outbound') {
            this.phase = 'inbound';
          } else {
            this.phase = 'finished';
            this.running = false;
          }
        }
      }

      this.updateAges();
      this.render();

      if (this.running) {
        this.animationId = requestAnimationFrame(() => this.animate());
      }
    },

    updateAges() {
      document.querySelector('.earth-age').textContent = Math.floor(this.earthAge) + ' years';
      document.querySelector('.space-age').textContent = Math.floor(this.spaceAge) + ' years';
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      const earthX = 80;
      const starX = rect.width - 80;
      const centerY = rect.height / 2;

      // Draw path line
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#ccc';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(earthX, centerY);
      this.ctx.lineTo(starX, centerY);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Draw Earth
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.beginPath();
      this.ctx.arc(earthX, centerY, 25, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Earth', earthX, centerY + 45);

      // Draw star
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.arc(starX, centerY, 20, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim() || '#333';
      this.ctx.fillText('Star', starX, centerY + 45);

      // Draw spaceship
      let shipX = earthX;
      if (this.phase === 'outbound') {
        shipX = earthX + (starX - earthX) * this.progress;
      } else if (this.phase === 'inbound') {
        shipX = starX - (starX - earthX) * this.progress;
      } else if (this.phase === 'finished') {
        shipX = earthX;
      }

      this.ctx.font = '24px sans-serif';
      this.ctx.fillText('🚀', shipX, centerY - 40);

      // Status text
      this.ctx.font = '14px sans-serif';
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() || '#666';
      let status = '';
      if (this.phase === 'waiting') status = 'Ready to launch';
      else if (this.phase === 'outbound') status = 'Traveling to star...';
      else if (this.phase === 'inbound') status = 'Returning to Earth...';
      else if (this.phase === 'finished') status = 'Trip complete! Compare the ages.';
      this.ctx.fillText(status, rect.width / 2, 30);
    }
  };

  // ===== E=mc² Calculator =====
  const energyCalculator = {
    init() {
      this.bindEvents();
      this.calculate();
    },

    bindEvents() {
      document.getElementById('mass-input')?.addEventListener('input', () => this.calculate());
      document.getElementById('mass-unit')?.addEventListener('change', () => this.calculate());

      document.querySelectorAll('.mass-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('mass-input').value = btn.dataset.mass;
          document.getElementById('mass-unit').value = btn.dataset.unit;
          this.calculate();
        });
      });
    },

    calculate() {
      const massInput = parseFloat(document.getElementById('mass-input')?.value) || 0;
      const unitMultiplier = parseFloat(document.getElementById('mass-unit')?.value) || 1;
      const massKg = massInput * unitMultiplier;

      const energy = massKg * c * c; // Joules

      // Format energy
      if (energy === 0) {
        document.querySelector('.energy-number').textContent = '0';
      } else {
        const exp = Math.floor(Math.log10(energy));
        const mantissa = energy / Math.pow(10, exp);
        if (exp > 3 || exp < -3) {
          document.querySelector('.energy-number').textContent = mantissa.toFixed(2) + ' × 10' + this.superscript(exp);
        } else {
          document.querySelector('.energy-number').textContent = energy.toExponential(2);
        }
      }

      // Calculate equivalents
      const tntJoules = 4.184e9; // 1 ton TNT in Joules
      const tntMegatons = energy / (tntJoules * 1e6);
      document.querySelector('.tnt-value').textContent = this.formatNumber(tntMegatons) + ' megatons';

      const homeYearJoules = 10000 * 3600 * 1000; // ~10,000 kWh per home per year
      const homes = energy / homeYearJoules;
      document.querySelector('.homes-value').textContent = this.formatNumber(homes);

      const hiroshimaJoules = 63e12; // ~15 kilotons
      const hiroshimas = energy / hiroshimaJoules;
      document.querySelector('.hiroshima-value').textContent = this.formatNumber(hiroshimas) + '×';
    },

    superscript(n) {
      const superscripts = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
      return String(n).split('').map(d => superscripts[d] || d).join('');
    },

    formatNumber(n) {
      if (n === 0) return '0';
      if (n < 0.01) return n.toExponential(1);
      if (n < 1000) return n.toFixed(2);
      if (n < 1e6) return (n / 1e3).toFixed(1) + ' thousand';
      if (n < 1e9) return (n / 1e6).toFixed(1) + ' million';
      if (n < 1e12) return (n / 1e9).toFixed(1) + ' billion';
      return (n / 1e12).toFixed(1) + ' trillion';
    }
  };

  // ===== Initialize =====
  function init() {
    timeDilation.init();
    twinParadox.init();
    energyCalculator.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIP = window.TIP || {};
  window.TIP.specialRelativity = { timeDilation, twinParadox, energyCalculator };
})();
