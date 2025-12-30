"use client";

import * as React from "react";
import { ChevronRight, ArrowRight, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroButtonExpandableProps {
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  className?: string;
  variant?: "default" | "maroon" | "outline";
  size?: "default" | "sm" | "lg";
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

export function HeroButtonExpandable({
  children,
  expandedContent,
  className,
  variant = "maroon",
  size = "lg",
  icon,
  onClick,
  href,
}: HeroButtonExpandableProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    if (expandedContent) {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    maroon: "bg-[#800020] text-white hover:bg-[#A00030] border-2 border-[#800020] hover:border-[#A00030]",
    outline: "border-2 border-[#800020] text-[#800020] bg-transparent hover:bg-[#800020] hover:text-white",
  };

  const sizeClasses = {
    sm: "h-10 px-4 text-sm",
    default: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  const buttonContent = (
    <div className="relative w-full">
      <div className="flex items-center justify-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="font-semibold">{children}</span>
        {expandedContent && (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-300 flex-shrink-0",
              isExpanded && "rotate-90",
              isHovered && !isExpanded && "translate-x-1"
            )}
          />
        )}
        {!expandedContent && (
          <ArrowRight
            className={cn(
              "h-4 w-4 transition-transform duration-300 flex-shrink-0",
              isHovered && "translate-x-1"
            )}
          />
        )}
      </div>
    </div>
  );

  const buttonElement = (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-lg font-semibold transition-all duration-300",
        "shadow-lg hover:shadow-xl active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-[#800020] focus:ring-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {/* Animated background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-[#800020] via-[#A00030] to-[#800020]",
          "opacity-0 transition-opacity duration-300",
          (isHovered || isExpanded) && "opacity-100"
        )}
        style={{
          backgroundSize: "200% 200%",
          animation: isHovered ? "gradient-shift 3s ease infinite" : "none",
        }}
      />

      {/* Shimmer effect */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          "from-transparent via-white/20 to-transparent",
          "translate-x-[-100%] transition-transform duration-700",
          isHovered && "translate-x-[100%]"
        )}
      />

      {/* Content */}
      <span className="relative z-10">{buttonContent}</span>
    </button>
  );

  if (href) {
    return (
      <a
        href={href}
        className="inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {buttonElement}
      </a>
    );
  }

  return (
    <div className="relative">
      {buttonElement}
      
      {/* Expanded content */}
      {expandedContent && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-2 z-50",
            "bg-black/95 backdrop-blur-sm border-2 border-[#800020]",
            "rounded-lg shadow-2xl overflow-hidden",
            "transition-all duration-300 ease-in-out",
            isExpanded
              ? "opacity-100 translate-y-0 max-h-96"
              : "opacity-0 -translate-y-4 max-h-0 pointer-events-none"
          )}
        >
          <div className="p-4 text-white">
            {expandedContent}
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone expandable button variant
interface ExpandableButtonProps {
  label: string;
  expandedLabel?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "maroon" | "outline";
}

export function ExpandableButton({
  label,
  expandedLabel,
  children,
  className,
  variant = "maroon",
}: ExpandableButtonProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <HeroButtonExpandable
      variant={variant}
      className={className}
      onClick={() => setIsExpanded(!isExpanded)}
      expandedContent={
        isExpanded ? (
          <div className="space-y-2">
            {children}
          </div>
        ) : undefined
      }
    >
      {isExpanded ? expandedLabel || label : label}
    </HeroButtonExpandable>
  );
}

