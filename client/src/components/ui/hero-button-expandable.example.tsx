/**
 * Example usage of HeroButtonExpandable component with maroon theme
 * 
 * This component provides an expandable hero button that matches the Julian Bradley
 * website color scheme (silver, maroon, black).
 */

import { HeroButtonExpandable, ExpandableButton } from "./hero-button-expandable";
import { Rocket, Sparkles, ArrowRight } from "lucide-react";

export function HeroButtonExamples() {
  return (
    <div className="space-y-8 p-8 bg-black min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-white text-4xl font-bold mb-8">
          Hero Button Expandable Examples
        </h1>

        {/* Basic expandable button */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Basic Expandable</h2>
          <HeroButtonExpandable
            variant="maroon"
            size="lg"
            icon={<Rocket className="h-5 w-5" />}
            expandedContent={
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  Discover how our AI-powered platform can transform your business.
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#800020] text-white rounded hover:bg-[#A00030] transition-colors">
                    Learn More
                  </button>
                  <button className="px-4 py-2 border border-[#800020] text-[#800020] rounded hover:bg-[#800020] hover:text-white transition-colors">
                    Get Started
                  </button>
                </div>
              </div>
            }
          >
            Claim Your Freedom
          </HeroButtonExpandable>
        </section>

        {/* Simple button with link */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Simple Button</h2>
          <HeroButtonExpandable
            variant="maroon"
            size="lg"
            href="#contact"
            icon={<ArrowRight className="h-5 w-5" />}
          >
            Book Your Time Now
          </HeroButtonExpandable>
        </section>

        {/* Outline variant */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Outline Variant</h2>
          <HeroButtonExpandable
            variant="outline"
            size="lg"
            icon={<Sparkles className="h-5 w-5" />}
            expandedContent={
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  Explore our premium features and unlock your potential.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                  <li>Personal Freedom Coaching</li>
                  <li>Mind, Body & Spiritual Growth</li>
                  <li>One-on-One Sessions</li>
                </ul>
              </div>
            }
          >
            Learn More
          </HeroButtonExpandable>
        </section>

        {/* Different sizes */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">Different Sizes</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <HeroButtonExpandable variant="maroon" size="sm">
              Small Button
            </HeroButtonExpandable>
            <HeroButtonExpandable variant="maroon" size="default">
              Default Button
            </HeroButtonExpandable>
            <HeroButtonExpandable variant="maroon" size="lg">
              Large Button
            </HeroButtonExpandable>
          </div>
        </section>

        {/* ExpandableButton wrapper */}
        <section className="space-y-4">
          <h2 className="text-white text-2xl font-semibold">ExpandableButton Wrapper</h2>
          <ExpandableButton
            label="Show Options"
            expandedLabel="Hide Options"
            variant="maroon"
          >
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 hover:bg-[#800020]/20 rounded transition-colors">
                Option 1: Personal Coaching
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-[#800020]/20 rounded transition-colors">
                Option 2: Business Consulting
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-[#800020]/20 rounded transition-colors">
                Option 3: AI Implementation
              </button>
            </div>
          </ExpandableButton>
        </section>

        {/* With ASMR Background */}
        <section className="relative space-y-4 p-8 rounded-lg border-2 border-[#800020]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#800020]/10 to-transparent rounded-lg" />
          <div className="relative z-10">
            <h2 className="text-white text-2xl font-semibold mb-4">
              With Background Effect
            </h2>
            <HeroButtonExpandable
              variant="maroon"
              size="lg"
              className="shadow-2xl"
              icon={<Rocket className="h-5 w-5" />}
            >
              Start Your Journey
            </HeroButtonExpandable>
          </div>
        </section>
      </div>
    </div>
  );
}

