"use client";

import * as React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WaitlistHeroProps {
  className?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  onJoin?: (email: string) => Promise<void> | void;
}

export function WaitlistHero({
  className,
  title = "Drive smarter with AI.",
  description = "Transform your workflow with intelligent automation.",
  placeholder = "name@email.com",
  buttonText = "Join waitlist",
  successMessage = "You're on the list!",
  onJoin,
}: WaitlistHeroProps) {
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      if (onJoin) {
        await onJoin(email);
      }
      setIsSubmitted(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center min-h-[600px] px-4 py-16",
        className
      )}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow-delayed" />
      </div>

      {/* App Icon */}
      <div className="relative z-10 mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer" />
          {/* Icon */}
          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6 text-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto">
          {description}
        </p>

        {/* Form or Success Message */}
        {isSubmitted ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-3 text-primary animate-slide-up">
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-lg sm:text-xl font-semibold">{successMessage}</span>
            </div>
            <p className="text-sm text-muted-foreground animate-fade-in-delayed">
              We'll notify you when we launch. Thanks for your interest!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder={placeholder}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={cn(
                    "w-full h-12 text-base",
                    error && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  aria-label="Email address"
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <p
                    id="email-error"
                    className="absolute -bottom-5 left-0 text-xs text-destructive mt-1"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                loadingText="Joining..."
                className="h-12 px-6 sm:px-8 whitespace-nowrap"
              >
                {buttonText}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

