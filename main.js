document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;

  const rootStyles = getComputedStyle(document.documentElement);
  const bgColor = rootStyles.getPropertyValue("--bg-soft").trim() || "#080f1f";
  const accentColor = rootStyles.getPropertyValue("--accent").trim() || "#e3a617";
  const mutedColor = rootStyles.getPropertyValue("--muted").trim() || "#9aa5b4";

  const pointer = {
    x: -9999,
    y: -9999,
    active: false,
  };

  const nodes = [];
  const NODE_COUNT = 46;
  const MAX_LINK_DISTANCE = 145;

  function parseColor(color) {
    const el = document.createElement("div");
    el.style.color = color;
    document.body.appendChild(el);
    const rgb = getComputedStyle(el).color;
    document.body.removeChild(el);

    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return [255, 255, 255];
    return match.slice(0, 3).map(Number);
  }

  const accentRGB = parseColor(accentColor);
  const mutedRGB = parseColor(mutedColor);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createNodes() {
    nodes.length = 0;

    const mobile = width < 768;
    const count = mobile ? 28 : NODE_COUNT;

    for (let i = 0; i < count; i++) {
      const isAccent = Math.random() > 0.75;

      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size: 2 + Math.random() * 2.8,
        phase: Math.random() * Math.PI * 2,
        colorType: isAccent ? "accent" : "muted",
      });
    }
  }

  function drawBackground() {
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, bgColor);
    gradient.addColorStop(1, "#050913");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // soft ambient glow
    const glow = ctx.createRadialGradient(
      width * 0.78,
      height * 0.2,
      0,
      width * 0.78,
      height * 0.2,
      Math.max(width, height) * 0.75
    );
    glow.addColorStop(0, "rgba(227, 166, 23, 0.08)");
    glow.addColorStop(0.35, "rgba(63, 167, 255, 0.03)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_LINK_DISTANCE) {
          const alpha = (1 - dist / MAX_LINK_DISTANCE) * 0.13;

          ctx.strokeStyle = `rgba(${accentRGB[0]}, ${accentRGB[1]}, ${accentRGB[2]}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawNodes(time) {
    for (const node of nodes) {
      const pulse = 0.65 + Math.sin(time * 0.001 + node.phase) * 0.12;
      const isAccent = node.colorType === "accent";

      const rgb = isAccent ? accentRGB : mutedRGB;
      const alpha = isAccent ? 0.88 : 0.7;
      const size = node.size * (0.9 + pulse * 0.18);

      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
      ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size);
    }
  }

  function updateNodes() {
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;

      // gentle wrap-around
      if (node.x < -30) node.x = width + 30;
      if (node.x > width + 30) node.x = -30;
      if (node.y < -30) node.y = height + 30;
      if (node.y > height + 30) node.y = -30;

      // soft pointer repulsion
      if (pointer.active) {
        const dx = node.x - pointer.x;
        const dy = node.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 140;

        if (dist > 0 && dist < radius) {
          const force = ((radius - dist) / radius) * 0.38;
          node.x += (dx / dist) * force;
          node.y += (dy / dist) * force;
        }
      }
    }
  }

  function animate(time) {
    drawBackground();
    updateNodes();
    drawConnections();
    drawNodes(time);

    rafId = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    resize();
    createNodes();
  });

  window.addEventListener("mousemove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  });

  window.addEventListener("mouseleave", () => {
    pointer.active = false;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId) {
      animate(performance.now());
    }
  });

  resize();
  createNodes();
  animate(performance.now());
});
