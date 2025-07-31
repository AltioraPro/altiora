"use client";

import ShinyText from "@/components/landing/ShinyText";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { ArrowRight, BookOpen, Zap, Trophy } from "lucide-react";
import Link from "next/link";
import SpotlightCard from "../SpotlightCard";

// Discord Icon SVG Component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const FeaturesSection = () => {
  return (
    <section 
      className="min-h-screen text-pure-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(220.55deg, #000000 0%, #0a0a0a 100%)'
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grille de points subtile */}
        <div className="absolute inset-0 opacity-[0.015]" 
             style={{
               backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
               backgroundSize: '40px 40px',
             }} 
        />
        
        {/* Formes géométriques animées */}
        <div className="absolute top-20 left-10 w-5 h-5 border border-white/10 rotate-45 animate-pulse" />
        <div className="absolute top-40 right-20 w-8 h-8 border border-white/15 rotate-12 animate-bounce" style={{animationDuration: '3s'}} />
        <div className="absolute bottom-32 left-1/3 w-6 h-6 border border-white/20 rotate-45" />
        <div className="absolute bottom-60 right-1/4 w-4 h-4 bg-white/5 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
        
        {/* Lignes décoratives */}
        <div className="absolute top-1/3 left-0 w-24 h-px bg-gradient-to-r from-transparent to-white/20" />
        <div className="absolute top-2/3 right-0 w-32 h-px bg-gradient-to-l from-transparent to-white/25" />
        
        {/* Effet de lumière central */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 70%)'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header de section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/30" />
            <span className="text-xs font-argesta tracking-[0.3em] text-white/60">FEATURES</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-white/30" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-argesta font-bold mb-6">
            <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              TRANSFORM
            </span>
            <br />
            <ShinyText 
              text="YOUR MINDSET"
              className="text-5xl md:text-6xl font-argesta font-bold"
              speed={6}
            />
          </h2>
          
          <AnimatedText 
            text="A complete platform to develop your personal and professional discipline"
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-argesta"
            delay={200}
            charDelay={30}
          />
        </div>

        {/* Grille des fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          
          {/* Trading Journal */}
          <AnimatedCard delay={0}>
            <SpotlightCard className="custom-spotlight-card group relative h-[400px] bg-pure-black" spotlightColor="rgba(255, 255, 255, 0.2)">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                  <BookOpen className="w-8 h-8 text-white/80 group-hover:text-white transition-colors duration-300" />
                </div>
                
                {/* Effet particule */}
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
              </div>
              
              <h3 className="text-xl font-argesta font-bold mb-4 text-white">
                TRADING JOURNAL
              </h3>
              
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Analyze your trades, identify patterns and optimize your strategy with an intelligent journal.
              </p>
              
              {/* Points clés */}
              <ul className="space-y-2 text-xs text-white/50">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Emotional analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Advanced metrics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Detailed reports</span>
                </li>
              </ul>
            </SpotlightCard>
          </AnimatedCard>

          {/* Habit Tracker */}
          <AnimatedCard delay={150}>
            <SpotlightCard className="custom-spotlight-card group relative h-[400px] bg-pure-black" spotlightColor="rgba(255, 255, 255, 0.2)">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                  <Zap className="w-8 h-8 text-white/80 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
              </div>
              
              <h3 className="text-xl font-argesta font-bold mb-4 text-white">
                HABIT TRACKER
              </h3>
              
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Build lasting habits with a visual and motivating tracking system.
              </p>
              
              <ul className="space-y-2 text-xs text-white/50">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Visual calendar</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Streaks & stats</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Smart reminders</span>
                </li>
              </ul>
            </SpotlightCard>
          </AnimatedCard>

          {/* Goal Planning */}
          <AnimatedCard delay={300}>
            <SpotlightCard className="custom-spotlight-card group relative h-[400px] bg-pure-black" spotlightColor="rgba(255, 255, 255, 0.2)">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                  <Trophy className="w-8 h-8 text-white/80 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
              </div>
              
              <h3 className="text-xl font-argesta font-bold mb-4 text-white">
                GOAL PLANNING
              </h3>
              
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Plan and achieve your goals with a structured and measurable approach.
              </p>
              
              <ul className="space-y-2 text-xs text-white/50">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Smart OKRs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Progress tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span>Step breakdown</span>
                </li>
              </ul>
            </SpotlightCard>
          </AnimatedCard>

          {/* Discord Integration */}
          <AnimatedCard delay={450}>
            <SpotlightCard className="custom-spotlight-card group relative h-[400px] bg-pure-black" spotlightColor="rgba(255, 255, 255, 0.2)" >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                    <DiscordIcon className="w-8 h-8 text-white/80 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                </div>
                
                <h3 className="text-xl font-argesta font-bold mb-4 text-white">
                  DISCORD POMODORO
                </h3>
                
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Boost your productivity with our Discord bot that syncs your pomodoro sessions directly to your workspace.
                </p>
                
                <ul className="space-y-2 text-xs text-white/50">
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-white/40 rounded-full" />
                    <span>Pomodoro timer bot</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-white/40 rounded-full" />
                    <span>Auto session tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-white/40 rounded-full" />
                    <span>Community accountability</span>
                  </li>
                </ul>
            </SpotlightCard>
          </AnimatedCard>
        </div>

        {/* And more section */}
        <AnimatedCard delay={500}>
          <div className="text-center mt-16 mb-8">
            
            <p className="text-white/50 text-sm font-argesta tracking-[0.2em]">
              AND MUCH MORE...
            </p>
            
            <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-white/30">
              <span>Analytics Dashboard</span>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Smart Notifications</span>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Export Features</span>
            </div>
          </div>
        </AnimatedCard>

        {/* Call to action */}
        <AnimatedCard delay={550}>
          <div className="text-center mt-20">
            <div className="inline-flex flex-col items-center space-y-6">
              <p className="text-white/60 text-sm font-argesta tracking-widest">
                READY TO TRANSFORM YOUR DISCIPLINE?
              </p>
              
              <Link href="/auth/register">
                <HoverBorderGradient
                  containerClassName="bg-pure-black"
                  className="bg-pure-black text-white border border-white/10 px-8 py-4"
                >
                  <span className="flex items-center gap-3 font-argesta tracking-widest">
                    START NOW
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </HoverBorderGradient>
              </Link>
              
              {/* Stats décoratives */}
              <div className="flex items-center space-x-8 text-xs text-white/40 mt-8">
                <div className="text-center">
                  <div className="font-argesta text-white/60">1000+</div>
                  <div>Active users</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="font-argesta text-white/60">50K+</div>
                  <div>Trades analyzed</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="font-argesta text-white/60">95%</div>
                  <div>Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </section>
  );
}; 