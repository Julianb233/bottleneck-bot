"use client";

import React, { Suspense, lazy } from "react";
import { cn } from "@/lib/utils";

// Lazy load Spline to improve initial load time
const Spline = lazy(() => import("@splinetool/react-spline").then((mod) => ({ default: mod.Spline })));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className={cn("flex items-center justify-center bg-muted/50", className)}>
          <div className="text-muted-foreground">Loading 3D scene...</div>
        </div>
      }
    >
      <div className={cn("w-full h-full", className)}>
        <Spline scene={scene} />
      </div>
    </Suspense>
  );
}

