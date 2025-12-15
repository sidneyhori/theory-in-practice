/**
 * Cognitive Biases Interactive Demonstrations
 * Demonstrates anchoring, framing, and confirmation bias
 */

(function() {
  'use strict';

  // ============================================
  // Anchoring Effect Demo
  // ============================================
  const AnchoringDemo = {
    anchor: null,
    estimate: 50,
    phase: 1,

    init() {
      this.bindEvents();
    },

    bindEvents() {
      const generateBtn = document.querySelector('.generate-anchor-btn');
      const estimateSlider = document.getElementById('estimate-slider');
      const submitBtn = document.querySelector('.submit-estimate-btn');
      const tryAgainBtn = document.querySelector('.try-again-btn');

      if (generateBtn) {
        generateBtn.addEventListener('click', () => this.generateAnchor());
      }

      if (estimateSlider) {
        estimateSlider.addEventListener('input', (e) => {
          this.estimate = parseInt(e.target.value);
          document.querySelector('.estimate-value').textContent = this.estimate + '%';
        });
      }

      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.submitEstimate());
      }

      if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => this.reset());
      }
    },

    generateAnchor() {
      // Randomly choose high (65) or low (10) anchor
      this.anchor = Math.random() > 0.5 ? 65 : 10;
      document.querySelector('.anchor-number').textContent = this.anchor;

      // Move to phase 2 after a brief pause
      setTimeout(() => {
        this.showPhase(2);
      }, 1500);
    },

    submitEstimate() {
      // Show results
      document.querySelector('.result-anchor').textContent = this.anchor;
      document.querySelector('.result-estimate').textContent = this.estimate + '%';

      // Provide explanation based on anchor
      const explanation = document.querySelector('.anchoring-explanation');
      if (this.anchor === 65) {
        if (this.estimate > 35) {
          explanation.textContent = `Your high anchor (65) likely pulled your estimate higher. People given this anchor average ~45%, well above the true 28%.`;
        } else {
          explanation.textContent = `Interesting! Despite the high anchor (65), your estimate was relatively low. Most people given this anchor estimate ~45%.`;
        }
      } else {
        if (this.estimate < 35) {
          explanation.textContent = `Your low anchor (10) likely pulled your estimate lower. People given this anchor average ~25%, closer to the true 28%.`;
        } else {
          explanation.textContent = `Interesting! Despite the low anchor (10), your estimate was relatively high. Most people given this anchor estimate ~25%.`;
        }
      }

      this.showPhase(3);
    },

    showPhase(phase) {
      document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
      document.querySelector(`.phase-${phase}`).classList.add('active');
      this.phase = phase;
    },

    reset() {
      this.anchor = null;
      this.estimate = 50;
      document.querySelector('.anchor-number').textContent = '--';
      document.getElementById('estimate-slider').value = 50;
      document.querySelector('.estimate-value').textContent = '50%';
      this.showPhase(1);
    }
  };

  // ============================================
  // Framing Effect Demo
  // ============================================
  const FramingDemo = {
    currentFrame: 'positive',

    init() {
      this.bindEvents();
    },

    bindEvents() {
      // Frame toggle buttons
      document.querySelectorAll('.frame-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const frame = btn.dataset.frame;
          this.switchFrame(frame);
        });
      });

      // Option cards
      document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
      });
    },

    switchFrame(frame) {
      this.currentFrame = frame;

      // Update toggle buttons
      document.querySelectorAll('.frame-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.frame === frame);
      });

      // Update option text visibility
      document.querySelectorAll('.option-text.positive-frame').forEach(el => {
        el.style.display = frame === 'positive' ? '' : 'none';
      });
      document.querySelectorAll('.option-text.negative-frame').forEach(el => {
        el.style.display = frame === 'negative' ? '' : 'none';
      });

      // Clear selections when switching frames
      document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    }
  };

  // ============================================
  // Wason 2-4-6 Task (Confirmation Bias)
  // ============================================
  const WasonTask = {
    testedSequences: [],
    guessed: false,

    init() {
      this.bindEvents();
    },

    bindEvents() {
      const testBtn = document.querySelector('.test-sequence-btn');
      const resetBtn = document.querySelector('.reset-wason-btn');

      if (testBtn) {
        testBtn.addEventListener('click', () => this.testSequence());
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.reset());
      }

      // Guess buttons
      document.querySelectorAll('.guess-btn').forEach(btn => {
        btn.addEventListener('click', () => this.makeGuess(btn.dataset.guess));
      });

      // Allow enter key in inputs
      document.querySelectorAll('.wason-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.testSequence();
        });
      });
    },

    // The actual rule: any three increasing numbers
    followsRule(a, b, c) {
      return a < b && b < c;
    },

    testSequence() {
      const a = parseInt(document.getElementById('wason-1').value);
      const b = parseInt(document.getElementById('wason-2').value);
      const c = parseInt(document.getElementById('wason-3').value);

      if (isNaN(a) || isNaN(b) || isNaN(c)) {
        document.querySelector('.test-result').textContent = 'Please enter three numbers';
        document.querySelector('.test-result').className = 'test-result';
        return;
      }

      const follows = this.followsRule(a, b, c);
      this.testedSequences.push({ a, b, c, follows });

      const resultEl = document.querySelector('.test-result');
      if (follows) {
        resultEl.textContent = `✓ ${a}, ${b}, ${c} follows the rule`;
        resultEl.className = 'test-result follows';
      } else {
        resultEl.textContent = `✗ ${a}, ${b}, ${c} does NOT follow the rule`;
        resultEl.className = 'test-result not-follows';
      }

      // Clear inputs for next test
      document.getElementById('wason-1').value = '';
      document.getElementById('wason-2').value = '';
      document.getElementById('wason-3').value = '';
      document.getElementById('wason-1').focus();
    },

    makeGuess(guess) {
      if (this.guessed) return;
      this.guessed = true;

      const resultEl = document.querySelector('.guess-result');
      const revealEl = document.querySelector('.wason-reveal');

      if (guess === 'increasing') {
        resultEl.textContent = 'Correct!';
        resultEl.className = 'guess-result correct';
      } else {
        resultEl.textContent = 'Not quite...';
        resultEl.className = 'guess-result incorrect';
      }

      // Show reveal after a moment
      setTimeout(() => {
        revealEl.style.display = 'block';
        revealEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1000);
    },

    reset() {
      this.testedSequences = [];
      this.guessed = false;

      document.getElementById('wason-1').value = '';
      document.getElementById('wason-2').value = '';
      document.getElementById('wason-3').value = '';
      document.querySelector('.test-result').textContent = '';
      document.querySelector('.test-result').className = 'test-result';
      document.querySelector('.guess-result').textContent = '';
      document.querySelector('.guess-result').className = 'guess-result';
      document.querySelector('.wason-reveal').style.display = 'none';
    }
  };

  // ============================================
  // Initialize all components
  // ============================================
  function init() {
    AnchoringDemo.init();
    FramingDemo.init();
    WasonTask.init();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.TIP = window.TIP || {};
  window.TIP.CognitiveBiases = {
    AnchoringDemo,
    FramingDemo,
    WasonTask
  };

})();
