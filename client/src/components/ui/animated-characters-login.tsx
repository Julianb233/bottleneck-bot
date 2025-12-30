"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedCharacterProps {
  isTyping?: boolean;
  isPasswordVisible?: boolean;
  className?: string;
}

function AnimatedCharacter({
  isTyping = false,
  isPasswordVisible = false,
  className,
}: AnimatedCharacterProps) {
  const [isBlinking, setIsBlinking] = React.useState(false);

  // Blink animation every 3-5 seconds
  React.useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 2000 + 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full max-w-[200px] max-h-[200px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Character Body */}
        <g id="character">
          {/* Head */}
          <circle
            cx="100"
            cy="80"
            r="45"
            fill="#FFE5B4"
            className="transition-all duration-300"
            style={{
              transform: isTyping ? "scale(1.05)" : "scale(1)",
            }}
          />

          {/* Eyes */}
          <g id="eyes">
            {/* Left Eye */}
            <ellipse
              cx="85"
              cy="75"
              rx="8"
              ry={isBlinking || isTyping ? "1" : "12"}
              fill="#000"
              className="transition-all duration-150"
              style={{
                transform: isTyping ? "translateX(-2px)" : "translateX(0)",
              }}
            />
            {/* Right Eye */}
            <ellipse
              cx="115"
              cy="75"
              rx="8"
              ry={isBlinking || isTyping ? "1" : "12"}
              fill="#000"
              className="transition-all duration-150"
              style={{
                transform: isTyping ? "translateX(2px)" : "translateX(0)",
              }}
            />

            {/* Eye shine */}
            {!isBlinking && !isTyping && (
              <>
                <circle cx="88" cy="72" r="3" fill="#fff" />
                <circle cx="118" cy="72" r="3" fill="#fff" />
              </>
            )}
          </g>

          {/* Mouth - changes based on typing */}
          <path
            d={
              isTyping
                ? "M 85 95 Q 100 105 115 95"
                : isPasswordVisible
                ? "M 85 95 Q 100 110 115 95"
                : "M 90 95 Q 100 100 110 95"
            }
            stroke="#000"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Cheeks - appear when typing */}
          {isTyping && (
            <g className="animate-fade-in">
              <circle cx="70" cy="85" r="8" fill="#FFB6C1" opacity="0.6" />
              <circle cx="130" cy="85" r="8" fill="#FFB6C1" opacity="0.6" />
            </g>
          )}

          {/* Body */}
          <ellipse
            cx="100"
            cy="150"
            rx="35"
            ry="40"
            fill="#4A90E2"
            className="transition-all duration-300"
            style={{
              transform: isTyping ? "scale(1.05)" : "scale(1)",
            }}
          />

          {/* Arms */}
          <g id="arms">
            {/* Left Arm */}
            <ellipse
              cx="65"
              cy="140"
              rx="12"
              ry="25"
              fill="#4A90E2"
              className="transition-all duration-300"
              style={{
                transform: isTyping
                  ? "rotate(-20deg) translateX(-5px)"
                  : "rotate(0deg)",
                transformOrigin: "65px 140px",
              }}
            />
            {/* Right Arm */}
            <ellipse
              cx="135"
              cy="140"
              rx="12"
              ry="25"
              fill="#4A90E2"
              className="transition-all duration-300"
              style={{
                transform: isTyping
                  ? "rotate(20deg) translateX(5px)"
                  : "rotate(0deg)",
                transformOrigin: "135px 140px",
              }}
            />
          </g>

          {/* Hands */}
          <circle
            cx="60"
            cy="160"
            r="8"
            fill="#FFE5B4"
            className="transition-all duration-300"
            style={{
              transform: isTyping
                ? "rotate(-20deg) translateX(-5px) translateY(-5px)"
                : "translate(0, 0)",
            }}
          />
          <circle
            cx="140"
            cy="160"
            r="8"
            fill="#FFE5B4"
            className="transition-all duration-300"
            style={{
              transform: isTyping
                ? "rotate(20deg) translateX(5px) translateY(-5px)"
                : "translate(0, 0)",
            }}
          />
        </g>

        {/* Thought bubble when password is visible */}
        {isPasswordVisible && (
          <g id="thought-bubble" className="animate-fade-in">
            <path
              d="M 150 60 Q 160 50 170 60 Q 160 70 150 60"
              fill="#fff"
              stroke="#4A90E2"
              strokeWidth="2"
            />
            <circle cx="165" cy="55" r="12" fill="#fff" stroke="#4A90E2" strokeWidth="2" />
            <circle cx="175" cy="50" r="8" fill="#fff" stroke="#4A90E2" strokeWidth="2" />
            {/* Eye icon in thought bubble */}
            <g transform="translate(158, 48)">
              <path
                d="M 2 4 C 2 2, 4 0, 6 0 C 8 0, 10 2, 10 4 C 10 6, 8 8, 6 8 C 4 8, 2 6, 2 4 Z"
                fill="#4A90E2"
              />
              <circle cx="6" cy="4" r="2" fill="#fff" />
            </g>
          </g>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <g id="typing-indicator" className="animate-fade-in">
            <circle cx="100" cy="200" r="4" fill="#4A90E2" opacity="0.4">
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="110" cy="200" r="4" fill="#4A90E2" opacity="0.4">
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="1s"
                begin="0.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="120" cy="200" r="4" fill="#4A90E2" opacity="0.4">
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="1s"
                begin="0.4s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
}

interface AnimatedCharactersLoginProps {
  email: string;
  password: string;
  showPassword: boolean;
  className?: string;
}

export function AnimatedCharactersLogin({
  email,
  password,
  showPassword,
  className,
}: AnimatedCharactersLoginProps) {
  const isTyping = React.useMemo(
    () => email.length > 0 || password.length > 0,
    [email, password]
  );

  return (
    <div className={cn("relative w-full h-full", className)}>
      <AnimatedCharacter
        isTyping={isTyping}
        isPasswordVisible={showPassword}
      />
    </div>
  );
}
