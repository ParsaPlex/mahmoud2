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
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  const mouse = { x: width / 2, y: height / 2, active: false };

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  const resizeCanvas = () => {
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;
  };

  window.addEventListener("resize", resizeCanvas);

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(10, 14, 26, 0.12)";
    ctx.fillRect(0, 0, width, height);

    particles.forEach((p) => {
      p.update(mouse.active ? mouse : null);
      p.draw();
    });

    requestAnimationFrame(render);
  };

  render();

  /* Language toggle */
  const translations = {
    en: {
      nav_services: "Services",
      nav_projects: "Projects",
      nav_technologies: "Technologies",
      nav_certificates: "Certificates",
      nav_contact: "Contact us",
      hero_eyebrow: "Enterprise Network Engineering",
      hero_title: "Reliable Network Infrastructure Built for Modern Organizations.",
      hero_description:
        "Experienced IT Infrastructure and Network Consultant with over 10 years of experience delivering enterprise networking, cybersecurity, and server administration.",
      hero_primary: "Explore services",
      hero_secondary: "View certificates",
      metric_years: "Years Experience",
      metric_clients: "Business Clients",
      metric_uptime: "Uptime Focus",
      status_secure: "Secure Tunnel Active",
      status_health: "Server Health Stable",
      trust_1: "Server Infrastructure",
      trust_2: "Network Architecture",
      trust_3: "Branch Connectivity",
      trust_4: "Security Monitoring",
      services_kicker: "Core Services",
      services_title: "Infrastructure services designed for stability, speed and security.",
      services_desc:
        "From server deployment to secure office-to-office connectivity, every layer is planned, documented and optimized for long-term reliability.",
      svc1_title: "Server Deployment & Configuration",
      svc1_1: "Installation of server operating systems including Windows Server and Linux",
      svc1_2: "Active Directory, DNS and DHCP service deployment",
      svc1_3: "RAID configuration, backup planning and infrastructure monitoring",
      svc2_title: "Network Hardware Consulting",
      svc2_1: "Technical requirement analysis and professional hardware recommendations",
      svc2_2: "Comparison of leading brands such as Cisco, MikroTik and Ubiquiti",
      svc2_3: "Quotation support, pricing research and equipment planning",
      svc3_title: "Internal Network Design & Maintenance",
      svc3_1: "Network topology design including Star, Mesh and Hybrid architectures",
      svc3_2: "Structured cabling, rack installation and patch panel organization",
      svc3_3: "Documentation, preventive maintenance and lifecycle support",
      svc4_title: "Branch & Office Connectivity",
      svc4_1: "Site-to-Site VPN deployment between offices and branches",
      svc4_2: "MPLS, IPsec and L2TP-based secure connectivity solutions",
      svc4_3: "Security monitoring, tunnel health checks and technical support",
      why_kicker: "Why Raman Network",
      why_title: "Engineered with operational precision.",
      why_desc:
        "Every design decision is made to reduce friction, improve resilience and keep operations visible and controlled.",
      adv1_title: "Performance",
      adv1_desc: "Optimized data flow, low-latency routing and structured infrastructure decisions.",
      adv2_title: "Security",
      adv2_desc: "Protected architecture, layered access control and monitoring-first deployment.",
      adv3_title: "Reliability",
      adv3_desc: "Stable operations, proactive maintenance and documented recovery paths.",
      cta_kicker: "Demo Landing Page",
      cta_title: "Build a network foundation your organization can depend on.",
      cta_btn: "Start Infrastructure Planning",
      footer_brand: "Enterprise network engineering for secure, scalable and reliable IT environments.",
      footer_services: "Services",
      footer_s1: "Server Deployment",
      footer_s2: "Network Consulting",
      footer_s3: "Connectivity Solutions",
      footer_infra: "Infrastructure",
      footer_i1: "Security Monitoring",
      footer_i2: "Operational Stability",
      footer_i3: "Certificates",
    },
    fa: {
      nav_services: "خدمات",
      nav_projects: "پروژه‌ها",
      nav_technologies: "فناوری‌ها",
      nav_certificates: "گواهی‌ها",
      nav_contact: "تماس با ما",
      hero_eyebrow: "مهندسی شبکه سازمانی",
      hero_title: "زیرساخت شبکه‌ی قابل‌اعتماد برای سازمان‌های مدرن.",
      hero_description:
        "مشاور با‌تجربه‌ی زیرساخت IT و شبکه با بیش از ۱۰ سال تجربه در اجرای شبکه‌های سازمانی، امنیت سایبری و مدیریت سرور.",
      hero_primary: "مشاهده خدمات",
      hero_secondary: "دیدن گواهی‌ها",
      metric_years: "سال تجربه",
      metric_clients: "مشتری سازمانی",
      metric_uptime: "تمرکز بر پایداری",
      status_secure: "تونل امن فعال است",
      status_health: "سلامت سرور پایدار است",
      trust_1: "زیرساخت سرور",
      trust_2: "معماری شبکه",
      trust_3: "اتصال شعب",
      trust_4: "پایش امنیت",
      services_kicker: "خدمات اصلی",
      services_title: "خدمات زیرساختی برای پایداری، سرعت و امنیت.",
      services_desc:
        "از استقرار سرور تا اتصال امن بین دفاتر، هر لایه با دقت برنامه‌ریزی، مستندسازی و برای پایداری بلندمدت بهینه می‌شود.",
      svc1_title: "استقرار و پیکربندی سرور",
      svc1_1: "نصب سیستم‌عامل‌های سرور از جمله Windows Server و Linux",
      svc1_2: "راه‌اندازی Active Directory، DNS و DHCP",
      svc1_3: "پیکربندی RAID، برنامه‌ریزی بکاپ و پایش زیرساخت",
      svc2_title: "مشاوره سخت‌افزار شبکه",
      svc2_1: "تحلیل نیاز فنی و پیشنهاد حرفه‌ای تجهیزات",
      svc2_2: "مقایسه برندهای Cisco، MikroTik و Ubiquiti",
      svc2_3: "پشتیبانی استعلام، بررسی قیمت و برنامه‌ریزی خرید",
      svc3_title: "طراحی و نگهداری شبکه داخلی",
      svc3_1: "طراحی توپولوژی Star، Mesh و Hybrid",
      svc3_2: "کابل‌کشی ساخت‌یافته، رک و سازمان‌دهی پچ‌پنل",
      svc3_3: "مستندسازی، نگهداری پیشگیرانه و پشتیبانی چرخه عمر",
      svc4_title: "اتصال شعب و دفاتر",
      svc4_1: "راه‌اندازی Site-to-Site VPN بین دفاتر و شعب",
      svc4_2: "راهکارهای امن مبتنی بر MPLS، IPsec و L2TP",
      svc4_3: "پایش امنیت، بررسی سلامت تونل و پشتیبانی فنی",
      why_kicker: "چرا Raman Network",
      why_title: "مهندسی‌شده با دقت عملیاتی.",
      why_desc:
        "هر تصمیم طراحی برای کاهش اصطکاک، افزایش تاب‌آوری و حفظ کنترل‌پذیری عملیات گرفته می‌شود.",
      adv1_title: "کارایی",
      adv1_desc: "جریان داده‌ی بهینه، مسیریابی کم‌تاخیر و تصمیم‌های ساخت‌یافته.",
      adv2_title: "امنیت",
      adv2_desc: "معماری محافظت‌شده، کنترل دسترسی لایه‌ای و استقرار مبتنی بر پایش.",
      adv3_title: "پایداری",
      adv3_desc: "عملیات پایدار، نگهداری پیشگیرانه و مسیرهای بازیابی مستند.",
      cta_kicker: "صفحه‌ی نمونه",
      cta_title: "پایه‌ای بسازید که سازمان شما بتواند روی آن تکیه کند.",
      cta_btn: "شروع برنامه‌ریزی زیرساخت",
      footer_brand: "مهندسی شبکه سازمانی برای محیط‌های IT امن، مقیاس‌پذیر و قابل‌اعتماد.",
      footer_services: "خدمات",
      footer_s1: "استقرار سرور",
      footer_s2: "مشاوره شبکه",
      footer_s3: "راهکارهای اتصال",
      footer_infra: "زیرساخت",
      footer_i1: "پایش امنیت",
      footer_i2: "پایداری عملیاتی",
      footer_i3: "گواهی‌ها",
    },
  };

  const applyLanguage = (lang) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (translations[lang][key]) el.textContent = translations[lang][key];
    });

    langButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === lang));
  };

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
  });

  /* Mobile menu */
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      const expanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      mobileMenuBtn.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("is-open");
    });
  }

  /* Default state */
  applyLanguage("en");
});
