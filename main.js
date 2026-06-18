gsap.registerPlugin(ScrollTrigger);

/* =========================
   Preloader
========================= */

window.addEventListener("load", () => {
    const tl = gsap.timeline();

    tl.to(".loader-mark", {
        scale: 0.82,
        opacity: 0,
        duration: 0.35,
        ease: "power2.out"
    })
    .to(".loader-text", {
        y: -10,
        opacity: 0,
        duration: 0.35,
        ease: "power2.out"
    }, "-=0.2")
    .to("#preloader", {
        opacity: 0,
        duration: 0.65,
        ease: "power2.inOut",
        onComplete: () => {
            document.getElementById("preloader").style.display = "none";
            document.body.classList.add("site-loaded");
        }
    }, "-=0.1");
});


/* =========================
   Three.js Network Background
========================= */

const canvas = document.querySelector("#bg-canvas");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

/* Particle Settings */
const isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 75 : 155;
const connectionDistance = isMobile ? 1.15 : 1.28;
const areaSize = isMobile ? 8 : 11;

const particlePositions = new Float32Array(particleCount * 3);
const particleVelocities = [];

for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    particlePositions[i3] = (Math.random() - 0.5) * areaSize;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * areaSize;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * areaSize;

    particleVelocities.push({
        x: (Math.random() - 0.5) * 0.004,
        y: (Math.random() - 0.5) * 0.004,
        z: (Math.random() - 0.5) * 0.004
    });
}

/* Points */
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
    color: 0xe3a617,
    size: isMobile ? 0.035 : 0.045,
    transparent: true,
    opacity: 0.82,
    sizeAttenuation: true
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/* Lines */
const maxConnections = particleCount * particleCount;
const linePositions = new Float32Array(maxConnections * 3 * 2);

const linesGeometry = new THREE.BufferGeometry();
linesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3)
);

linesGeometry.setDrawRange(0, 0);

const linesMaterial = new THREE.LineBasicMaterial({
    color: 0xe3a617,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const networkLines = new THREE.LineSegments(linesGeometry, linesMaterial);
scene.add(networkLines);

/* Mouse Parallax */
const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
};

window.addEventListener("mousemove", (event) => {
    mouse.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
});

/* Animation Loop */
function animateNetwork() {
    requestAnimationFrame(animateNetwork);

    mouse.x += (mouse.targetX - mouse.x) * 0.045;
    mouse.y += (mouse.targetY - mouse.y) * 0.045;

    let vertexPosition = 0;
    let connectionCount = 0;

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        particlePositions[i3] += particleVelocities[i].x + mouse.x * 0.0009;
        particlePositions[i3 + 1] += particleVelocities[i].y - mouse.y * 0.0009;
        particlePositions[i3 + 2] += particleVelocities[i].z;

        if (particlePositions[i3] > areaSize / 2 || particlePositions[i3] < -areaSize / 2) {
            particleVelocities[i].x *= -1;
        }

        if (particlePositions[i3 + 1] > areaSize / 2 || particlePositions[i3 + 1] < -areaSize / 2) {
            particleVelocities[i].y *= -1;
        }

        if (particlePositions[i3 + 2] > areaSize / 2 || particlePositions[i3 + 2] < -areaSize / 2) {
            particleVelocities[i].z *= -1;
        }

        for (let j = i + 1; j < particleCount; j++) {
            const j3 = j * 3;

            const dx = particlePositions[i3] - particlePositions[j3];
            const dy = particlePositions[i3 + 1] - particlePositions[j3 + 1];
            const dz = particlePositions[i3 + 2] - particlePositions[j3 + 2];

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < connectionDistance) {
                linePositions[vertexPosition++] = particlePositions[i3];
                linePositions[vertexPosition++] = particlePositions[i3 + 1];
                linePositions[vertexPosition++] = particlePositions[i3 + 2];

                linePositions[vertexPosition++] = particlePositions[j3];
                linePositions[vertexPosition++] = particlePositions[j3 + 1];
                linePositions[vertexPosition++] = particlePositions[j3 + 2];

                connectionCount++;
            }
        }
    }

    particlesGeometry.attributes.position.needsUpdate = true;
    linesGeometry.attributes.position.needsUpdate = true;
    linesGeometry.setDrawRange(0, connectionCount * 2);

    particles.rotation.y += 0.0009;
    particles.rotation.x += 0.00035;

    networkLines.rotation.y = particles.rotation.y;
    networkLines.rotation.x = particles.rotation.x;

    particles.rotation.y += mouse.x * 0.0008;
    particles.rotation.x += mouse.y * 0.0008;

    renderer.render(scene, camera);
}

animateNetwork();

/* Resize */
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
});


/* =========================
   Custom Cursor
========================= */

const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (event) => {
        gsap.to(cursorDot, {
            x: event.clientX,
            y: event.clientY,
            duration: 0.08,
            ease: "power2.out"
        });

        gsap.to(cursorOutline, {
            x: event.clientX,
            y: event.clientY,
            duration: 0.22,
            ease: "power2.out"
        });
    });

    const interactiveItems = document.querySelectorAll("a, button, .service-card, .advantage-card");

    interactiveItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
            gsap.to(cursorOutline, {
                width: 58,
                height: 58,
                borderColor: "rgba(227, 166, 23, 0.95)",
                duration: 0.2
            });
        });

        item.addEventListener("mouseleave", () => {
            gsap.to(cursorOutline, {
                width: 38,
                height: 38,
                borderColor: "rgba(227, 166, 23, 0.65)",
                duration: 0.2
            });
        });
    });
}


/* =========================
   Magnetic Buttons
========================= */

const magneticItems = document.querySelectorAll(".magnetic");

magneticItems.forEach((item) => {
    item.addEventListener("mousemove", (event) => {
        const rect = item.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsap.to(item, {
            x: x * 0.28,
            y: y * 0.28,
            duration: 0.35,
            ease: "power3.out"
        });
    });

    item.addEventListener("mouseleave", () => {
        gsap.to(item, {
            x: 0,
            y: 0,
            duration: 0.45,
            ease: "elastic.out(1, 0.45)"
        });
    });
});


/* =========================
   Scroll Reveal Animations
========================= */

gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true
        }
    });
});


/* =========================
   Hero Entrance Animation
========================= */

const heroTimeline = gsap.timeline({
    delay: 0.35
});

heroTimeline
    .to(".hero .reveal", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out"
    })
    .from(".orb-shell", {
        scale: 0.84,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out"
    }, "-=0.8")
    .from(".status-card", {
        opacity: 0,
        y: 18,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out"
    }, "-=0.55");


/* =========================
   Scroll Parallax
========================= */

gsap.to(".orb-shell", {
    y: -70,
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.2
    }
});

gsap.to(".status-card-top", {
    y: -42,
    x: 18,
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.4
    }
});

gsap.to(".status-card-bottom", {
    y: 38,
    x: -16,
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.4
    }
});


/* =========================
   Demo Mode
   All links are intentionally inactive.
========================= */

document.querySelectorAll("a[href='javascript:void(0)']").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
    });
});
