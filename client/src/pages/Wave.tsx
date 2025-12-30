"use client";

import React from "react";
import { MechanicalWaves } from "@/components/ui/mechanical-waves";
import { MetallicBusinessCard } from "@/components/ui/metallic-business-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Wave() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/wizard-of-ai")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wizard
            </Button>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white fill-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
              Wave
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the mesmerizing beauty of mechanical waves with golden animated lines
          </p>
        </div>

        {/* Main Wave Card */}
        <Card className="w-full h-[600px] md:h-[700px] bg-gradient-to-br from-card via-card/95 to-card/90 relative overflow-hidden border-2 shadow-2xl">
          <div className="absolute inset-0">
            <MechanicalWaves 
              className="w-full h-full"
              lineColor="#FFD700"
              numLines={7}
              speed={1.2}
            />
          </div>
          
          {/* Overlay content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-yellow-600 to-yellow-400 mb-4">
                Golden Waves
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Watch as the golden lines flow and dance in perfect harmony, creating a mesmerizing visual experience
              </p>
            </div>
          </div>
        </Card>

        {/* Business Card Section */}
        <div className="mt-12 mb-12 flex justify-center">
          <MetallicBusinessCard
            metal="gold"
            width={460}
            name="Julian Bradley"
            phone="267-918-8060"
            email="Duane@AIAcrobatics"
            align="left"
          />
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Animated</h3>
            <p className="text-muted-foreground">
              Smooth, fluid animations that create a sense of motion and energy
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Golden</h3>
            <p className="text-muted-foreground">
              Beautiful gold-colored lines with gradient effects and glow
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mechanical</h3>
            <p className="text-muted-foreground">
              Precise wave patterns that follow mathematical principles
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

