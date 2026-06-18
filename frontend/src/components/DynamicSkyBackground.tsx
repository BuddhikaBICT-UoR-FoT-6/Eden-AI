import React, { useEffect, useRef, useState, useCallback } from "react";

/* =========================================================================
   DynamicSkyBackground
   -------------------------------------------------------------------------
   Drop-in replacement for a static hero photo. Renders a procedural sky
   driven by two props:

     phase   : "dawn" | "day" | "dusk" | "night"   (derived from sunrise/sunset)
     weather : "clear" | "clouds" | "rain" | "thunderstorm" | "drizzle" | "mist"
   ========================================================================= */

const SKY_GRADIENTS = {
  dawn: "linear-gradient(180deg,#1a1330 0%,#3c2a55 24%,#a85a6c 55%,#f0a875 80%,#ffd9a0 100%)",
  day: "linear-gradient(180deg,#2a6fb0 0%,#4f9bd9 40%,#8cc5ec 75%,#c9e8fb 100%)",
  dusk: "linear-gradient(180deg,#0c0a1f 0%,#2c1f4a 22%,#6b3a55 50%,#c2603f 75%,#f2935a 100%)",
  night: "linear-gradient(180deg,#050714 0%,#0a0e24 35%,#111a36 70%,#1a2440 100%)",
};

const STAR_VISIBILITY = { dawn: 0.3, day: 0, dusk: 0.55, night: 1 };

const SUN_CONFIG = {
  dawn: { visible: true, top: "60%", left: "16%", size: 86, glow: "#ffb27a" },
  day: { visible: true, top: "10%", left: "70%", size: 108, glow: "#fff3c4" },
  dusk: { visible: true, top: "56%", left: "80%", size: 92, glow: "#ff8a5c" },
  night: { visible: false, top: "50%", left: "50%", size: 0, glow: "#fff3c4" },
};

const MOON_CONFIG = {
  dawn: { visible: false, top: "50%", right: "50%", size: 0, glow: "#eef0ff" },
  day: { visible: false, top: "50%", right: "50%", size: 0, glow: "#eef0ff" },
  dusk: { visible: true, top: "14%", right: "14%", size: 64, glow: "#dfe6ff" },
  night: { visible: true, top: "9%", right: "10%", size: 78, glow: "#eef0ff" },
};

const isRainy = (w: string) => w === "rain" || w === "thunderstorm" || w === "drizzle";
const isCloudy = (w: string) => w === "clouds" || isRainy(w) || w === "mist";

/* ---------------- canvas layer: stars (clear) or rain (wet) ---------------- */

  function SkyCanvas({ phase, weather }: { phase: "dawn"|"day"|"dusk"|"night", weather: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<any[]>([]);
  const dropsRef = useRef<any[]>([]);
  const meteorsRef = useRef<any[]>([]);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const buildField = useCallback(() => {
    const el = canvasRef.current;
    if (!el || !el.parentElement) return;
    const w = el.parentElement.clientWidth;
    const h = el.parentElement.clientHeight;
    el.width = w;
    el.height = h;
    sizeRef.current = { w, h };

    const starCount = Math.min(220, Math.max(90, Math.floor((w * h) / 9000)));
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.75,
      r: Math.random() * 1.3 + 0.4,
      base: Math.random() * 0.6 + 0.4,
      speed: Math.random() * 1.2 + 0.4,
      offset: Math.random() * Math.PI * 2,
    }));

    const dropCount = Math.min(260, Math.max(120, Math.floor((w * h) / 6000)));
    dropsRef.current = Array.from({ length: dropCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: Math.random() * 14 + 10,
      speed: Math.random() * 260 + 320,
      opacity: Math.random() * 0.35 + 0.25,
    }));
    
    meteorsRef.current = [];
  }, []);

  useEffect(() => {
    buildField();
    window.addEventListener("resize", buildField);
    return () => window.removeEventListener("resize", buildField);
  }, [buildField]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let last = performance.now();
    const rainActive = isRainy(weather);
    const starMultiplier =
      (STAR_VISIBILITY[phase] ?? 0) * (weather === "clouds" ? 0.35 : 1);

    const draw = (now: number) => {
      const dt = now - last;
      last = now;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      if (rainActive) {
        dropsRef.current.forEach((d) => {
          d.y += (d.speed * dt) / 1000;
          d.x += dt / 45;
          if (d.y > h) {
            d.y = -d.len;
            d.x = Math.random() * w;
          }
          ctx.beginPath();
          ctx.strokeStyle = `rgba(196,214,255,${d.opacity})`;
          ctx.lineWidth = 1.1;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + 3, d.y + d.len);
          ctx.stroke();
        });
      } else if (starMultiplier > 0) {
        starsRef.current.forEach((s) => {
          const twinkle = 0.5 + 0.5 * Math.sin((now / 1000) * s.speed + s.offset);
          const alpha = s.base * twinkle * starMultiplier;
          if (alpha < 0.04) return;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Spawn meteors occasionally in clear skies at night/dusk
        if (starMultiplier > 0.4 && Math.random() < 0.005) {
          meteorsRef.current.push({
            x: Math.random() * w,
            y: Math.random() * (h * 0.4),
            len: Math.random() * 60 + 40,
            speed: Math.random() * 800 + 1000,
            opacity: 1,
            angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1) // roughly 45 degrees
          });
        }
        
        // Update and draw meteors
        for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
          const m = meteorsRef.current[i];
          m.x += (Math.cos(m.angle) * m.speed * dt) / 1000;
          m.y += (Math.sin(m.angle) * m.speed * dt) / 1000;
          m.opacity -= dt / 600; // fade out over 600ms
          
          if (m.opacity <= 0 || m.y > h || m.x > w) {
            meteorsRef.current.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          const grad = ctx.createLinearGradient(m.x, m.y, m.x - Math.cos(m.angle) * m.len, m.y - Math.sin(m.angle) * m.len);
          grad.addColorStop(0, `rgba(255,255,255,${m.opacity * starMultiplier})`);
          grad.addColorStop(1, `rgba(255,255,255,0)`);
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - Math.cos(m.angle) * m.len, m.y - Math.sin(m.angle) * m.len);
          ctx.stroke();
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [phase, weather]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

/* ---------------- sun / moon glow ---------------- */

function CelestialBody({ phase, weather }: { phase: "dawn"|"day"|"dusk"|"night", weather: string }) {
  const sun = SUN_CONFIG[phase];
  const moon = MOON_CONFIG[phase];
  const dim = isCloudy(weather) ? 0.22 : 1;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: sun.top,
          left: sun.left,
          width: sun.size,
          height: sun.size,
          borderRadius: "50%",
          transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle at 35% 35%, #fff8e4 0%, ${sun.glow} 45%, transparent 75%)`,
          boxShadow: `0 0 70px 24px ${sun.glow}66`,
          opacity: sun.visible ? dim : 0,
          transition: "all 1.4s ease",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: moon.top,
          right: moon.right,
          width: moon.size,
          height: moon.size,
          borderRadius: "50%",
          transform: "translate(50%,-50%)",
          background: `radial-gradient(circle at 38% 35%, #ffffff 0%, ${moon.glow} 55%, transparent 80%)`,
          boxShadow: `0 0 60px 18px ${moon.glow}55`,
          opacity: moon.visible ? dim : 0,
          transition: "all 1.4s ease",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

/* ---------------- drifting cloud layer ---------------- */

function CloudLayer({ weather, phase }: { phase: "dawn"|"day"|"dusk"|"night", weather: string }) {
  if (!isCloudy(weather)) return null;
  const tint = phase === "day" ? "rgba(255,255,255,0.65)" : "rgba(180,190,210,0.35)";
  const dense = isRainy(weather);
  const clouds = [
    { top: "8%", scale: 1, dur: 70, delay: 0 },
    { top: "18%", scale: 0.7, dur: 95, delay: -20 },
    { top: "4%", scale: 1.3, dur: 110, delay: -50 },
    { top: "26%", scale: 0.55, dur: 60, delay: -10 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {clouds.map((c, i) => (
        <div
          key={i}
          className="sky-cloud"
          style={{
            top: c.top,
            transform: `scale(${c.scale})`,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
            background: tint,
            opacity: dense ? 0.85 : 0.55,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- lightning flash for storms ---------------- */

function LightningFlash({ active }: { active: boolean }) {
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (!active) return;
    let id: any;
    const schedule = () => {
      const wait = 3500 + Math.random() * 7000;
      id = setTimeout(() => {
        setFlash(1);
        setTimeout(() => setFlash(0), 120);
        schedule();
      }, wait);
    };
    schedule();
    return () => clearTimeout(id);
  }, [active]);

  if (!active) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "white",
        opacity: flash * 0.55,
        transition: "opacity 0.12s ease",
        pointerEvents: "none",
      }}
    />
  );
}

/* ---------------- main exported component ---------------- */

interface DynamicSkyProps {
  phase?: "dawn" | "day" | "dusk" | "night";
  weather?: "clear" | "clouds" | "rain" | "thunderstorm" | "drizzle" | "mist";
  children?: React.ReactNode;
}

export function DynamicSkyBackground({ phase = "night", weather = "clear", children }: DynamicSkyProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: SKY_GRADIENTS[phase],
        transition: "background 1.6s ease",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <SkyCanvas phase={phase} weather={weather} />
      <CelestialBody phase={phase} weather={weather} />
      <CloudLayer weather={weather} phase={phase} />
      <LightningFlash active={weather === "thunderstorm"} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 55%, rgba(5,8,16,0.05) 0%, rgba(5,8,16,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>{children}</div>
      <style>{`
        .sky-cloud {
          position: absolute;
          left: -320px;
          width: 260px;
          height: 70px;
          border-radius: 50%;
          filter: blur(18px);
          animation-name: cloudDrift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes cloudDrift {
          from { left: -320px; }
          to { left: 110%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sky-cloud { animation: none; left: 20%; }
        }
      `}</style>
    </div>
  );
}
