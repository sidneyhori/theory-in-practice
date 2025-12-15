/**
 * Compound Growth Interactive Visualizations
 * Demonstrates compound interest, Rule of 72, and rate comparisons
 */

(function() {
  'use strict';

  // Get theme colors
  function getColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      primary: style.getPropertyValue('--color-economics').trim() || '#10b981',
      text: style.getPropertyValue('--color-text').trim() || '#1f2937',
      textSecondary: style.getPropertyValue('--color-text-secondary').trim() || '#6b7280',
      textMuted: style.getPropertyValue('--color-text-muted').trim() || '#9ca3af',
      border: style.getPropertyValue('--color-border').trim() || '#e5e7eb',
      surface: style.getPropertyValue('--color-surface').trim() || '#f9fafb',
      bg: style.getPropertyValue('--color-bg').trim() || '#ffffff',
      purple: '#8b5cf6',
      cyan: '#06b6d4'
    };
  }

  // Format currency
  function formatCurrency(value) {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toLocaleString();
  }

  // ============================================
  // Compound Interest Calculator
  // ============================================
  const CompoundCalculator = {
    canvas: null,
    ctx: null,
    principal: 1000,
    rate: 7,
    years: 20,

    init() {
      this.canvas = document.getElementById('compound-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
      this.update();
    },

    bindEvents() {
      const principalSlider = document.getElementById('principal-slider');
      const rateSlider = document.getElementById('rate-slider');
      const yearsSlider = document.getElementById('years-slider');

      if (principalSlider) {
        principalSlider.addEventListener('input', (e) => {
          this.principal = parseInt(e.target.value);
          document.querySelector('.principal-display').textContent = this.principal.toLocaleString();
          this.update();
        });
      }

      if (rateSlider) {
        rateSlider.addEventListener('input', (e) => {
          this.rate = parseInt(e.target.value);
          document.querySelector('.rate-display').textContent = this.rate + '%';
          this.update();
        });
      }

      if (yearsSlider) {
        yearsSlider.addEventListener('input', (e) => {
          this.years = parseInt(e.target.value);
          document.querySelector('.years-display').textContent = this.years;
          this.update();
        });
      }

      // Handle theme changes
      const observer = new MutationObserver(() => this.draw());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    },

    calculate() {
      const data = [];
      for (let t = 0; t <= this.years; t++) {
        const compound = this.principal * Math.pow(1 + this.rate / 100, t);
        const linear = this.principal + (this.principal * this.rate / 100 * t);
        data.push({ year: t, compound, linear });
      }
      return data;
    },

    update() {
      const data = this.calculate();
      const finalValue = data[data.length - 1].compound;
      const interest = finalValue - this.principal;
      const multiple = finalValue / this.principal;

      // Update displays
      document.querySelector('.final-value').textContent = formatCurrency(Math.round(finalValue));
      document.querySelector('.interest-earned').textContent = formatCurrency(Math.round(interest));
      document.querySelector('.growth-multiple').textContent = multiple.toFixed(1) + 'x';

      this.draw(data);
    },

    draw(data) {
      if (!data) data = this.calculate();

      const colors = getColors();
      const { width, height } = this.canvas;
      const ctx = this.ctx;
      const padding = { top: 20, right: 20, bottom: 40, left: 60 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Clear canvas
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      // Find max value
      const maxValue = Math.max(...data.map(d => d.compound));

      // Draw grid lines
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight * i / 4);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Y-axis labels
        const value = maxValue * (1 - i / 4);
        ctx.fillStyle = colors.textMuted;
        ctx.font = '10px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(formatCurrency(Math.round(value)), padding.left - 5, y + 3);
      }

      // Draw linear growth line (simple interest)
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      data.forEach((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.linear / maxValue) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw compound growth curve
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      data.forEach((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.compound / maxValue) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Fill area under compound curve
      ctx.fillStyle = colors.primary + '20';
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartHeight);
      data.forEach((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.compound / maxValue) * chartHeight;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(width - padding.right, padding.top + chartHeight);
      ctx.closePath();
      ctx.fill();

      // Draw X-axis labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      const yearInterval = this.years <= 10 ? 2 : this.years <= 25 ? 5 : 10;
      for (let year = 0; year <= this.years; year += yearInterval) {
        const x = padding.left + (year / this.years) * chartWidth;
        ctx.fillText(`Y${year}`, x, height - 10);
      }

      // Legend
      ctx.font = '11px system-ui';
      ctx.textAlign = 'left';

      // Compound legend
      ctx.fillStyle = colors.primary;
      ctx.fillRect(padding.left, height - 30, 15, 3);
      ctx.fillStyle = colors.text;
      ctx.fillText('Compound', padding.left + 20, height - 26);

      // Linear legend
      ctx.strokeStyle = colors.border;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left + 100, height - 28);
      ctx.lineTo(padding.left + 115, height - 28);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.text;
      ctx.fillText('Simple', padding.left + 120, height - 26);
    }
  };

  // ============================================
  // Rule of 72 Calculator
  // ============================================
  const Rule72Calculator = {
    rate: 7,

    init() {
      this.bindEvents();
      this.update();
    },

    bindEvents() {
      const slider = document.getElementById('rule72-slider');
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.rate = parseInt(e.target.value);
          document.querySelector('.rule72-rate').textContent = this.rate;
          this.update();
        });
      }
    },

    update() {
      const rule72Estimate = 72 / this.rate;
      const exactTime = Math.log(2) / Math.log(1 + this.rate / 100);

      // Update displays
      document.querySelector('.rule72-estimate').textContent = rule72Estimate.toFixed(1) + ' years';
      document.querySelector('.rule72-exact').textContent = exactTime.toFixed(1) + ' years';

      // Update doubling timeline
      const doublingTime = rule72Estimate;
      document.querySelector('.time-1').textContent = Math.round(doublingTime) + ' yrs';
      document.querySelector('.time-2').textContent = Math.round(doublingTime * 2) + ' yrs';
      document.querySelector('.time-3').textContent = Math.round(doublingTime * 3) + ' yrs';
      document.querySelector('.time-4').textContent = Math.round(doublingTime * 4) + ' yrs';
    }
  };

  // ============================================
  // Rate Comparison
  // ============================================
  const RateComparison = {
    canvas: null,
    ctx: null,
    rateA: 5,
    rateB: 7,
    rateC: 10,
    period: 20,
    principal: 10000,

    init() {
      this.canvas = document.getElementById('comparison-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
      this.update();
    },

    bindEvents() {
      const rateASlider = document.getElementById('rate-a');
      const rateBSlider = document.getElementById('rate-b');
      const rateCSlider = document.getElementById('rate-c');
      const periodSlider = document.getElementById('period-slider');

      if (rateASlider) {
        rateASlider.addEventListener('input', (e) => {
          this.rateA = parseInt(e.target.value);
          document.querySelector('.rate-a-display').textContent = this.rateA + '%';
          document.querySelector('.rate-a-label').textContent = this.rateA + '%';
          this.update();
        });
      }

      if (rateBSlider) {
        rateBSlider.addEventListener('input', (e) => {
          this.rateB = parseInt(e.target.value);
          document.querySelector('.rate-b-display').textContent = this.rateB + '%';
          document.querySelector('.rate-b-label').textContent = this.rateB + '%';
          this.update();
        });
      }

      if (rateCSlider) {
        rateCSlider.addEventListener('input', (e) => {
          this.rateC = parseInt(e.target.value);
          document.querySelector('.rate-c-display').textContent = this.rateC + '%';
          document.querySelector('.rate-c-label').textContent = this.rateC + '%';
          this.update();
        });
      }

      if (periodSlider) {
        periodSlider.addEventListener('input', (e) => {
          this.period = parseInt(e.target.value);
          document.querySelector('.period-display').textContent = this.period;
          this.update();
        });
      }

      // Handle theme changes
      const observer = new MutationObserver(() => this.draw());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    },

    calculate() {
      const dataA = [];
      const dataB = [];
      const dataC = [];

      for (let t = 0; t <= this.period; t++) {
        dataA.push(this.principal * Math.pow(1 + this.rateA / 100, t));
        dataB.push(this.principal * Math.pow(1 + this.rateB / 100, t));
        dataC.push(this.principal * Math.pow(1 + this.rateC / 100, t));
      }

      return { dataA, dataB, dataC };
    },

    update() {
      const { dataA, dataB, dataC } = this.calculate();
      const finalA = dataA[dataA.length - 1];
      const finalB = dataB[dataB.length - 1];
      const finalC = dataC[dataC.length - 1];

      // Update legend values
      document.querySelector('.rate-a-final').textContent = formatCurrency(Math.round(finalA));
      document.querySelector('.rate-b-final').textContent = formatCurrency(Math.round(finalB));
      document.querySelector('.rate-c-final').textContent = formatCurrency(Math.round(finalC));

      this.draw({ dataA, dataB, dataC });
    },

    draw(data) {
      if (!data) data = this.calculate();

      const colors = getColors();
      const { width, height } = this.canvas;
      const ctx = this.ctx;
      const padding = { top: 20, right: 20, bottom: 40, left: 60 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Clear canvas
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      // Find max value
      const maxValue = Math.max(
        ...data.dataA,
        ...data.dataB,
        ...data.dataC
      );

      // Draw grid lines
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight * i / 4);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Y-axis labels
        const value = maxValue * (1 - i / 4);
        ctx.fillStyle = colors.textMuted;
        ctx.font = '10px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(formatCurrency(Math.round(value)), padding.left - 5, y + 3);
      }

      // Draw curves
      const drawCurve = (dataArr, color, lineWidth = 2) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        dataArr.forEach((value, i) => {
          const x = padding.left + (i / (dataArr.length - 1)) * chartWidth;
          const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      };

      drawCurve(data.dataA, colors.primary, 2);
      drawCurve(data.dataB, colors.purple, 2);
      drawCurve(data.dataC, colors.cyan, 2);

      // Draw X-axis labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      const yearInterval = this.period <= 10 ? 2 : this.period <= 25 ? 5 : 10;
      for (let year = 0; year <= this.period; year += yearInterval) {
        const x = padding.left + (year / this.period) * chartWidth;
        ctx.fillText(`Y${year}`, x, height - 10);
      }

      // Draw end points
      const drawEndPoint = (value, color) => {
        const x = width - padding.right;
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      };

      drawEndPoint(data.dataA[data.dataA.length - 1], colors.primary);
      drawEndPoint(data.dataB[data.dataB.length - 1], colors.purple);
      drawEndPoint(data.dataC[data.dataC.length - 1], colors.cyan);
    }
  };

  // ============================================
  // Initialize all components
  // ============================================
  function init() {
    CompoundCalculator.init();
    Rule72Calculator.init();
    RateComparison.init();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.TIP = window.TIP || {};
  window.TIP.CompoundGrowth = {
    CompoundCalculator,
    Rule72Calculator,
    RateComparison
  };

})();
