// Fractals Interactive Components

(function() {
  // ===== Sierpinski Triangle =====
  const sierpinski = {
    canvas: null,
    ctx: null,
    depth: 0,
    animating: false,

    init() {
      this.canvas = document.getElementById('sierpinski-canvas');
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
      const slider = document.getElementById('sierpinski-depth');
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.depth = parseInt(e.target.value);
          document.querySelector('.depth-value').textContent = this.depth;
          this.updateStats();
          this.render();
        });
      }

      document.querySelector('.animate-sierpinski-btn')?.addEventListener('click', () => {
        this.animate();
      });

      window.addEventListener('resize', () => this.resizeCanvas());
    },

    animate() {
      if (this.animating) return;
      this.animating = true;
      this.depth = 0;

      const slider = document.getElementById('sierpinski-depth');
      const animate = () => {
        if (this.depth < 8) {
          this.depth++;
          if (slider) slider.value = this.depth;
          document.querySelector('.depth-value').textContent = this.depth;
          this.updateStats();
          this.render();
          setTimeout(animate, 500);
        } else {
          this.animating = false;
        }
      };

      this.render();
      setTimeout(animate, 500);
    },

    updateStats() {
      const triangles = Math.pow(3, this.depth);
      const removed = (Math.pow(3, this.depth) - 1) / 2;
      document.querySelector('.triangle-count').textContent = triangles.toLocaleString();
      document.querySelector('.removed-count').textContent = Math.floor(removed).toLocaleString();
    },

    drawTriangle(x1, y1, x2, y2, x3, y3, depth) {
      if (depth === 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.closePath();
        this.ctx.fill();
        return;
      }

      const mx1 = (x1 + x2) / 2;
      const my1 = (y1 + y2) / 2;
      const mx2 = (x2 + x3) / 2;
      const my2 = (y2 + y3) / 2;
      const mx3 = (x3 + x1) / 2;
      const my3 = (y3 + y1) / 2;

      this.drawTriangle(x1, y1, mx1, my1, mx3, my3, depth - 1);
      this.drawTriangle(mx1, my1, x2, y2, mx2, my2, depth - 1);
      this.drawTriangle(mx3, my3, mx2, my2, x3, y3, depth - 1);
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#2563EB';
      this.ctx.fillStyle = accentColor;

      const padding = 30;
      const size = Math.min(rect.width, rect.height) - padding * 2;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const x1 = cx;
      const y1 = cy - size / 2;
      const x2 = cx - size / 2;
      const y2 = cy + size / 2;
      const x3 = cx + size / 2;
      const y3 = cy + size / 2;

      this.drawTriangle(x1, y1, x2, y2, x3, y3, this.depth);
    }
  };

  // ===== Mandelbrot Set =====
  const mandelbrot = {
    canvas: null,
    ctx: null,
    centerX: -0.5,
    centerY: 0,
    zoom: 1,
    maxIterations: 100,

    init() {
      this.canvas = document.getElementById('mandelbrot-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.bindEvents();
      this.render();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.render();
    },

    bindEvents() {
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scale = 3 / (this.zoom * Math.min(rect.width, rect.height));
        this.centerX += (x - rect.width / 2) * scale;
        this.centerY += (y - rect.height / 2) * scale;
        this.zoom *= 2;

        this.updateInfo();
        this.render();
      });

      document.querySelector('.zoom-out-btn')?.addEventListener('click', () => {
        this.zoom = Math.max(1, this.zoom / 2);
        this.updateInfo();
        this.render();
      });

      document.querySelector('.reset-mandelbrot-btn')?.addEventListener('click', () => {
        this.centerX = -0.5;
        this.centerY = 0;
        this.zoom = 1;
        this.updateInfo();
        this.render();
      });

      document.getElementById('max-iterations')?.addEventListener('change', (e) => {
        this.maxIterations = parseInt(e.target.value);
        this.render();
      });

      window.addEventListener('resize', () => this.resizeCanvas());
    },

    updateInfo() {
      document.querySelector('.zoom-level').textContent = this.zoom + 'x';
      document.querySelector('.center-coords').textContent = `(${this.centerX.toFixed(4)}, ${this.centerY.toFixed(4)})`;
    },

    getColor(iterations) {
      if (iterations === this.maxIterations) return [0, 0, 0];

      const hue = (iterations / this.maxIterations) * 360;
      const saturation = 100;
      const lightness = 50;

      // HSL to RGB conversion
      const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
      const m = lightness / 100 - c / 2;

      let r, g, b;
      if (hue < 60) { r = c; g = x; b = 0; }
      else if (hue < 120) { r = x; g = c; b = 0; }
      else if (hue < 180) { r = 0; g = c; b = x; }
      else if (hue < 240) { r = 0; g = x; b = c; }
      else if (hue < 300) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }

      return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
      ];
    },

    render() {
      if (!this.ctx) return;
      const width = this.canvas.width;
      const height = this.canvas.height;

      const imageData = this.ctx.createImageData(width, height);
      const data = imageData.data;

      const scale = 3 / (this.zoom * Math.min(width, height));

      for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
          const x0 = this.centerX + (px - width / 2) * scale;
          const y0 = this.centerY + (py - height / 2) * scale;

          let x = 0;
          let y = 0;
          let iteration = 0;

          while (x * x + y * y <= 4 && iteration < this.maxIterations) {
            const xtemp = x * x - y * y + x0;
            y = 2 * x * y + y0;
            x = xtemp;
            iteration++;
          }

          const [r, g, b] = this.getColor(iteration);
          const idx = (py * width + px) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      this.ctx.putImageData(imageData, 0, 0);
    }
  };

  // ===== Fractal Tree =====
  const fractalTree = {
    canvas: null,
    ctx: null,
    angle: 25,
    ratio: 0.7,
    depth: 8,

    init() {
      this.canvas = document.getElementById('tree-canvas');
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
      document.getElementById('branch-angle')?.addEventListener('input', (e) => {
        this.angle = parseInt(e.target.value);
        document.querySelector('.angle-value').textContent = this.angle;
        this.render();
      });

      document.getElementById('branch-ratio')?.addEventListener('input', (e) => {
        this.ratio = parseInt(e.target.value) / 100;
        document.querySelector('.ratio-value').textContent = this.ratio.toFixed(2);
        this.render();
      });

      document.getElementById('tree-depth')?.addEventListener('input', (e) => {
        this.depth = parseInt(e.target.value);
        document.querySelector('.tree-depth-value').textContent = this.depth;
        this.render();
      });

      document.querySelector('.randomize-tree-btn')?.addEventListener('click', () => {
        this.angle = 15 + Math.random() * 45;
        this.ratio = 0.5 + Math.random() * 0.35;
        this.depth = 6 + Math.floor(Math.random() * 6);

        document.getElementById('branch-angle').value = this.angle;
        document.getElementById('branch-ratio').value = this.ratio * 100;
        document.getElementById('tree-depth').value = this.depth;

        document.querySelector('.angle-value').textContent = Math.round(this.angle);
        document.querySelector('.ratio-value').textContent = this.ratio.toFixed(2);
        document.querySelector('.tree-depth-value').textContent = this.depth;

        this.render();
      });

      window.addEventListener('resize', () => this.resizeCanvas());
    },

    drawBranch(x, y, length, angle, depth) {
      if (depth === 0 || length < 1) return;

      const endX = x + length * Math.sin(angle * Math.PI / 180);
      const endY = y - length * Math.cos(angle * Math.PI / 180);

      // Color gradient from brown to green
      const greenness = (this.depth - depth) / this.depth;
      const r = Math.round(101 + (34 - 101) * greenness);
      const g = Math.round(67 + (139 - 67) * greenness);
      const b = Math.round(33 + (34 - 33) * greenness);

      this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      this.ctx.lineWidth = Math.max(1, depth * 0.8);

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      const newLength = length * this.ratio;
      this.drawBranch(endX, endY, newLength, angle - this.angle, depth - 1);
      this.drawBranch(endX, endY, newLength, angle + this.angle, depth - 1);
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      const startX = rect.width / 2;
      const startY = rect.height - 20;
      const startLength = rect.height * 0.3;

      this.drawBranch(startX, startY, startLength, 0, this.depth);
    }
  };

  // ===== Initialize =====
  function init() {
    sierpinski.init();
    mandelbrot.init();
    fractalTree.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIP = window.TIP || {};
  window.TIP.fractals = { sierpinski, mandelbrot, fractalTree };
})();
