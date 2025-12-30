"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ASMRBackgroundProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
  variant?: "default" | "subtle" | "vibrant";
}

export function ASMRBackground({
  className,
  intensity = "medium",
  variant = "default",
}: ASMRBackgroundProps) {
  const intensityClasses = {
    low: "opacity-30",
    medium: "opacity-50",
    high: "opacity-70",
  };

  // Using RGB values for maroon (#800020) with different opacities
  const variantClasses = {
    default: "from-[#800020]/20 via-[#600010]/15 to-[#800020]/10",
    subtle: "from-[#400008]/10 via-[#600010]/5 to-transparent",
    vibrant: "from-[#A00030]/30 via-[#800020]/20 to-[#600010]/15",
  };

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {/* Animated gradient background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          variantClasses[variant],
          intensityClasses[intensity],
          "animate-gradient-shift"
        )}
        style={{
          backgroundSize: "200% 200%",
        }}
      />

      {/* Radial gradients for depth */}
      <div
        className={cn(
          "absolute inset-0",
          intensityClasses[intensity],
          "animate-pulse-slow"
        )}
        style={{
          background: "radial-gradient(ellipse at top right, rgba(128, 0, 32, 0.25), rgba(96, 0, 16, 0.1), transparent)",
        }}
      />
      <div
        className={cn(
          "absolute inset-0",
          intensityClasses[intensity],
          "animate-pulse-slow-delayed"
        )}
        style={{
          background: "radial-gradient(ellipse at bottom left, rgba(128, 0, 32, 0.2), transparent, transparent)",
        }}
      />

      {/* Floating orbs with maroon colors */}
      <div
        className={cn(
          "absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl",
          "animate-float"
        )}
        style={{
          background: "linear-gradient(to bottom right, rgba(128, 0, 32, 0.3), rgba(96, 0, 16, 0.2))",
        }}
      />
      <div
        className={cn(
          "absolute bottom-20 right-10 w-40 h-40 rounded-full blur-3xl",
          "animate-float-delayed"
        )}
        style={{
          background: "linear-gradient(to bottom right, rgba(128, 0, 32, 0.25), rgba(96, 0, 16, 0.15))",
        }}
      />
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-64 h-64 rounded-full blur-3xl",
          "animate-float-slow"
        )}
        style={{
          background: "linear-gradient(to bottom right, rgba(96, 0, 16, 0.2), rgba(128, 0, 32, 0.1))",
        }}
      />

      {/* Animated grid pattern */}
      <div
        className={cn(
          "absolute inset-0",
          intensityClasses[intensity]
        )}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(128, 0, 32, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(128, 0, 32, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "4rem 4rem",
        }}
      />

      {/* Shimmer effect */}
      <div
        className={cn(
          "absolute inset-0",
          "animate-shimmer",
          intensityClasses[intensity]
        )}
        style={{
          background: "linear-gradient(to right, transparent, rgba(128, 0, 32, 0.1), transparent)",
        }}
      />
    </div>
  );
}


