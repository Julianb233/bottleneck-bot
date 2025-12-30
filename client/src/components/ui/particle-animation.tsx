'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function ParticleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const [isHovered, setIsHovered] = useState(false);

  // Emerald/Teal color palette matching the website
  const colors = [
    '#10b981', // emerald-500
    '#059669', // emerald-600
    '#047857', // emerald-700
    '#14b8a6', // teal-500
    '#0d9488', // teal-600
    '#0f766e', // teal-700
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Emit particles on mouse movement
      if (isHovered) {
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.5 + Math.random() * 1.5;
          particlesRef.current.push({
            x: mouseRef.current.x,
            y: mouseRef.current.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            maxLife: 60 + Math.random() * 40,
            size: 2 + Math.random() * 3,
          });
        }
      }
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      if (!ctx) return;

      // Clear with slight fade for trail effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98; // Friction
        particle.vy *= 0.98;
        particle.life--;

        if (particle.life <= 0) return false;

        const alpha = particle.life / particle.maxLife;
        const colorIndex = Math.floor(Math.random() * colors.length);
        const color = colors[colorIndex];

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.restore();

        return true;
      });

      // Draw gooey blob effect at mouse position
      if (isHovered && mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        ctx.save();
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          50
        );
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)'); // emerald-500
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered]);

  // Animate text on mount
  useEffect(() => {
    const textElements = containerRef.current?.querySelectorAll('.particle-text');
    if (textElements) {
      gsap.fromTo(
        textElements,
        {
          scale: 0.8,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 1.5,
          ease: 'power3.out',
          stagger: 0.2,
        }
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'multiply' }}
      />
      
      {/* Animated text overlay - subtle background decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center space-y-2">
          <h1 className="particle-text text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400/40 via-teal-400/40 to-emerald-500/40">
            Wizard of AI
          </h1>
          <p className="particle-text text-lg md:text-xl font-semibold text-emerald-600/30">
            Autonomous Intelligence
          </p>
        </div>
      </div>

      {/* SVG filter for gooey effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

