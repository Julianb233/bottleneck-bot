"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-0 h-[169%] w-[138%] lg:w-[84%] opacity-0 blur-[100px]",
        className
      )}
      style={{
        background: `radial-gradient(ellipse at center, ${fill}15 0%, transparent 70%)`,
      }}
    />
  );
}

