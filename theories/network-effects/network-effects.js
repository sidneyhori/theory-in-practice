/**
 * Network Effects - Interactive Demos
 * Metcalfe's law, viral spread, and network growth visualizations
 */

(function() {
  'use strict';

  // ============================================
  // Metcalfe's Law Demo
  // ============================================
  const MetcalfeLaw = {
    canvas: null,
    ctx: null,
    slider: null,
    userCount: null,
    connectionCount: null,
    networkValue: null,
    usersDisplay: null,
    linearBar: null,
    quadraticBar: null,
    linearValue: null,
    quadraticValue: null,

    nodes: [],

    init() {
      this.canvas = document.getElementById('network-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.slider = document.getElementById('users-slider');
      this.userCount = document.querySelector('.user-count');
      this.connectionCount = document.querySelector('.connection-count');
      this.networkValue = document.querySelector('.network-value');
      this.usersDisplay = document.querySelector('.users-display');
      this.linearBar = document.querySelector('.linear-bar .bar-fill');
      this.quadraticBar = document.querySelector('.quadratic-bar .bar-fill');
      this.linearValue = document.querySelector('.linear-value');
      this.quadraticValue = document.querySelector('.quadratic-value');

      this.setupCanvas();
      this.bindEvents();
      this.update();
    },

    setupCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
    },

    bindEvents() {
      this.slider.addEventListener('input', () => this.update());
      window.addEventListener('resize', () => {
        this.setupCanvas();
        this.update();
      });
    },

    generateNodes(count) {
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;

      this.nodes = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        this.nodes.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      }
    },

    update() {
      const n = parseInt(this.slider.value);
      const connections = (n * (n - 1)) / 2;
      const value = n * n;

      this.userCount.textContent = n;
      this.connectionCount.textContent = connections;
      this.networkValue.textContent = value;
      this.usersDisplay.textContent = n;

      // Update comparison bars
      const maxValue = 400; // 20^2
      this.linearBar.style.width = `${(n / 20) * 100}%`;
      this.quadraticBar.style.width = `${(value / maxValue) * 100}%`;
      this.linearValue.textContent = n;
      this.quadraticValue.textContent = value;

      this.generateNodes(n);
      this.draw();
    },

    draw() {
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);

      this.ctx.clearRect(0, 0, width, height);

      // Draw connections
      this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      this.ctx.lineWidth = 1;

      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          this.ctx.stroke();
        }
      }

      // Draw nodes
      this.ctx.fillStyle = '#3b82f6';
      this.nodes.forEach(node => {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }
  };

  // ============================================
  // Viral Spread Simulator
  // ============================================
  const ViralSpread = {
    canvas: null,
    ctx: null,
    probSlider: null,
    densitySlider: null,
    probDisplay: null,
    densityDisplay: null,
    infectedCount: null,
    generationCount: null,
    rValue: null,
    resetBtn: null,

    nodes: [],
    edges: [],
    spreading: false,

    init() {
      this.canvas = document.getElementById('viral-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.probSlider = document.getElementById('spread-prob');
      this.densitySlider = document.getElementById('network-density');
      this.probDisplay = document.querySelector('.prob-display');
      this.densityDisplay = document.querySelector('.density-display');
      this.infectedCount = document.querySelector('.infected-count');
      this.generationCount = document.querySelector('.generation-count');
      this.rValue = document.querySelector('.r-value');
      this.resetBtn = document.querySelector('.reset-viral-btn');

      this.setupCanvas();
      this.bindEvents();
      this.generateNetwork();
      this.draw();
    },

    setupCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
    },

    bindEvents() {
      this.canvas.addEventListener('click', (e) => this.handleClick(e));
      this.probSlider.addEventListener('input', () => this.updateDisplays());
      this.densitySlider.addEventListener('input', () => {
        this.updateDisplays();
        this.generateNetwork();
        this.draw();
      });
      this.resetBtn.addEventListener('click', () => {
        this.generateNetwork();
        this.draw();
      });
      window.addEventListener('resize', () => {
        this.setupCanvas();
        this.draw();
      });
    },

    updateDisplays() {
      this.probDisplay.textContent = this.probSlider.value + '%';
      const densityLabels = ['Sparse', 'Medium', 'Dense'];
      this.densityDisplay.textContent = densityLabels[parseInt(this.densitySlider.value) - 1];
    },

    generateNetwork() {
      this.spreading = false;
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      const padding = 30;

      // Generate nodes
      this.nodes = [];
      const nodeCount = 30;
      for (let i = 0; i < nodeCount; i++) {
        this.nodes.push({
          x: padding + Math.random() * (width - padding * 2),
          y: padding + Math.random() * (height - padding * 2),
          infected: false,
          generation: -1
        });
      }

      // Generate edges based on density
      this.edges = [];
      const density = parseInt(this.densitySlider.value);
      const connectionRange = [60, 100, 150][density - 1];

      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const dx = this.nodes[i].x - this.nodes[j].x;
          const dy = this.nodes[i].y - this.nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionRange) {
            this.edges.push([i, j]);
          }
        }
      }

      this.updateStats();
    },

    handleClick(e) {
      if (this.spreading) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find clicked node
      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        const dx = node.x - x;
        const dy = node.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 15) {
          this.startSpread(i);
          break;
        }
      }
    },

    async startSpread(startNode) {
      this.spreading = true;

      // Reset all nodes
      this.nodes.forEach(n => {
        n.infected = false;
        n.generation = -1;
      });

      this.nodes[startNode].infected = true;
      this.nodes[startNode].generation = 0;

      const prob = parseInt(this.probSlider.value) / 100;
      let generation = 0;
      let totalSpread = 0;
      let spreadEvents = 0;

      this.draw();
      await this.sleep(500);

      while (true) {
        const currentGen = this.nodes.filter(n => n.generation === generation);
        if (currentGen.length === 0) break;

        let newInfections = 0;

        for (const node of currentGen) {
          const nodeIndex = this.nodes.indexOf(node);
          const neighbors = this.getNeighbors(nodeIndex);

          for (const neighborIndex of neighbors) {
            const neighbor = this.nodes[neighborIndex];
            if (!neighbor.infected && Math.random() < prob) {
              neighbor.infected = true;
              neighbor.generation = generation + 1;
              newInfections++;
            }
          }
          spreadEvents++;
        }

        totalSpread += newInfections;
        generation++;

        this.draw();
        this.updateStats();
        await this.sleep(600);

        if (newInfections === 0) break;
      }

      // Calculate R value
      const r = spreadEvents > 0 ? (totalSpread / spreadEvents).toFixed(2) : '0';
      this.rValue.textContent = r;

      this.spreading = false;
    },

    getNeighbors(nodeIndex) {
      const neighbors = [];
      for (const edge of this.edges) {
        if (edge[0] === nodeIndex) neighbors.push(edge[1]);
        if (edge[1] === nodeIndex) neighbors.push(edge[0]);
      }
      return neighbors;
    },

    updateStats() {
      const infected = this.nodes.filter(n => n.infected).length;
      const maxGen = Math.max(...this.nodes.map(n => n.generation));
      this.infectedCount.textContent = infected;
      this.generationCount.textContent = maxGen >= 0 ? maxGen : 0;
    },

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    draw() {
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);

      this.ctx.clearRect(0, 0, width, height);

      // Draw edges
      this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
      this.ctx.lineWidth = 1;

      for (const edge of this.edges) {
        const n1 = this.nodes[edge[0]];
        const n2 = this.nodes[edge[1]];

        // Highlight infected connections
        if (n1.infected && n2.infected) {
          this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
          this.ctx.lineWidth = 2;
        } else {
          this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
          this.ctx.lineWidth = 1;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(n1.x, n1.y);
        this.ctx.lineTo(n2.x, n2.y);
        this.ctx.stroke();
      }

      // Draw nodes
      for (const node of this.nodes) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);

        if (node.infected) {
          this.ctx.fillStyle = '#ef4444';
        } else {
          this.ctx.fillStyle = '#3b82f6';
        }
        this.ctx.fill();
      }
    }
  };

  // ============================================
  // Growth Comparison
  // ============================================
  const GrowthComparison = {
    canvas: null,
    ctx: null,
    timeSlider: null,
    timeDisplay: null,
    networkUsers: null,
    linearUsers: null,
    advantageRatio: null,

    init() {
      this.canvas = document.getElementById('growth-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.timeSlider = document.getElementById('time-slider');
      this.timeDisplay = document.querySelector('.time-display');
      this.networkUsers = document.querySelector('.network-users');
      this.linearUsers = document.querySelector('.linear-users');
      this.advantageRatio = document.querySelector('.advantage-ratio');

      this.setupCanvas();
      this.bindEvents();
      this.update();
    },

    setupCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
    },

    bindEvents() {
      this.timeSlider.addEventListener('input', () => this.update());
      window.addEventListener('resize', () => {
        this.setupCanvas();
        this.update();
      });
    },

    // S-curve growth (logistic function)
    networkGrowth(t, maxT) {
      const k = 0.5; // Growth rate
      const L = 1000; // Max capacity
      const midpoint = maxT * 0.4;
      return L / (1 + Math.exp(-k * (t - midpoint)));
    },

    // Linear growth
    linearGrowth(t) {
      return 20 * t;
    },

    update() {
      const maxT = parseInt(this.timeSlider.value);
      this.timeDisplay.textContent = maxT;

      const networkVal = Math.round(this.networkGrowth(maxT, maxT));
      const linearVal = Math.round(this.linearGrowth(maxT));

      this.networkUsers.textContent = networkVal.toLocaleString();
      this.linearUsers.textContent = linearVal.toLocaleString();
      this.advantageRatio.textContent = linearVal > 0 ? (networkVal / linearVal).toFixed(1) + 'x' : '--';

      this.draw(maxT);
    },

    draw(maxT) {
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      const padding = 40;
      const graphWidth = width - padding * 2;
      const graphHeight = height - padding * 2;

      this.ctx.clearRect(0, 0, width, height);

      // Draw axes
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary') || '#666';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, padding);
      this.ctx.lineTo(padding, height - padding);
      this.ctx.lineTo(width - padding, height - padding);
      this.ctx.stroke();

      // Labels
      this.ctx.fillStyle = this.ctx.strokeStyle;
      this.ctx.font = '11px system-ui';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Time', width / 2, height - 10);

      // Scale
      const maxUsers = Math.max(this.networkGrowth(30, 30), this.linearGrowth(30));
      const scaleX = t => padding + (t / 30) * graphWidth;
      const scaleY = u => height - padding - (u / maxUsers) * graphHeight;

      // Draw linear growth
      this.ctx.strokeStyle = '#8b5cf6';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      for (let t = 0; t <= maxT; t += 0.5) {
        const y = this.linearGrowth(t);
        if (t === 0) this.ctx.moveTo(scaleX(t), scaleY(y));
        else this.ctx.lineTo(scaleX(t), scaleY(y));
      }
      this.ctx.stroke();

      // Draw network growth (S-curve)
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.beginPath();
      for (let t = 0; t <= maxT; t += 0.5) {
        const y = this.networkGrowth(t, 30);
        if (t === 0) this.ctx.moveTo(scaleX(t), scaleY(y));
        else this.ctx.lineTo(scaleX(t), scaleY(y));
      }
      this.ctx.stroke();

      // Draw current time marker
      this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.moveTo(scaleX(maxT), padding);
      this.ctx.lineTo(scaleX(maxT), height - padding);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  };

  // ============================================
  // Initialize all demos
  // ============================================
  function init() {
    MetcalfeLaw.init();
    ViralSpread.init();
    GrowthComparison.init();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.TIP = window.TIP || {};
  window.TIP.NetworkEffects = {
    MetcalfeLaw,
    ViralSpread,
    GrowthComparison
  };
})();
