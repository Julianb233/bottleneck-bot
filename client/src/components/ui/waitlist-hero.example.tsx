"use client";

import { WaitlistHero } from "./waitlist-hero";

/**
 * Example usage of the WaitlistHero component
 */
export default function WaitlistHeroExample() {
  const handleJoin = async (email: string) => {
    // Simulate API call
    console.log("Joining waitlist with email:", email);
    
    // In a real app, you would make an API call here:
    // await fetch('/api/waitlist', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email }),
    // });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-background">
      <WaitlistHero
        title="Drive smarter with AI."
        description="Transform your workflow with intelligent automation."
        placeholder="name@email.com"
        buttonText="Join waitlist"
        successMessage="You're on the list!"
        onJoin={handleJoin}
      />
    </div>
  );
}

