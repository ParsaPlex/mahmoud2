gsap.registerPlugin(ScrollTrigger);

/* =========================
   Language System
========================= */

const translations = {
    en: {},
    fa: {}
};

function applyLanguage(lang) {

    const html = document.documentElement;

    if (lang === "fa") {
        html.setAttribute("dir", "rtl");
        html.setAttribute("lang", "fa");
    } else {
        html.setAttribute("dir", "ltr");
        html.setAttribute("lang", "en");
    }

    localStorage.setItem("site-language", lang);

    document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.dataset.translate;

        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

document.querySelectorAll(".lang-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        const lang = btn.dataset.lang;

        applyLanguage(lang);

        closePreloader();
    });

});

function closePreloader() {

    const tl = gsap.timeline();

    tl.to(".loader-mark", {
        scale: 0.82,
        opacity: 0,
        duration: 0.35
    })
    .to(".loader-text", {
        opacity: 0,
        duration: 0.35
    }, "-=0.2")
    .to("#preloader", {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {

            const preloader = document.getElementById("preloader");

            if (preloader) {
                preloader.style.display = "none";
            }

            document.body.classList.remove("preloader-active");
            document.body.classList.add("site-loaded");

        }
    });
}

window.addEventListener("DOMContentLoaded", () => {

    const savedLang = localStorage.getItem("site-language");

    if (savedLang) {
        applyLanguage(savedLang);
        closePreloader();
    }

});

/* safety fallback */
setTimeout(() => {

    const preloader = document.getElementById("preloader");

    if (preloader && preloader.style.display !== "none") {
        closePreloader();
    }

}, 6000);


/* =========================
   Mobile Menu
========================= */

const menuBtn = document.querySelector(".mobile-menu-btn");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuBtn && mobileMenu) {

    menuBtn.addEventListener("click", () => {

        menuBtn.classList.toggle("active");
        mobileMenu.classList.toggle("active");

        document.body.classList.toggle("menu-open");

    });

    mobileMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menuBtn.classList.remove("active");
            mobileMenu.classList.remove("active");
            document.body.classList.remove("menu-open");

        });

    });

}


/* =========================
   Three.js Network Background
========================= */

if (typeof THREE !== "undefined") {

const canvas = document.querySelector("#bg-canvas");

if (canvas) {

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

const particlesGeometry = new THREE.BufferGeometry();

particlesGeometry.setAttribute(
"position",
new THREE.BufferAttribute(particlePositions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
color: 0xe3a617,
size: isMobile ? 0.035 : 0.045,
transparent: true,
opacity: 0.82
});

const particles = new THREE.Points(
particlesGeometry,
particlesMaterial
);

scene.add(particles);

/* Lines */

const maxConnections = particleCount * particleCount;
const linePositions = new Float32Array(maxConnections * 6);

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

const networkLines = new THREE.LineSegments(
linesGeometry,
linesMaterial
);

scene.add(networkLines);

/* Mouse */

const mouse = {
x: 0,
y: 0,
targetX: 0,
targetY: 0
};

window.addEventListener("mousemove", e => {

mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;

});

function animateNetwork() {

requestAnimationFrame(animateNetwork);

mouse.x += (mouse.targetX - mouse.x) * 0.045;
mouse.y += (mouse.targetY - mouse.y) * 0.045;

let vertex = 0;
let connectionCount = 0;

for (let i = 0; i < particleCount; i++) {

const i3 = i * 3;

particlePositions[i3] += particleVelocities[i].x + mouse.x * 0.0009;
particlePositions[i3 + 1] += particleVelocities[i].y - mouse.y * 0.0009;
particlePositions[i3 + 2] += particleVelocities[i].z;

if (particlePositions[i3] > areaSize/2 || particlePositions[i3] < -areaSize/2)
particleVelocities[i].x *= -1;

if (particlePositions[i3+1] > areaSize/2 || particlePositions[i3+1] < -areaSize/2)
particleVelocities[i].y *= -1;

if (particlePositions[i3+2] > areaSize/2 || particlePositions[i3+2] < -areaSize/2)
particleVelocities[i].z *= -1;

for (let j=i+1;j<particleCount;j++){

const j3=j*3;

const dx=particlePositions[i3]-particlePositions[j3];
const dy=particlePositions[i3+1]-particlePositions[j3+1];
const dz=particlePositions[i3+2]-particlePositions[j3+2];

const dist=Math.sqrt(dx*dx+dy*dy+dz*dz);

if(dist<connectionDistance){

linePositions[vertex++]=particlePositions[i3];
linePositions[vertex++]=particlePositions[i3+1];
linePositions[vertex++]=particlePositions[i3+2];

linePositions[vertex++]=particlePositions[j3];
linePositions[vertex++]=particlePositions[j3+1];
linePositions[vertex++]=particlePositions[j3+2];

connectionCount++;

}

}

}

particlesGeometry.attributes.position.needsUpdate=true;
linesGeometry.attributes.position.needsUpdate=true;

linesGeometry.setDrawRange(0,connectionCount*2);

particles.rotation.y+=0.0009;
particles.rotation.x+=0.00035;

networkLines.rotation.y=particles.rotation.y;
networkLines.rotation.x=particles.rotation.x;

renderer.render(scene,camera);

}

animateNetwork();

window.addEventListener("resize",()=>{

camera.aspect=window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();

renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth,window.innerHeight);

});

}}






/* =========================
   Custom Cursor
========================= */

const cursorDot=document.querySelector(".cursor-dot");
const cursorOutline=document.querySelector(".cursor-outline");

if(window.matchMedia("(pointer:fine)").matches){

window.addEventListener("mousemove",(e)=>{

gsap.to(cursorDot,{x:e.clientX,y:e.clientY,duration:0.08});
gsap.to(cursorOutline,{x:e.clientX,y:e.clientY,duration:0.2});

});

document.querySelectorAll("a,button,.service-card,.advantage-card")
.forEach(el=>{

el.addEventListener("mouseenter",()=>{

gsap.to(cursorOutline,{
width:58,
height:58,
borderColor:"rgba(227,166,23,0.95)",
duration:0.2
});

});

el.addEventListener("mouseleave",()=>{

gsap.to(cursorOutline,{
width:38,
height:38,
borderColor:"rgba(227,166,23,0.65)",
duration:0.2
});

});

});

}


/* =========================
   Scroll Reveal
========================= */

gsap.utils.toArray(".reveal").forEach(el=>{

gsap.to(el,{
opacity:1,
y:0,
duration:0.9,
ease:"power3.out",
scrollTrigger:{
trigger:el,
start:"top 86%",
once:true
}
});

});


/* =========================
   Demo Mode
========================= */

document.querySelectorAll("a[href='javascript:void(0)']")
.forEach(link=>{

link.addEventListener("click",e=>{
e.preventDefault();
});

});
