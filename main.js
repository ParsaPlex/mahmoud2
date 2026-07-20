/* =====================================================
   Raman Network - Main JS
   Canvas Background + Technologies Swiper
===================================================== */

(() => {
  "use strict";

  /**
   * اجرای کدها بعد از آماده‌شدن DOM
   */
  function initializeWebsite() {
    initializeCanvasBackground();
    initializeTechnologiesSwiper();
    initializeTechCardTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWebsite, {
      once: true
    });
  } else {
    initializeWebsite();
  }

  /* =====================================================
     CANVAS BACKGROUND
  ===================================================== */

  function initializeCanvasBackground() {
    const canvas = document.getElementById("bg-canvas");

    /*
     * اگر Canvas وجود نداشت، فقط همین بخش متوقف می‌شود.
     * Swiper و سایر بخش‌های سایت همچنان اجرا خواهند شد.
     */
    if (!canvas) {
      console.warn(
        'Canvas background disabled: element "#bg-canvas" was not found.'
      );
      return;
    }

    const ctx = canvas.getContext("2d", {
      alpha: true
    });

    if (!ctx) {
      console.warn("Canvas background disabled: 2D context is unavailable.");
      return;
    }

    const state = {
      width: 0,
      height: 0,
      dpr: 1,
      mouseX: 0,
      mouseY: 0,
      targetX: 0,
      targetY: 0,
      particles: [],
      animationFrameId: null
    };

    const config = {
      mobile: window.innerWidth < 768,
      particleCount: window.innerWidth < 768 ? 58 : 105,
      maxDistance: window.innerWidth < 768 ? 120 : 150,
      particleRadius: window.innerWidth < 768 ? 1.15 : 1.6,
      motion: 0.28
    };

    function updateResponsiveConfig() {
      config.mobile = window.innerWidth < 768;
      config.particleCount = config.mobile ? 58 : 105;
      config.maxDistance = config.mobile ? 120 : 150;
      config.particleRadius = config.mobile ? 1.15 : 1.6;
    }

    function resizeCanvas() {
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(state.width * state.dpr);
      canvas.height = Math.floor(state.height * state.dpr);

      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;

      /*
       * مختصات رسم را بر اساس CSS Pixel نگه می‌دارد
       * ولی خروجی را در نمایشگرهای Retina واضح می‌کند.
       */
      ctx.setTransform(
        state.dpr,
        0,
        0,
        state.dpr,
        0,
        0
      );
    }

    function randomBetween(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createParticles() {
      state.particles = [];

      const spreadX = state.width * 0.9;
      const spreadY = state.height * 0.8;

      for (let i = 0; i < config.particleCount; i++) {
        state.particles.push({
          x: randomBetween(-spreadX * 0.1, spreadX),
          y: randomBetween(-spreadY * 0.05, spreadY),
          vx: randomBetween(-0.22, 0.22),
          vy: randomBetween(-0.16, 0.16),
          radius: randomBetween(
            config.particleRadius * 0.7,
            config.particleRadius * 1.35
          ),
          color: Math.random() > 0.82 ? "blue" : "gold"
        });
      }
    }

    function drawBackground() {
      /*
       * فریم قبلی پاک می‌شود تا Canvas به‌مرور بیش از حد
       * روشن یا مات نشود.
       */
      ctx.clearRect(0, 0, state.width, state.height);

      const gradient = ctx.createRadialGradient(
        state.width * 0.25,
        state.height * 0.12,
        0,
        state.width * 0.25,
        state.height * 0.12,
        Math.max(state.width, state.height) * 0.9
      );

      gradient.addColorStop(0, "rgba(227, 166, 23, 0.08)");
      gradient.addColorStop(0.55, "rgba(5, 9, 19, 0.18)");
      gradient.addColorStop(1, "rgba(5, 9, 19, 0)");

      ctx.fillStyle = "rgba(5, 9, 19, 0.18)";
      ctx.fillRect(0, 0, state.width, state.height);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, state.width, state.height);
    }

    function drawParticlesAndLines() {
      const maxDistance = config.maxDistance;
      const maxDistanceSquared = maxDistance * maxDistance;

      for (let i = 0; i < state.particles.length; i++) {
        const particle = state.particles[i];

        particle.x += particle.vx + state.mouseX * 0.012;
        particle.y += particle.vy + state.mouseY * 0.012;

        const padding = 40;

        if (particle.x < -padding) {
          particle.x = state.width + padding;
        }

        if (particle.x > state.width + padding) {
          particle.x = -padding;
        }

        if (particle.y < -padding) {
          particle.y = state.height + padding;
        }

        if (particle.y > state.height + padding) {
          particle.y = -padding;
        }

        ctx.beginPath();

        ctx.fillStyle =
          particle.color === "gold"
            ? "rgba(240, 194, 87, 0.85)"
            : "rgba(110, 168, 255, 0.8)";

        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fill();

        for (let j = i + 1; j < state.particles.length; j++) {
          const secondParticle = state.particles[j];

          const differenceX = particle.x - secondParticle.x;
          const differenceY = particle.y - secondParticle.y;

          const distanceSquared =
            differenceX * differenceX +
            differenceY * differenceY;

          if (distanceSquared < maxDistanceSquared) {
            const distance = Math.sqrt(distanceSquared);
            const opacity = 1 - distance / maxDistance;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(227, 166, 23, ${opacity * 0.18})`;
            ctx.lineWidth = 1;

            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(secondParticle.x, secondParticle.y);

            ctx.stroke();
          }
        }
      }
    }

    function animateCanvas() {
      state.mouseX +=
        (state.targetX - state.mouseX) * 0.04;

      state.mouseY +=
        (state.targetY - state.mouseY) * 0.04;

      drawBackground();
      drawParticlesAndLines();

      state.animationFrameId =
        window.requestAnimationFrame(animateCanvas);
    }

    function handleMouseMove(event) {
      const normalizedX =
        (event.clientX / window.innerWidth - 0.5) * 2;

      const normalizedY =
        (event.clientY / window.innerHeight - 0.5) * 2;

      state.targetX = normalizedX * config.motion;
      state.targetY = normalizedY * config.motion;
    }

    function resetMousePosition() {
      state.targetX = 0;
      state.targetY = 0;
    }

    let resizeTimeout = null;

    function handleResize() {
      window.clearTimeout(resizeTimeout);

      resizeTimeout = window.setTimeout(() => {
        updateResponsiveConfig();
        resizeCanvas();
        createParticles();
      }, 120);
    }

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true
    });

    window.addEventListener("mouseleave", resetMousePosition);

    window.addEventListener("resize", handleResize, {
      passive: true
    });

    updateResponsiveConfig();
    resizeCanvas();
    createParticles();
    animateCanvas();
  }

  /* =====================================================
     TECHNOLOGIES SWIPER
  ===================================================== */

  function initializeTechnologiesSwiper() {
    const swiperElement =
      document.querySelector(".techSwiper");

    /*
     * اگر اسلایدر در این صفحه وجود نداشت، فقط همین بخش
     * اجرا نمی‌شود و خطایی برای بقیه سایت ایجاد نمی‌کند.
     */
    if (!swiperElement) {
      console.warn(
        'Technologies Swiper disabled: element ".techSwiper" was not found.'
      );
      return;
    }

    /*
     * مانع ساخته‌شدن چندباره Swiper روی یک عنصر می‌شود.
     */
    if (swiperElement.dataset.swiperInitialized === "true") {
      return;
    }

    /*
     * بررسی می‌کند فایل کتابخانه Swiper واقعاً بارگذاری شده باشد.
     */
    if (typeof window.Swiper !== "function") {
      console.error(
        "Swiper initialization failed: Swiper library is not loaded."
      );
      return;
    }

    function updateActiveCard(swiper) {
      if (!swiper || !swiper.el) return;

      const allCards =
        swiper.el.querySelectorAll(".tech-card");

      allCards.forEach((card) => {
        card.classList.remove("active-card");
      });

      const activeSlide = swiper.slides?.[swiper.activeIndex];

      if (!activeSlide) return;

      const activeCard =
        activeSlide.querySelector(".tech-card");

      if (activeCard) {
        activeCard.classList.add("active-card");
      }
    }

    const techSwiper = new window.Swiper(swiperElement, {
      loop: false,
rewind: true,


      slidesPerView: "auto",
      centeredSlides: true,
      spaceBetween: 24,

      speed: 700,

      grabCursor: true,
      allowTouchMove: true,
      simulateTouch: true,

      watchSlidesProgress: true,
      observer: true,
      observeParents: true,
      resizeObserver: true,

      effect: "coverflow",

      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 170,
        modifier: 1,
        scale: 0.88,
        slideShadows: false
      },

      autoplay: {
        delay: 2200,
        disableOnInteraction: false,
        pauseOnMouseEnter: false
      },

      /*
       * با کلیک روی کارت کناری، همان کارت فعال می‌شود.
       */
      slideToClickedSlide: true,

      /*
       * پشتیبانی از کلیدهای چپ و راست؛ فقط وقتی اسلایدر
       * داخل Viewport قرار دارد.
       */
      keyboard: {
        enabled: true,
        onlyInViewport: true,
        pageUpDown: false
      },

      breakpoints: {
        0: {
          spaceBetween: 12
        },

        480: {
          spaceBetween: 14
        },

        768: {
          spaceBetween: 18
        },

        1200: {
          spaceBetween: 24
        }
      },

      on: {
        init(swiper) {
          updateActiveCard(swiper);
        },

        slideChange(swiper) {
          updateActiveCard(swiper);
        },

        slideChangeTransitionEnd(swiper) {
          updateActiveCard(swiper);
        },

        loopFix(swiper) {
          updateActiveCard(swiper);
        }
      }
    });

    swiperElement.dataset.swiperInitialized = "true";

    /*
     * اطمینان از فعال‌شدن کارت اولیه
     */
    updateActiveCard(techSwiper);

    /* =====================================================
       PAUSE AUTOPLAY WHEN TAB IS HIDDEN
    ===================================================== */

    document.addEventListener("visibilitychange", () => {
      if (
        techSwiper.destroyed ||
        !techSwiper.autoplay
      ) {
        return;
      }

      if (document.hidden) {
        techSwiper.autoplay.stop();
      } else {
        techSwiper.autoplay.start();
      }
    });
  }

  /* =====================================================
     TECHNOLOGY CARDS — 3D HOVER TILT
  ===================================================== */

  function initializeTechCardTilt() {
    const cards =
      document.querySelectorAll(".tech-card");

    if (!cards.length) return;

    const desktopPointer = window.matchMedia(
      "(min-width: 992px) and (hover: hover) and (pointer: fine)"
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        if (
          !desktopPointer.matches ||
          reducedMotion.matches
        ) {
          return;
        }

        const rectangle =
          card.getBoundingClientRect();

        const pointerX =
          event.clientX - rectangle.left;

        const pointerY =
          event.clientY - rectangle.top;

        const rotateY =
          (pointerX / rectangle.width - 0.5) * 12;

        const rotateX =
          (0.5 - pointerY / rectangle.height) * 10;

        card.style.transform = `
          perspective(900px)
          rotateX(${rotateX.toFixed(2)}deg)
          rotateY(${rotateY.toFixed(2)}deg)
          translateY(-8px)
        `;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });

      card.addEventListener("pointercancel", () => {
        card.style.transform = "";
      });
    });
  }
})();
