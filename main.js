document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll(".counter");
  const langButtons = document.querySelectorAll(".lang-btn");
  const bgCanvas = document.getElementById("bg-canvas");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");

  /* Reveal on scroll */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* Counter animation */
  const animateCounter = (el) => {
    const target = +el.dataset.target;
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = "true";
          animateCounter(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  /* Background particles */
  const ctx = bgCanvas.getContext("2d");
  let width = (bgCanvas.width = window.innerWidth);
  let height = (bgCanvas.height = window.innerHeight);

  const particles = [];
  const PARTICLE_COUNT = Math.min(120, Math.floor((width * height) / 18000));

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.radius = Math.random() * 1.6 + 0.35;
      this.speedY = Math.random() * 0.35 + 0.12;
      this.speedX = (Math.random() - 0.5) * 0.18;
      this.alpha = Math.random() * 0.35 + 0.08;
      this.color = Math.random() > 0.78 ? "230,171,32" : "255,255,255";
    }

    update(mouse) {
      this.x += this.speedX;
      this.y -= this.speedY;

      if (this.y < -20) {
        this.reset(false);
      }

      if (mouse) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          const force = (110 - dist) / 110;
          this.x += (dx / dist) * force * 0.9;
          this.y += (dy / dist) * force * 0.4;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${this.color}, ${this.alp
