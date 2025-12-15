// Probability Interactive Components

(function() {
  // ===== Coin Flip Simulator =====
  const coinSimulator = {
    totalFlips: 0,
    headsCount: 0,
    history: [],

    init() {
      this.coin = document.getElementById('coin');
      this.totalFlipsEl = document.getElementById('total-flips');
      this.headsCountEl = document.getElementById('heads-count');
      this.headsPercentEl = document.getElementById('heads-percent');
      this.chartEl = document.getElementById('coin-chart');

      document.getElementById('flip-one')?.addEventListener('click', () => this.flip(1));
      document.getElementById('flip-ten')?.addEventListener('click', () => this.flip(10));
      document.getElementById('flip-hundred')?.addEventListener('click', () => this.flip(100));
      document.getElementById('reset-coins')?.addEventListener('click', () => this.reset());
    },

    flip(count) {
      const flipOne = (index) => {
        if (index >= count) return;

        const isHeads = Math.random() < 0.5;
        this.totalFlips++;
        if (isHeads) this.headsCount++;

        // Store running percentage for chart
        this.history.push(this.headsCount / this.totalFlips);

        // Animate coin for single flips
        if (count === 1 && this.coin) {
          this.coin.classList.add('flipping');
          setTimeout(() => {
            this.coin.classList.remove('flipping');
            this.coin.classList.remove('heads', 'tails');
            this.coin.classList.add(isHeads ? 'heads' : 'tails');
          }, 300);
        }

        this.updateDisplay();

        if (count > 1) {
          setTimeout(() => flipOne(index + 1), count > 50 ? 5 : 20);
        }
      };

      flipOne(0);
    },

    updateDisplay() {
      if (this.totalFlipsEl) this.totalFlipsEl.textContent = this.totalFlips;
      if (this.headsCountEl) this.headsCountEl.textContent = this.headsCount;
      if (this.headsPercentEl) {
        const percent = this.totalFlips > 0 ? (this.headsCount / this.totalFlips * 100).toFixed(1) : 0;
        this.headsPercentEl.textContent = percent + '%';
      }

      this.updateChart();
    },

    updateChart() {
      if (!this.chartEl) return;

      // Show last 100 data points
      const data = this.history.slice(-100);
      if (data.length === 0) {
        this.chartEl.innerHTML = '';
        return;
      }

      const bars = data.map((percent, i) => {
        const height = Math.max(5, percent * 100);
        const isBelow = percent < 0.5;
        return `<div class="chart-bar ${isBelow ? 'below' : ''}" style="height: ${height}%"></div>`;
      }).join('');

      this.chartEl.innerHTML = bars;
    },

    reset() {
      this.totalFlips = 0;
      this.headsCount = 0;
      this.history = [];
      if (this.coin) {
        this.coin.classList.remove('heads', 'tails', 'flipping');
      }
      this.updateDisplay();
    }
  };

  // ===== Bayesian Calculator =====
  const bayesCalculator = {
    init() {
      this.baseRateInput = document.getElementById('base-rate');
      this.sensitivityInput = document.getElementById('sensitivity');
      this.specificityInput = document.getElementById('specificity');

      this.baseRateValue = document.getElementById('base-rate-value');
      this.sensitivityValue = document.getElementById('sensitivity-value');
      this.specificityValue = document.getElementById('specificity-value');

      this.posteriorValue = document.getElementById('posterior-value');
      this.resultExplanation = document.getElementById('result-explanation');
      this.populationGrid = document.getElementById('population-grid');

      [this.baseRateInput, this.sensitivityInput, this.specificityInput].forEach(input => {
        input?.addEventListener('input', () => this.calculate());
      });

      this.calculate();
    },

    calculate() {
      const baseRate = parseFloat(this.baseRateInput?.value || 1) / 100;
      const sensitivity = parseFloat(this.sensitivityInput?.value || 99) / 100;
      const specificity = parseFloat(this.specificityInput?.value || 99) / 100;

      // Update display values
      if (this.baseRateValue) this.baseRateValue.textContent = (baseRate * 100).toFixed(1) + '%';
      if (this.sensitivityValue) this.sensitivityValue.textContent = (sensitivity * 100).toFixed(1) + '%';
      if (this.specificityValue) this.specificityValue.textContent = (specificity * 100).toFixed(1) + '%';

      // Bayes' theorem
      // P(condition|positive) = P(positive|condition) * P(condition) / P(positive)
      // P(positive) = P(positive|condition)*P(condition) + P(positive|no condition)*P(no condition)

      const pPositiveGivenCondition = sensitivity;
      const pPositiveGivenNoCondition = 1 - specificity;
      const pCondition = baseRate;
      const pNoCondition = 1 - baseRate;

      const pPositive = pPositiveGivenCondition * pCondition + pPositiveGivenNoCondition * pNoCondition;
      const posterior = (pPositiveGivenCondition * pCondition) / pPositive;

      if (this.posteriorValue) {
        this.posteriorValue.textContent = (posterior * 100).toFixed(1) + '%';
      }

      // Update explanation
      if (this.resultExplanation) {
        if (posterior > 0.9) {
          this.resultExplanation.textContent = 'With this base rate and test accuracy, a positive result is highly reliable.';
        } else if (posterior > 0.5) {
          this.resultExplanation.textContent = 'A positive result means more likely than not, but there\'s still significant uncertainty.';
        } else {
          this.resultExplanation.textContent = 'Surprisingly, most positive results are false positives due to the low base rate.';
        }
      }

      // Update population visualization
      this.updatePopulationGrid(baseRate, sensitivity, specificity);
    },

    updatePopulationGrid(baseRate, sensitivity, specificity) {
      if (!this.populationGrid) return;

      const population = 1000;
      const withCondition = Math.round(population * baseRate);
      const withoutCondition = population - withCondition;

      const truePositives = Math.round(withCondition * sensitivity);
      const falseNegatives = withCondition - truePositives;
      const trueNegatives = Math.round(withoutCondition * specificity);
      const falsePositives = withoutCondition - trueNegatives;

      // Create array of people
      const people = [];

      for (let i = 0; i < truePositives; i++) people.push('true-positive');
      for (let i = 0; i < falsePositives; i++) people.push('false-positive');
      for (let i = 0; i < falseNegatives; i++) people.push('false-negative');
      for (let i = 0; i < trueNegatives; i++) people.push('true-negative');

      // Shuffle for visual interest (Fisher-Yates)
      for (let i = people.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [people[i], people[j]] = [people[j], people[i]];
      }

      // Limit to 500 for performance
      const displayPeople = people.slice(0, 500);

      this.populationGrid.innerHTML = displayPeople.map(type =>
        `<div class="person ${type}"></div>`
      ).join('');
    }
  };

  // ===== Monty Hall Simulator =====
  const montyHall = {
    carPosition: null,
    selectedDoor: null,
    openedDoor: null,
    gamePhase: 'select', // select, reveal, done
    stats: {
      gamesPlayed: 0,
      switchWins: 0,
      switchLosses: 0,
      stayWins: 0,
      stayLosses: 0
    },

    init() {
      this.doors = document.querySelectorAll('.door');
      this.messageEl = document.getElementById('monty-message');
      this.switchBtn = document.getElementById('switch-btn');
      this.stayBtn = document.getElementById('stay-btn');
      this.newGameBtn = document.getElementById('new-game-btn');

      this.doors.forEach(door => {
        door.addEventListener('click', () => this.selectDoor(parseInt(door.dataset.door)));
      });

      this.switchBtn?.addEventListener('click', () => this.makeChoice('switch'));
      this.stayBtn?.addEventListener('click', () => this.makeChoice('stay'));
      this.newGameBtn?.addEventListener('click', () => this.newGame());
      document.getElementById('sim-100')?.addEventListener('click', () => this.simulate(100));
      document.getElementById('reset-monty')?.addEventListener('click', () => this.resetStats());

      this.newGame();
    },

    newGame() {
      // Reset state
      this.carPosition = Math.floor(Math.random() * 3) + 1;
      this.selectedDoor = null;
      this.openedDoor = null;
      this.gamePhase = 'select';

      // Reset door visuals
      this.doors.forEach(door => {
        door.classList.remove('selected', 'opened', 'disabled');
        const prize = door.querySelector('.door-prize');
        if (prize) prize.textContent = '';
      });

      // Reset buttons
      if (this.switchBtn) this.switchBtn.disabled = true;
      if (this.stayBtn) this.stayBtn.disabled = true;

      this.setMessage('Pick a door to start!');
    },

    selectDoor(doorNum) {
      if (this.gamePhase !== 'select') return;

      this.selectedDoor = doorNum;

      // Highlight selected door
      this.doors.forEach(door => {
        door.classList.remove('selected');
        if (parseInt(door.dataset.door) === doorNum) {
          door.classList.add('selected');
        }
      });

      // Monty opens a door (goat door that wasn't selected)
      this.openGoatDoor();
    },

    openGoatDoor() {
      // Find a door that: isn't selected, doesn't have the car
      const possibleDoors = [1, 2, 3].filter(d => d !== this.selectedDoor && d !== this.carPosition);
      this.openedDoor = possibleDoors[Math.floor(Math.random() * possibleDoors.length)];

      // Open the door to reveal goat
      this.doors.forEach(door => {
        const doorNum = parseInt(door.dataset.door);
        if (doorNum === this.openedDoor) {
          door.classList.add('opened', 'disabled');
          const prize = door.querySelector('.door-prize');
          if (prize) prize.textContent = '🐐';
        }
      });

      this.gamePhase = 'reveal';
      if (this.switchBtn) this.switchBtn.disabled = false;
      if (this.stayBtn) this.stayBtn.disabled = false;

      const remainingDoor = [1, 2, 3].find(d => d !== this.selectedDoor && d !== this.openedDoor);
      this.setMessage(`Door ${this.openedDoor} has a goat! Do you want to switch to Door ${remainingDoor}, or stay with Door ${this.selectedDoor}?`);
    },

    makeChoice(choice) {
      if (this.gamePhase !== 'reveal') return;

      this.gamePhase = 'done';
      if (this.switchBtn) this.switchBtn.disabled = true;
      if (this.stayBtn) this.stayBtn.disabled = true;

      let finalDoor;
      if (choice === 'switch') {
        finalDoor = [1, 2, 3].find(d => d !== this.selectedDoor && d !== this.openedDoor);
        // Update selection visual
        this.doors.forEach(door => {
          door.classList.remove('selected');
          if (parseInt(door.dataset.door) === finalDoor) {
            door.classList.add('selected');
          }
        });
      } else {
        finalDoor = this.selectedDoor;
      }

      const won = finalDoor === this.carPosition;

      // Reveal all doors
      this.doors.forEach(door => {
        const doorNum = parseInt(door.dataset.door);
        door.classList.add('opened', 'disabled');
        const prize = door.querySelector('.door-prize');
        if (prize) {
          prize.textContent = doorNum === this.carPosition ? '🚗' : '🐐';
        }
      });

      // Update stats
      this.stats.gamesPlayed++;
      if (choice === 'switch') {
        if (won) this.stats.switchWins++;
        else this.stats.switchLosses++;
      } else {
        if (won) this.stats.stayWins++;
        else this.stats.stayLosses++;
      }

      this.updateStats();

      const action = choice === 'switch' ? 'switched' : 'stayed';
      const result = won ? 'won the car!' : 'got a goat.';
      this.setMessage(`You ${action} and ${result}`);
    },

    simulate(count) {
      for (let i = 0; i < count; i++) {
        // Simulate one game with always switching
        const car = Math.floor(Math.random() * 3) + 1;
        const initialPick = Math.floor(Math.random() * 3) + 1;

        // After switch, we get the car if initial pick was wrong
        const switchWins = initialPick !== car;

        this.stats.gamesPlayed++;
        if (switchWins) {
          this.stats.switchWins++;
        } else {
          this.stats.stayWins++;
        }
      }

      this.updateStats();
      this.setMessage(`Simulated ${count} games (always switching). Check the win rates!`);
    },

    updateStats() {
      document.getElementById('games-played').textContent = this.stats.gamesPlayed;
      document.getElementById('switch-wins').textContent = this.stats.switchWins;
      document.getElementById('stay-wins').textContent = this.stats.stayWins;

      const switchTotal = this.stats.switchWins + this.stats.switchLosses;
      const stayTotal = this.stats.stayWins + this.stats.stayLosses;

      document.getElementById('switch-rate').textContent = switchTotal > 0
        ? (this.stats.switchWins / switchTotal * 100).toFixed(1) + '%'
        : '-';
      document.getElementById('stay-rate').textContent = stayTotal > 0
        ? (this.stats.stayWins / stayTotal * 100).toFixed(1) + '%'
        : '-';
    },

    resetStats() {
      this.stats = {
        gamesPlayed: 0,
        switchWins: 0,
        switchLosses: 0,
        stayWins: 0,
        stayLosses: 0
      };
      this.updateStats();
      this.newGame();
    },

    setMessage(msg) {
      if (this.messageEl) this.messageEl.textContent = msg;
    }
  };

  // ===== Initialize =====
  function init() {
    coinSimulator.init();
    bayesCalculator.init();
    montyHall.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.TIP = window.TIP || {};
  window.TIP.probability = { coinSimulator, bayesCalculator, montyHall };
})();
