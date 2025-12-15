/**
 * Epidemiology Interactive Visualizations
 * Demonstrates SIR models, disease spread, and herd immunity
 */

(function() {
  'use strict';

  // Get theme colors
  function getColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      primary: style.getPropertyValue('--color-biology').trim() || '#8b5cf6',
      text: style.getPropertyValue('--color-text').trim() || '#1f2937',
      textSecondary: style.getPropertyValue('--color-text-secondary').trim() || '#6b7280',
      textMuted: style.getPropertyValue('--color-text-muted').trim() || '#9ca3af',
      border: style.getPropertyValue('--color-border').trim() || '#e5e7eb',
      surface: style.getPropertyValue('--color-surface').trim() || '#f9fafb',
      bg: style.getPropertyValue('--color-bg').trim() || '#ffffff',
      susceptible: '#3b82f6',
      infected: '#ef4444',
      recovered: '#10b981'
    };
  }

  // ============================================
  // SIR Model Simulator
  // ============================================
  const SIRModel = {
    canvas: null,
    ctx: null,
    beta: 0.5,   // Transmission rate
    gamma: 0.2,  // Recovery rate
    history: [],
    S: 0.99,
    I: 0.01,
    R: 0,

    init() {
      this.canvas = document.getElementById('sir-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
      this.reset();
      this.updateR0Display();
      this.draw();
    },

    bindEvents() {
      const betaSlider = document.getElementById('beta-slider');
      const gammaSlider = document.getElementById('gamma-slider');
      const runBtn = document.querySelector('.run-sir-btn');
      const resetBtn = document.querySelector('.reset-sir-btn');

      if (betaSlider) {
        betaSlider.addEventListener('input', (e) => {
          this.beta = parseFloat(e.target.value);
          document.querySelector('.beta-display').textContent = this.beta.toFixed(2);
          this.updateR0Display();
        });
      }

      if (gammaSlider) {
        gammaSlider.addEventListener('input', (e) => {
          this.gamma = parseFloat(e.target.value);
          document.querySelector('.gamma-display').textContent = this.gamma.toFixed(2);
          this.updateR0Display();
        });
      }

      if (runBtn) {
        runBtn.addEventListener('click', () => this.runSimulation());
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.reset();
          this.draw();
        });
      }

      // Handle theme changes
      const observer = new MutationObserver(() => this.draw());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    },

    reset() {
      this.S = 0.99;
      this.I = 0.01;
      this.R = 0;
      this.history = [{ S: this.S, I: this.I, R: this.R }];
      this.updateDisplay();
    },

    updateR0Display() {
      const r0 = this.beta / this.gamma;
      document.querySelector('.r0-value').textContent = r0.toFixed(1);
    },

    updateDisplay() {
      document.querySelector('.s-percent').textContent = Math.round(this.S * 100) + '%';
      document.querySelector('.i-percent').textContent = Math.round(this.I * 100) + '%';
      document.querySelector('.r-percent').textContent = Math.round(this.R * 100) + '%';
    },

    runSimulation() {
      this.reset();

      const dt = 0.1;
      const maxTime = 100;

      let peakInfected = 0;

      for (let t = 0; t < maxTime; t += dt) {
        // SIR differential equations
        const dS = -this.beta * this.S * this.I;
        const dI = this.beta * this.S * this.I - this.gamma * this.I;
        const dR = this.gamma * this.I;

        this.S += dS * dt;
        this.I += dI * dt;
        this.R += dR * dt;

        // Clamp values
        this.S = Math.max(0, Math.min(1, this.S));
        this.I = Math.max(0, Math.min(1, this.I));
        this.R = Math.max(0, Math.min(1, this.R));

        if (this.I > peakInfected) peakInfected = this.I;

        // Record every 1 time unit
        if (Math.abs(t % 1) < dt) {
          this.history.push({ S: this.S, I: this.I, R: this.R });
        }

        // Stop if epidemic is over
        if (this.I < 0.001) break;
      }

      // Update stats
      document.querySelector('.peak-infected').textContent = Math.round(peakInfected * 100) + '%';
      document.querySelector('.total-infected').textContent = Math.round(this.R * 100) + '%';

      this.updateDisplay();
      this.draw();
    },

    draw() {
      const colors = getColors();
      const { width, height } = this.canvas;
      const ctx = this.ctx;
      const padding = { top: 20, right: 20, bottom: 30, left: 40 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Clear canvas
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;

      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight * i / 4);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Y-axis labels
        ctx.fillStyle = colors.textMuted;
        ctx.font = '10px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(((4 - i) * 25) + '%', padding.left - 5, y + 3);
      }

      if (this.history.length < 2) return;

      // Draw curves
      const drawCurve = (key, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.history.forEach((point, i) => {
          const x = padding.left + (i / (this.history.length - 1)) * chartWidth;
          const y = padding.top + chartHeight * (1 - point[key]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        ctx.stroke();
      };

      drawCurve('S', colors.susceptible);
      drawCurve('I', colors.infected);
      drawCurve('R', colors.recovered);

      // X-axis label
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Time', width / 2, height - 5);
    }
  };

  // ============================================
  // Population Spread Visualization
  // ============================================
  const SpreadSim = {
    canvas: null,
    ctx: null,
    people: [],
    running: false,
    animationId: null,
    infectionRadius: 30,
    infectionChance: 0.2,

    init() {
      this.canvas = document.getElementById('spread-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
      this.reset();
      this.draw();
    },

    bindEvents() {
      const startBtn = document.querySelector('.start-spread-btn');
      const resetBtn = document.querySelector('.reset-spread-btn');
      const radiusSlider = document.getElementById('radius-slider');
      const chanceSlider = document.getElementById('chance-slider');

      if (startBtn) {
        startBtn.addEventListener('click', () => {
          if (this.running) {
            this.stop();
            startBtn.textContent = 'Start Spread';
          } else {
            this.start();
            startBtn.textContent = 'Pause';
          }
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.stop();
          document.querySelector('.start-spread-btn').textContent = 'Start Spread';
          this.reset();
          this.draw();
        });
      }

      if (radiusSlider) {
        radiusSlider.addEventListener('input', (e) => {
          this.infectionRadius = parseInt(e.target.value);
          document.querySelector('.radius-display').textContent = this.infectionRadius;
        });
      }

      if (chanceSlider) {
        chanceSlider.addEventListener('input', (e) => {
          this.infectionChance = parseInt(e.target.value) / 100;
          document.querySelector('.chance-display').textContent = Math.round(this.infectionChance * 100) + '%';
        });
      }

      // Click to infect
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        // Find nearest susceptible person
        let nearest = null;
        let nearestDist = 20;

        this.people.forEach(person => {
          if (person.state !== 'susceptible') return;
          const dx = person.x - x;
          const dy = person.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < nearestDist) {
            nearest = person;
            nearestDist = dist;
          }
        });

        if (nearest) {
          nearest.state = 'infected';
          nearest.infectedTime = 0;
          this.updateStats();
          this.draw();
        }
      });

      // Handle theme changes
      const observer = new MutationObserver(() => this.draw());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    },

    reset() {
      this.people = [];
      const { width, height } = this.canvas;
      const padding = 20;

      // Create grid of people
      for (let i = 0; i < 200; i++) {
        this.people.push({
          x: padding + Math.random() * (width - 2 * padding),
          y: padding + Math.random() * (height - 2 * padding),
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          state: 'susceptible',
          infectedTime: 0
        });
      }

      this.updateStats();
    },

    updateStats() {
      const counts = { susceptible: 0, infected: 0, recovered: 0 };
      this.people.forEach(p => counts[p.state]++);

      document.querySelector('.spread-susceptible').textContent = counts.susceptible;
      document.querySelector('.spread-infected').textContent = counts.infected;
      document.querySelector('.spread-recovered').textContent = counts.recovered;
    },

    start() {
      this.running = true;
      this.animate();
    },

    stop() {
      this.running = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    },

    animate() {
      if (!this.running) return;

      this.update();
      this.draw();

      this.animationId = requestAnimationFrame(() => this.animate());
    },

    update() {
      const { width, height } = this.canvas;
      const recoveryTime = 100; // frames until recovery

      this.people.forEach(person => {
        // Move
        person.x += person.vx;
        person.y += person.vy;

        // Bounce off walls
        if (person.x < 10 || person.x > width - 10) person.vx *= -1;
        if (person.y < 10 || person.y > height - 10) person.vy *= -1;

        person.x = Math.max(10, Math.min(width - 10, person.x));
        person.y = Math.max(10, Math.min(height - 10, person.y));

        // Update infected
        if (person.state === 'infected') {
          person.infectedTime++;
          if (person.infectedTime > recoveryTime) {
            person.state = 'recovered';
          }
        }
      });

      // Spread infection
      const infected = this.people.filter(p => p.state === 'infected');
      const susceptible = this.people.filter(p => p.state === 'susceptible');

      infected.forEach(inf => {
        susceptible.forEach(sus => {
          const dx = inf.x - sus.x;
          const dy = inf.y - sus.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.infectionRadius && Math.random() < this.infectionChance * 0.1) {
            sus.state = 'infected';
            sus.infectedTime = 0;
          }
        });
      });

      this.updateStats();
    },

    draw() {
      const colors = getColors();
      const { width, height } = this.canvas;
      const ctx = this.ctx;

      // Clear canvas
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      // Draw people
      this.people.forEach(person => {
        ctx.beginPath();
        ctx.arc(person.x, person.y, 5, 0, Math.PI * 2);

        switch (person.state) {
          case 'susceptible':
            ctx.fillStyle = colors.susceptible;
            break;
          case 'infected':
            ctx.fillStyle = colors.infected;
            break;
          case 'recovered':
            ctx.fillStyle = colors.recovered;
            break;
        }

        ctx.fill();

        // Draw infection radius for infected
        if (person.state === 'infected') {
          ctx.strokeStyle = colors.infected + '40';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(person.x, person.y, this.infectionRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }
  };

  // ============================================
  // Herd Immunity Calculator
  // ============================================
  const HerdImmunity = {
    r0: 3,
    vaccinationRate: 0,
    gridSize: 100,

    init() {
      this.createGrid();
      this.bindEvents();
      this.update();
    },

    createGrid() {
      const grid = document.getElementById('herd-grid');
      if (!grid) return;

      grid.innerHTML = '';
      for (let i = 0; i < this.gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'herd-cell';
        grid.appendChild(cell);
      }
    },

    bindEvents() {
      const r0Slider = document.getElementById('herd-r0-slider');
      const vaxSlider = document.getElementById('vax-slider');

      if (r0Slider) {
        r0Slider.addEventListener('input', (e) => {
          this.r0 = parseFloat(e.target.value);
          document.querySelector('.herd-r0-display').textContent = this.r0.toFixed(1);
          this.update();
        });
      }

      if (vaxSlider) {
        vaxSlider.addEventListener('input', (e) => {
          this.vaccinationRate = parseInt(e.target.value);
          document.querySelector('.vax-display').textContent = this.vaccinationRate + '%';
          this.update();
        });
      }
    },

    update() {
      // Calculate herd immunity threshold
      const threshold = (1 - 1 / this.r0) * 100;

      // Update displays
      document.querySelector('.herd-r0').textContent = this.r0.toFixed(1);
      document.querySelector('.herd-threshold').textContent = Math.round(threshold) + '%';
      document.querySelector('.herd-vaccinated').textContent = this.vaccinationRate + '%';

      // Update status
      const isProtected = this.vaccinationRate >= threshold;
      const indicator = document.querySelector('.status-indicator');
      const statusText = document.querySelector('.status-text');

      if (isProtected) {
        indicator.className = 'status-indicator protected';
        statusText.textContent = 'Herd immunity achieved!';
      } else {
        indicator.className = 'status-indicator not-protected';
        const needed = Math.ceil(threshold - this.vaccinationRate);
        statusText.textContent = `Need ${needed}% more for herd immunity`;
      }

      // Update grid visualization
      this.updateGrid();
    },

    updateGrid() {
      const cells = document.querySelectorAll('.herd-cell');
      const vaccinatedCount = Math.round(this.vaccinationRate);

      // Randomly select cells to vaccinate
      const indices = Array.from({ length: this.gridSize }, (_, i) => i);

      // Shuffle indices deterministically based on vaccination rate
      const seed = 12345;
      for (let i = indices.length - 1; i > 0; i--) {
        const j = (seed * (i + 1) * 7) % (i + 1);
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      cells.forEach((cell, i) => {
        cell.className = 'herd-cell';
        // Use shuffled indices for consistent random-looking distribution
        if (indices.indexOf(i) < vaccinatedCount) {
          cell.classList.add('vaccinated');
        }
      });
    }
  };

  // ============================================
  // Initialize all components
  // ============================================
  function init() {
    SIRModel.init();
    SpreadSim.init();
    HerdImmunity.init();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.TIP = window.TIP || {};
  window.TIP.Epidemiology = {
    SIRModel,
    SpreadSim,
    HerdImmunity
  };

})();
