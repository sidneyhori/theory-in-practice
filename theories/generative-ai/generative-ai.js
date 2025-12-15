// Generative AI & Neural Networks Interactive Components

(function() {
  // ===== Single Neuron Simulator =====
  const neuronSim = {
    inputs: [0.5, 0.3, 0.8],
    weights: [0.5, -0.3, 0.7],

    init() {
      this.bindEvents();
      this.update();
    },

    bindEvents() {
      document.querySelectorAll('.input-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
          const idx = parseInt(e.target.dataset.input) - 1;
          this.inputs[idx] = parseInt(e.target.value) / 100;
          document.querySelector(`.i${idx + 1}-display`).textContent = this.inputs[idx].toFixed(1);
          this.update();
        });
      });

      document.querySelectorAll('.weight-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
          const idx = parseInt(e.target.dataset.weight) - 1;
          this.weights[idx] = parseInt(e.target.value) / 100;
          document.querySelector(`.w${idx + 1}-display`).textContent = this.weights[idx].toFixed(1);
          this.update();
        });
      });
    },

    sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    },

    relu(x) {
      return Math.max(0, x);
    },

    update() {
      // Calculate weighted sum
      let sum = 0;
      for (let i = 0; i < 3; i++) {
        sum += this.inputs[i] * this.weights[i];
      }

      // Apply ReLU activation (simpler for visualization)
      const output = this.relu(sum);

      // Update display
      document.querySelectorAll('.input-node').forEach((node, i) => {
        node.querySelector('.node-value').textContent = this.inputs[i].toFixed(1);
      });

      document.querySelector('.w1-label').textContent = `w1: ${this.weights[0].toFixed(1)}`;
      document.querySelector('.w2-label').textContent = `w2: ${this.weights[1].toFixed(1)}`;
      document.querySelector('.w3-label').textContent = `w3: ${this.weights[2].toFixed(1)}`;

      document.querySelector('.neuron-sum').textContent = `Σ = ${sum.toFixed(2)}`;
      document.querySelector('.output-value').textContent = output.toFixed(2);

      document.querySelector('.math-sum').textContent = sum.toFixed(2);
      document.querySelector('.math-output').textContent = output.toFixed(2);
    }
  };

  // ===== Next Token Predictor =====
  const tokenPredictor = {
    temperature: 0.7,
    prompts: {
      fox: {
        text: 'The quick brown fox',
        predictions: [
          { word: 'jumps', prob: 0.45 },
          { word: 'runs', prob: 0.25 },
          { word: 'leaps', prob: 0.15 },
          { word: 'is', prob: 0.10 },
          { word: 'ran', prob: 0.05 }
        ]
      },
      weather: {
        text: 'The weather today is',
        predictions: [
          { word: 'sunny', prob: 0.30 },
          { word: 'cloudy', prob: 0.25 },
          { word: 'cold', prob: 0.20 },
          { word: 'perfect', prob: 0.15 },
          { word: 'terrible', prob: 0.10 }
        ]
      },
      code: {
        text: 'def calculate_sum(',
        predictions: [
          { word: 'numbers', prob: 0.35 },
          { word: 'a', prob: 0.25 },
          { word: 'list', prob: 0.20 },
          { word: 'arr', prob: 0.12 },
          { word: 'self', prob: 0.08 }
        ]
      },
      story: {
        text: 'Once upon a time',
        predictions: [
          { word: 'there', prob: 0.50 },
          { word: 'in', prob: 0.20 },
          { word: ',', prob: 0.15 },
          { word: 'a', prob: 0.10 },
          { word: 'lived', prob: 0.05 }
        ]
      },
      science: {
        text: 'The speed of light',
        predictions: [
          { word: 'is', prob: 0.45 },
          { word: 'in', prob: 0.20 },
          { word: 'travels', prob: 0.15 },
          { word: 'equals', prob: 0.12 },
          { word: 'remains', prob: 0.08 }
        ]
      }
    },
    currentPrompt: 'fox',
    generatedText: '',

    init() {
      this.generatedText = this.prompts[this.currentPrompt].text;
      this.bindEvents();
      this.update();
    },

    bindEvents() {
      document.getElementById('temperature-slider')?.addEventListener('input', (e) => {
        this.temperature = parseInt(e.target.value) / 10;
        document.querySelector('.temp-value').textContent = this.temperature.toFixed(1);
        this.update();
      });

      document.getElementById('prompt-select')?.addEventListener('change', (e) => {
        this.currentPrompt = e.target.value;
        this.generatedText = this.prompts[this.currentPrompt].text;
        this.update();
      });

      document.querySelector('.sample-btn')?.addEventListener('click', () => this.sample());

      document.querySelectorAll('.prediction-item').forEach(item => {
        item.addEventListener('click', () => {
          const word = item.dataset.word;
          this.selectWord(word);
        });
      });
    },

    softmax(probs, temperature) {
      // Apply temperature to probabilities
      const scaled = probs.map(p => Math.pow(p, 1 / temperature));
      const sum = scaled.reduce((a, b) => a + b, 0);
      return scaled.map(p => p / sum);
    },

    update() {
      const prompt = this.prompts[this.currentPrompt];
      document.querySelector('.prompt-text').textContent = prompt.text;
      document.querySelector('.generated-content').textContent = this.generatedText;

      // Apply temperature to predictions
      const baseProbs = prompt.predictions.map(p => p.prob);
      const adjustedProbs = this.softmax(baseProbs, this.temperature);

      // Update prediction bars
      const items = document.querySelectorAll('.prediction-item');
      items.forEach((item, i) => {
        if (i < prompt.predictions.length) {
          const pred = prompt.predictions[i];
          const adjustedProb = adjustedProbs[i];

          item.style.display = 'grid';
          item.dataset.word = pred.word;
          item.querySelector('.prediction-word').textContent = pred.word;
          item.querySelector('.prediction-fill').style.width = (adjustedProb * 100) + '%';
          item.querySelector('.prediction-prob').textContent = Math.round(adjustedProb * 100) + '%';
        } else {
          item.style.display = 'none';
        }
      });
    },

    sample() {
      const prompt = this.prompts[this.currentPrompt];
      const baseProbs = prompt.predictions.map(p => p.prob);
      const adjustedProbs = this.softmax(baseProbs, this.temperature);

      // Weighted random selection
      const rand = Math.random();
      let cumulative = 0;
      let selectedWord = prompt.predictions[0].word;

      for (let i = 0; i < adjustedProbs.length; i++) {
        cumulative += adjustedProbs[i];
        if (rand < cumulative) {
          selectedWord = prompt.predictions[i].word;
          break;
        }
      }

      this.selectWord(selectedWord);
    },

    selectWord(word) {
      // Highlight selected
      document.querySelectorAll('.prediction-item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.word === word) {
          item.classList.add('selected');
        }
      });

      // Add to generated text
      this.generatedText += ' ' + word;
      document.querySelector('.generated-content').textContent = this.generatedText;
    }
  };

  // ===== Attention Visualizer =====
  const attention = {
    canvas: null,
    ctx: null,
    words: ['The', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'soft'],
    selectedIdx: -1,

    // Simulated attention patterns (which words attend to which)
    attentionPatterns: {
      0: { 1: 0.3, 2: 0.2 }, // "The" -> cat, sat
      1: { 0: 0.4, 2: 0.3, 5: 0.2 }, // "cat" -> The, sat, mat
      2: { 1: 0.5, 3: 0.2, 5: 0.3 }, // "sat" -> cat, on, mat
      3: { 2: 0.3, 4: 0.2, 5: 0.4 }, // "on" -> sat, the, mat
      4: { 3: 0.2, 5: 0.5 }, // "the" -> on, mat
      5: { 1: 0.3, 2: 0.2, 4: 0.4 }, // "mat" -> cat, sat, the
      6: { 1: 0.3, 5: 0.2, 7: 0.4 }, // "because" -> cat, mat, it
      7: { 1: 0.8, 5: 0.15 }, // "it" -> cat (strong), mat
      8: { 7: 0.5, 9: 0.4 }, // "was" -> it, soft
      9: { 5: 0.6, 8: 0.3 } // "soft" -> mat, was
    },

    init() {
      this.canvas = document.getElementById('attention-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.bindEvents();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    },

    bindEvents() {
      document.querySelectorAll('.attention-word').forEach(word => {
        word.addEventListener('click', () => {
          const idx = parseInt(word.dataset.idx);
          this.selectWord(idx);
        });
      });

      window.addEventListener('resize', () => {
        this.resizeCanvas();
        if (this.selectedIdx >= 0) {
          this.drawAttention();
        }
      });
    },

    selectWord(idx) {
      this.selectedIdx = idx;

      // Update word highlighting
      document.querySelectorAll('.attention-word').forEach(word => {
        const wordIdx = parseInt(word.dataset.idx);
        word.classList.remove('selected', 'attended');

        if (wordIdx === idx) {
          word.classList.add('selected');
        } else if (this.attentionPatterns[idx] && this.attentionPatterns[idx][wordIdx]) {
          word.classList.add('attended');
        }
      });

      // Update info text
      const pattern = this.attentionPatterns[idx];
      if (pattern) {
        const attendedWords = Object.entries(pattern)
          .sort((a, b) => b[1] - a[1])
          .map(([i, strength]) => `${this.words[i]} (${Math.round(strength * 100)}%)`)
          .join(', ');
        document.querySelector('.attention-info').innerHTML =
          `"<strong>${this.words[idx]}</strong>" attends to: ${attendedWords}`;
      } else {
        document.querySelector('.attention-info').innerHTML =
          `"<strong>${this.words[idx]}</strong>" has minimal attention to other words`;
      }

      this.drawAttention();
    },

    drawAttention() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();

      // Clear
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      if (this.selectedIdx < 0) return;

      const pattern = this.attentionPatterns[this.selectedIdx];
      if (!pattern) return;

      // Get word positions
      const wordElements = document.querySelectorAll('.attention-word');
      const positions = [];
      const containerRect = document.querySelector('.attention-sentence').getBoundingClientRect();

      wordElements.forEach(el => {
        const elRect = el.getBoundingClientRect();
        positions.push({
          x: elRect.left - containerRect.left + elRect.width / 2,
          y: elRect.bottom - containerRect.top
        });
      });

      // Scale to canvas
      const scaleX = rect.width / containerRect.width;
      const canvasBottom = 10;

      // Draw attention lines
      const fromPos = positions[this.selectedIdx];
      const fromX = fromPos.x * scaleX;
      const fromY = canvasBottom;

      Object.entries(pattern).forEach(([toIdx, strength]) => {
        const toPos = positions[parseInt(toIdx)];
        const toX = toPos.x * scaleX;
        const toY = canvasBottom;

        // Draw curved line
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);

        const midX = (fromX + toX) / 2;
        const midY = rect.height - 10;

        this.ctx.quadraticCurveTo(midX, midY, toX, toY);

        this.ctx.strokeStyle = `rgba(16, 185, 129, ${strength})`;
        this.ctx.lineWidth = strength * 6 + 1;
        this.ctx.stroke();
      });
    }
  };

  // ===== Initialize =====
  function init() {
    neuronSim.init();
    tokenPredictor.init();
    attention.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIP = window.TIP || {};
  window.TIP.generativeAI = { neuronSim, tokenPredictor, attention };
})();
