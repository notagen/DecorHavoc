import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

/**
 * Raw Network Systems — Industrial Digital Aesthetic
 * --------------------------------------------------
 * A full-screen React component with:
 *  - Animated code-rain background (canvas)
 *  - Subtle node-network lines (canvas)
 *  - Scanlines + grid overlay for an industrial/raw net feel
 *  - Monospace, terminal-esque UI with accent highlights
 *  - Reduced-motion friendly
 *  - CTA buttons (one wired to Etsy — replace the link)
 */

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(!!mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
};

function CodeRain({ enabled = true, speed = 1, color = "#18f3a1" }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled || reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const fontSize = 14; // px
    let columns = Math.floor(width / fontSize);
    let drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * height / fontSize));

    const charset = "0123456789ABCDEF▌▐░▒▓#@$%&*/<>[]{}()";

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * height / fontSize));
    };

    const draw = () => {
      // translucent background for trail effect
      ctx.fillStyle = "rgba(2, 8, 12, 0.15)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = charset[Math.floor(Math.random() * charset.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) drops[i] = 0;
        else drops[i] += Math.max(0.5, 1.2 * speed);
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, reduced, speed, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full [image-rendering:pixelated] opacity-40"
      aria-hidden
    />
  );
}

function NodeNetwork({ enabled = true, color = "#6fffe9", nodesCount = 64 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled || reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const nodes = Array.from({ length: nodesCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 140;
          if (dist < maxDist) {
            const alpha = 1 - dist / maxDist;
            ctx.strokeStyle = `rgba(111,255,233,${alpha * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // Draw nodes
      for (const n of nodes) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, reduced, nodesCount, color]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-35" aria-hidden />;
}

export function RawNetworkPage()  {
  const [codeRainOn, setCodeRainOn] = useState(true);
  const [networkOn, setNetworkOn] = useState(true);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="relative min-h-screen bg-[#070b0d] text-zinc-100 selection:bg-emerald-400/30 selection:text-emerald-50 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px, 32px 32px",
          backgroundPosition: "0 0, 0 0",
        }}
        aria-hidden
      />

      {/* Scanlines overlay */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 3px)",
        }}
        aria-hidden
      />

      {/* Animated layers */}
      {networkOn && <NodeNetwork />}
      {codeRainOn && <CodeRain speed={speed} />}

      {/* Content */}
      <main className="relative z-10">
        <nav className="flex items-center justify-between px-6 sm:px-10 py-5">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_2px_rgba(52,211,153,0.7)]" />
            <span className="font-mono tracking-widest text-xs text-emerald-300/90">LINK:UP</span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-300/80 font-mono">
            <Link to="/systems" className="hover:text-emerald-300 transition">systems</Link>
            <a href="#catalog" className="hover:text-emerald-300 transition">catalog</a>
            <a href="#contact" className="hover:text-emerald-300 transition">contact</a>
          </div>
        </nav>

        <section className="px-6 sm:px-10 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <h1 className="font-mono text-3xl sm:text-5xl md:text-6xl leading-tight">
              <span className="text-zinc-200">raw network </span>
              <span className="text-emerald-400">systems</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-zinc-300/90 max-w-2xl font-mono">
              industrial internet aesthetic. exposed signals. visible protocols. the world is code —
              so we made it your backdrop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.etsy.com/shop/SAVOPOULOS" // TODO: replace with your actual link
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 font-mono text-sm hover:bg-emerald-500/20 hover:border-emerald-400 transition shadow-[0_0_30px_rgba(52,211,153,0.1)]"
              >
                <span>enter shop</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-500/40 px-5 py-3 font-mono text-sm text-zinc-200 hover:border-zinc-300 transition"
              >
                signal us
              </a>
            </div>
          </motion.div>
        </section>

        {/* Control panel */}
        <section className="px-6 sm:px-10 pb-20">
          <div className="max-w-4xl rounded-2xl border border-zinc-700/60 bg-zinc-900/40 backdrop-blur px-5 sm:px-6 py-5 font-mono">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-xs uppercase tracking-widest text-zinc-400">background systems</div>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-emerald-400"
                    checked={codeRainOn}
                    onChange={(e) => setCodeRainOn(e.target.checked)}
                  />
                  <span className="text-zinc-300">code rain</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-emerald-400"
                    checked={networkOn}
                    onChange={(e) => setNetworkOn(e.target.checked)}
                  />
                  <span className="text-zinc-300">node network</span>
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-zinc-400">speed</span>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  />
                </label>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs text-zinc-400">
              <div>
                <span className="text-zinc-500">IP:</span> 198.51.100.23
              </div>
              <div>
                <span className="text-zinc-500">STATUS:</span> LINKED ✓
              </div>
              <div className="truncate">
                <span className="text-zinc-500">ROUTE:</span> /core/system/entry
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 sm:px-10 pb-14">
          <div className="max-w-4xl text-xs text-zinc-500 font-mono">
            © {new Date().getFullYear()} raw network systems. all signals observed.
          </div>
        </footer>
      </main>
    </div>
  );
}

// ---------------- Systems Page (portfolio with carousel) ----------------
function SystemsPage() {
  const images = [
    // TODO: replace with your own image URLs later
    "https://picsum.photos/seed/raw1/1600/900",
    "https://picsum.photos/seed/raw2/1600/900",
    "https://picsum.photos/seed/raw3/1600/900",
    "https://picsum.photos/seed/raw4/1600/900",
  ];

  return (
    <div className="min-h-screen bg-[#070b0d] text-zinc-100">
      <header className="px-6 sm:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_2px_rgba(52,211,153,0.7)]" />
          <span className="font-mono tracking-widest text-xs text-emerald-300/90">SYSTEMS</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-300/80 font-mono">
          <Link to="/" className="hover:text-emerald-300 transition">home</Link>
        </nav>
      </header>

      <section className="px-6 sm:px-10 py-10">
        <h2 className="font-mono text-2xl sm:text-4xl text-emerald-400">portfolio</h2>
        <p className="text-zinc-300/90 mt-2 font-mono">selected works and experiments</p>

        <Carousel images={images} />
      </section>
    </div>
  );
}

// Framer Motion carousel (touch + drag, autoplay)
function Carousel({ images }) {
  const [index, setIndex] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    if (isDragging) return;
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 3500);
    return () => clearTimeout(timeoutRef.current);
  }, [index, isDragging, images.length]);

  return (
    <div className="mt-6">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/40">
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: -((images.length - 1) * 100) + "%", right: 0 }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            const offset = info.offset.x;
            if (offset < -50 && index < images.length - 1) setIndex(index + 1);
            else if (offset > 50 && index > 0) setIndex(index - 1);
          }}
          animate={{ x: `-${index * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ width: `${images.length * 100}%` }}
        >
          {images.map((src, i) => (
            <div key={i} className="w-full shrink-0" style={{ width: `${100 / images.length}%` }}>
              <img src={src} alt={`slide ${i + 1}`} className="block w-full h-[50vh] sm:h-[70vh] object-cover" />
            </div>
          ))}
        </motion.div>

        {/* Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition ${i === index ? "bg-emerald-400" : "bg-zinc-500"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
// ---------------- App Router ----------------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RawNetworkPage />} />
        <Route path="/systems" element={<SystemsPage />} />
      </Routes>
    </BrowserRouter>
  );
}


