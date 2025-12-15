// Quantum Computing Interactive Components

(function() {
  // ===== Bloch Sphere Visualizer =====
  const blochSphere = {
    canvas: null,
    ctx: null,
    theta: 0, // Polar angle (0 = |0⟩, π = |1⟩)
    phi: 0,   // Azimuthal angle
    animationId: null,
    rotation: 0,

    init() {
      this.canvas = document.getElementById('bloch-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.bindEvents();
      this.animate();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    },

    bindEvents() {
      document.querySelectorAll('.gate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.applyGate(btn.dataset.gate);
        });
      });

      document.querySelector('.reset-bloch-btn')?.addEventListener('click', () => this.reset());
      document.querySelector('.measure-qubit-btn')?.addEventListener('click', () => this.measure());

      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });
    },

    reset() {
      this.theta = 0;
      this.phi = 0;
      this.updateStateDisplay();
      document.querySelector('.bloch-result').style.display = 'none';
    },

    applyGate(gate) {
      // Simplified gate operations on Bloch sphere angles
      switch (gate) {
        case 'H': // Hadamard
          if (this.theta < 0.01) {
            this.theta = Math.PI / 2;
            this.phi = 0;
          } else if (Math.abs(this.theta - Math.PI) < 0.01) {
            this.theta = Math.PI / 2;
            this.phi = Math.PI;
          } else if (Math.abs(this.theta - Math.PI / 2) < 0.01) {
            if (Math.abs(this.phi) < 0.01) {
              this.theta = 0;
            } else {
              this.theta = Math.PI;
            }
          } else {
            // General case - simplified
            this.theta = Math.PI / 2;
            this.phi = (this.phi + Math.PI) % (2 * Math.PI);
          }
          break;
        case 'X': // Pauli-X (NOT)
          this.theta = Math.PI - this.theta;
          break;
        case 'Y': // Pauli-Y
          this.theta = Math.PI - this.theta;
          this.phi = this.phi + Math.PI;
          break;
        case 'Z': // Pauli-Z
          this.phi = this.phi + Math.PI;
          break;
        case 'S': // S gate (π/2 phase)
          this.phi = this.phi + Math.PI / 2;
          break;
        case 'T': // T gate (π/4 phase)
          this.phi = this.phi + Math.PI / 4;
          break;
      }

      // Normalize phi
      this.phi = ((this.phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      this.updateStateDisplay();
      document.querySelector('.bloch-result').style.display = 'none';
    },

    measure() {
      // Probability of |0⟩ = cos²(θ/2)
      const prob0 = Math.pow(Math.cos(this.theta / 2), 2);
      const result = Math.random() < prob0 ? '0' : '1';

      // Collapse to measured state
      this.theta = result === '0' ? 0 : Math.PI;
      this.phi = 0;

      document.querySelector('.bloch-result').style.display = 'block';
      document.querySelector('.bloch-result .result-value').textContent = `|${result}⟩`;

      this.updateStateDisplay();
    },

    updateStateDisplay() {
      let stateStr;
      if (this.theta < 0.01) {
        stateStr = '|0⟩';
      } else if (Math.abs(this.theta - Math.PI) < 0.01) {
        stateStr = '|1⟩';
      } else if (Math.abs(this.theta - Math.PI / 2) < 0.01) {
        if (Math.abs(this.phi) < 0.01 || Math.abs(this.phi - 2 * Math.PI) < 0.01) {
          stateStr = '|+⟩ = (|0⟩+|1⟩)/√2';
        } else if (Math.abs(this.phi - Math.PI) < 0.01) {
          stateStr = '|-⟩ = (|0⟩-|1⟩)/√2';
        } else {
          stateStr = 'Superposition';
        }
      } else {
        stateStr = 'Superposition';
      }
      document.querySelector('.state-value').textContent = stateStr;
    },

    animate() {
      this.render();
      this.rotation += 0.005;
      this.animationId = requestAnimationFrame(() => this.animate());
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;

      // Clear
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#f5f5f5';
      this.ctx.fillRect(0, 0, width, height);

      // Draw sphere outline
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#e5e5e5';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();

      // Draw equator (ellipse for 3D effect)
      this.ctx.beginPath();
      this.ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      // Draw prime meridian
      this.ctx.beginPath();
      this.ctx.ellipse(centerX, centerY, radius * 0.3, radius, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      // Draw axes
      this.ctx.setLineDash([3, 3]);

      // Z axis
      this.ctx.strokeStyle = '#ef4444';
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - radius - 20);
      this.ctx.lineTo(centerX, centerY + radius + 20);
      this.ctx.stroke();

      // X axis
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.beginPath();
      this.ctx.moveTo(centerX - radius - 20, centerY);
      this.ctx.lineTo(centerX + radius + 20, centerY);
      this.ctx.stroke();

      this.ctx.setLineDash([]);

      // Labels
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() || '#666';
      this.ctx.font = '12px sans-serif';
      this.ctx.fillText('|0⟩', centerX + 5, centerY - radius - 25);
      this.ctx.fillText('|1⟩', centerX + 5, centerY + radius + 20);

      // Draw state vector
      const x = Math.sin(this.theta) * Math.cos(this.phi + this.rotation);
      const y = Math.sin(this.theta) * Math.sin(this.phi + this.rotation);
      const z = Math.cos(this.theta);

      // Project to 2D
      const projX = centerX + x * radius;
      const projY = centerY - z * radius; // Flip for screen coords

      // Draw vector
      this.ctx.strokeStyle = '#8b5cf6';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(projX, projY);
      this.ctx.stroke();

      // Draw point
      this.ctx.fillStyle = '#8b5cf6';
      this.ctx.beginPath();
      this.ctx.arc(projX, projY, 8, 0, Math.PI * 2);
      this.ctx.fill();
    }
  };

  // ===== Quantum Circuit =====
  const circuit = {
    gates: [[], []], // Gates for q0 and q1
    state: [1, 0, 0, 0], // |00⟩, |01⟩, |10⟩, |11⟩

    init() {
      this.bindEvents();
      this.render();
    },

    bindEvents() {
      document.querySelectorAll('.add-gate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.addGate(btn.dataset.gate, parseInt(btn.dataset.qubit));
        });
      });

      document.querySelector('.run-circuit-btn')?.addEventListener('click', () => this.run());
      document.querySelector('.clear-circuit-btn')?.addEventListener('click', () => this.clear());
    },

    addGate(gate, qubit) {
      if (this.gates[qubit].length < 5) {
        this.gates[qubit].push(gate);
        if (gate === 'CNOT') {
          // CNOT affects both qubits
          this.gates[1 - qubit].push('CNOT-target');
        }
        this.renderGates();
      }
    },

    clear() {
      this.gates = [[], []];
      this.state = [1, 0, 0, 0];
      this.renderGates();
      this.updateProbabilities();
    },

    renderGates() {
      [0, 1].forEach(q => {
        const slots = document.querySelector(`.gate-slots[data-qubit="${q}"]`);
        slots.innerHTML = '';

        this.gates[q].forEach(gate => {
          const gateEl = document.createElement('div');
          gateEl.className = 'circuit-gate';

          if (gate === 'CNOT') {
            gateEl.classList.add('cnot-control');
            gateEl.textContent = '';
          } else if (gate === 'CNOT-target') {
            gateEl.classList.add('cnot-target');
            gateEl.textContent = '';
          } else {
            gateEl.textContent = gate;
          }

          slots.appendChild(gateEl);
        });
      });
    },

    run() {
      // Start with |00⟩
      this.state = [1, 0, 0, 0];

      // Apply gates in sequence
      const maxLen = Math.max(this.gates[0].length, this.gates[1].length);

      for (let i = 0; i < maxLen; i++) {
        const g0 = this.gates[0][i];
        const g1 = this.gates[1][i];

        if (g0 === 'CNOT') {
          this.applyCNOT(0); // Control on q0
        } else if (g1 === 'CNOT') {
          this.applyCNOT(1); // Control on q1
        } else {
          if (g0 && g0 !== 'CNOT-target') this.applySingleGate(g0, 0);
          if (g1 && g1 !== 'CNOT-target') this.applySingleGate(g1, 1);
        }
      }

      this.updateProbabilities();
    },

    applySingleGate(gate, qubit) {
      // Single qubit gates (simplified)
      const sqrt2 = Math.sqrt(2);

      if (gate === 'H') {
        const newState = [0, 0, 0, 0];
        if (qubit === 0) {
          // H on q0
          newState[0] = (this.state[0] + this.state[2]) / sqrt2;
          newState[1] = (this.state[1] + this.state[3]) / sqrt2;
          newState[2] = (this.state[0] - this.state[2]) / sqrt2;
          newState[3] = (this.state[1] - this.state[3]) / sqrt2;
        } else {
          // H on q1
          newState[0] = (this.state[0] + this.state[1]) / sqrt2;
          newState[1] = (this.state[0] - this.state[1]) / sqrt2;
          newState[2] = (this.state[2] + this.state[3]) / sqrt2;
          newState[3] = (this.state[2] - this.state[3]) / sqrt2;
        }
        this.state = newState;
      } else if (gate === 'X') {
        const newState = [0, 0, 0, 0];
        if (qubit === 0) {
          // X on q0 swaps |00⟩↔|10⟩, |01⟩↔|11⟩
          newState[0] = this.state[2];
          newState[1] = this.state[3];
          newState[2] = this.state[0];
          newState[3] = this.state[1];
        } else {
          // X on q1 swaps |00⟩↔|01⟩, |10⟩↔|11⟩
          newState[0] = this.state[1];
          newState[1] = this.state[0];
          newState[2] = this.state[3];
          newState[3] = this.state[2];
        }
        this.state = newState;
      }
    },

    applyCNOT(control) {
      const newState = [...this.state];
      if (control === 0) {
        // CNOT with q0 as control: flip q1 when q0=1
        // |10⟩ ↔ |11⟩
        const temp = newState[2];
        newState[2] = newState[3];
        newState[3] = temp;
      } else {
        // CNOT with q1 as control: flip q0 when q1=1
        // |01⟩ ↔ |11⟩
        const temp = newState[1];
        newState[1] = newState[3];
        newState[3] = temp;
      }
      this.state = newState;
    },

    updateProbabilities() {
      const probs = this.state.map(a => Math.pow(Math.abs(a), 2));

      ['00', '01', '10', '11'].forEach((s, i) => {
        const pct = Math.round(probs[i] * 100);
        document.querySelector(`.prob-${s}`).style.width = pct + '%';
        document.querySelector(`.prob-${s}-val`).textContent = pct + '%';
      });
    },

    render() {
      this.renderGates();
      this.updateProbabilities();
    }
  };

  // ===== Entanglement Demo =====
  const entanglement = {
    measured: false,
    resultA: null,
    resultB: null,

    init() {
      this.bindEvents();
      this.reset();
    },

    bindEvents() {
      document.querySelector('.measure-a-btn')?.addEventListener('click', () => this.measureA());
      document.querySelector('.measure-b-btn')?.addEventListener('click', () => this.measureB());
      document.querySelector('.reset-entangle-btn')?.addEventListener('click', () => this.reset());
    },

    reset() {
      this.measured = false;
      this.resultA = null;
      this.resultB = null;

      document.querySelector('.qubit-a .qubit-icon').textContent = '?';
      document.querySelector('.qubit-b .qubit-icon').textContent = '?';
      document.querySelector('.qubit-a-value').textContent = 'Superposition';
      document.querySelector('.qubit-b-value').textContent = 'Superposition';
      document.querySelector('.qubit-a .qubit-state').style.background = 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)';
      document.querySelector('.qubit-b .qubit-state').style.background = 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)';
      document.querySelector('.link-symbol').textContent = '⟷';
      document.querySelector('.entanglement-result').style.display = 'none';
    },

    measureA() {
      if (this.measured) return;
      this.measured = true;

      // Bell state: 50% |00⟩, 50% |11⟩
      this.resultA = Math.random() < 0.5 ? '0' : '1';
      this.resultB = this.resultA; // Entangled!

      this.updateDisplay('A');
    },

    measureB() {
      if (this.measured) return;
      this.measured = true;

      // Bell state: 50% |00⟩, 50% |11⟩
      this.resultB = Math.random() < 0.5 ? '0' : '1';
      this.resultA = this.resultB; // Entangled!

      this.updateDisplay('B');
    },

    updateDisplay(first) {
      // Update qubit A
      document.querySelector('.qubit-a .qubit-icon').textContent = this.resultA;
      document.querySelector('.qubit-a-value').textContent = `|${this.resultA}⟩`;
      document.querySelector('.qubit-a .qubit-state').style.background =
        this.resultA === '0' ? '#3b82f6' : '#ef4444';

      // Update qubit B
      document.querySelector('.qubit-b .qubit-icon').textContent = this.resultB;
      document.querySelector('.qubit-b-value').textContent = `|${this.resultB}⟩`;
      document.querySelector('.qubit-b .qubit-state').style.background =
        this.resultB === '0' ? '#3b82f6' : '#ef4444';

      // Update link
      document.querySelector('.link-symbol').textContent = '=';

      // Show result
      const resultEl = document.querySelector('.entanglement-result');
      resultEl.style.display = 'block';

      const other = first === 'A' ? 'B' : 'A';
      resultEl.querySelector('.result-text').textContent =
        `Measured Qubit ${first} = ${this.resultA === '0' ? '|0⟩' : '|1⟩'}. ` +
        `Instantly, Qubit ${other} collapsed to ${this.resultB === '0' ? '|0⟩' : '|1⟩'}!`;
    }
  };

  // ===== Initialize =====
  function init() {
    blochSphere.init();
    circuit.init();
    entanglement.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIP = window.TIP || {};
  window.TIP.quantumComputing = { blochSphere, circuit, entanglement };
})();
