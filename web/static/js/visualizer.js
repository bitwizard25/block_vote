// P2P Network Mesh Canvas Animation
class NetworkVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [
      { id: 'Node-Alpha (Validator)', x: 0.2, y: 0.5, color: '#00f0ff', pulse: 0 },
      { id: 'Node-Beta (Peer)', x: 0.5, y: 0.25, color: '#10b981', pulse: 0 },
      { id: 'Node-Gamma (Auditor)', x: 0.8, y: 0.5, color: '#8b5cf6', pulse: 0 },
      { id: 'Mempool Pool', x: 0.5, y: 0.75, color: '#f59e0b', pulse: 0 },
    ];
    this.packets = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  emitPacket(fromIdx, toIdx, color = '#00f0ff') {
    this.packets.push({
      from: fromIdx,
      to: toIdx,
      progress: 0,
      color: color,
      speed: 0.02 + Math.random() * 0.02,
    });
  }

  animate() {
    if (!this.canvas) return;
    const w = this.canvas.offsetWidth;
    const h = this.canvas.offsetHeight;
    this.ctx.clearRect(0, 0, w, h);

    // Draw connecting lines
    this.ctx.lineWidth = 1.5;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[j];
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        this.ctx.beginPath();
        this.ctx.moveTo(n1.x * w, n1.y * h);
        this.ctx.lineTo(n2.x * w, n2.y * h);
        this.ctx.stroke();
      }
    }

    // Update and draw packets
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.progress += p.speed;
      const n1 = this.nodes[p.from];
      const n2 = this.nodes[p.to];
      const x = n1.x * w + (n2.x * w - n1.x * w) * p.progress;
      const y = n1.y * h + (n2.y * h - n1.y * h) * p.progress;

      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      if (p.progress >= 1) {
        this.nodes[p.to].pulse = 15;
        this.packets.splice(i, 1);
      }
    }

    // Draw Nodes
    this.nodes.forEach((n) => {
      const x = n.x * w;
      const y = n.y * h;

      if (n.pulse > 0) {
        this.ctx.strokeStyle = n.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 14 + (15 - n.pulse) * 1.5, 0, Math.PI * 2);
        this.ctx.stroke();
        n.pulse--;
      }

      this.ctx.fillStyle = n.color;
      this.ctx.shadowColor = n.color;
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Label
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = '11px JetBrains Mono, monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(n.id, x, y + 24);
    });

    // Random idle packet emit
    if (Math.random() < 0.03 && this.packets.length < 5) {
      const from = Math.floor(Math.random() * this.nodes.length);
      let to = Math.floor(Math.random() * this.nodes.length);
      while (to === from) to = Math.floor(Math.random() * this.nodes.length);
      this.emitPacket(from, to, this.nodes[from].color);
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Interactive SVG Merkle Tree Renderer
class MerkleVisualizer {
  static renderTree(containerId, rootHash, proofSteps, receiptHash) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = 800;
    const height = 340;
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Root node
    const rootX = width / 2;
    const rootY = 50;

    // Levels
    const isVerified = proofSteps && proofSteps.length > 0;
    const rootColor = isVerified ? '#10b981' : '#00f0ff';

    svg += `<circle cx="${rootX}" cy="${rootY}" r="22" fill="#0b1329" stroke="${rootColor}" stroke-width="3"/>`;
    svg += `<text x="${rootX}" y="${rootY + 5}" fill="#fff" font-size="10" font-family="JetBrains Mono" text-anchor="middle">ROOT</text>`;
    svg += `<text x="${rootX}" y="${rootY - 30}" fill="${rootColor}" font-size="11" font-weight="bold" font-family="JetBrains Mono" text-anchor="middle">${rootHash.substring(0, 10)}...</text>`;

    // Render proof branch if available
    if (proofSteps && proofSteps.length > 0) {
      let currX = rootX;
      let currY = rootY;
      for (let i = proofSteps.length - 1; i >= 0; i--) {
        const step = proofSteps[i];
        const nextY = currY + 70;
        const leftX = currX - (60 * (i + 1));
        const rightX = currX + (60 * (i + 1));

        const targetX = step.IsRight ? leftX : rightX;
        const siblingX = step.IsRight ? rightX : leftX;

        // Lines
        svg += `<line x1="${currX}" y1="${currY + 22}" x2="${targetX}" y2="${nextY - 18}" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4"/>`;
        svg += `<line x1="${currX}" y1="${currY + 22}" x2="${siblingX}" y2="${nextY - 18}" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>`;

        // Target (on path)
        svg += `<circle cx="${targetX}" cy="${nextY}" r="18" fill="#064e3b" stroke="#10b981" stroke-width="2.5"/>`;
        svg += `<text x="${targetX}" y="${nextY + 4}" fill="#a7f3d0" font-size="9" font-family="JetBrains Mono" text-anchor="middle">H${i+1}</text>`;

        // Sibling
        svg += `<circle cx="${siblingX}" cy="${nextY}" r="16" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>`;
        svg += `<text x="${siblingX}" y="${nextY + 4}" fill="#94a3b8" font-size="8" font-family="JetBrains Mono" text-anchor="middle">SIB</text>`;

        currX = targetX;
        currY = nextY;
      }

      // Leaf Node (Voter Receipt)
      const leafY = currY + 60;
      svg += `<line x1="${currX}" y1="${currY + 18}" x2="${currX}" y2="${leafY - 20}" stroke="#10b981" stroke-width="3"/>`;
      svg += `<rect x="${currX - 60}" y="${leafY - 18}" width="120" height="36" rx="8" fill="#047857" stroke="#34d399" stroke-width="2"/>`;
      svg += `<text x="${currX}" y="${leafY - 2}" fill="#fff" font-size="10" font-weight="bold" font-family="JetBrains Mono" text-anchor="middle">YOUR RECEIPT</text>`;
      svg += `<text x="${currX}" y="${leafY + 11}" fill="#d1fae5" font-size="9" font-family="JetBrains Mono" text-anchor="middle">${receiptHash.substring(0, 8)}...</text>`;
    } else {
      svg += `<text x="${rootX}" y="${height / 2}" fill="#64748b" font-size="14" font-family="JetBrains Mono" text-anchor="middle">Enter a valid receipt hash to verify cryptographic Merkle path</text>`;
    }

    svg += '</svg>';
    container.innerHTML = svg;
  }
}
