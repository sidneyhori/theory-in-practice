// Quantum Mechanics Interactive Components

(function() {
  // ===== Superposition Simulator =====
  const superposition = {
    upProb: 50,
    upCount: 0,
    downCount: 0,

    init() {
      this.bindEvents();
      this.update();
    },

    bindEvents() {
      document.getElementById('up-amplitude')?.addEventListener('input', (e) => {
        this.upProb = parseInt(e.target.value);
        this.update();
      });

      document.querySelector('.measure-btn')?.addEventListener('click', () => this.measure());
      document.querySelector('.reset-stats-btn')?.addEventListener('click', () => this.resetStats());
    },

    update() {
      const downProb = 100 - this.upProb;
      document.querySelector('.up-prob').textContent = this.upProb + '%';
      document.querySelector('.prob-up').style.width = this.upProb + '%';
      document.querySelector('.prob-down').style.width = downProb + '%';
    },

    measure() {
      const result = Math.random() * 100 < this.upProb ? 'up' : 'down';

      if (result === 'up') {
        this.upCount++;
        document.querySelector('.result-icon').textContent = '↑';
        document.querySelector('.result-text').textContent = 'Collapsed to |↑⟩';
      } else {
        this.downCount++;
        document.querySelector('.result-icon').textContent = '↓';
        document.querySelector('.result-text').textContent = 'Collapsed to |↓⟩';
      }

      document.querySelector('.measurement-result').style.display = 'block';
      document.querySelector('.up-count').textContent = this.upCount;
      document.querySelector('.down-count').textContent = this.downCount;
      document.querySelector('.total-count').textContent = this.upCount + this.downCount;

      // Animate coin
      const coin = document.querySelector('.coin-visual');
      coin.style.transform = 'scale(1.1)';
      setTimeout(() => coin.style.transform = '', 200);
    },

    resetStats() {
      this.upCount = 0;
      this.downCount = 0;
      document.querySelector('.up-count').textContent = '0';
      document.querySelector('.down-count').textContent = '0';
      document.querySelector('.total-count').textContent = '0';
      document.querySelector('.measurement-result').style.display = 'none';
    }
  };

  // ===== Double Slit Experiment =====
  const doubleSlit = {
    canvas: null,
    ctx: null,
    particles: [],
    hits: [],
    particleCount: 0,

    init() {
      this.canvas = document.getElementById('double-slit-canvas');
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
      document.querySelector('.fire-particle-btn')?.addEventListener('click', () => this.fireParticle());
      document.querySelector('.fire-many-btn')?.addEventListener('click', () => this.fireMany(100));
      document.querySelector('.clear-screen-btn')?.addEventListener('click', () => this.clear());
      window.addEventListener('resize', () => { this.resizeCanvas(); this.render(); });
    },

    fireParticle() {
      const rect = this.canvas.getBoundingClientRect();

      // Double-slit interference pattern probability
      const y = this.getInterferenceY(rect.height);

      this.hits.push({ x: rect.width - 50, y });
      this.particleCount++;
      document.querySelector('.particle-count').textContent = this.particleCount;

      this.animateParticle(rect, y);
    },

    getInterferenceY(height) {
      // Simulate double-slit interference pattern
      const center = height / 2;
      const slitSeparation = 30;
      const wavelength = 20;

      // Generate y position following interference pattern
      let attempts = 0;
      while (attempts < 100) {
        const y = Math.random() * height;
        const relY = y - center;

        // Interference intensity: cos²(π * d * sin(θ) / λ)
        const sinTheta = relY / (height / 2);
        const phase = Math.PI * slitSeparation * sinTheta / wavelength;
        const intensity = Math.pow(Math.cos(phase), 2);

        // Single slit envelope
        const envelope = Math.pow(Math.sin(phase / 3 + 0.001) / (phase / 3 + 0.001), 2);

        const prob = intensity * Math.max(0.1, envelope);

        if (Math.random() < prob) return y;
        attempts++;
      }
      return center;
    },

    animateParticle(rect, finalY) {
      const particle = { x: 50, y: rect.height / 2, targetY: finalY, phase: 0 };

      const animate = () => {
        particle.x += 8;
        particle.phase += 0.1;

        // Wave-like motion before slit
        if (particle.x < rect.width / 3) {
          particle.y = rect.height / 2 + Math.sin(particle.phase * 3) * 20;
        } else {
          // After slit, move toward final position
          const progress = (particle.x - rect.width / 3) / (rect.width - rect.width / 3 - 50);
          particle.y = rect.height / 2 + (finalY - rect.height / 2) * progress;
        }

        this.render();

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fill();

        if (particle.x < rect.width - 50) {
          requestAnimationFrame(animate);
        } else {
          this.render();
        }
      };

      animate();
    },

    fireMany(count) {
      const rect = this.canvas.getBoundingClientRect();
      for (let i = 0; i < count; i++) {
        const y = this.getInterferenceY(rect.height);
        this.hits.push({ x: rect.width - 50, y });
      }
      this.particleCount += count;
      document.querySelector('.particle-count').textContent = this.particleCount;
      this.render();
    },

    clear() {
      this.hits = [];
      this.particleCount = 0;
      document.querySelector('.particle-count').textContent = '0';
      this.render();
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();

      // Clear
      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw barrier with slits
      const barrierX = rect.width / 3;
      const slitGap = 30;
      const slitHeight = 40;
      const centerY = rect.height / 2;

      this.ctx.fillStyle = '#374151';
      this.ctx.fillRect(barrierX - 5, 0, 10, centerY - slitGap - slitHeight / 2);
      this.ctx.fillRect(barrierX - 5, centerY - slitGap + slitHeight / 2, 10, slitGap * 2 - slitHeight);
      this.ctx.fillRect(barrierX - 5, centerY + slitGap + slitHeight / 2, 10, rect.height);

      // Draw detection screen
      this.ctx.fillStyle = '#1f2937';
      this.ctx.fillRect(rect.width - 55, 0, 10, rect.height);

      // Draw hits
      this.ctx.fillStyle = 'rgba(96, 165, 250, 0.8)';
      this.hits.forEach(hit => {
        this.ctx.beginPath();
        this.ctx.arc(hit.x, hit.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // Labels
      this.ctx.fillStyle = '#6b7280';
      this.ctx.font = '11px sans-serif';
      this.ctx.fillText('Source', 20, rect.height - 10);
      this.ctx.fillText('Slits', barrierX - 10, rect.height - 10);
      this.ctx.fillText('Screen', rect.width - 55, rect.height - 10);
    }
  };

  // ===== Uncertainty Principle =====
  const uncertainty = {
    canvas: null,
    ctx: null,
    positionCertainty: 50,

    init() {
      this.canvas = document.getElementById('uncertainty-canvas');
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
      document.getElementById('position-slider')?.addEventListener('input', (e) => {
        this.positionCertainty = parseInt(e.target.value);
        document.querySelector('.position-certainty').textContent = this.positionCertainty + '%';
        this.updateDisplay();
        this.render();
      });
      window.addEventListener('resize', () => { this.resizeCanvas(); this.render(); });
    },

    updateDisplay() {
      const momentumCertainty = 100 - this.positionCertainty;

      let posLabel, momLabel;
      if (this.positionCertainty < 30) {
        posLabel = 'Very High';
        momLabel = 'Very Low';
      } else if (this.positionCertainty < 45) {
        posLabel = 'High';
        momLabel = 'Low';
      } else if (this.positionCertainty < 55) {
        posLabel = 'Medium';
        momLabel = 'Medium';
      } else if (this.positionCertainty < 70) {
        posLabel = 'Low';
        momLabel = 'High';
      } else {
        posLabel = 'Very Low';
        momLabel = 'Very High';
      }

      document.querySelector('.delta-x').textContent = posLabel;
      document.querySelector('.delta-p').textContent = momLabel;
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();

      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#f5f5f5';
      this.ctx.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Position uncertainty (spatial spread)
      const posSpread = (100 - this.positionCertainty) / 100 * 100 + 20;

      // Momentum uncertainty (arrow spread)
      const momSpread = this.positionCertainty / 100 * 60 + 10;

      // Draw position probability cloud
      const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, posSpread);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
      gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, posSpread, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw momentum arrows (spread indicates uncertainty)
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;

      const numArrows = 8;
      for (let i = 0; i < numArrows; i++) {
        const baseAngle = (i / numArrows) * Math.PI * 2;
        const angleSpread = (momSpread / 100) * (Math.random() - 0.5) * 2;
        const angle = baseAngle + angleSpread;

        const length = 30 + Math.random() * 20;
        const startX = centerX + Math.cos(angle) * 30;
        const startY = centerY + Math.sin(angle) * 30;
        const endX = centerX + Math.cos(angle) * (30 + length);
        const endY = centerY + Math.sin(angle) * (30 + length);

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Arrowhead
        const headLen = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - headLen * Math.cos(angle - 0.3), endY - headLen * Math.sin(angle - 0.3));
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - headLen * Math.cos(angle + 0.3), endY - headLen * Math.sin(angle + 0.3));
        this.ctx.stroke();
      }

      // Labels
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() || '#666';
      this.ctx.font = '12px sans-serif';
      this.ctx.fillText('Position (red cloud)', 10, 20);
      this.ctx.fillText('Momentum (blue arrows)', 10, 40);
    }
  };

  // ===== Initialize =====
  function init() {
    superposition.init();
    doubleSlit.init();
    uncertainty.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIP = window.TIP || {};
  window.TIP.quantumMechanics = { superposition, doubleSlit, uncertainty };
})();
