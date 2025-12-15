// Entropy & Thermodynamics Interactive Components

(function() {
  // ===== Gas Diffusion Simulator =====
  const diffusion = {
    canvas: null,
    ctx: null,
    particles: [],
    barrierRemoved: false,
    animationId: null,
    particleCount: 100,

    init() {
      this.canvas = document.getElementById('diffusion-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.reset();
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
      document.querySelector('.reset-diffusion-btn')?.addEventListener('click', () => this.reset());
      document.querySelector('.remove-barrier-btn')?.addEventListener('click', () => this.removeBarrier());
      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });
    },

    reset() {
      const rect = this.canvas.getBoundingClientRect();
      this.barrierRemoved = false;
      this.particles = [];

      // All particles start on the left side
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * (rect.width / 2 - 20) + 10,
          y: Math.random() * (rect.height - 20) + 10,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: 4
        });
      }

      this.updateStats();
    },

    removeBarrier() {
      this.barrierRemoved = true;
    },

    updateStats() {
      const rect = this.canvas.getBoundingClientRect();
      const midX = rect.width / 2;

      let leftCount = 0;
      let rightCount = 0;

      this.particles.forEach(p => {
        if (p.x < midX) leftCount++;
        else rightCount++;
      });

      document.querySelector('.left-count').textContent = leftCount;
      document.querySelector('.right-count').textContent = rightCount;

      // Calculate entropy level
      const ratio = Math.min(leftCount, rightCount) / Math.max(leftCount, rightCount, 1);
      let entropyLabel;
      if (ratio < 0.1) entropyLabel = 'Low';
      else if (ratio < 0.4) entropyLabel = 'Medium';
      else if (ratio < 0.8) entropyLabel = 'High';
      else entropyLabel = 'Maximum';

      document.querySelector('.entropy-value').textContent = entropyLabel;
    },

    animate() {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(() => this.animate());
    },

    update() {
      const rect = this.canvas.getBoundingClientRect();
      const midX = rect.width / 2;

      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wall collisions
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx *= -1;
        }
        if (p.x + p.radius > rect.width) {
          p.x = rect.width - p.radius;
          p.vx *= -1;
        }
        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy *= -1;
        }
        if (p.y + p.radius > rect.height) {
          p.y = rect.height - p.radius;
          p.vy *= -1;
        }

        // Barrier collision (if not removed)
        if (!this.barrierRemoved) {
          if (p.x + p.radius > midX - 3 && p.x - p.radius < midX + 3) {
            if (p.vx > 0 && p.x < midX) {
              p.x = midX - 3 - p.radius;
              p.vx *= -1;
            } else if (p.vx < 0 && p.x > midX) {
              p.x = midX + 3 + p.radius;
              p.vx *= -1;
            }
          }
        }
      });

      this.updateStats();
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const midX = rect.width / 2;

      // Clear
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#f5f5f5';
      this.ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw barrier (if present)
      if (!this.barrierRemoved) {
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#ccc';
        this.ctx.fillRect(midX - 3, 0, 6, rect.height);
      } else {
        // Draw dashed line where barrier was
        this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#ccc';
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(midX, 0);
        this.ctx.lineTo(midX, rect.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      // Draw particles
      this.ctx.fillStyle = '#3b82f6';
      this.particles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // Labels
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#999';
      this.ctx.font = '12px sans-serif';
      this.ctx.fillText('Left', 20, 20);
      this.ctx.fillText('Right', rect.width - 50, 20);
    }
  };

  // ===== Heat Transfer =====
  const heatTransfer = {
    hotTemp: 100,
    coldTemp: 0,
    currentHot: 100,
    currentCold: 0,
    transferring: false,
    animationId: null,

    init() {
      this.bindEvents();
      this.updateDisplay();
    },

    bindEvents() {
      document.getElementById('hot-slider')?.addEventListener('input', (e) => {
        this.hotTemp = parseInt(e.target.value);
        this.currentHot = this.hotTemp;
        document.querySelector('.hot-value').textContent = this.hotTemp;
        this.updateDisplay();
      });

      document.getElementById('cold-slider')?.addEventListener('input', (e) => {
        this.coldTemp = parseInt(e.target.value);
        this.currentCold = this.coldTemp;
        document.querySelector('.cold-value').textContent = this.coldTemp;
        this.updateDisplay();
      });

      document.querySelector('.start-transfer-btn')?.addEventListener('click', () => this.startTransfer());
      document.querySelector('.reset-heat-btn')?.addEventListener('click', () => this.reset());
    },

    reset() {
      this.transferring = false;
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.currentHot = this.hotTemp;
      this.currentCold = this.coldTemp;
      this.updateDisplay();
      document.querySelector('.heat-status').textContent = 'Ready';
    },

    startTransfer() {
      if (this.transferring) return;
      this.transferring = true;
      document.querySelector('.heat-status').textContent = 'Transferring...';
      this.animate();
    },

    animate() {
      if (!this.transferring) return;

      const finalTemp = (this.hotTemp + this.coldTemp) / 2;
      const rate = 0.02;

      this.currentHot += (finalTemp - this.currentHot) * rate;
      this.currentCold += (finalTemp - this.currentCold) * rate;

      this.updateDisplay();

      if (Math.abs(this.currentHot - finalTemp) < 0.5) {
        this.currentHot = finalTemp;
        this.currentCold = finalTemp;
        this.transferring = false;
        document.querySelector('.heat-status').textContent = 'Equilibrium reached!';
        this.updateDisplay();
        return;
      }

      this.animationId = requestAnimationFrame(() => this.animate());
    },

    updateDisplay() {
      const hotEl = document.querySelector('.hot-object');
      const coldEl = document.querySelector('.cold-object');
      const finalTemp = (this.hotTemp + this.coldTemp) / 2;

      // Update temperatures
      document.querySelector('.hot-temp').textContent = Math.round(this.currentHot) + '°C';
      document.querySelector('.cold-temp').textContent = Math.round(this.currentCold) + '°C';
      document.querySelector('.final-temp').textContent = Math.round(finalTemp) + '°C';

      // Update colors based on temperature
      const hotColor = this.tempToColor(this.currentHot);
      const coldColor = this.tempToColor(this.currentCold);

      hotEl.style.backgroundColor = hotColor;
      coldEl.style.backgroundColor = coldColor;
    },

    tempToColor(temp) {
      // Map temperature to color (blue = cold, red = hot)
      const normalizedTemp = Math.max(0, Math.min(100, temp)) / 100;

      const r = Math.round(59 + (239 - 59) * normalizedTemp);
      const g = Math.round(130 + (68 - 130) * normalizedTemp);
      const b = Math.round(246 + (68 - 246) * normalizedTemp);

      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // ===== Microstate Counter =====
  const microstates = {
    leftParticles: 4,
    totalParticles: 4,

    init() {
      this.bindEvents();
      this.update();
    },

    bindEvents() {
      document.getElementById('particle-slider')?.addEventListener('input', (e) => {
        this.leftParticles = parseInt(e.target.value);
        document.querySelector('.left-particle-count').textContent = this.leftParticles;
        this.update();
      });
    },

    factorial(n) {
      if (n <= 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    },

    binomial(n, k) {
      return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
    },

    update() {
      const n = this.totalParticles;
      const left = this.leftParticles;
      const right = n - left;

      // Calculate microstates for this configuration
      const microstateCount = this.binomial(n, left);
      const totalMicrostates = Math.pow(2, n); // Total possible microstates
      const probability = (microstateCount / totalMicrostates * 100).toFixed(2);

      // Update display
      document.querySelector('.config-value').textContent = `${left} left, ${right} right`;
      document.querySelector('.microstate-count').textContent = microstateCount;
      document.querySelector('.probability-value').textContent = probability + '%';

      // Entropy label
      let entropyLabel;
      if (left === 0 || left === n) entropyLabel = 'Lowest';
      else if (left === 1 || left === n - 1) entropyLabel = 'Low';
      else if (left === 2 || left === n - 2) entropyLabel = 'Highest';
      else entropyLabel = 'Medium';
      document.querySelector('.relative-entropy').textContent = entropyLabel;

      // Update particle display
      document.querySelector('.left-particles').textContent = '●'.repeat(left);
      document.querySelector('.right-particles').textContent = '●'.repeat(right);

      // Update chart highlighting
      document.querySelectorAll('.chart-bar').forEach(bar => {
        bar.classList.remove('active');
        const config = bar.dataset.config;
        if (config === `${left}-${right}`) {
          bar.classList.add('active');
        }
      });
    }
  };

  // ===== Initialize =====
  function init() {
    diffusion.init();
    heatTransfer.init();
    microstates.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIP = window.TIP || {};
  window.TIP.entropy = { diffusion, heatTransfer, microstates };
})();
