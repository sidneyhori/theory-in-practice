/**
 * Supply & Demand - Interactive Demos
 * Market curves, shocks, and elasticity visualizations
 */

(function() {
  'use strict';

  // Color scheme
  const COLORS = {
    demand: '#3b82f6',
    supply: '#ef4444',
    equilibrium: '#22c55e',
    grid: 'rgba(128, 128, 128, 0.2)',
    text: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary') || '#666'
  };

  // ============================================
  // Supply & Demand Curves
  // ============================================
  const SupplyDemandCurves = {
    canvas: null,
    ctx: null,
    demandShift: null,
    demandSlope: null,
    supplyShift: null,
    supplySlope: null,
    priceDisplay: null,
    quantityDisplay: null,

    // Curve parameters
    demandBase: 100,
    demandSensitivity: 1,
    supplyBase: 0,
    supplySensitivity: 1,

    init() {
      this.canvas = document.getElementById('sd-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.demandShift = document.getElementById('demand-shift');
      this.demandSlope = document.getElementById('demand-slope');
      this.supplyShift = document.getElementById('supply-shift');
      this.supplySlope = document.getElementById('supply-slope');
      this.priceDisplay = document.querySelector('.price-value');
      this.quantityDisplay = document.querySelector('.quantity-value');

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
      const update = () => this.update();
      this.demandShift.addEventListener('input', update);
      this.demandSlope.addEventListener('input', update);
      this.supplyShift.addEventListener('input', update);
      this.supplySlope.addEventListener('input', update);

      window.addEventListener('resize', () => {
        this.setupCanvas();
        this.update();
      });
    },

    // Demand: Q = demandBase - sensitivity * P
    demandQuantity(price) {
      return this.demandBase - this.demandSensitivity * price;
    },

    // Supply: Q = supplyBase + sensitivity * P
    supplyQuantity(price) {
      return this.supplyBase + this.supplySensitivity * price;
    },

    // Find equilibrium
    findEquilibrium() {
      // demandBase - demandSens * P = supplyBase + supplySens * P
      // demandBase - supplyBase = (demandSens + supplySens) * P
      const price = (this.demandBase - this.supplyBase) / (this.demandSensitivity + this.supplySensitivity);
      const quantity = this.supplyQuantity(price);
      return { price: Math.max(0, price), quantity: Math.max(0, quantity) };
    },

    update() {
      // Update parameters from sliders
      this.demandBase = parseInt(this.demandShift.value);
      this.demandSensitivity = parseInt(this.demandSlope.value) / 10;
      this.supplyBase = parseInt(this.supplyShift.value);
      this.supplySensitivity = parseInt(this.supplySlope.value) / 10;

      // Update displays
      document.querySelector('.demand-display').textContent = this.demandBase;
      document.querySelector('.demand-slope-display').textContent = this.demandSensitivity.toFixed(1);
      document.querySelector('.supply-display').textContent = this.supplyBase;
      document.querySelector('.supply-slope-display').textContent = this.supplySensitivity.toFixed(1);

      // Find equilibrium
      const eq = this.findEquilibrium();
      this.priceDisplay.textContent = `$${eq.price.toFixed(0)}`;
      this.quantityDisplay.textContent = `${eq.quantity.toFixed(0)} units`;

      this.draw(eq);
    },

    draw(equilibrium) {
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      const padding = 40;
      const graphWidth = width - padding * 2;
      const graphHeight = height - padding * 2;

      this.ctx.clearRect(0, 0, width, height);

      // Draw axes
      this.ctx.strokeStyle = COLORS.text;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, padding);
      this.ctx.lineTo(padding, height - padding);
      this.ctx.lineTo(width - padding, height - padding);
      this.ctx.stroke();

      // Labels
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '12px system-ui';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Quantity', width / 2, height - 10);
      this.ctx.save();
      this.ctx.translate(15, height / 2);
      this.ctx.rotate(-Math.PI / 2);
      this.ctx.fillText('Price', 0, 0);
      this.ctx.restore();

      // Scale
      const maxQ = 120;
      const maxP = 120;
      const scaleX = q => padding + (q / maxQ) * graphWidth;
      const scaleY = p => height - padding - (p / maxP) * graphHeight;

      // Draw grid
      this.ctx.strokeStyle = COLORS.grid;
      this.ctx.lineWidth = 0.5;
      for (let i = 0; i <= 100; i += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(scaleX(i), padding);
        this.ctx.lineTo(scaleX(i), height - padding);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(padding, scaleY(i));
        this.ctx.lineTo(width - padding, scaleY(i));
        this.ctx.stroke();
      }

      // Draw demand curve
      this.ctx.strokeStyle = COLORS.demand;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      for (let p = 0; p <= maxP; p += 2) {
        const q = this.demandQuantity(p);
        if (q >= 0 && q <= maxQ) {
          if (p === 0) this.ctx.moveTo(scaleX(q), scaleY(p));
          else this.ctx.lineTo(scaleX(q), scaleY(p));
        }
      }
      this.ctx.stroke();

      // Draw supply curve
      this.ctx.strokeStyle = COLORS.supply;
      this.ctx.beginPath();
      for (let p = 0; p <= maxP; p += 2) {
        const q = this.supplyQuantity(p);
        if (q >= 0 && q <= maxQ) {
          if (p === 0) this.ctx.moveTo(scaleX(q), scaleY(p));
          else this.ctx.lineTo(scaleX(q), scaleY(p));
        }
      }
      this.ctx.stroke();

      // Draw equilibrium point
      if (equilibrium.price >= 0 && equilibrium.quantity >= 0) {
        this.ctx.fillStyle = COLORS.equilibrium;
        this.ctx.beginPath();
        this.ctx.arc(scaleX(equilibrium.quantity), scaleY(equilibrium.price), 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Dashed lines to axes
        this.ctx.strokeStyle = COLORS.equilibrium;
        this.ctx.setLineDash([4, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(scaleX(equilibrium.quantity), scaleY(equilibrium.price));
        this.ctx.lineTo(scaleX(equilibrium.quantity), height - padding);
        this.ctx.moveTo(scaleX(equilibrium.quantity), scaleY(equilibrium.price));
        this.ctx.lineTo(padding, scaleY(equilibrium.price));
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      // Legend
      this.ctx.font = '11px system-ui';
      this.ctx.fillStyle = COLORS.demand;
      this.ctx.fillText('Demand', width - padding - 30, padding + 15);
      this.ctx.fillStyle = COLORS.supply;
      this.ctx.fillText('Supply', width - padding - 30, padding + 30);
    }
  };

  // ============================================
  // Market Shocks
  // ============================================
  const MarketShocks = {
    canvas: null,
    ctx: null,
    priceChange: null,
    quantityChange: null,
    resetBtn: null,

    // Base parameters
    baseSupply: 0,
    baseDemand: 100,
    currentSupply: 0,
    currentDemand: 100,
    sensitivity: 1,

    init() {
      this.canvas = document.getElementById('shocks-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.priceChange = document.querySelector('.price-change');
      this.quantityChange = document.querySelector('.quantity-change');
      this.resetBtn = document.querySelector('.reset-shock-btn');

      this.setupCanvas();
      this.bindEvents();
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
      document.querySelectorAll('.shock-btn').forEach(btn => {
        btn.addEventListener('click', () => this.applyShock(btn.dataset.shock));
      });

      this.resetBtn.addEventListener('click', () => this.reset());

      window.addEventListener('resize', () => {
        this.setupCanvas();
        this.draw();
      });
    },

    findEquilibrium(demandBase, supplyBase) {
      const price = (demandBase - supplyBase) / (this.sensitivity * 2);
      const quantity = supplyBase + this.sensitivity * price;
      return { price, quantity };
    },

    applyShock(type) {
      const oldEq = this.findEquilibrium(this.currentDemand, this.currentSupply);

      switch (type) {
        case 'demand-up':
          this.currentDemand += 20;
          break;
        case 'demand-down':
          this.currentDemand -= 20;
          break;
        case 'supply-up':
          this.currentSupply += 20;
          break;
        case 'supply-down':
          this.currentSupply -= 20;
          break;
      }

      const newEq = this.findEquilibrium(this.currentDemand, this.currentSupply);

      // Update displays
      const priceDiff = newEq.price - oldEq.price;
      const qtyDiff = newEq.quantity - oldEq.quantity;

      this.priceChange.textContent = priceDiff >= 0 ? `+$${priceDiff.toFixed(0)}` : `-$${Math.abs(priceDiff).toFixed(0)}`;
      this.priceChange.className = 'price-change ' + (priceDiff >= 0 ? 'up' : 'down');

      this.quantityChange.textContent = qtyDiff >= 0 ? `+${qtyDiff.toFixed(0)}` : `${qtyDiff.toFixed(0)}`;
      this.quantityChange.className = 'quantity-change ' + (qtyDiff >= 0 ? 'up' : 'down');

      this.draw();
    },

    reset() {
      this.currentDemand = this.baseDemand;
      this.currentSupply = this.baseSupply;
      this.priceChange.textContent = '--';
      this.priceChange.className = 'price-change';
      this.quantityChange.textContent = '--';
      this.quantityChange.className = 'quantity-change';
      this.draw();
    },

    draw() {
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      const padding = 40;
      const graphWidth = width - padding * 2;
      const graphHeight = height - padding * 2;

      this.ctx.clearRect(0, 0, width, height);

      // Draw axes
      this.ctx.strokeStyle = COLORS.text;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, padding);
      this.ctx.lineTo(padding, height - padding);
      this.ctx.lineTo(width - padding, height - padding);
      this.ctx.stroke();

      // Scale
      const maxQ = 120;
      const maxP = 120;
      const scaleX = q => padding + (q / maxQ) * graphWidth;
      const scaleY = p => height - padding - (p / maxP) * graphHeight;

      // Draw grid
      this.ctx.strokeStyle = COLORS.grid;
      this.ctx.lineWidth = 0.5;
      for (let i = 0; i <= 100; i += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(scaleX(i), padding);
        this.ctx.lineTo(scaleX(i), height - padding);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(padding, scaleY(i));
        this.ctx.lineTo(width - padding, scaleY(i));
        this.ctx.stroke();
      }

      // Draw original curves (faded)
      if (this.currentDemand !== this.baseDemand || this.currentSupply !== this.baseSupply) {
        this.ctx.globalAlpha = 0.3;

        // Original demand
        this.ctx.strokeStyle = COLORS.demand;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let p = 0; p <= maxP; p += 2) {
          const q = this.baseDemand - this.sensitivity * p;
          if (q >= 0 && q <= maxQ) {
            if (p === 0) this.ctx.moveTo(scaleX(q), scaleY(p));
            else this.ctx.lineTo(scaleX(q), scaleY(p));
          }
        }
        this.ctx.stroke();

        // Original supply
        this.ctx.strokeStyle = COLORS.supply;
        this.ctx.beginPath();
        for (let p = 0; p <= maxP; p += 2) {
          const q = this.baseSupply + this.sensitivity * p;
          if (q >= 0 && q <= maxQ) {
            if (p === 0) this.ctx.moveTo(scaleX(q), scaleY(p));
            else this.ctx.lineTo(scaleX(q), scaleY(p));
          }
        }
        this.ctx.stroke();

        this.ctx.globalAlpha = 1;
      }

      // Draw current curves
      this.ctx.strokeStyle = COLORS.demand;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      for (let p = 0; p <= maxP; p += 2) {
        const q = this.currentDemand - this.sensitivity * p;
        if (q >= 0 && q <= maxQ) {
          if (p === 0) this.ctx.moveTo(scaleX(q), scaleY(p));
          else this.ctx.lineTo(scaleX(q), scaleY(p));
        }
      }
      this.ctx.stroke();

      this.ctx.strokeStyle = COLORS.supply;
      this.ctx.beginPath();
      for (let p = 0; p <= maxP; p += 2) {
        const q = this.currentSupply + this.sensitivity * p;
        if (q >= 0 && q <= maxQ) {
          if (p === 0) this.ctx.moveTo(scaleX(q), scaleY(p));
          else this.ctx.lineTo(scaleX(q), scaleY(p));
        }
      }
      this.ctx.stroke();

      // Draw equilibrium
      const eq = this.findEquilibrium(this.currentDemand, this.currentSupply);
      if (eq.price >= 0 && eq.quantity >= 0) {
        this.ctx.fillStyle = COLORS.equilibrium;
        this.ctx.beginPath();
        this.ctx.arc(scaleX(eq.quantity), scaleY(eq.price), 6, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  };

  // ============================================
  // Elasticity Simulator
  // ============================================
  const ElasticitySimulator = {
    elasticCanvas: null,
    inelasticCanvas: null,
    priceSlider: null,
    priceDisplay: null,
    elasticRevenue: null,
    inelasticRevenue: null,
    elasticQty: null,
    inelasticQty: null,

    basePrice: 50,
    baseQty: 50,

    init() {
      this.elasticCanvas = document.getElementById('elastic-canvas');
      this.inelasticCanvas = document.getElementById('inelastic-canvas');
      this.priceSlider = document.getElementById('price-slider');

      if (!this.elasticCanvas || !this.priceSlider) return;

      this.priceDisplay = document.querySelector('.price-display');
      this.elasticRevenue = document.querySelector('.elastic-revenue');
      this.inelasticRevenue = document.querySelector('.inelastic-revenue');
      this.elasticQty = document.querySelector('.elastic-qty');
      this.inelasticQty = document.querySelector('.inelastic-qty');

      this.setupCanvases();
      this.bindEvents();
      this.update();
    },

    setupCanvases() {
      [this.elasticCanvas, this.inelasticCanvas].forEach(canvas => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      });
    },

    bindEvents() {
      this.priceSlider.addEventListener('input', () => this.update());
      window.addEventListener('resize', () => {
        this.setupCanvases();
        this.update();
      });
    },

    // Elastic: qty changes a lot with price
    elasticDemand(price) {
      return Math.max(0, this.baseQty - (price - this.basePrice) * 2);
    },

    // Inelastic: qty changes little with price
    inelasticDemand(price) {
      return Math.max(0, this.baseQty - (price - this.basePrice) * 0.3);
    },

    update() {
      const price = parseInt(this.priceSlider.value);
      this.priceDisplay.textContent = price;

      const elasticQ = this.elasticDemand(price);
      const inelasticQ = this.inelasticDemand(price);

      this.elasticQty.textContent = Math.round(elasticQ);
      this.inelasticQty.textContent = Math.round(inelasticQ);
      this.elasticRevenue.textContent = `$${(price * elasticQ).toFixed(0).toLocaleString()}`;
      this.inelasticRevenue.textContent = `$${(price * inelasticQ).toFixed(0).toLocaleString()}`;

      this.drawCurve(this.elasticCanvas, price, elasticQ, 'elastic');
      this.drawCurve(this.inelasticCanvas, price, inelasticQ, 'inelastic');
    },

    drawCurve(canvas, currentPrice, currentQty, type) {
      const ctx = canvas.getContext('2d');
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const padding = 20;

      ctx.clearRect(0, 0, width, height);

      // Scale
      const scaleX = q => padding + (q / 100) * (width - padding * 2);
      const scaleY = p => height - padding - ((p - 10) / 80) * (height - padding * 2);

      // Draw axes
      ctx.strokeStyle = COLORS.text;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Draw curve
      ctx.strokeStyle = COLORS.demand;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let p = 20; p <= 80; p += 2) {
        const q = type === 'elastic' ? this.elasticDemand(p) : this.inelasticDemand(p);
        if (p === 20) ctx.moveTo(scaleX(q), scaleY(p));
        else ctx.lineTo(scaleX(q), scaleY(p));
      }
      ctx.stroke();

      // Draw current point
      ctx.fillStyle = COLORS.equilibrium;
      ctx.beginPath();
      ctx.arc(scaleX(currentQty), scaleY(currentPrice), 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw revenue rectangle (area)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.fillRect(padding, scaleY(currentPrice), scaleX(currentQty) - padding, height - padding - scaleY(currentPrice));
    }
  };

  // ============================================
  // Initialize all demos
  // ============================================
  function init() {
    SupplyDemandCurves.init();
    MarketShocks.init();
    ElasticitySimulator.init();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.TIP = window.TIP || {};
  window.TIP.SupplyDemand = {
    SupplyDemandCurves,
    MarketShocks,
    ElasticitySimulator
  };
})();
