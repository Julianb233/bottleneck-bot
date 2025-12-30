# Hero Button Expandable Integration Guide

## Overview
The `HeroButtonExpandable` component provides an animated, expandable button with maroon theming that matches the Julian Bradley website color scheme.

## Basic Usage

```tsx
import { HeroButtonExpandable } from "@/components/ui/hero-button-expandable";
import { Rocket } from "lucide-react";

// Simple button
<HeroButtonExpandable
  variant="maroon"
  size="lg"
  icon={<Rocket className="h-5 w-5" />}
  href="#contact"
>
  Book Your Time Now
</HeroButtonExpandable>

// Expandable button with content
<HeroButtonExpandable
  variant="maroon"
  size="lg"
  icon={<Rocket className="h-5 w-5" />}
  expandedContent={
    <div className="space-y-3">
      <p className="text-sm text-gray-300">
        Discover how our platform can transform your business.
      </p>
      <button className="px-4 py-2 bg-[#800020] text-white rounded">
        Learn More
      </button>
    </div>
  }
>
  Claim Your Freedom
</HeroButtonExpandable>
```

## Integration with LandingPage

Replace the existing CTA buttons in `LandingPage.tsx`:

```tsx
import { HeroButtonExpandable } from "@/components/ui/hero-button-expandable";

// Replace the Button component around line 204
<HeroButtonExpandable
  variant="maroon"
  size="lg"
  icon={<Rocket className="w-5 h-5 sm:w-6 sm:h-6" />}
  onClick={() => handleCTAClick('hero_claim_freedom')}
  expandedContent={
    <div className="space-y-3">
      <p className="text-sm text-gray-300">
        Start your free trial today. No credit card required.
      </p>
      <div className="flex gap-2">
        <button 
          onClick={() => handleCTAClick('expanded_signup')}
          className="px-4 py-2 bg-[#800020] text-white rounded hover:bg-[#A00030]"
        >
          Sign Up Free
        </button>
        <button 
          onClick={() => handleCTAClick('expanded_demo')}
          className="px-4 py-2 border border-[#800020] text-[#800020] rounded hover:bg-[#800020] hover:text-white"
        >
          Watch Demo
        </button>
      </div>
    </div>
  }
>
  Claim Your Freedom
</HeroButtonExpandable>
```

## Variants

- `default`: Uses primary theme colors
- `maroon`: Maroon theme matching Julian Bradley website (#800020)
- `outline`: Outlined version with maroon border

## Sizes

- `sm`: Small button (h-10)
- `default`: Default button (h-12)
- `lg`: Large button (h-14)

## Features

- ✅ Animated gradient background on hover
- ✅ Shimmer effect
- ✅ Expandable content panel
- ✅ Smooth transitions
- ✅ Maroon color scheme
- ✅ Accessible (keyboard navigation, focus states)
- ✅ Responsive design

