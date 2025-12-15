// Graph Theory Interactive Components

(function() {
  // ===== Graph Builder =====
  const graphBuilder = {
    canvas: null,
    ctx: null,
    nodes: [],
    edges: [],
    mode: 'add-node',
    selectedNode: null,
    nodeRadius: 20,
    nextId: 1,

    init() {
      this.canvas = document.getElementById('graph-canvas');
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
      this.canvas.addEventListener('click', (e) => this.handleClick(e));

      document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.mode = btn.dataset.mode;
          this.selectedNode = null;
          this.render();
        });
      });

      document.querySelector('.clear-graph-btn')?.addEventListener('click', () => {
        this.nodes = [];
        this.edges = [];
        this.selectedNode = null;
        this.nextId = 1;
        this.updateStats();
        this.render();
      });

      document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => this.loadPreset(btn.dataset.preset));
      });

      window.addEventListener('resize', () => this.resizeCanvas());
    },

    handleClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedNode = this.findNodeAt(x, y);

      if (this.mode === 'add-node') {
        if (!clickedNode) {
          this.nodes.push({ id: this.nextId++, x, y });
          this.updateStats();
          this.render();
        }
      } else if (this.mode === 'add-edge') {
        if (clickedNode) {
          if (this.selectedNode === null) {
            this.selectedNode = clickedNode;
          } else if (this.selectedNode !== clickedNode) {
            const exists = this.edges.some(e =>
              (e.from === this.selectedNode.id && e.to === clickedNode.id) ||
              (e.from === clickedNode.id && e.to === this.selectedNode.id)
            );
            if (!exists) {
              this.edges.push({ from: this.selectedNode.id, to: clickedNode.id });
            }
            this.selectedNode = null;
            this.updateStats();
          }
          this.render();
        }
      } else if (this.mode === 'delete') {
        if (clickedNode) {
          this.nodes = this.nodes.filter(n => n.id !== clickedNode.id);
          this.edges = this.edges.filter(e => e.from !== clickedNode.id && e.to !== clickedNode.id);
          this.updateStats();
          this.render();
        }
      }
    },

    findNodeAt(x, y) {
      return this.nodes.find(n => {
        const dx = n.x - x;
        const dy = n.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.nodeRadius;
      });
    },

    loadPreset(preset) {
      this.nodes = [];
      this.edges = [];
      this.nextId = 1;

      const rect = this.canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const r = Math.min(rect.width, rect.height) * 0.35;

      if (preset === 'triangle') {
        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI / 3) - Math.PI / 2;
          this.nodes.push({ id: this.nextId++, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
        }
        this.edges = [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 1 }];
      } else if (preset === 'star') {
        this.nodes.push({ id: this.nextId++, x: cx, y: cy });
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
          this.nodes.push({ id: this.nextId++, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
          this.edges.push({ from: 1, to: this.nextId - 1 });
        }
      } else if (preset === 'complete') {
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
          this.nodes.push({ id: this.nextId++, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
        }
        for (let i = 1; i <= 5; i++) {
          for (let j = i + 1; j <= 5; j++) {
            this.edges.push({ from: i, to: j });
          }
        }
      } else if (preset === 'bipartite') {
        for (let i = 0; i < 3; i++) {
          this.nodes.push({ id: this.nextId++, x: cx - r * 0.6, y: cy - r + i * r });
        }
        for (let i = 0; i < 3; i++) {
          this.nodes.push({ id: this.nextId++, x: cx + r * 0.6, y: cy - r + i * r });
        }
        for (let i = 1; i <= 3; i++) {
          for (let j = 4; j <= 6; j++) {
            this.edges.push({ from: i, to: j });
          }
        }
      }

      this.updateStats();
      this.render();
    },

    updateStats() {
      document.querySelector('.nodes-count').textContent = this.nodes.length;
      document.querySelector('.edges-count').textContent = this.edges.length;

      // Count connected components using union-find
      const parent = {};
      this.nodes.forEach(n => parent[n.id] = n.id);
      const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
      const union = (a, b) => parent[find(a)] = find(b);
      this.edges.forEach(e => union(e.from, e.to));
      const components = new Set(this.nodes.map(n => find(n.id))).size;
      document.querySelector('.components-count').textContent = this.nodes.length > 0 ? components : 0;

      // Average degree
      const degrees = {};
      this.nodes.forEach(n => degrees[n.id] = 0);
      this.edges.forEach(e => {
        degrees[e.from]++;
        degrees[e.to]++;
      });
      const avgDegree = this.nodes.length > 0
        ? (Object.values(degrees).reduce((a, b) => a + b, 0) / this.nodes.length).toFixed(1)
        : 0;
      document.querySelector('.avg-degree').textContent = avgDegree;
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw edges
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#ccc';
      this.ctx.lineWidth = 2;
      this.edges.forEach(e => {
        const from = this.nodes.find(n => n.id === e.from);
        const to = this.nodes.find(n => n.id === e.to);
        if (from && to) {
          this.ctx.beginPath();
          this.ctx.moveTo(from.x, from.y);
          this.ctx.lineTo(to.x, to.y);
          this.ctx.stroke();
        }
      });

      // Draw nodes
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#2563EB';
      this.nodes.forEach(n => {
        this.ctx.beginPath();
        this.ctx.arc(n.x, n.y, this.nodeRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.selectedNode === n ? '#10b981' : accentColor;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(n.id, n.x, n.y);
      });
    }
  };

  // ===== Shortest Path Finder =====
  const pathfinder = {
    canvas: null,
    ctx: null,
    nodes: [],
    edges: [],
    startNode: null,
    endNode: null,
    path: [],
    nodeRadius: 20,

    init() {
      this.canvas = document.getElementById('pathfinder-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.generateGraph();
      this.bindEvents();
    },

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.render();
    },

    generateGraph() {
      this.nodes = [];
      this.edges = [];
      this.startNode = null;
      this.endNode = null;
      this.path = [];

      const rect = this.canvas.getBoundingClientRect();
      const padding = 50;

      // Generate random nodes in a grid-like pattern
      const cols = 4;
      const rows = 3;
      const cellW = (rect.width - padding * 2) / (cols - 1);
      const cellH = (rect.height - padding * 2) / (rows - 1);

      let id = 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const jitterX = (Math.random() - 0.5) * cellW * 0.3;
          const jitterY = (Math.random() - 0.5) * cellH * 0.3;
          this.nodes.push({
            id: id++,
            x: padding + c * cellW + jitterX,
            y: padding + r * cellH + jitterY
          });
        }
      }

      // Connect nearby nodes with random weights
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const dx = this.nodes[i].x - this.nodes[j].x;
          const dy = this.nodes[i].y - this.nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cellW * 1.5 && Math.random() > 0.3) {
            this.edges.push({
              from: this.nodes[i].id,
              to: this.nodes[j].id,
              weight: Math.floor(dist / 30) + 1
            });
          }
        }
      }

      this.updateInfo();
      this.render();
    },

    bindEvents() {
      this.canvas.addEventListener('click', (e) => this.handleClick(e));

      document.querySelector('.find-path-btn')?.addEventListener('click', () => this.findPath());
      document.querySelector('.reset-path-btn')?.addEventListener('click', () => this.resetSelection());
      document.querySelector('.randomize-graph-btn')?.addEventListener('click', () => this.generateGraph());

      window.addEventListener('resize', () => this.resizeCanvas());
    },

    handleClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedNode = this.nodes.find(n => {
        const dx = n.x - x;
        const dy = n.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.nodeRadius;
      });

      if (clickedNode) {
        if (!this.startNode) {
          this.startNode = clickedNode;
          this.path = [];
        } else if (!this.endNode && clickedNode !== this.startNode) {
          this.endNode = clickedNode;
        } else {
          this.startNode = clickedNode;
          this.endNode = null;
          this.path = [];
        }
        this.updateInfo();
        this.render();
      }
    },

    findPath() {
      if (!this.startNode || !this.endNode) return;

      // Dijkstra's algorithm
      const dist = {};
      const prev = {};
      const unvisited = new Set();

      this.nodes.forEach(n => {
        dist[n.id] = Infinity;
        prev[n.id] = null;
        unvisited.add(n.id);
      });
      dist[this.startNode.id] = 0;

      while (unvisited.size > 0) {
        let minNode = null;
        let minDist = Infinity;
        unvisited.forEach(id => {
          if (dist[id] < minDist) {
            minDist = dist[id];
            minNode = id;
          }
        });

        if (minNode === null || minNode === this.endNode.id) break;
        unvisited.delete(minNode);

        // Find neighbors
        this.edges.forEach(e => {
          let neighbor = null;
          if (e.from === minNode && unvisited.has(e.to)) neighbor = e.to;
          if (e.to === minNode && unvisited.has(e.from)) neighbor = e.from;
          if (neighbor) {
            const alt = dist[minNode] + e.weight;
            if (alt < dist[neighbor]) {
              dist[neighbor] = alt;
              prev[neighbor] = minNode;
            }
          }
        });
      }

      // Reconstruct path
      this.path = [];
      let current = this.endNode.id;
      while (current !== null) {
        this.path.unshift(current);
        current = prev[current];
      }

      if (this.path[0] !== this.startNode.id) {
        this.path = [];
      }

      this.updateInfo();
      this.render();
    },

    resetSelection() {
      this.startNode = null;
      this.endNode = null;
      this.path = [];
      this.updateInfo();
      this.render();
    },

    updateInfo() {
      const statusEl = document.querySelector('.path-status');
      const resultEl = document.querySelector('.path-result');

      if (!this.startNode) {
        statusEl.textContent = 'Click on two nodes to select start and end points';
        statusEl.style.display = 'block';
        resultEl.style.display = 'none';
      } else if (!this.endNode) {
        statusEl.textContent = `Start: Node ${this.startNode.id} - Click another node for end point`;
        statusEl.style.display = 'block';
        resultEl.style.display = 'none';
      } else if (this.path.length === 0) {
        statusEl.textContent = `Path from Node ${this.startNode.id} to Node ${this.endNode.id} - Click "Find Shortest Path"`;
        statusEl.style.display = 'block';
        resultEl.style.display = 'none';
      } else {
        statusEl.style.display = 'none';
        resultEl.style.display = 'flex';

        let totalWeight = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
          const edge = this.edges.find(e =>
            (e.from === this.path[i] && e.to === this.path[i + 1]) ||
            (e.to === this.path[i] && e.from === this.path[i + 1])
          );
          if (edge) totalWeight += edge.weight;
        }

        document.querySelector('.path-length').textContent = `Shortest path length: ${totalWeight}`;
        document.querySelector('.path-nodes').textContent = `Path: ${this.path.join(' → ')}`;
      }
    },

    render() {
      if (!this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#ccc';
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#2563EB';

      // Draw edges
      this.edges.forEach(e => {
        const from = this.nodes.find(n => n.id === e.from);
        const to = this.nodes.find(n => n.id === e.to);
        if (from && to) {
          const inPath = this.path.length > 1 && this.path.some((id, i) =>
            i < this.path.length - 1 &&
            ((this.path[i] === e.from && this.path[i + 1] === e.to) ||
             (this.path[i] === e.to && this.path[i + 1] === e.from))
          );

          this.ctx.beginPath();
          this.ctx.moveTo(from.x, from.y);
          this.ctx.lineTo(to.x, to.y);
          this.ctx.strokeStyle = inPath ? '#10b981' : borderColor;
          this.ctx.lineWidth = inPath ? 4 : 2;
          this.ctx.stroke();

          // Draw weight
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#fff';
          this.ctx.beginPath();
          this.ctx.arc(midX, midY, 12, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() || '#666';
          this.ctx.font = 'bold 11px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(e.weight, midX, midY);
        }
      });

      // Draw nodes
      this.nodes.forEach(n => {
        let color = accentColor;
        if (n === this.startNode) color = '#10b981';
        else if (n === this.endNode) color = '#ef4444';
        else if (this.path.includes(n.id)) color = '#10b981';

        this.ctx.beginPath();
        this.ctx.arc(n.x, n.y, this.nodeRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(n.id, n.x, n.y);
      });
    }
  };

  // ===== Initialize =====
  function init() {
    graphBuilder.init();
    pathfinder.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIP = window.TIP || {};
  window.TIP.graphTheory = { graphBuilder, pathfinder };
})();
