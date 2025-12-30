"use client";

import React, { useState } from "react";
import { Paperclip, ArrowUp, Code, Rocket, Layers, Lightbulb, User, Monitor, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Search() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Handle search submission
      console.log("Search query:", query);
    }
  };

  const quickActions = [
    { icon: Code, label: "Generate Code" },
    { icon: Rocket, label: "Launch App" },
    { icon: Layers, label: "UI Components" },
    { icon: Lightbulb, label: "Theme Ideas" },
    { icon: User, label: "User Dashboard" },
    { icon: Monitor, label: "Landing Page" },
    { icon: Upload, label: "Upload Docs" },
    { icon: ImageIcon, label: "Image Assets" },
  ];

  return (
    <main className="min-h-screen w-full bg-black text-white relative overflow-hidden">
      {/* Moon-themed background with purple-blue glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black">
        {/* Purple-blue glow effect at bottom center */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(139, 92, 246, 0.4) 0%, rgba(79, 70, 229, 0.2) 40%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <section className="flex justify-center items-start w-full min-h-screen pt-32 pb-20 px-4 relative z-10">
        <div className="w-full max-w-4xl">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Ruixen AI
            </h1>
            <p className="text-lg text-neutral-400">
              Build something amazing — just start typing below.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative flex items-center gap-3">
              {/* Paperclip icon on left */}
              <button
                type="button"
                className="absolute left-4 z-10 text-neutral-400 hover:text-neutral-300 transition-colors"
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Search input */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your request..."
                className="w-full h-14 pl-14 pr-16 rounded-xl bg-purple-900/20 backdrop-blur-md border border-purple-500/30 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              />

              {/* Submit button on right */}
              <button
                type="submit"
                disabled={!query.trim()}
                className="absolute right-3 z-10 w-8 h-8 rounded-full bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Send"
              >
                <ArrowUp className="w-4 h-4 text-neutral-300" />
              </button>
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  className="rounded-full border-neutral-700 bg-neutral-900/30 hover:bg-neutral-800/50 text-neutral-300 hover:text-white backdrop-blur-sm"
                  onClick={() => {
                    setQuery(action.label);
                  }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-neutral-500 py-2 mt-10 border-t border-neutral-800 text-sm relative z-10">
        © {new Date().getFullYear()} Ruixen Demo Page
      </footer>
    </main>
  );
}

