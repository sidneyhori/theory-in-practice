// Game Theory Interactive Components

(function() {
  // ===== Iterated Prisoner's Dilemma Game =====
  let gameHistory = [];
  let scores = { you: 0, opponent: 0 };
  let currentRound = 0;
  const MAX_ROUNDS = 10;

  const strategies = {
    'tit-for-tat': (history) => history.length === 0 ? 'cooperate' : history[history.length - 1].you,
    'always-defect': () => 'defect',
    'always-cooperate': () => 'cooperate',
    'grudger': (history) => history.some(h => h.you === 'defect') ? 'defect' : 'cooperate',
    'random': () => Math.random() > 0.5 ? 'cooperate' : 'defect'
  };

  function getPayoff(p1, p2) {
    if (p1 === 'cooperate' && p2 === 'cooperate') return [3, 3];
    if (p1 === 'cooperate' && p2 === 'defect') return [0, 5];
    if (p1 === 'defect' && p2 === 'cooperate') return [5, 0];
    return [1, 1];
  }

  function playRound(yourChoice) {
    if (currentRound >= MAX_ROUNDS) return;

    const strategySelect = document.querySelector('.strategy-select');
    const strategy = strategySelect ? strategySelect.value : 'tit-for-tat';
    const opponentMove = strategies[strategy](gameHistory);
    const [yourPayoff, oppPayoff] = getPayoff(yourChoice, opponentMove);

    gameHistory.push({ you: yourChoice, opponent: opponentMove, yourPayoff, oppPayoff });
    scores.you += yourPayoff;
    scores.opponent += oppPayoff;
    currentRound++;

    updateDisplay();
  }

  function updateDisplay() {
    // Update round display
    const roundEl = document.querySelector('.current-round');
    if (roundEl) roundEl.textContent = currentRound;

    // Update scores
    const yourTotalEl = document.querySelector('.your-total');
    const oppTotalEl = document.querySelector('.opponent-total');
    if (yourTotalEl) yourTotalEl.textContent = scores.you;
    if (oppTotalEl) oppTotalEl.textContent = scores.opponent;

    // Update history
    const historyEl = document.querySelector('.pd-history');
    const historyItemsEl = document.querySelector('.pd-history-items');
    if (historyEl && historyItemsEl && gameHistory.length > 0) {
      historyEl.style.display = 'block';
      historyItemsEl.innerHTML = gameHistory.map((round, i) =>
        `<span class="history-item">R${i + 1}: ${round.you === 'cooperate' ? '🤝' : '🗡️'} vs ${round.opponent === 'cooperate' ? '🤝' : '🗡️'}</span>`
      ).join('');
    }

    // Show last round result
    const resultBox = document.querySelector('.pd-result');
    if (resultBox && gameHistory.length > 0) {
      const last = gameHistory[gameHistory.length - 1];
      resultBox.innerHTML = `
        <p>You <strong style="color: ${last.you === 'cooperate' ? 'var(--color-cs)' : 'var(--color-physics)'}">${last.you === 'cooperate' ? 'cooperated' : 'defected'}</strong>,
        opponent <strong style="color: ${last.opponent === 'cooperate' ? 'var(--color-cs)' : 'var(--color-physics)'}">${last.opponent === 'cooperate' ? 'cooperated' : 'defected'}</strong></p>
        <p>You earned <strong>+${last.yourPayoff}</strong> points</p>
      `;
      resultBox.style.display = 'block';
    }

    // Check for game over
    if (currentRound >= MAX_ROUNDS) {
      const buttonsEl = document.querySelector('.pd-choices');
      const gameOverEl = document.querySelector('.pd-game-over');

      if (buttonsEl) buttonsEl.style.display = 'none';

      if (gameOverEl) {
        let result;
        if (scores.you > scores.opponent) result = 'You won!';
        else if (scores.you < scores.opponent) result = 'Opponent won!';
        else result = "It's a tie!";

        gameOverEl.innerHTML = `
          <div class="game-over-title">${result}</div>
          <div class="game-over-scores">Final: You ${scores.you} - ${scores.opponent} Opponent</div>
        `;
        gameOverEl.style.display = 'block';
      }
    }
  }

  function resetGame() {
    gameHistory = [];
    scores = { you: 0, opponent: 0 };
    currentRound = 0;

    const roundEl = document.querySelector('.current-round');
    const yourTotalEl = document.querySelector('.your-total');
    const oppTotalEl = document.querySelector('.opponent-total');
    const historyEl = document.querySelector('.pd-history');
    const historyItemsEl = document.querySelector('.pd-history-items');
    const resultBox = document.querySelector('.pd-result');
    const buttonsEl = document.querySelector('.pd-choices');
    const gameOverEl = document.querySelector('.pd-game-over');

    if (roundEl) roundEl.textContent = '0';
    if (yourTotalEl) yourTotalEl.textContent = '0';
    if (oppTotalEl) oppTotalEl.textContent = '0';
    if (historyEl) historyEl.style.display = 'none';
    if (historyItemsEl) historyItemsEl.innerHTML = '';
    if (resultBox) resultBox.style.display = 'none';
    if (buttonsEl) buttonsEl.style.display = 'flex';
    if (gameOverEl) gameOverEl.style.display = 'none';
  }

  // ===== Strategy Simulator =====
  class StrategySimulator {
    constructor(container) {
      this.container = container;
      this.init();
    }

    init() {
      this.strategy1Select = this.container.querySelector('.strategy1-select');
      this.strategy2Select = this.container.querySelector('.strategy2-select');
      this.roundsInput = this.container.querySelector('.rounds-input');
      this.runBtn = this.container.querySelector('.simulator-run');
      this.statsContainer = this.container.querySelector('.simulator-stats');
      this.historyLog = this.container.querySelector('.history-log');

      if (this.runBtn) {
        this.runBtn.addEventListener('click', () => this.runSimulation());
      }
    }

    runSimulation() {
      const strategy1 = this.strategy1Select?.value || 'tit-for-tat';
      const strategy2 = this.strategy2Select?.value || 'always-defect';
      const rounds = parseInt(this.roundsInput?.value) || 100;

      const results = this.simulate(strategy1, strategy2, rounds);
      this.displayResults(results);
    }

    simulate(strategy1Name, strategy2Name, rounds) {
      const history1 = [];
      const history2 = [];
      let total1 = 0;
      let total2 = 0;
      let memory1 = { betrayed: false };
      let memory2 = { betrayed: false };

      const strats = {
        'tit-for-tat': (myH, theirH) => theirH.length === 0 ? 'cooperate' : theirH[theirH.length - 1],
        'always-cooperate': () => 'cooperate',
        'always-defect': () => 'defect',
        'random': () => Math.random() < 0.5 ? 'cooperate' : 'defect',
        'grudger': (myH, theirH, mem) => mem.betrayed ? 'defect' : 'cooperate',
        'pavlov': (myH, theirH) => {
          if (myH.length === 0) return 'cooperate';
          const lastMine = myH[myH.length - 1];
          const lastTheirs = theirH[theirH.length - 1];
          // Win-stay, lose-shift
          if ((lastMine === 'cooperate' && lastTheirs === 'cooperate') ||
              (lastMine === 'defect' && lastTheirs === 'defect')) {
            return lastMine;
          }
          return lastMine === 'cooperate' ? 'defect' : 'cooperate';
        },
        'tit-for-two-tats': (myH, theirH) => {
          if (theirH.length < 2) return 'cooperate';
          if (theirH[theirH.length - 1] === 'defect' && theirH[theirH.length - 2] === 'defect') {
            return 'defect';
          }
          return 'cooperate';
        }
      };

      for (let i = 0; i < rounds; i++) {
        const move1 = strats[strategy1Name](history1, history2, memory1);
        const move2 = strats[strategy2Name](history2, history1, memory2);

        const [pay1, pay2] = getPayoff(move1, move2);
        total1 += pay1;
        total2 += pay2;

        history1.push(move1);
        history2.push(move2);

        if (move2 === 'defect') memory1.betrayed = true;
        if (move1 === 'defect') memory2.betrayed = true;
      }

      let cc = 0, cd = 0, dc = 0, dd = 0;
      for (let i = 0; i < rounds; i++) {
        if (history1[i] === 'cooperate' && history2[i] === 'cooperate') cc++;
        else if (history1[i] === 'cooperate' && history2[i] === 'defect') cd++;
        else if (history1[i] === 'defect' && history2[i] === 'cooperate') dc++;
        else dd++;
      }

      return { rounds, total1, total2, history1, history2, outcomes: { cc, cd, dc, dd } };
    }

    displayResults(results) {
      // Render chart showing cumulative scores over time
      const chartContainer = this.container.querySelector('.simulator-chart');
      if (chartContainer) {
        // Calculate cumulative scores
        const cumulative1 = [];
        const cumulative2 = [];
        let sum1 = 0, sum2 = 0;

        for (let i = 0; i < results.rounds; i++) {
          const [pay1, pay2] = getPayoff(results.history1[i], results.history2[i]);
          sum1 += pay1;
          sum2 += pay2;
          cumulative1.push(sum1);
          cumulative2.push(sum2);
        }

        const maxScore = Math.max(sum1, sum2, 1);
        const chartHeight = 200;

        // Sample points for display (max 100 bars)
        const sampleRate = Math.max(1, Math.floor(results.rounds / 100));
        const sampledRounds = [];
        for (let i = 0; i < results.rounds; i += sampleRate) {
          sampledRounds.push(i);
        }
        if (sampledRounds[sampledRounds.length - 1] !== results.rounds - 1) {
          sampledRounds.push(results.rounds - 1);
        }

        chartContainer.innerHTML = `
          <div style="display: flex; gap: 2px; align-items: flex-end; height: ${chartHeight}px; overflow: hidden; width: 100%; box-sizing: border-box;">
            ${sampledRounds.map(i => {
              const h1 = Math.max(4, (cumulative1[i] / maxScore) * chartHeight);
              const h2 = Math.max(4, (cumulative2[i] / maxScore) * chartHeight);
              return `
                <div style="flex: 1 1 0; display: flex; gap: 1px; align-items: flex-end; min-width: 0; overflow: hidden;">
                  <div style="flex: 1 1 0; height: ${h1}px; background: var(--color-accent); border-radius: 2px 2px 0 0; min-width: 0;"></div>
                  <div style="flex: 1 1 0; height: ${h2}px; background: var(--color-accent-secondary); border-radius: 2px 2px 0 0; min-width: 0;"></div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 8px;">
            <span>Round 1</span>
            <span style="display: flex; gap: 12px;">
              <span><span style="color: var(--color-accent);">■</span> P1</span>
              <span><span style="color: var(--color-accent-secondary);">■</span> P2</span>
            </span>
            <span>Round ${results.rounds}</span>
          </div>
        `;
      }

      if (this.statsContainer) {
        this.statsContainer.innerHTML = `
          <div class="stat-item">
            <div class="stat-value" style="color: var(--color-accent)">${results.total1}</div>
            <div class="stat-label">Player 1 Score</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: var(--color-accent-secondary)">${results.total2}</div>
            <div class="stat-label">Player 2 Score</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${results.outcomes.cc}</div>
            <div class="stat-label">Both Cooperate</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${results.outcomes.dd}</div>
            <div class="stat-label">Both Defect</div>
          </div>
        `;
      }

      if (this.historyLog) {
        this.historyLog.innerHTML = '';
        const displayRounds = Math.min(results.rounds, 30);
        for (let i = 0; i < displayRounds; i++) {
          const entry = document.createElement('div');
          entry.className = 'history-entry';
          entry.innerHTML = `<span class="history-round">R${i + 1}</span> ${results.history1[i][0].toUpperCase()} vs ${results.history2[i][0].toUpperCase()}`;
          this.historyLog.appendChild(entry);
        }
        if (results.rounds > 30) {
          const more = document.createElement('div');
          more.className = 'history-entry';
          more.textContent = `... ${results.rounds - 30} more rounds`;
          this.historyLog.appendChild(more);
        }
      }
    }
  }

  // ===== Initialize =====
  function init() {
    // Set up choice buttons
    document.querySelectorAll('.pd-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => playRound(btn.dataset.choice));
    });

    // Set up reset button
    const resetBtn = document.querySelector('.pd-reset-game');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetGame);
    }

    // Strategy change resets game
    const strategySelect = document.querySelector('.strategy-select');
    if (strategySelect) {
      strategySelect.addEventListener('change', resetGame);
    }

    // Initialize simulators
    document.querySelectorAll('.simulator').forEach(container => {
      new StrategySimulator(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.TIP = window.TIP || {};
  window.TIP.gameTheory = { playRound, resetGame };
})();
