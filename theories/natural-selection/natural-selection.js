/**
 * Natural Selection Interactive Visualizations
 * Demonstrates evolution, selection types, and genetic drift
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
      purple: '#8b5cf6',
      green: '#10b981',
      red: '#ef4444',
      yellow: '#f59e0b'
    };
  }

  // ============================================
  // Population Evolution Simulator
  // ============================================
  const EvolutionSim = {
    canvas: null,
    ctx: null,
    creatures: [],
    food: [],
    generation: 0,
    running: false,
    animationId: null,
    pressure: 2,
    mutationRate: 5,

    init() {
      this.canvas = document.getElementById('evolution-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
      this.reset();
      this.draw();
    },

    bindEvents() {
      const startBtn = document.querySelector('.start-evolution-btn');
      const resetBtn = document.querySelector('.reset-evolution-btn');
      const pressureSlider = document.getElementById('pressure-slider');
      const mutationSlider = document.getElementById('mutation-slider');

      if (startBtn) {
        startBtn.addEventListener('click', () => {
          if (this.running) {
            this.stop();
            startBtn.textContent = 'Start Evolution';
          } else {
            this.start();
            startBtn.textContent = 'Pause';
          }
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.stop();
          document.querySelector('.start-evolution-btn').textContent = 'Start Evolution';
          this.reset();
          this.draw();
        });
      }

      if (pressureSlider) {
        pressureSlider.addEventListener('input', (e) => {
          this.pressure = parseInt(e.target.value);
          const labels = ['Low', 'Medium', 'High'];
          document.querySelector('.pressure-display').textContent = labels[this.pressure - 1];
        });
      }

      if (mutationSlider) {
        mutationSlider.addEventListener('input', (e) => {
          this.mutationRate = parseInt(e.target.value);
          document.querySelector('.mutation-display').textContent = this.mutationRate + '%';
        });
      }

      // Handle theme changes
      const observer = new MutationObserver(() => this.draw());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    },

    reset() {
      this.creatures = [];
      this.food = [];
      this.generation = 0;

      // Create initial population with random traits
      for (let i = 0; i < 30; i++) {
        this.creatures.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          speed: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
          size: 0.8 + Math.random() * 0.4,   // 0.8 to 1.2
          energy: 100,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2
        });
      }

      this.spawnFood();
      this.updateStats();
    },

    spawnFood() {
      this.food = [];
      const foodCount = 20 + (3 - this.pressure) * 10; // More food = less pressure
      for (let i = 0; i < foodCount; i++) {
        this.food.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height
        });
      }
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

      // Update each creature
      this.creatures.forEach(creature => {
        // Find nearest food
        let nearestFood = null;
        let nearestDist = Infinity;

        this.food.forEach(f => {
          const dx = f.x - creature.x;
          const dy = f.y - creature.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestFood = f;
          }
        });

        // Move towards food
        if (nearestFood) {
          const dx = nearestFood.x - creature.x;
          const dy = nearestFood.y - creature.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            creature.vx = (dx / dist) * creature.speed * 2;
            creature.vy = (dy / dist) * creature.speed * 2;
          }
        }

        // Update position
        creature.x += creature.vx;
        creature.y += creature.vy;

        // Wrap around edges
        if (creature.x < 0) creature.x = width;
        if (creature.x > width) creature.x = 0;
        if (creature.y < 0) creature.y = height;
        if (creature.y > height) creature.y = 0;

        // Energy cost (larger creatures use more energy)
        creature.energy -= 0.3 * creature.size * creature.size;

        // Check for food collision
        this.food = this.food.filter(f => {
          const dx = f.x - creature.x;
          const dy = f.y - creature.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 10 * creature.size) {
            creature.energy += 50;
            return false;
          }
          return true;
        });
      });

      // Remove dead creatures
      this.creatures = this.creatures.filter(c => c.energy > 0);

      // Check for generation end
      if (this.food.length < 5 || this.creatures.length < 5) {
        this.nextGeneration();
      }
    },

    nextGeneration() {
      this.generation++;

      // Sort by energy (fitness)
      this.creatures.sort((a, b) => b.energy - a.energy);

      // Take top survivors
      const survivors = this.creatures.slice(0, Math.max(5, Math.floor(this.creatures.length * 0.4)));

      // Create new population through reproduction
      this.creatures = [];

      while (this.creatures.length < 30 && survivors.length > 0) {
        const parent = survivors[Math.floor(Math.random() * survivors.length)];

        // Create offspring with possible mutation
        const child = {
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          speed: parent.speed,
          size: parent.size,
          energy: 100,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2
        };

        // Apply mutations
        if (Math.random() * 100 < this.mutationRate) {
          child.speed += (Math.random() - 0.5) * 0.2;
          child.speed = Math.max(0.3, Math.min(2, child.speed));
        }
        if (Math.random() * 100 < this.mutationRate) {
          child.size += (Math.random() - 0.5) * 0.2;
          child.size = Math.max(0.3, Math.min(2, child.size));
        }

        this.creatures.push(child);
      }

      this.spawnFood();
      this.updateStats();
    },

    updateStats() {
      const avgSpeed = this.creatures.reduce((sum, c) => sum + c.speed, 0) / this.creatures.length;
      const avgSize = this.creatures.reduce((sum, c) => sum + c.size, 0) / this.creatures.length;

      document.querySelector('.generation-count').textContent = this.generation;
      document.querySelector('.population-count').textContent = this.creatures.length;
      document.querySelector('.avg-speed').textContent = avgSpeed.toFixed(2);
      document.querySelector('.avg-size').textContent = avgSize.toFixed(2);
    },

    draw() {
      const colors = getColors();
      const { width, height } = this.canvas;
      const ctx = this.ctx;

      // Clear canvas
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      // Draw food
      ctx.fillStyle = colors.green;
      this.food.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw creatures
      this.creatures.forEach(creature => {
        const radius = 6 * creature.size;

        // Color based on speed (faster = more blue/purple)
        const hue = 200 + (creature.speed - 0.5) * 100;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;

        ctx.beginPath();
        ctx.arc(creature.x, creature.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Energy indicator
        const energyRatio = creature.energy / 100;
        ctx.strokeStyle = energyRatio > 0.5 ? colors.green : colors.red;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(creature.x, creature.y, radius + 2, 0, Math.PI * 2 * energyRatio);
        ctx.stroke();
      });
    }
  };

  // ============================================
  // Selection Types Demo
  // ============================================
  const SelectionDemo = {
    canvas: null,
    ctx: null,
    population: [],
    generation: 0,
    selectionType: 'directional',
    populationSize: 200,

    init() {
      this.canvas = document.getElementById('selection-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
      this.reset();
      this.draw();
    },

    bindEvents() {
      document.querySelectorAll('.selection-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectionType = btn.dataset.type;
          this.reset();
          this.draw();
        });
      });

      const runBtn = document.querySelector('.run-selection-btn');
      const resetBtn = document.querySelector('.reset-selection-btn');

      if (runBtn) {
        runBtn.addEventListener('click', () => this.runGeneration());
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
      this.generation = 0;
      this.population = [];

      // Create normal distribution centered at 50
      for (let i = 0; i < this.populationSize; i++) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const trait = 50 + z * 15; // mean=50, std=15
        this.population.push(Math.max(0, Math.min(100, trait)));
      }

      this.updateStats();
    },

    getFitness(trait) {
      switch (this.selectionType) {
        case 'directional':
          // Higher values are fitter
          return trait / 100;

        case 'stabilizing':
          // Values closer to 50 are fitter
          return 1 - Math.abs(trait - 50) / 50;

        case 'disruptive':
          // Extreme values are fitter
          return Math.abs(trait - 50) / 50;

        default:
          return 1;
      }
    },

    runGeneration() {
      this.generation++;

      // Calculate fitness for each individual
      const fitnessScores = this.population.map(trait => ({
        trait,
        fitness: this.getFitness(trait)
      }));

      // Selection: weighted by fitness
      const totalFitness = fitnessScores.reduce((sum, f) => sum + f.fitness + 0.1, 0);
      const newPopulation = [];

      for (let i = 0; i < this.populationSize; i++) {
        // Roulette wheel selection
        let rand = Math.random() * totalFitness;
        let parent = fitnessScores[0].trait;

        for (const f of fitnessScores) {
          rand -= (f.fitness + 0.1);
          if (rand <= 0) {
            parent = f.trait;
            break;
          }
        }

        // Mutation
        const mutation = (Math.random() - 0.5) * 6;
        const offspring = Math.max(0, Math.min(100, parent + mutation));
        newPopulation.push(offspring);
      }

      this.population = newPopulation;
      this.updateStats();
      this.draw();
    },

    updateStats() {
      const mean = this.population.reduce((a, b) => a + b, 0) / this.population.length;
      const variance = this.population.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / this.population.length;
      const std = Math.sqrt(variance);

      document.querySelector('.selection-mean').textContent = mean.toFixed(1);
      document.querySelector('.selection-std').textContent = std.toFixed(1);
      document.querySelector('.selection-gen').textContent = this.generation;
    },

    draw() {
      const colors = getColors();
      const { width, height } = this.canvas;
      const ctx = this.ctx;
      const padding = { top: 20, right: 20, bottom: 30, left: 20 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Clear canvas
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      // Create histogram bins
      const numBins = 20;
      const bins = new Array(numBins).fill(0);
      this.population.forEach(trait => {
        const binIndex = Math.min(numBins - 1, Math.floor(trait / (100 / numBins)));
        bins[binIndex]++;
      });

      const maxBin = Math.max(...bins, 1);

      // Draw selection pressure indicator
      ctx.fillStyle = colors.primary + '20';
      const drawPressure = () => {
        switch (this.selectionType) {
          case 'directional':
            // Gradient from left to right
            const gradD = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
            gradD.addColorStop(0, colors.primary + '00');
            gradD.addColorStop(1, colors.primary + '40');
            ctx.fillStyle = gradD;
            ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);
            break;

          case 'stabilizing':
            // Peak in middle
            ctx.beginPath();
            ctx.moveTo(padding.left, padding.top + chartHeight);
            ctx.lineTo(padding.left + chartWidth / 2, padding.top);
            ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
            ctx.closePath();
            ctx.fillStyle = colors.primary + '20';
            ctx.fill();
            break;

          case 'disruptive':
            // Valleys in middle
            ctx.fillStyle = colors.primary + '20';
            ctx.fillRect(padding.left, padding.top, chartWidth * 0.3, chartHeight);
            ctx.fillRect(padding.left + chartWidth * 0.7, padding.top, chartWidth * 0.3, chartHeight);
            break;
        }
      };
      drawPressure();

      // Draw histogram bars
      const barWidth = chartWidth / numBins - 2;
      bins.forEach((count, i) => {
        const x = padding.left + (i / numBins) * chartWidth + 1;
        const barHeight = (count / maxBin) * chartHeight;
        const y = padding.top + chartHeight - barHeight;

        ctx.fillStyle = colors.primary;
        ctx.fillRect(x, y, barWidth, barHeight);
      });

      // Draw X-axis labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      for (let i = 0; i <= 4; i++) {
        const x = padding.left + (i / 4) * chartWidth;
        ctx.fillText((i * 25).toString(), x, height - 5);
      }

      // Draw title for selection type
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'left';
      const titles = {
        directional: 'Favors high values →',
        stabilizing: 'Favors middle values',
        disruptive: '← Favors extremes →'
      };
      ctx.fillText(titles[this.selectionType], padding.left, padding.top - 5);
    }
  };

  // ============================================
  // Genetic Drift Simulator
  // ============================================
  const DriftSim = {
    canvas: null,
    ctx: null,
    smallPopHistory: [],
    largePopHistory: [],
    smallPopFreq: 0.5,
    largePopFreq: 0.5,
    generation: 0,
    maxGenerations: 50,

    init() {
      this.canvas = document.getElementById('drift-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
      this.reset();
      this.draw();
    },

    bindEvents() {
      const runBtn = document.querySelector('.run-drift-btn');
      const resetBtn = document.querySelector('.reset-drift-btn');

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
      this.generation = 0;
      this.smallPopFreq = 0.5;
      this.largePopFreq = 0.5;
      this.smallPopHistory = [0.5];
      this.largePopHistory = [0.5];
      this.updateStats();
    },

    simulateGeneration(popSize, currentFreq) {
      // Binomial sampling: each individual in next gen comes from parent population
      let count = 0;
      for (let i = 0; i < popSize; i++) {
        if (Math.random() < currentFreq) count++;
      }
      return count / popSize;
    },

    runSimulation() {
      this.reset();

      // Run for max generations
      for (let gen = 0; gen < this.maxGenerations; gen++) {
        this.generation = gen + 1;

        // Small population (20 individuals) - high drift
        this.smallPopFreq = this.simulateGeneration(20, this.smallPopFreq);
        this.smallPopHistory.push(this.smallPopFreq);

        // Large population (500 individuals) - low drift
        this.largePopFreq = this.simulateGeneration(500, this.largePopFreq);
        this.largePopHistory.push(this.largePopFreq);
      }

      this.updateStats();
      this.draw();
    },

    updateStats() {
      document.querySelector('.small-pop-freq').textContent = Math.round(this.smallPopFreq * 100) + '%';
      document.querySelector('.large-pop-freq').textContent = Math.round(this.largePopFreq * 100) + '%';
      document.querySelector('.drift-gen').textContent = this.generation;
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

      // Horizontal lines at 0%, 50%, 100%
      [0, 0.5, 1].forEach(freq => {
        const y = padding.top + chartHeight * (1 - freq);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = colors.textMuted;
        ctx.font = '10px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(freq * 100) + '%', padding.left - 5, y + 3);
      });

      // Draw 50% reference line (dashed)
      ctx.strokeStyle = colors.textMuted;
      ctx.setLineDash([5, 5]);
      const halfY = padding.top + chartHeight * 0.5;
      ctx.beginPath();
      ctx.moveTo(padding.left, halfY);
      ctx.lineTo(width - padding.right, halfY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw histories
      const drawHistory = (history, color) => {
        if (history.length < 2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        history.forEach((freq, i) => {
          const x = padding.left + (i / (this.maxGenerations)) * chartWidth;
          const y = padding.top + chartHeight * (1 - freq);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        ctx.stroke();
      };

      drawHistory(this.smallPopHistory, colors.primary);
      drawHistory(this.largePopHistory, colors.purple);

      // Draw X-axis labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      for (let i = 0; i <= 5; i++) {
        const gen = (i / 5) * this.maxGenerations;
        const x = padding.left + (i / 5) * chartWidth;
        ctx.fillText('G' + gen, x, height - 5);
      }

      // Label
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('Allele Frequency', padding.left, padding.top - 5);
    }
  };

  // ============================================
  // Initialize all components
  // ============================================
  function init() {
    EvolutionSim.init();
    SelectionDemo.init();
    DriftSim.init();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.TIP = window.TIP || {};
  window.TIP.NaturalSelection = {
    EvolutionSim,
    SelectionDemo,
    DriftSim
  };

})();
