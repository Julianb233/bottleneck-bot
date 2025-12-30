"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MechanicalWavesProps {
  className?: string;
  lineColor?: string;
  numLines?: number;
  speed?: number;
}

export function MechanicalWaves({
  className,
  lineColor = "#FFD700", // Gold color
  numLines = 7,
  speed = 1,
}: MechanicalWavesProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const paths = Array.from(svg.querySelectorAll("path"));
    const duration = 3000 / speed;

    const animate = () => {
      timeRef.current += 16; // ~60fps
      const t = (timeRef.current % duration) / duration;

      paths.forEach((path, i) => {
        const amplitude = 30 + i * 15;
        const frequency = 0.02 + i * 0.005;
        const offset = i * 40;
        const phase = t * Math.PI * 2 + offset * 0.01;

        let pathData = "M ";
        for (let x = 0; x <= 1200; x += 3) {
          const y = 300 + amplitude * Math.sin(frequency * x + phase);
          pathData += `${x},${y} `;
        }

        path.setAttribute("d", pathData);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed, numLines]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FFA500" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="goldGradientVertical" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FFA500" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {Array.from({ length: numLines }).map((_, i) => {
          const amplitude = 30 + i * 15;
          const frequency = 0.02 + i * 0.005;
          const offset = i * 40;
          
          // Initial path
          let pathData = "M ";
          for (let x = 0; x <= 1200; x += 3) {
            const y = 300 + amplitude * Math.sin(frequency * x + offset * 0.01);
            pathData += `${x},${y} `;
          }
          
          return (
            <path
              key={i}
              d={pathData}
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth={2.5 + i * 0.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              opacity={0.6 + i * 0.05}
            />
          );
        })}
      </svg>
    </div>
  );
}

