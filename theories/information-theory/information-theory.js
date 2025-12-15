/**
 * Information Theory - Interactive Demos
 * Shannon entropy, text analysis, compression, and binary search
 */

(function() {
  'use strict';

  // ============================================
  // Shannon Entropy Calculator
  // ============================================
  const EntropyCalculator = {
    slider: null,
    probDisplay: null,
    entropyValue: null,
    predictabilityValue: null,
    headsBar: null,
    tailsBar: null,

    init() {
      this.slider = document.getElementById('entropy-prob');
      this.probDisplay = document.querySelector('.prob-display');
      this.entropyValue = document.querySelector('.entropy-value');
      this.predictabilityValue = document.querySelector('.predictability-value');
      this.headsBar = document.querySelector('.heads-bar .bar-fill');
      this.tailsBar = document.querySelector('.tails-bar .bar-fill');

      if (!this.slider) return;

      this.bindEvents();
      this.update();
    },

    bindEvents() {
      this.slider.addEventListener('input', () => this.update());
    },

    // Calculate binary entropy
    binaryEntropy(p) {
      if (p <= 0 || p >= 1) return 0;
      return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
    },

    update() {
      const prob = parseInt(this.slider.value) / 100;
      const entropy = this.binaryEntropy(prob);
      const predictability = (1 - entropy) * 100;

      this.probDisplay.textContent = `${Math.round(prob * 100)}%`;
      this.entropyValue.textContent = entropy.toFixed(2);
      this.predictabilityValue.textContent = `${Math.round(predictability)}%`;

      // Update bars
      this.headsBar.style.height = `${prob * 100}%`;
      this.tailsBar.style.height = `${(1 - prob) * 100}%`;
    }
  };

  // ============================================
  // Text Entropy Analysis
  // ============================================
  const TextAnalysis = {
    textarea: null,
    charCount: null,
    uniqueCount: null,
    textEntropy: null,
    totalInfo: null,
    freqBars: null,

    init() {
      this.textarea = document.getElementById('text-input');
      this.charCount = document.querySelector('.char-count');
      this.uniqueCount = document.querySelector('.unique-count');
      this.textEntropy = document.querySelector('.text-entropy');
      this.totalInfo = document.querySelector('.total-info');
      this.freqBars = document.querySelector('.freq-bars');

      if (!this.textarea) return;

      this.bindEvents();
      this.analyze();
    },

    bindEvents() {
      this.textarea.addEventListener('input', () => this.analyze());
    },

    calculateEntropy(text) {
      if (!text.length) return 0;

      const freq = {};
      for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
      }

      let entropy = 0;
      const len = text.length;
      for (const char in freq) {
        const p = freq[char] / len;
        entropy -= p * Math.log2(p);
      }

      return entropy;
    },

    getFrequencies(text) {
      const freq = {};
      for (const char of text) {
        freq[char] = (freq[char] || 0) + 1;
      }
      return freq;
    },

    analyze() {
      const text = this.textarea.value;
      const len = text.length;
      const freq = this.getFrequencies(text);
      const unique = Object.keys(freq).length;
      const entropy = this.calculateEntropy(text);
      const totalBits = entropy * len;

      this.charCount.textContent = len;
      this.uniqueCount.textContent = unique;
      this.textEntropy.textContent = entropy.toFixed(2);
      this.totalInfo.textContent = Math.round(totalBits);

      this.renderFrequencyBars(freq, len);
    },

    renderFrequencyBars(freq, total) {
      if (!total) {
        this.freqBars.innerHTML = '<p style="font-size: var(--text-sm); color: var(--color-text-muted);">Enter text to see frequencies</p>';
        return;
      }

      // Sort by frequency descending
      const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20); // Show top 20

      const maxCount = sorted[0]?.[1] || 1;

      this.freqBars.innerHTML = sorted.map(([char, count]) => {
        const height = (count / maxCount) * 60;
        const displayChar = char === ' ' ? '␣' : char;
        return `
          <div class="freq-bar">
            <div class="freq-bar-fill" style="height: ${height}px;"></div>
            <span class="freq-char">${displayChar}</span>
          </div>
        `;
      }).join('');
    }
  };

  // ============================================
  // Compression Visualizer
  // ============================================
  const CompressionDemo = {
    input: null,
    originalBits: null,
    originalSize: null,
    rleEncoded: null,
    rleSize: null,
    huffmanEncoded: null,
    huffmanSize: null,
    compressionRatio: null,
    theoreticalMin: null,

    init() {
      this.input = document.getElementById('compression-input');
      this.originalBits = document.querySelector('.original-bits');
      this.originalSize = document.querySelector('.original-size');
      this.rleEncoded = document.querySelector('.rle-encoded');
      this.rleSize = document.querySelector('.rle-size');
      this.huffmanEncoded = document.querySelector('.huffman-encoded');
      this.huffmanSize = document.querySelector('.huffman-size');
      this.compressionRatio = document.querySelector('.compression-ratio');
      this.theoreticalMin = document.querySelector('.theoretical-min');

      if (!this.input) return;

      this.bindEvents();
      this.update();
    },

    bindEvents() {
      this.input.addEventListener('input', () => this.update());
    },

    // Run-length encoding
    rle(str) {
      if (!str) return '';
      let result = '';
      let count = 1;
      let current = str[0];

      for (let i = 1; i <= str.length; i++) {
        if (str[i] === current) {
          count++;
        } else {
          result += count > 1 ? `${current}${count}` : current;
          current = str[i];
          count = 1;
        }
      }

      return result;
    },

    // Simple Huffman-like encoding (variable length codes)
    huffmanEncode(str) {
      if (!str) return { encoded: '', codes: {} };

      // Count frequencies
      const freq = {};
      for (const char of str) {
        freq[char] = (freq[char] || 0) + 1;
      }

      // Sort by frequency (most common = shortest code)
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);

      // Assign codes (simplified - just increasing length)
      const codes = {};
      sorted.forEach(([char], i) => {
        // Generate prefix-free codes of increasing length
        const codeLength = Math.floor(Math.log2(i + 1)) + 1;
        codes[char] = (i).toString(2).padStart(codeLength, '0');
      });

      // Encode the string
      let encoded = '';
      for (const char of str) {
        encoded += codes[char];
      }

      return { encoded, codes };
    },

    calculateEntropy(str) {
      if (!str.length) return 0;

      const freq = {};
      for (const char of str) {
        freq[char] = (freq[char] || 0) + 1;
      }

      let entropy = 0;
      const len = str.length;
      for (const char in freq) {
        const p = freq[char] / len;
        entropy -= p * Math.log2(p);
      }

      return entropy;
    },

    update() {
      const str = this.input.value;
      const originalBits = str.length * 8;

      // Original
      this.originalBits.textContent = str.length > 20
        ? str.substring(0, 20) + '...'
        : str;
      this.originalSize.textContent = `${originalBits} bits (${str.length} chars × 8 bits)`;

      // RLE
      const rleResult = this.rle(str);
      this.rleEncoded.textContent = rleResult.length > 30
        ? rleResult.substring(0, 30) + '...'
        : rleResult;
      const rleBits = rleResult.length * 8;
      this.rleSize.textContent = `${rleBits} bits (${rleResult.length} chars)`;

      // Huffman
      const { encoded: huffEncoded } = this.huffmanEncode(str);
      this.huffmanEncoded.textContent = huffEncoded.length > 40
        ? huffEncoded.substring(0, 40) + '...'
        : huffEncoded;
      this.huffmanSize.textContent = `${huffEncoded.length} bits`;

      // Calculate compression ratio
      if (originalBits > 0) {
        const bestCompressed = Math.min(rleBits, huffEncoded.length);
        const ratio = ((originalBits - bestCompressed) / originalBits * 100).toFixed(1);
        this.compressionRatio.textContent = `${ratio}% smaller`;

        const entropy = this.calculateEntropy(str);
        const theoreticalBits = Math.ceil(entropy * str.length);
        this.theoreticalMin.textContent = `~${theoreticalBits} bits`;
      } else {
        this.compressionRatio.textContent = '--';
        this.theoreticalMin.textContent = '--';
      }
    }
  };

  // ============================================
  // Twenty Questions Game
  // ============================================
  const GuessingGame = {
    rangeSlider: null,
    rangeDisplay: null,
    maxNum: null,
    possibilitiesCount: null,
    questionsNeeded: null,
    bitsNeeded: null,
    startBtn: null,
    gamePlay: null,
    gameResult: null,
    rangeText: null,
    pivot: null,
    answerNo: null,
    answerYes: null,
    questionsAsked: null,
    resultMessage: null,
    playAgainBtn: null,

    // Game state
    low: 1,
    high: 128,
    target: null,
    questions: 0,

    init() {
      this.rangeSlider = document.getElementById('range-size');
      this.rangeDisplay = document.querySelector('.range-display');
      this.maxNum = document.querySelector('.max-num');
      this.possibilitiesCount = document.querySelector('.possibilities-count');
      this.questionsNeeded = document.querySelector('.questions-needed');
      this.bitsNeeded = document.querySelector('.bits-needed');
      this.startBtn = document.querySelector('.start-game-btn');
      this.gamePlay = document.querySelector('.game-play');
      this.gameResult = document.querySelector('.game-result');
      this.rangeText = document.querySelector('.range-text');
      this.pivot = document.querySelector('.pivot');
      this.answerNo = document.querySelector('.answer-no');
      this.answerYes = document.querySelector('.answer-yes');
      this.questionsAsked = document.querySelector('.questions-asked');
      this.resultMessage = document.querySelector('.result-message');
      this.playAgainBtn = document.querySelector('.play-again-btn');

      if (!this.rangeSlider) return;

      this.bindEvents();
      this.updateRange();
    },

    bindEvents() {
      this.rangeSlider.addEventListener('input', () => this.updateRange());
      this.startBtn.addEventListener('click', () => this.startGame());
      this.answerNo?.addEventListener('click', () => this.answer(false));
      this.answerYes?.addEventListener('click', () => this.answer(true));
      this.playAgainBtn?.addEventListener('click', () => this.startGame());
    },

    updateRange() {
      const power = parseInt(this.rangeSlider.value);
      const max = Math.pow(2, power);

      this.high = max;
      this.rangeDisplay.textContent = `Range: 1-${max}`;
      this.maxNum.textContent = max;
      this.possibilitiesCount.textContent = max;
      this.questionsNeeded.textContent = power;
      this.bitsNeeded.textContent = power;
    },

    startGame() {
      const max = this.high;
      this.low = 1;
      this.target = Math.floor(Math.random() * max) + 1;
      this.questions = 0;

      this.startBtn.style.display = 'none';
      this.gameResult.style.display = 'none';
      this.gamePlay.style.display = 'block';

      this.updateGameDisplay();
    },

    updateGameDisplay() {
      this.rangeText.textContent = `${this.low}-${this.high}`;
      const mid = Math.floor((this.low + this.high) / 2);
      this.pivot.textContent = mid;
      this.questionsAsked.textContent = this.questions;
    },

    answer(isHigher) {
      const mid = Math.floor((this.low + this.high) / 2);
      this.questions++;

      if (isHigher) {
        this.low = mid + 1;
      } else {
        this.high = mid;
      }

      if (this.low === this.high) {
        this.endGame();
      } else {
        this.updateGameDisplay();
      }
    },

    endGame() {
      this.gamePlay.style.display = 'none';
      this.gameResult.style.display = 'block';

      const found = this.low;
      const correct = found === this.target;
      const optimal = Math.ceil(Math.log2(this.high));

      if (correct) {
        this.resultMessage.innerHTML = `
          Found it: <strong>${found}</strong>!<br>
          Used ${this.questions} questions (optimal: ${optimal})
        `;
      } else {
        this.resultMessage.innerHTML = `
          Guessed: ${found}, but the number was ${this.target}.<br>
          Something went wrong!
        `;
      }
    }
  };

  // ============================================
  // Initialize all demos
  // ============================================
  function init() {
    EntropyCalculator.init();
    TextAnalysis.init();
    CompressionDemo.init();
    GuessingGame.init();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.TIP = window.TIP || {};
  window.TIP.InformationTheory = {
    EntropyCalculator,
    TextAnalysis,
    CompressionDemo,
    GuessingGame
  };
})();
