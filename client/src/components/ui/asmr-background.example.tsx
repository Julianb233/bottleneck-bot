/**
 * Example usage of ASMRBackground component with maroon theme
 * 
 * This component provides an animated background that matches the Julian Bradley
 * website color scheme (silver, maroon, black).
 */

import { ASMRBackground } from "./asmr-background";

export function ExampleUsage() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Add the background component */}
      <ASMRBackground intensity="medium" variant="default" />
      
      {/* Your content goes here */}
      <div className="relative z-10 p-8">
        <h1 className="text-white text-4xl font-bold mb-4">
          Welcome to Julian Bradley
        </h1>
        <p className="text-gray-300">
          This is an example of the ASMR background component with maroon theme.
        </p>
      </div>
    </div>
  );
}

// Usage with different variants:
export function SubtleBackground() {
  return (
    <div className="relative min-h-screen bg-black">
      <ASMRBackground intensity="low" variant="subtle" />
      <div className="relative z-10 p-8">
        {/* Content */}
      </div>
    </div>
  );
}

export function VibrantBackground() {
  return (
    <div className="relative min-h-screen bg-black">
      <ASMRBackground intensity="high" variant="vibrant" />
      <div className="relative z-10 p-8">
        {/* Content */}
      </div>
    </div>
  );
}

