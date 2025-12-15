/**
 * Algorithms & Complexity - Interactive Demos
 * Big O visualization, sorting algorithms, and search comparison
 */

(function() {
  'use strict';

  // ============================================
  // Big O Growth Rate Visualizer
  // ============================================
  const BigOVisualizer = {
    slider: null,
    nDisplay: null,
    bars: null,

    init() {
      this.slider = document.getElementById('bigo-n');
      this.nDisplay = document.querySelector('.n-display');
      this.bars = document.querySelectorAll('.complexity-bar');

      if (!this.slider) return;

      this.bindEvents();
      this.update();
    },

    bindEvents() {
      this.slider.addEventListener('input', () => this.update());
    },

    calculateComplexities(n) {
      return {
        '1': 1,
        'logn': Math.log2(n),
        'n': n,
        'nlogn': n * Math.log2(n),
        'n2': n * n,
        '2n': Math.min(Math.pow(2, n), 1e15) // Cap at a large number
      };
    },

    update() {
      const n = parseInt(this.slider.value);
      this.nDisplay.textContent = n;

      const complexities = this.calculateComplexities(n);
      const maxValue = Math.max(...Object.values(complexities).filter(v => v < 1e10));

      this.bars.forEach(bar => {
        const type = bar.dataset.complexity;
        const value = complexities[type];
        const fill = bar.querySelector('.bar-fill');
        const valueDisplay = bar.querySelector('.bar-value');

        // Calculate height as percentage of max (with log scale for large values)
        let height;
        if (value > maxValue * 10) {
          height = 100; // Max out for exponential
        } else {
          height = Math.max(2, (value / maxValue) * 100);
        }

        fill.style.height = `${Math.min(height, 100)}%`;

        // Format display value
        if (value >= 1e12) {
          valueDisplay.textContent = value.toExponential(1);
        } else if (value >= 1e6) {
          valueDisplay.textContent = (value / 1e6).toFixed(1) + 'M';
        } else if (value >= 1000) {
          valueDisplay.textContent = (value / 1000).toFixed(1) + 'K';
        } else {
          valueDisplay.textContent = Math.round(value);
        }
      });
    }
  };

  // ============================================
  // Sorting Visualizer
  // ============================================
  const SortingVisualizer = {
    container: null,
    sizeSlider: null,
    speedSlider: null,
    sizeDisplay: null,
    comparisonsDisplay: null,
    swapsDisplay: null,
    statusDisplay: null,
    shuffleBtn: null,
    stopBtn: null,
    algorithmBtns: null,

    array: [],
    comparisons: 0,
    swaps: 0,
    isSorting: false,
    shouldStop: false,

    init() {
      this.container = document.getElementById('sort-bars');
      this.sizeSlider = document.getElementById('array-size');
      this.speedSlider = document.getElementById('sort-speed');
      this.sizeDisplay = document.querySelector('.size-display');
      this.comparisonsDisplay = document.querySelector('.comparisons-count');
      this.swapsDisplay = document.querySelector('.swaps-count');
      this.statusDisplay = document.querySelector('.sort-status');
      this.shuffleBtn = document.querySelector('.shuffle-btn');
      this.stopBtn = document.querySelector('.stop-btn');
      this.algorithmBtns = document.querySelectorAll('.algorithm-btn');

      if (!this.container) return;

      this.bindEvents();
      this.createArray();
    },

    bindEvents() {
      this.sizeSlider.addEventListener('input', () => {
        this.sizeDisplay.textContent = this.sizeSlider.value;
        if (!this.isSorting) this.createArray();
      });

      this.shuffleBtn.addEventListener('click', () => {
        if (!this.isSorting) this.shuffle();
      });

      this.stopBtn.addEventListener('click', () => {
        this.shouldStop = true;
      });

      this.algorithmBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (this.isSorting) return;
          this.algorithmBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.runAlgorithm(btn.dataset.algorithm);
        });
      });
    },

    createArray() {
      const size = parseInt(this.sizeSlider.value);
      this.array = Array.from({ length: size }, (_, i) => i + 1);
      this.shuffle();
    },

    shuffle() {
      for (let i = this.array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
      }
      this.comparisons = 0;
      this.swaps = 0;
      this.updateStats();
      this.render();
    },

    getDelay() {
      const speed = parseInt(this.speedSlider.value);
      return Math.max(5, 200 - speed * 2);
    },

    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms || this.getDelay()));
    },

    render(highlights = {}) {
      const maxValue = Math.max(...this.array);
      this.container.innerHTML = this.array.map((value, index) => {
        const height = (value / maxValue) * 100;
        let className = 'sort-bar';
        if (highlights.comparing?.includes(index)) className += ' comparing';
        if (highlights.swapping?.includes(index)) className += ' swapping';
        if (highlights.sorted?.includes(index)) className += ' sorted';
        if (highlights.pivot === index) className += ' pivot';
        return `<div class="${className}" style="height: ${height}%;"></div>`;
      }).join('');
    },

    updateStats() {
      this.comparisonsDisplay.textContent = this.comparisons;
      this.swapsDisplay.textContent = this.swaps;
    },

    async runAlgorithm(name) {
      if (this.isSorting) return;

      this.isSorting = true;
      this.shouldStop = false;
      this.comparisons = 0;
      this.swaps = 0;
      this.statusDisplay.textContent = 'Sorting...';

      switch (name) {
        case 'bubble': await this.bubbleSort(); break;
        case 'selection': await this.selectionSort(); break;
        case 'insertion': await this.insertionSort(); break;
        case 'merge': await this.mergeSort(); break;
        case 'quick': await this.quickSort(); break;
      }

      if (!this.shouldStop) {
        this.render({ sorted: this.array.map((_, i) => i) });
        this.statusDisplay.textContent = 'Done!';
      } else {
        this.statusDisplay.textContent = 'Stopped';
      }

      this.isSorting = false;
    },

    async bubbleSort() {
      const n = this.array.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          if (this.shouldStop) return;

          this.comparisons++;
          this.render({ comparing: [j, j + 1] });
          await this.sleep();

          if (this.array[j] > this.array[j + 1]) {
            [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
            this.swaps++;
            this.render({ swapping: [j, j + 1] });
            await this.sleep();
          }
          this.updateStats();
        }
      }
    },

    async selectionSort() {
      const n = this.array.length;
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          if (this.shouldStop) return;

          this.comparisons++;
          this.render({ comparing: [minIdx, j], sorted: Array.from({ length: i }, (_, k) => k) });
          await this.sleep();

          if (this.array[j] < this.array[minIdx]) {
            minIdx = j;
          }
          this.updateStats();
        }

        if (minIdx !== i) {
          [this.array[i], this.array[minIdx]] = [this.array[minIdx], this.array[i]];
          this.swaps++;
          this.render({ swapping: [i, minIdx] });
          await this.sleep();
          this.updateStats();
        }
      }
    },

    async insertionSort() {
      const n = this.array.length;
      for (let i = 1; i < n; i++) {
        const key = this.array[i];
        let j = i - 1;

        while (j >= 0) {
          if (this.shouldStop) return;

          this.comparisons++;
          this.render({ comparing: [j, j + 1] });
          await this.sleep();

          if (this.array[j] > key) {
            this.array[j + 1] = this.array[j];
            this.swaps++;
            this.render({ swapping: [j, j + 1] });
            await this.sleep();
            j--;
          } else {
            break;
          }
          this.updateStats();
        }
        this.array[j + 1] = key;
      }
    },

    async mergeSort(start = 0, end = this.array.length - 1) {
      if (start >= end || this.shouldStop) return;

      const mid = Math.floor((start + end) / 2);
      await this.mergeSort(start, mid);
      await this.mergeSort(mid + 1, end);
      await this.merge(start, mid, end);
    },

    async merge(start, mid, end) {
      const left = this.array.slice(start, mid + 1);
      const right = this.array.slice(mid + 1, end + 1);

      let i = 0, j = 0, k = start;

      while (i < left.length && j < right.length) {
        if (this.shouldStop) return;

        this.comparisons++;
        this.render({ comparing: [start + i, mid + 1 + j] });
        await this.sleep();

        if (left[i] <= right[j]) {
          this.array[k] = left[i];
          i++;
        } else {
          this.array[k] = right[j];
          j++;
        }
        this.swaps++;
        k++;
        this.updateStats();
        this.render();
        await this.sleep();
      }

      while (i < left.length) {
        if (this.shouldStop) return;
        this.array[k] = left[i];
        i++;
        k++;
        this.render();
        await this.sleep();
      }

      while (j < right.length) {
        if (this.shouldStop) return;
        this.array[k] = right[j];
        j++;
        k++;
        this.render();
        await this.sleep();
      }
    },

    async quickSort(low = 0, high = this.array.length - 1) {
      if (low < high && !this.shouldStop) {
        const pi = await this.partition(low, high);
        await this.quickSort(low, pi - 1);
        await this.quickSort(pi + 1, high);
      }
    },

    async partition(low, high) {
      const pivot = this.array[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        if (this.shouldStop) return low;

        this.comparisons++;
        this.render({ comparing: [j, high], pivot: high });
        await this.sleep();

        if (this.array[j] < pivot) {
          i++;
          [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
          this.swaps++;
          this.render({ swapping: [i, j], pivot: high });
          await this.sleep();
        }
        this.updateStats();
      }

      [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
      this.swaps++;
      this.updateStats();
      return i + 1;
    }
  };

  // ============================================
  // Search Comparison
  // ============================================
  const SearchComparison = {
    container: null,
    sizeSlider: null,
    sizeDisplay: null,
    targetDisplay: null,
    searchBtn: null,
    worstBtn: null,
    linearSteps: null,
    binarySteps: null,
    linearResult: null,
    binaryResult: null,

    array: [],
    isSearching: false,

    init() {
      this.container = document.getElementById('search-array');
      this.sizeSlider = document.getElementById('search-size');
      this.sizeDisplay = document.querySelector('.search-size-display');
      this.targetDisplay = document.querySelector('.target-value');
      this.searchBtn = document.querySelector('.search-btn');
      this.worstBtn = document.querySelector('.search-worst-btn');
      this.linearSteps = document.querySelector('.linear-panel .steps-count');
      this.binarySteps = document.querySelector('.binary-panel .steps-count');
      this.linearResult = document.querySelector('.linear-panel .search-result');
      this.binaryResult = document.querySelector('.binary-panel .search-result');

      if (!this.container) return;

      this.bindEvents();
      this.createArray();
    },

    bindEvents() {
      this.sizeSlider.addEventListener('input', () => {
        this.sizeDisplay.textContent = this.sizeSlider.value;
        this.createArray();
      });

      this.searchBtn.addEventListener('click', () => {
        if (!this.isSearching) {
          const target = this.array[Math.floor(Math.random() * this.array.length)];
          this.search(target);
        }
      });

      this.worstBtn.addEventListener('click', () => {
        if (!this.isSearching) {
          // Worst case for linear search is last element
          // Worst case for binary can be first or last
          const target = this.array[this.array.length - 1];
          this.search(target);
        }
      });
    },

    createArray() {
      const size = parseInt(this.sizeSlider.value);
      this.array = Array.from({ length: size }, (_, i) => i + 1);
      this.render();
      this.reset();
    },

    render(linearHighlights = {}, binaryHighlights = {}) {
      this.container.innerHTML = this.array.map((value, index) => {
        let className = 'array-item';
        if (linearHighlights.current === index) className += ' checked';
        if (binaryHighlights.current === index) className += ' current';
        if (binaryHighlights.eliminated?.includes(index)) className += ' eliminated';
        if (linearHighlights.found === index || binaryHighlights.found === index) {
          className += ' found';
        }
        return `<div class="${className}">${value}</div>`;
      }).join('');
    },

    reset() {
      this.targetDisplay.textContent = '--';
      this.linearSteps.textContent = '0';
      this.binarySteps.textContent = '0';
      this.linearResult.textContent = '--';
      this.binaryResult.textContent = '--';
    },

    async sleep(ms = 300) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    async search(target) {
      this.isSearching = true;
      this.reset();
      this.targetDisplay.textContent = target;

      // Run both searches in parallel (visually)
      await Promise.all([
        this.linearSearch(target),
        this.binarySearch(target)
      ]);

      this.isSearching = false;
    },

    async linearSearch(target) {
      let steps = 0;

      for (let i = 0; i < this.array.length; i++) {
        steps++;
        this.linearSteps.textContent = steps;

        // Update visualization
        const items = this.container.querySelectorAll('.array-item');
        items.forEach((item, idx) => {
          item.classList.remove('checked', 'found');
          if (idx === i) item.classList.add('checked');
        });

        await this.sleep(150);

        if (this.array[i] === target) {
          items[i].classList.remove('checked');
          items[i].classList.add('found');
          this.linearResult.textContent = `Found at index ${i}`;
          return i;
        }
      }

      this.linearResult.textContent = 'Not found';
      return -1;
    },

    async binarySearch(target) {
      let low = 0;
      let high = this.array.length - 1;
      let steps = 0;
      const eliminated = new Set();

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        steps++;
        this.binarySteps.textContent = steps;

        // Update visualization
        const items = this.container.querySelectorAll('.array-item');
        items.forEach((item, idx) => {
          item.classList.remove('current', 'found', 'eliminated');
          if (eliminated.has(idx)) item.classList.add('eliminated');
          if (idx === mid) item.classList.add('current');
        });

        await this.sleep(400);

        if (this.array[mid] === target) {
          items[mid].classList.remove('current');
          items[mid].classList.add('found');
          this.binaryResult.textContent = `Found at index ${mid}`;
          return mid;
        }

        if (this.array[mid] < target) {
          // Eliminate lower half
          for (let i = low; i <= mid; i++) eliminated.add(i);
          low = mid + 1;
        } else {
          // Eliminate upper half
          for (let i = mid; i <= high; i++) eliminated.add(i);
          high = mid - 1;
        }
      }

      this.binaryResult.textContent = 'Not found';
      return -1;
    }
  };

  // ============================================
  // Initialize all demos
  // ============================================
  function init() {
    BigOVisualizer.init();
    SortingVisualizer.init();
    SearchComparison.init();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.TIP = window.TIP || {};
  window.TIP.Algorithms = {
    BigOVisualizer,
    SortingVisualizer,
    SearchComparison
  };
})();
