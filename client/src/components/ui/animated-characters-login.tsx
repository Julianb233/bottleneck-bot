"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCharactersLoginProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCharactersLogin({
  children,
  className,
}: AnimatedCharactersLoginProps) {
  return (
    <div className={cn("min-h-screen flex", className)}>
      {/* Left side - Animated Characters */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-black via-[#1a0008] to-[#0d0004]">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Floating orbs with maroon colors */}
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-[#800020]/20 rounded-full blur-3xl"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-40 h-40 bg-[#A00030]/15 rounded-full blur-3xl"
            animate={{
              y: [0, 15, 0],
              x: [0, -15, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#600010]/20 rounded-full blur-2xl"
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>

        {/* Character illustrations */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12">
          {/* Main character illustration */}
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Character SVG - Abstract representation with maroon theme */}
              <svg
                width="400"
                height="400"
                viewBox="0 0 400 400"
                className="w-full h-auto"
              >
                {/* Background circle */}
                <motion.circle
                  cx="200"
                  cy="200"
                  r="180"
                  fill="none"
                  stroke="#800020"
                  strokeWidth="2"
                  opacity="0.3"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.3 }}
                  transition={{ duration: 1 }}
                />

                {/* Character head - silver/gray */}
                <motion.circle
                  cx="200"
                  cy="150"
                  r="50"
                  fill="#C0C0C0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />

                {/* Character eyes - black */}
                <motion.circle
                  cx="185"
                  cy="145"
                  r="8"
                  fill="#000000"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                />
                <motion.circle
                  cx="215"
                  cy="145"
                  r="8"
                  fill="#000000"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                />

                {/* Eye shine - silver */}
                <motion.circle
                  cx="182"
                  cy="142"
                  r="3"
                  fill="#FFFFFF"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                />
                <motion.circle
                  cx="212"
                  cy="142"
                  r="3"
                  fill="#FFFFFF"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                />

                {/* Character body - maroon */}
                <motion.rect
                  x="150"
                  y="200"
                  width="100"
                  height="120"
                  rx="20"
                  fill="#800020"
                  initial={{ y: 250, opacity: 0 }}
                  animate={{ y: 200, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />

                {/* Character arms - maroon */}
                <motion.line
                  x1="150"
                  y1="220"
                  x2="100"
                  y2="180"
                  stroke="#800020"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                />
                <motion.line
                  x1="250"
                  y1="220"
                  x2="300"
                  y2="180"
                  stroke="#800020"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                />

                {/* Character legs - darker maroon */}
                <motion.line
                  x1="170"
                  y1="320"
                  x2="170"
                  y2="380"
                  stroke="#600010"
                  strokeWidth="10"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                />
                <motion.line
                  x1="230"
                  y1="320"
                  x2="230"
                  y2="380"
                  stroke="#600010"
                  strokeWidth="10"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                />

                {/* Floating particles - silver */}
                {[...Array(6)].map((_, i) => (
                  <motion.circle
                    key={i}
                    cx={100 + i * 50}
                    cy={50 + (i % 2) * 30}
                    r="4"
                    fill="#C0C0C0"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [0, -30, -60],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </svg>
            </div>
          </motion.div>

          {/* Welcome text */}
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-4xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-[#C0C0C0] text-lg max-w-md">
              Sign in to continue your journey with us
            </p>
          </motion.div>

          {/* Decorative elements - maroon dots */}
          <div className="absolute bottom-10 left-10 right-10 flex justify-between">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#800020] rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 bg-black lg:bg-gradient-to-br lg:from-black lg:via-[#0d0004] lg:to-black">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
