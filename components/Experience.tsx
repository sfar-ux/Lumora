"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import StaggeredMenu from "./StaggeredMenu";
import ContactForm from "./ContactForm";

gsap.registerPlugin(ScrollTrigger);

const ORB_DATA: { pos: [number, number, number]; size: number; color: string; speed: number }[] = [
  { pos: [2.1, -0.6, 0.9], size: 0.14, color: "#00aaff", speed: 1.6 },
  { pos: [2.8, 0.5, -0.6], size: 0.09, color: "#ff00cc", speed: 1.9 },
  { pos: [2.9, -1.4, 0.4], size: 0.17, color: "#ff6600", speed: 1.3 },
  { pos: [2.5, 1.3, 0.5], size: 0.08, color: "#9900ff", speed: 2.1 },
  { pos: [3.2, -0.1, -0.4], size: 0.11, color: "#ffcc00", speed: 1.7 },
  { pos: [1.9, -1.9, 0.7], size: 0.07, color: "#00ffcc", speed: 2.3 },
  { pos: [3.4, 0.9, 0.6], size: 0.10, color: "#ff3366", speed: 1.5 },
];

function LLetter() {
  const ref = useRef<THREE.Mesh>(null);

  const { geometry, material } = useMemo(() => {
    const sw = 0.62, h = 3.3, w = 2.3;
    const shape = new THREE.Shape();
    shape.moveTo(0, h);
    shape.lineTo(0, 0);
    shape.lineTo(w, 0);
    shape.lineTo(w, sw);
    shape.lineTo(sw, sw);
    shape.lineTo(sw, h);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.52, bevelEnabled: true,
      bevelThickness: 0.06, bevelSize: 0.07, bevelSegments: 4,
    });
    geo.center();
    geo.computeBoundingBox();
    const yMin = geo.boundingBox!.min.y;
    const yRange = geo.boundingBox!.max.y - yMin;

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uYMin: { value: yMin }, uYRange: { value: yRange } },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        uniform float uTime, uYMin, uYRange;
        vec3 palette(float t) {
          vec3 a=vec3(0.5,0.5,0.5), b=vec3(0.5,0.5,0.5),
               c=vec3(1.0,1.0,1.0), d=vec3(0.0,0.2,0.5);
          return a + b*cos(6.28318*(c*t+d));
        }
        void main() {
          float t = 1.0 - clamp((vPos.y - uYMin)/uYRange, 0.0, 1.0);
          float shimmer = sin(vPos.x*3.0+uTime*1.5)*0.05 + sin(vPos.z*5.0+uTime)*0.04;
          vec3 col = palette(t*0.62 + shimmer + 0.04);
          col = pow(col, vec3(0.85));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    return { geometry: geo, material: mat };
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.38;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.9}>
      <mesh ref={ref} geometry={geometry} material={material} />
    </Float>
  );
}

function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 40 }} dpr={[1, 1.6]}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 5, 5]} intensity={2.5} />
      <pointLight position={[-4, -2, 3]} intensity={2} color="#8ea6ff" />
      <pointLight position={[3, 3, -2]} intensity={1.5} color="#ff6622" />
      <LLetter />
      {ORB_DATA.map((o, i) => (
        <Float key={i} speed={o.speed} floatIntensity={0.7} rotationIntensity={0}>
          <mesh position={o.pos}>
            <sphereGeometry args={[o.size, 16, 16]} />
            <meshStandardMaterial color={o.color} emissive={o.color} emissiveIntensity={0.85} roughness={0.1} metalness={0.2} />
          </mesh>
        </Float>
      ))}
      <Sparkles count={70} scale={7} size={0.9} speed={0.2} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
}

function MiniScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 44 }} dpr={[1, 1.4]} gl={{ alpha: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 4]} intensity={2} />
      <pointLight position={[-3, -2, 2]} intensity={1.5} color="#8ea6ff" />
      <LLetter />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}

const services = [
  ["SAAS ARCHITECTURE", "System Design", "API Strategy", "Multi-tenancy"],
  ["FULL STACK DEV", "Next.js / React", "Node · Python", "PostgreSQL · Redis"],
  ["PRODUCT DESIGN", "UX Research", "UI Systems", "Prototyping"],
  ["CLOUD & DEVOPS", "AWS · GCP", "CI/CD Pipelines", "Scaling & Security"],
];

const projects = [
  {
    num: "01",
    tag: "RESUME BUILDER",
    title: "Profile2CV — LinkedIn to ATS Resume Studio",
    desc: "Turn your LinkedIn profile into a polished, ATS-friendly resume with AI-powered rewrites and PDF export.",
    tools: "React · Tailwind · Vercel",
    url: "https://resume-builder-xi-lac.vercel.app/",
    img: "/proj-resume.png",
    accent: "#00aaff",
  },
  {
    num: "02",
    tag: "NUEE PLATFORM",
    title: "Nuée — Artisanal Yogurt Brand Experience",
    desc: "Premium product showcase site for a slow-cultured French-style yogurt brand with immersive storytelling.",
    tools: "Next.js · Framer Motion · Vercel",
    url: "https://nuee-2.vercel.app/",
    img: "/proj-nuee2.png",
    accent: "#cc00ff",
  },
  {
    num: "03",
    tag: "NUEE V1",
    title: "Nuée V1 — First Brand Portal",
    desc: "The initial version of the Nuée digital presence — clean layout with product and story highlights.",
    tools: "React · CSS · Vercel",
    url: "https://nuee-one.vercel.app/",
    img: "/proj-nuee1.png",
    accent: "#ff6600",
  },
  {
    num: "04",
    tag: "RESTAURANT SITE",
    title: "Ember & Thyme — Fine Dining Website",
    desc: "Modern restaurant website for a premium New Delhi dining experience with reservations and menu showcase.",
    tools: "React · GSAP · Vercel",
    url: "https://restaurant-website-swart-iota.vercel.app/",
    img: "/proj-restaurant.png",
    accent: "#d9ff62",
  },
  {
    num: "05",
    tag: "SNEAKER STORE",
    title: "Soleva — Premium Sneaker E-Commerce",
    desc: "Full-featured sneaker retail platform with product catalogue, cart, wishlist and a bold editorial aesthetic.",
    tools: "React · Node · Vercel",
    url: "https://soleva-frontend.vercel.app/",
    img: "/proj-soleva.png",
    accent: "#FFD700",
  },
];

const TECH_LOGOS = [
  { name: "React", color: "#61DAFB", svg: <svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="8" fill="#61DAFB" /><ellipse cx="50" cy="50" rx="42" ry="16" stroke="#61DAFB" strokeWidth="4" /><ellipse cx="50" cy="50" rx="42" ry="16" stroke="#61DAFB" strokeWidth="4" transform="rotate(60 50 50)" /><ellipse cx="50" cy="50" rx="42" ry="16" stroke="#61DAFB" strokeWidth="4" transform="rotate(120 50 50)" /></svg> },
  { name: "Next.js", color: "#ffffff", svg: <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#111" stroke="#fff" strokeWidth="3" /><text x="50" y="66" textAnchor="middle" fontSize="48" fontWeight="700" fill="white" fontFamily="Arial">N</text></svg> },
  { name: "TypeScript", color: "#3178C6", svg: <svg viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#3178C6" /><text x="50" y="68" textAnchor="middle" fontSize="40" fontWeight="700" fill="white" fontFamily="Arial">TS</text></svg> },
  { name: "Node.js", color: "#3c873a", svg: <svg viewBox="0 0 100 100"><polygon points="50,4 94,27 94,73 50,96 6,73 6,27" fill="#3c873a" /><text x="50" y="58" textAnchor="middle" fontSize="18" fontWeight="700" fill="white" fontFamily="Arial">NODE</text></svg> },
  { name: "Docker", color: "#2496ED", svg: <svg viewBox="0 0 100 100"><rect x="8" y="52" width="84" height="14" rx="7" fill="#2496ED" /><rect x="14" y="36" width="14" height="12" rx="2" fill="#2496ED" /><rect x="32" y="36" width="14" height="12" rx="2" fill="#2496ED" /><rect x="50" y="36" width="14" height="12" rx="2" fill="#2496ED" /><rect x="32" y="20" width="14" height="12" rx="2" fill="#2496ED" /><rect x="50" y="20" width="14" height="12" rx="2" fill="#2496ED" /><path d="M74 44 Q88 36 82 22" stroke="#2496ED" strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="82" cy="19" r="4" fill="#2496ED" /></svg> },
  { name: "Firebase", color: "#FFCA28", svg: <svg viewBox="0 0 100 100"><path d="M22 80 L50 10 L63 42 L80 18 L60 80 Z" fill="#F57C00" /><path d="M22 80 L60 80 L50 52 Z" fill="#FFCA28" /><path d="M63 42 L80 18 L60 80 L50 52 Z" fill="#FF8F00" /></svg> },
  { name: "Java", color: "#e76f00", svg: <svg viewBox="0 0 100 100"><ellipse cx="50" cy="83" rx="26" ry="6" fill="#5382a1" opacity=".5" /><ellipse cx="50" cy="74" rx="20" ry="5" fill="#5382a1" opacity=".4" /><path d="M35 64 Q33 42 50 38 Q67 34 50 18" stroke="#e76f00" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M42 18 Q40 7 50 7 Q60 7 58 18" stroke="#e76f00" strokeWidth="4" fill="none" strokeLinecap="round" /></svg> },
  { name: "Python", color: "#FFD43B", svg: <svg viewBox="0 0 100 100"><defs><linearGradient id="pb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#387EB8" /><stop offset="100%" stopColor="#366994" /></linearGradient><linearGradient id="py" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFE052" /><stop offset="100%" stopColor="#FFC331" /></linearGradient></defs><path d="M49 8 C30 8 23 17 23 30 L23 42 L53 42 L53 46 L17 46 C10 46 4 52 4 62 L4 72 C4 84 13 92 32 92 L42 92 L42 80 L36 80 C24 80 16 75 16 68 L16 58 L53 58 L53 92 L63 92 L63 58 L84 58 L84 68 C84 75 76 80 64 80 L58 80 L58 92 L68 92 C87 92 96 84 96 72 L96 62 C96 52 90 46 83 46 L63 46 L63 42 L77 42 L77 30 C77 17 70 8 49 8Z" fill="url(#pb)" /><path d="M49 8 C70 8 77 17 77 30 L77 42 L47 42 L47 46 L83 46 C90 46 96 52 96 62 L96 72 C96 84 87 92 68 92 L58 92 L58 80 L64 80 C76 80 84 75 84 68 L84 58 L47 58 L47 92 L37 92 L37 58 L16 58 L16 68 C16 75 24 80 36 80 L42 80 L42 92 L32 92 C13 92 4 84 4 72 L4 62 C4 52 10 46 17 46 L37 46 L37 42 L23 42 L23 30 C23 17 30 8 49 8Z" fill="url(#py)" opacity=".85" /><circle cx="40" cy="28" r="4" fill="white" opacity=".85" /><circle cx="60" cy="72" r="4" fill="white" opacity=".85" /></svg> },
  { name: "PostgreSQL", color: "#336791", svg: <svg viewBox="0 0 100 100"><ellipse cx="50" cy="30" rx="32" ry="20" fill="#336791" /><rect x="18" y="30" width="64" height="36" fill="#336791" /><ellipse cx="50" cy="66" rx="32" ry="12" fill="#284d6e" /><text x="50" y="53" textAnchor="middle" fontSize="18" fontWeight="700" fill="white" fontFamily="serif">PG</text></svg> },
  { name: "AWS", color: "#FF9900", svg: <svg viewBox="0 0 100 100"><path d="M16 58 Q30 74 50 76 Q70 74 84 58" stroke="#FF9900" strokeWidth="6" fill="none" strokeLinecap="round" /><path d="M80,52 L88,60 L80,66" fill="#FF9900" /><text x="50" y="40" textAnchor="middle" fontSize="20" fontWeight="700" fill="#FF9900" fontFamily="Arial">AWS</text></svg> },
  { name: "Redis", color: "#DC382D", svg: <svg viewBox="0 0 100 100"><ellipse cx="50" cy="68" rx="36" ry="11" fill="#DC382D" opacity=".3" /><ellipse cx="50" cy="54" rx="36" ry="11" fill="#DC382D" opacity=".6" /><ellipse cx="50" cy="40" rx="36" ry="11" fill="#DC382D" /><text x="50" y="45" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="Arial">REDIS</text></svg> },
  { name: "Stripe", color: "#635BFF", svg: <svg viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#635BFF" /><text x="50" y="68" textAnchor="middle" fontSize="52" fontWeight="700" fill="white" fontFamily="Arial">S</text></svg> },
  { name: "Astro", color: "#E8845C", svg: <svg viewBox="0 0 100 100"><g transform="translate(50,50)">{[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => <rect key={i} x="-5" y="-44" width="10" height="26" rx="4" fill="#E8845C" transform={`rotate(${a})`} />)}</g></svg> },
  { name: "OpenAI", color: "#ffffff", svg: <svg viewBox="0 0 100 100" fill="none"><path d="M50 15 C62 15 72 22 77 32 C82 28 89 28 93 33 C97 38 96 46 91 51 C94 57 93 65 88 69 C83 73 76 73 71 69 C67 76 59 80 50 80 C41 80 33 76 29 69 C24 73 17 73 12 69 C7 65 6 57 9 51 C4 46 3 38 7 33 C11 28 18 28 23 32 C28 22 38 15 50 15Z" stroke="white" strokeWidth="5" fill="none" /><path d="M50 25 C57 25 62 29 65 35 L65 65 C62 71 57 75 50 75 C43 75 38 71 35 65 L35 35 C38 29 43 25 50 25Z" stroke="white" strokeWidth="3" fill="none" /></svg> },
  { name: "MongoDB", color: "#00ED64", svg: <svg viewBox="0 0 100 100"><path d="M50 6 C50 6 26 30 26 56 C26 74 37 88 50 94 C63 88 74 74 74 56 C74 30 50 6 50 6Z" fill="#00ED64" /><line x1="50" y1="50" x2="50" y2="95" stroke="white" strokeWidth="4" strokeLinecap="round" /><line x1="50" y1="78" x2="44" y2="90" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg> },
  { name: "GraphQL", color: "#E535AB", svg: <svg viewBox="0 0 100 100"><circle cx="50" cy="12" r="7" fill="#E535AB" /><circle cx="86" cy="31" r="7" fill="#E535AB" /><circle cx="86" cy="69" r="7" fill="#E535AB" /><circle cx="50" cy="88" r="7" fill="#E535AB" /><circle cx="14" cy="69" r="7" fill="#E535AB" /><circle cx="14" cy="31" r="7" fill="#E535AB" /><circle cx="50" cy="50" r="14" fill="none" stroke="#E535AB" strokeWidth="4" /><polygon points="50,12 86,31 86,69 50,88 14,69 14,31" fill="none" stroke="#E535AB" strokeWidth="3" /></svg> },
  { name: "Vercel", color: "#ffffff", svg: <svg viewBox="0 0 100 100"><polygon points="50,10 92,85 8,85" fill="white" /></svg> },
];

const LOGO_POSITIONS = [
  // Left cluster — beside the L stem
  { top: "8%", left: "-6%" },
  { top: "28%", left: "-14%" },
  { top: "52%", left: "-10%" },
  { top: "70%", left: "-18%" },
  { top: "88%", left: "-4%" },
  // Right cluster — opposite side of L
  { top: "5%", left: "108%" },
  { top: "22%", left: "115%" },
  { top: "42%", left: "110%" },
  { top: "62%", left: "118%" },
  { top: "80%", left: "105%" },
  // Above L — along top edge
  { top: "-8%", left: "20%" },
  { top: "-12%", left: "55%" },
  { top: "-6%", left: "78%" },
  // Below L — along bottom
  { top: "108%", left: "25%" },
  { top: "112%", left: "55%" },
  { top: "105%", left: "80%" },
  // Centre-ish — loose scatter near L body
  { top: "38%", left: "8%" },
];

const MENU_ITEMS = [
  { label: "Services", ariaLabel: "View our services",   link: "#services"  },
  { label: "Work",     ariaLabel: "View our work",        link: "#work"      },
  { label: "About",   ariaLabel: "Learn about us",       link: "#philosophy"},
  { label: "Clients", ariaLabel: "Read client reviews",  link: "/review"    },
  { label: "Contact", ariaLabel: "Get in touch",         link: "#contact"   },
];

const SOCIAL_ITEMS = [
  { label: "GitHub",   link: "https://github.com/sfar-ux/Lumora" },
  { label: "LinkedIn", link: "#" },
  { label: "Instagram",link: "#" },
];

export default function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const [cursorText, setCursorText] = useState("");
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(el, { y: 80, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1.1, ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 85%" }
        });
      });

      gsap.to(".hero-orb", {
        yPercent: 35, rotate: 12, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });

      gsap.to(".marquee-track", {
        xPercent: -28, ease: "none",
        scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true }
      });

      gsap.to(".problem-word", {
        scale: 1.18, opacity: 0.22, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: ".problem", start: "top 70%", end: "bottom 20%", scrub: true }
      });

      gsap.fromTo(".manifesto-l",
        { yPercent: -15, rotate: -18, opacity: 0 },
        {
          yPercent: 25, rotate: 14, opacity: 0.88, ease: "none",
          scrollTrigger: { trigger: ".manifesto", start: "top 80%", end: "bottom 20%", scrub: true }
        }
      );
    }, root);

    const move = (e: MouseEvent) => {
      if (!cursor.current) return;
      gsap.to(cursor.current, { x: e.clientX, y: e.clientY, duration: 0.18, ease: "power2.out" });
    };
    window.addEventListener("mousemove", move);

    return () => {
      lenis.destroy();
      ctx.revert();
      window.removeEventListener("mousemove", move);
    };
  }, []);

  const cursorHandlers = {
    onMouseEnter: () => setCursorText("OPEN"),
    onMouseLeave: () => setCursorText("")
  };

  return (
    <main ref={root} className="site">
      <div ref={cursor} className={`cursor ${cursorText ? "active" : ""}`}>{cursorText}</div>

      <StaggeredMenu
        isFixed
        position="right"
        logoUrl="/logo.png"
        logoText="LUMORA°"
        items={MENU_ITEMS}
        socialItems={SOCIAL_ITEMS}
        displaySocials
        displayItemNumbering
        colors={["#1a0040", "#5227FF"]}
        accentColor="#5227FF"
        menuButtonColor="#ffffff"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen
      />

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">SAAS DEVELOPMENT STUDIO</p>
          <h1 className="hero-wordmark">LUMOR<em>A</em></h1>
          <div className="hero-tagline-row">
            <span className="tagline-bar left" />
            <p className="hero-tagline">TECHNOLOGY THAT GIVES BUSINESSES<br />A NEW DIGITAL PRESENCE</p>
            <span className="tagline-bar right" />
          </div>
          <a className="circle-link" href="#services" {...cursorHandlers}>EXPLORE <span>↓</span></a>
        </div>
        <div className="hero-orb" aria-hidden="true">
          <Scene />
          <div className="floating-logos">
            {TECH_LOGOS.map((t, i) => (
              <div className="float-logo" key={i} style={{ left: LOGO_POSITIONS[i]?.left, top: LOGO_POSITIONS[i]?.top }}>
                {t.svg}
              </div>
            ))}
          </div>
        </div>
        <div className="hero-index">01 / 07</div>
        <div className="scroll-hint">SCROLL TO EXPLORE <span>↓</span></div>
      </section>

      <section className="marquee">
        <div className="marquee-track">
          <span>DESIGN.</span><i>✦</i><span>BUILD.</span><i>✦</i><span>SCALE.</span><i>✦</i>
          <span>DESIGN.</span><i>✦</i><span>BUILD.</span><i>✦</i><span>SCALE.</span>
        </div>
      </section>



      <section className="manifesto section-dark">
        <div className="section-number">02 / WHY</div>
        <div className="manifesto-l" aria-hidden="true"><MiniScene /></div>
        <div className="manifesto-content reveal">
          <p className="eyebrow">THE PROBLEM WITH MOST AGENCIES</p>
          <h2>GENERIC<br />VENDORS.<br /><span>REAL COSTS.</span></h2>
          <p>Most businesses get cookie-cutter solutions from shops that don&apos;t understand SaaS. We build opinionated, scalable products — from zero to production — that your team can own.</p>
        </div>
      </section>

      <section className="problem">
        <div className="problem-inner">
          <p className="eyebrow">THE REAL QUESTION</p>
          <div className="problem-stack">
            <div className="problem-word">CAN</div>
            <div className="problem-word">YOUR</div>
            <div className="problem-word accent">SOFTWARE</div>
            <div className="problem-word">SCALE?</div>
          </div>
        </div>
      </section>

      <section id="services" className="programs section-light">
        <div className="section-number">03 / SERVICES</div>
        <div className="program-head reveal">
          <p className="eyebrow">WHAT WE BUILD</p>
          <h2>END-TO-END<br />SAAS<br /><em>DELIVERY.</em></h2>
        </div>
        <div className="program-grid">
          {services.map(([name, ...items], i) => (
            <article className="program reveal" key={name} {...cursorHandlers}>
              <div className="program-no">0{i + 1}</div>
              <h3>{name}</h3>
              <div className="program-items">{items.map(x => <span key={x}>{x}</span>)}</div>
              <div className="arrow">↗</div>
            </article>
          ))}
        </div>
      </section>

      <section id="work" className="projects section-dark">
        <div className="section-number">04 / WORK</div>
        <div className="project-title reveal">
          <p className="eyebrow">SHIPPED. LIVE. OPEN.</p>
          <h2>LIVE<br /><span>PROJECTS.</span></h2>
        </div>
        <div className="project-grid-live">
          {projects.slice(0, 3).map((proj) => (
            <div className="proj-live-card reveal" key={proj.url} style={{ "--proj-accent": proj.accent } as React.CSSProperties}>
              {/* Clickable image thumbnail */}
              <a
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                className="proj-thumb-link"
                aria-label={`Open ${proj.title}`}
              >
                <div className="proj-thumb">
                  <Image
                    src={proj.img}
                    alt={proj.title}
                    fill
                    sizes="(max-width:800px) 100vw, 50vw"
                    style={{ objectFit: "cover", objectPosition: "top" }}
                    className="proj-thumb-img"
                  />
                  <div className="proj-thumb-overlay">
                    <span className="proj-visit-label">VISIT SITE ↗</span>
                  </div>
                </div>
              </a>
              {/* Card info */}
              <div className="proj-info">
                <div className="proj-info-top">
                  <span className="proj-num-badge">{proj.num}</span>
                  <span className="eyebrow proj-tag-inline">{proj.tag}</span>
                </div>
                <h3 className="proj-live-title">{proj.title}</h3>
                <p className="proj-live-desc">{proj.desc}</p>
                <div className="proj-live-footer">
                  <span className="proj-tools">{proj.tools}</span>
                  <a href={proj.url} target="_blank" rel="noopener noreferrer" className="proj-cta-link">Open Project <span>↗</span></a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="proj-view-all-wrap">
          <a
            href="#all-projects"
            className="proj-view-all-btn"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("all-projects")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            VIEW ALL {projects.length} PROJECTS <span>↓</span>
          </a>
        </div>
      </section>

      {/* Extended projects */}
      <section id="all-projects" className="projects section-dark proj-all-section">
        <div className="section-number">04b / MORE WORK</div>
        <div className="project-grid-live">
          {projects.slice(3).map((proj) => (
            <div className="proj-live-card reveal" key={proj.url} style={{ "--proj-accent": proj.accent } as React.CSSProperties}>
              <a href={proj.url} target="_blank" rel="noopener noreferrer" className="proj-thumb-link" aria-label={`Open ${proj.title}`}>
                <div className="proj-thumb">
                  <Image
                    src={proj.img}
                    alt={proj.title}
                    fill
                    sizes="(max-width:800px) 100vw, 50vw"
                    style={{ objectFit: "cover", objectPosition: "top" }}
                    className="proj-thumb-img"
                  />
                  <div className="proj-thumb-overlay">
                    <span className="proj-visit-label">VISIT SITE ↗</span>
                  </div>
                </div>
              </a>
              <div className="proj-info">
                <div className="proj-info-top">
                  <span className="proj-num-badge">{proj.num}</span>
                  <span className="eyebrow proj-tag-inline">{proj.tag}</span>
                </div>
                <h3 className="proj-live-title">{proj.title}</h3>
                <p className="proj-live-desc">{proj.desc}</p>
                <div className="proj-live-footer">
                  <span className="proj-tools">{proj.tools}</span>
                  <a href={proj.url} target="_blank" rel="noopener noreferrer" className="proj-cta-link">Open Project <span>↗</span></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="journey section-light">
        <div className="section-number">05 / PROCESS</div>
        <div className="journey-copy reveal">
          <p className="eyebrow">HOW WE WORK</p>
          <h2>DISCOVER → DESIGN →<br /><em>BUILD → LAUNCH → SCALE</em></h2>
        </div>
        <div className="journey-line">
          {["DISCOVER", "DESIGN", "BUILD", "LAUNCH", "SCALE"].map((x, i) => (
            <div key={x}><b>0{i + 1}</b><span>{x}</span></div>
          ))}
        </div>
      </section>

      <section id="philosophy" className="philosophy section-dark">
        <div className="section-number">06 / ABOUT</div>
        <div className="philosophy-copy reveal">
          <p className="eyebrow">OUR BELIEF</p>
          <h2>WE DON&apos;T JUST<br />WRITE CODE.<br /><em>WE BUILD<br />BUSINESSES.</em></h2>
          <p>Great SaaS is 20% code and 80% decisions. We embed with your team, challenge assumptions, and ship software that creates real leverage — not just lines of code.</p>
        </div>
      </section>

      <section id="contact" className="final">
        <div className="final-no">07 / NEXT</div>
        <div className="final-content-wrapper">
          <div className="final-text reveal">
            <p className="eyebrow">LET&apos;S BUILD TOGETHER</p>
            <h2>READY TO<br /><em>LAUNCH</em><br />YOUR SAAS?</h2>
            <p className="final-desc">Tell us about your project requirements, timeline, and goals. We will get back to you within 24 hours.</p>
          </div>
          <div className="final-form-container reveal">
            <ContactForm />
          </div>
        </div>
        <footer>
          <span>LUMORA° — SAAS DEVELOPMENT STUDIO</span>
          <span>© 2026</span>
          <span>DELHI NCR / INDIA</span>
        </footer>
      </section>

      <a href="#contact" className="floating-contact-btn" aria-label="Contact Us">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Let's Talk</span>
      </a>
    </main>
  );
}