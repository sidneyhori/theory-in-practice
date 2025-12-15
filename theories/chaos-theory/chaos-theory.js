// Chaos Theory Interactive Components

(function() {
  // ===== Double Pendulum =====
  const doublePendulum = {
    canvas: null,
    ctx: null,
    running: false,
    showTrace: true,
    pendulums: [],
    traces: [[], []],
    animationId: null,

    // Physical constants
    g: 9.81,
    L1: 100,
    L2: 100,
    m1: 10,
    m2: 10,
    dt: 0.05,

    init() {
      this.canvas = document.getElementById('pendulum-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.reset();
      this.bindEvents();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    },

    reset() {
      this.running = false;
      if (this.animationId) cancelAnimationFrame(this.animationId);

      const angle = Math.PI / 2;
      const offset = 0.1 * Math.PI / 180; // 0.1 degree difference

      this.pendulums = [
        { theta1: angle, theta2: angle, omega1: 0, omega2: 0 },
        { theta1: angle + offset, theta2: angle, omega1: 0, omega2: 0 }
      ];
      this.traces = [[], []];
      this.render();
    },

    bindEvents() {
      document.querySelector('.start-pendulum-btn')?.addEventListener('click', () => {
        if (this.running) {
          this.running = false;
          document.querySelector('.start-pendulum-btn').textContent = 'Start';
        } else {
          this.running = true;
          document.querySelector('.start-pendulum-btn').textContent = 'Pause';
          this.animate();
        }
      });

      document.querySelector('.reset-pendulum-btn')?.addEventListener('click', () => {
        document.querySelector('.start-pendulum-btn').textContent = 'Start';
        this.reset();
      });

      document.querySelector('.show-trace-checkbox')?.addEventListener('change', (e) => {
        this.showTrace = e.target.checked;
        this.render();
      });

      window.addEventListener('resize', () => {
        this.resizeCanvas();
        this.render();
      });
    },

    step(p) {
      const { theta1, theta2, omega1, omega2 } = p;
      const { g, L1, L2, m1, m2, dt } = this;

      const delta = theta2 - theta1;
      const den1 = (m1 + m2) * L1 - m2 * L1 * Math.cos(delta) * Math.cos(delta);
      const den2 = (L2 / L1) * den1;

      const alpha1 = (m2 * L1 * omega1 * omega1 * Math.sin(delta) * Math.cos(delta)
        + m2 * g * Math.sin(theta2) * Math.cos(delta)
        + m2 * L2 * omega2 * omega2 * Math.sin(delta)
        - (m1 + m2) * g * Math.sin(theta1)) / den1;

      const alpha2 = (-m2 * L2 * omega2 * omega2 * Math.sin(delta) * Math.cos(delta)
        + (m1 + m2) * g * Math.sin(theta1) * Math.cos(delta)
        - (m1 + m2) * L1 * omega1 * omega1 * Math.sin(delta)
        - (m1 + m2) * g * Math.sin(theta2)) / den2;

      p.omega1 += alpha1 * dt;
      p.omega2 += alpha2 * dt;
      p.theta1 += p.omega1 * dt;
      p.theta2 += p.omega2 * dt;

      // Damping
      p.omega1 *= 0.9999;
      p.omega2 *= 0.9999;
    },

    animate() {
      if (!this.running) return;

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          this.step(this.pendulums[i]);
        }

        const rect = this.canvas.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2 - 30;
        const p = this.pendulums[i];

        const x2 = cx + this.L1 * Math.sin(p.theta1) + this.L2 * Math.sin(p.theta2);
        const y2 = cy + this.L1 * Math.cos(p.theta1) + this.L2 * Math.cos(p.theta2);

        this.traces[i].push({ x: x2, y: y2 });
        if (this.traces[i].length > 500) this.traces[i].shift();
      }

      this.render();
      this.animationId = requestAnimationFrame(() => this.animate());
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width / 2;
      const cy = rect.height / 2 - 30;

      // Draw traces
      if (this.showTrace) {
        const colors = ['rgba(37, 99, 235, 0.4)', 'rgba(239, 68, 68, 0.4)'];
        for (let i = 0; i < 2; i++) {
          if (this.traces[i].length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.traces[i][0].x, this.traces[i][0].y);
            for (let j = 1; j < this.traces[i].length; j++) {
              this.ctx.lineTo(this.traces[i][j].x, this.traces[i][j].y);
            }
            this.ctx.strokeStyle = colors[i];
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
          }
        }
      }

      // Draw pendulums
      const pendulumColors = ['#2563eb', '#ef4444'];
      for (let i = 0; i < 2; i++) {
        const p = this.pendulums[i];
        const x1 = cx + this.L1 * Math.sin(p.theta1);
        const y1 = cy + this.L1 * Math.cos(p.theta1);
        const x2 = x1 + this.L2 * Math.sin(p.theta2);
        const y2 = y1 + this.L2 * Math.cos(p.theta2);

        // Arms
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = pendulumColors[i];
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Joints
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = pendulumColors[i];
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(x2, y2, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = pendulumColors[i];
        this.ctx.fill();
      }

      // Pivot
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim() || '#333';
      this.ctx.fill();
    }
  };

  // ===== Logistic Map =====
  const logisticMap = {
    canvas: null,
    ctx: null,
    r: 2.5,

    init() {
      this.canvas = document.getElementById('logistic-canvas');
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
      this.render();
    },

    bindEvents() {
      document.getElementById('growth-rate')?.addEventListener('input', (e) => {
        this.r = parseInt(e.target.value) / 100;
        document.querySelector('.r-value').textContent = this.r.toFixed(2);
        this.render();
      });

      document.querySelector('.show-bifurcation-btn')?.addEventListener('click', () => {
        const container = document.querySelector('.bifurcation-container');
        if (container.style.display === 'none') {
          container.style.display = 'block';
          this.renderBifurcation();
        } else {
          container.style.display = 'none';
        }
      });

      window.addEventListener('resize', () => {
        this.resizeCanvas();
        if (document.querySelector('.bifurcation-container').style.display !== 'none') {
          this.renderBifurcation();
        }
      });
    },

    iterate(x, r) {
      return r * x * (1 - x);
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      // Run iterations
      let x = 0.5;
      const values = [x];
      for (let i = 0; i < 100; i++) {
        x = this.iterate(x, this.r);
        values.push(x);
      }

      // Draw chart
      const padding = 40;
      const chartWidth = rect.width - padding * 2;
      const chartHeight = rect.height - padding * 2;

      // Axes
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#ccc';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, padding);
      this.ctx.lineTo(padding, rect.height - padding);
      this.ctx.lineTo(rect.width - padding, rect.height - padding);
      this.ctx.stroke();

      // Line
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#2563EB';
      this.ctx.strokeStyle = accentColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      for (let i = 0; i < values.length; i++) {
        const x = padding + (i / values.length) * chartWidth;
        const y = rect.height - padding - values[i] * chartHeight;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();

      // Points for last 20 values
      this.ctx.fillStyle = accentColor;
      for (let i = Math.max(0, values.length - 20); i < values.length; i++) {
        const x = padding + (i / values.length) * chartWidth;
        const y = rect.height - padding - values[i] * chartHeight;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Determine behavior
      const last50 = values.slice(-50);
      const unique = [...new Set(last50.map(v => v.toFixed(4)))];

      let behavior, finalPop;
      if (this.r < 1) {
        behavior = 'Extinction';
        finalPop = '0.00';
      } else if (unique.length <= 2) {
        behavior = 'Stable';
        finalPop = values[values.length - 1].toFixed(4);
      } else if (unique.length <= 4) {
        behavior = 'Period 2';
        finalPop = unique.slice(0, 2).join(' ↔ ');
      } else if (unique.length <= 8) {
        behavior = 'Period 4';
        finalPop = 'oscillating';
      } else if (this.r < 3.57) {
        behavior = 'Period doubling';
        finalPop = 'oscillating';
      } else {
        behavior = 'Chaotic';
        finalPop = 'unpredictable';
      }

      document.querySelector('.behavior-type').textContent = behavior;
      document.querySelector('.final-population').textContent = finalPop;
    },

    renderBifurcation() {
      const canvas = document.getElementById('bifurcation-canvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#fff';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#2563EB';

      // Draw bifurcation diagram
      for (let px = 0; px < rect.width; px++) {
        const r = 2.5 + (px / rect.width) * 1.5; // r from 2.5 to 4
        let x = 0.5;

        // Settle
        for (let i = 0; i < 100; i++) {
          x = r * x * (1 - x);
        }

        // Plot
        for (let i = 0; i < 100; i++) {
          x = r * x * (1 - x);
          const py = rect.height - x * rect.height;
          ctx.fillStyle = accentColor;
          ctx.fillRect(px, py, 1, 1);
        }
      }

      // Labels
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#999';
      ctx.font = '11px sans-serif';
      ctx.fillText('r = 2.5', 5, rect.height - 5);
      ctx.fillText('r = 4.0', rect.width - 45, rect.height - 5);
    }
  };

  // ===== Lorenz Attractor =====
  const lorenzAttractor = {
    canvas: null,
    ctx: null,
    running: false,
    points: [],
    animationId: null,

    // Lorenz parameters
    sigma: 10,
    rho: 28,
    beta: 8/3,
    dt: 0.005,

    init() {
      this.canvas = document.getElementById('lorenz-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.reset();
      this.bindEvents();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    },

    reset() {
      this.running = false;
      if (this.animationId) cancelAnimationFrame(this.animationId);

      this.points = [
        { x: 1, y: 1, z: 1, trail: [] },
        { x: 1.0001, y: 1, z: 1, trail: [] }
      ];
      document.querySelector('.separation-value').textContent = '0.0001';
      this.render();
    },

    bindEvents() {
      document.querySelector('.start-lorenz-btn')?.addEventListener('click', () => {
        if (this.running) {
          this.running = false;
          document.querySelector('.start-lorenz-btn').textContent = 'Start';
        } else {
          this.running = true;
          document.querySelector('.start-lorenz-btn').textContent = 'Pause';
          this.animate();
        }
      });

      document.querySelector('.reset-lorenz-btn')?.addEventListener('click', () => {
        document.querySelector('.start-lorenz-btn').textContent = 'Start';
        this.reset();
      });

      window.addEventListener('resize', () => {
        this.resizeCanvas();
        this.render();
      });
    },

    step(p) {
      const dx = this.sigma * (p.y - p.x) * this.dt;
      const dy = (p.x * (this.rho - p.z) - p.y) * this.dt;
      const dz = (p.x * p.y - this.beta * p.z) * this.dt;

      p.x += dx;
      p.y += dy;
      p.z += dz;
    },

    project(x, y, z) {
      const rect = this.canvas.getBoundingClientRect();
      const scale = 5;
      const px = rect.width / 2 + (x - 0) * scale;
      const py = rect.height / 2 + (z - 25) * -scale;
      return { x: px, y: py };
    },

    animate() {
      if (!this.running) return;

      for (let i = 0; i < 5; i++) {
        for (const p of this.points) {
          this.step(p);
          const proj = this.project(p.x, p.y, p.z);
          p.trail.push(proj);
          if (p.trail.length > 1000) p.trail.shift();
        }
      }

      // Calculate separation
      const dx = this.points[0].x - this.points[1].x;
      const dy = this.points[0].y - this.points[1].y;
      const dz = this.points[0].z - this.points[1].z;
      const sep = Math.sqrt(dx*dx + dy*dy + dz*dz);
      document.querySelector('.separation-value').textContent = sep.toFixed(4);

      this.render();
      this.animationId = requestAnimationFrame(() => this.animate());
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.fillRect(0, 0, rect.width, rect.height);

      const colors = ['#60a5fa', '#f87171'];

      for (let i = 0; i < 2; i++) {
        const trail = this.points[i].trail;
        if (trail.length < 2) continue;

        this.ctx.beginPath();
        this.ctx.moveTo(trail[0].x, trail[0].y);
        for (let j = 1; j < trail.length; j++) {
          this.ctx.lineTo(trail[j].x, trail[j].y);
        }
        this.ctx.strokeStyle = colors[i];
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Current position
        if (trail.length > 0) {
          const last = trail[trail.length - 1];
          this.ctx.beginPath();
          this.ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
          this.ctx.fillStyle = colors[i];
          this.ctx.fill();
        }
      }
    }
  };

  // ===== Initialize =====
  function init() {
    doublePendulum.init();
    logisticMap.init();
    lorenzAttractor.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIP = window.TIP || {};
  window.TIP.chaosTheory = { doublePendulum, logisticMap, lorenzAttractor };
})();
