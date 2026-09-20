import React, { useRef, useEffect } from 'react';

export default function P2PCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes = [
      { id: 'Node-Alpha (Validator)', x: 0.18, y: 0.5, color: '#0071e3', pulse: 0 },
      { id: 'Node-Beta (Peer)', x: 0.5, y: 0.22, color: '#34c759', pulse: 0 },
      { id: 'Node-Gamma (Auditor)', x: 0.82, y: 0.5, color: '#af52de', pulse: 0 },
      { id: 'Mempool Daemon', x: 0.5, y: 0.78, color: '#ff9f0a', pulse: 0 },
    ];
    let packets = [];
    let animationId;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Connecting lines
      ctx.lineWidth = 1.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.beginPath();
          ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
          ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
          ctx.stroke();
        }
      }

      // Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        const n1 = nodes[p.from];
        const n2 = nodes[p.to];
        const x = n1.x * w + (n2.x * w - n1.x * w) * p.progress;
        const y = n1.y * h + (n2.y * h - n1.y * h) * p.progress;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (p.progress >= 1) {
          nodes[p.to].pulse = 14;
          packets.splice(i, 1);
        }
      }

      // Draw Nodes
      nodes.forEach(n => {
        const x = n.x * w;
        const y = n.y * h;

        if (n.pulse > 0) {
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 12 + (14 - n.pulse) * 1.5, 0, Math.PI * 2);
          ctx.stroke();
          n.pulse--;
        }

        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.id, x, y + 22);
      });

      // Random packet
      if (Math.random() < 0.025 && packets.length < 5) {
        const from = Math.floor(Math.random() * nodes.length);
        let to = Math.floor(Math.random() * nodes.length);
        while (to === from) to = Math.floor(Math.random() * nodes.length);
        packets.push({ from, to, progress: 0, color: nodes[from].color, speed: 0.018 + Math.random() * 0.02 });
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '210px',
        borderRadius: '14px',
        background: 'rgba(10, 10, 15, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    />
  );
}
