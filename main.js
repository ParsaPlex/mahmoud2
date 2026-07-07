/* =====================================================
   Raman Network - Main JS
   Lightweight, debugged, no custom cursor, no preloader
===================================================== */

(() => {
  "use strict";

  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  const state = {
    width: 0,
    height: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    particles: [],
    lines: []
  };

  const config = {
    mobile: window.innerWidth < 768,
    particleCount: window.innerWidth < 768 ? 58 : 105,
    maxDistance: window.innerWidth < 768 ? 120 : 150,
    particleRadius: window.innerWidth < 768 ? 1.15 : 1.6,
    motion: 0.28
  };

  function resizeCanvas() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;

    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticles() {
    state.particles = [];

    const spreadX = state.width * 0.9;
    const spreadY = state.height * 0.8;

    for (let i = 0; i < config.particleCount; i++) {
      state.particles.push({
        x: rand(-spreadX * 0.1, spreadX),
        y: rand(-spreadY * 0.05, spreadY),
        vx: rand(-0.22, 0.22),
        vy: rand(-0.16, 0.16),
        r: rand(config.particleRadius * 0.7, config.particleRadius * 1.35),
        hue: Math.random() > 0.82 ? "blue" : "gold"
      });
    }
  }

  function drawBackground() {
    const gradient = ctx.createRadialGradient(
      state.width * 0.25,
      state.height * 0.12,
      0,
      state.width * 0.25,
      state.height * 0.12,
      Math.max(state.width, state.height) * 0.9
    );

    gradient.addColorStop(0, "rgba(227,166,23,0.08)");
    gradient.addColorStop(0.55, "rgba(5,9,19,0.18)");
    gradient.addColorStop(1, "rgba(5,9,19,0.0)");

    ctx.fillStyle = "rgba(5,9,19,0.18)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function drawParticlesAndLines() {
    const maxDist = config.maxDistance;
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];

      p.x += p.vx + state.mouseX * 0.012;
      p.y += p.vy + state.mouseY * 0.012;

      const pad = 40;

      if (p.x < -pad) p.x = state.width + pad;
      if (p.x > state.width + pad) p.x = -pad;
      if (p.y < -pad) p.y = state.height + pad;
      if (p.y > state.height + pad) p.y = -pad;

      ctx.beginPath();
      ctx.fillStyle =
        p.hue === "gold"
          ? "rgba(240,194,87,0.85)"
          : "rgba(110,168,255,0.8)";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < state.particles.length; j++) {
        const q = state.particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const alpha = 1 - Math.sqrt(distSq) / maxDist;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(227,166,23,${alpha * 0.18})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    state.mouseX += (state.targetX - state.mouseX) * 0.04;
    state.mouseY += (state.targetY - state.mouseY) * 0.04;

    drawBackground();
    drawParticlesAndLines();

    requestAnimationFrame(animate);
  }

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    state.targetX = x * config.motion;
    state.targetY = y * config.motion;
  });

  window.addEventListener("mouseleave", () => {
    state.targetX = 0;
    state.targetY = 0;
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    config.mobile = window.innerWidth < 768;
    config.particleCount = config.mobile ? 58 : 105;
    config.maxDistance = config.mobile ? 120 : 150;
    config.particleRadius = config.mobile ? 1.15 : 1.6;
    createParticles();
  });

  resizeCanvas();
  createParticles();
  animate();
});
})();
