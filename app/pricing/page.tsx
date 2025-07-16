        import React from "react";
import { Header } from "@/components/layout/Header";
import { Check, Star, Zap } from "lucide-react";
import Link from "next/link";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import ShinyText from "@/components/landing/ShinyText";

        export default function PricingPage() {
        const testimonials1 = [
            {
                quote: "ALTIORA transformed my trading discipline completely. The habit tracking and journal insights are game-changers for my daily routine.",
                name: "Alex M.",
                title: "Professional Trader"
            },
            {
                quote: "Finally found a platform that understands the mental side of trading. The goal planning features keep me accountable every single day.",
                name: "Sarah K.",
                title: "Day Trader"
            },
            {
                quote: "The Discord integration for accountability is brilliant. My trading performance improved 300% since using ALTIORA consistently.",
                name: "Marcus R.",
                title: "Forex Trader"
            },
            {
                quote: "Clean interface, powerful analytics. ALTIORA helped me build the discipline I needed to become consistently profitable.",
                name: "Emma L.",
                title: "Swing Trader"
            },
            {
                quote: "The habit streaks and trading journal work perfectly together. I can finally track my progress and stay motivated long-term.",
                name: "David Chen",
                title: "Crypto Trader"
            }
        ];

        const testimonials2 = [
            {
                quote: "ALTIORA's pomodoro timer with Discord sync keeps me focused during market hours. The productivity boost is incredible.",
                name: "Jessica P.",
                title: "Options Trader"
            },
            {
                quote: "The AI insights in the trading journal help me identify patterns I never noticed before. Worth every penny.",
                name: "Ryan T.",
                title: "Futures Trader"
            },
            {
                quote: "Simple, effective, and exactly what I needed to build consistent trading habits. The analytics are phenomenal.",
                name: "Lisa Wang",
                title: "Stock Trader"
            },
            {
                quote: "Best investment I've made for my trading career. The goal tracking and habit building features are unmatched.",
                name: "Michael B.",
                title: "Portfolio Manager"
            },
            {
                quote: "ALTIORA helped me overcome emotional trading. The discipline tools and accountability features changed everything.",
                name: "Anna S.",
                title: "Retail Trader"
            }
        ];

        return (
            <>
            <Header />
            
            <section className="min-h-screen bg-gradient-to-br from-pure-black to-neutral-950 pt-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 font-argesta">
                    Choose Your Path.
                    </h1>
                    <ShinyText 
                    text="Start your journey to discipline and success with our proven platform"
                    className="text-xl text-neutral-400 max-w-2xl mx-auto font-argesta"
                    speed={8}
                    />
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    
                                {/* Trial Offer */}
                <div className="relative bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8 hover:border-neutral-600 transition-all duration-300">
                <div className="absolute top-4 right-4">
                    <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                    Trial
                    </span>
                </div>
                
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Free Trial</h3>
                    <p className="text-gray-400 mb-6">Experience the power of discipline</p>
                    
                    <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-white">€0</span>
                    <span className="text-neutral-400 ml-2">/ 14 days</span>
                    </div>
                </div>

                <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-neutral-300">
                    <Check className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                    Basic habit tracking
                    </li>
                    <li className="flex items-center text-neutral-300">
                    <Check className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                    Simple trading journal
                    </li>
                    <li className="flex items-center text-neutral-300">
                    <Check className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                    Goal setting tools
                    </li>
                    <li className="flex items-center text-neutral-300">
                    <Check className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                    Basic analytics
                    </li>
                </ul>

                <Link 
                    href="/auth/register"
                    className="block w-full bg-neutral-700 text-white text-center py-4 rounded-xl font-semibold hover:bg-neutral-600 transition-all duration-300 transform hover:scale-105"
                >
                    Start Free Trial
                </Link>
                </div>

                    {/* Pro Offer */}
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                    <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-white to-neutral-200 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Pro
                        </span>
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">ALTIORA Pro</h3>
                        <p className="text-gray-400 mb-6">Unlock your full potential</p>
                        
                        <div className="flex items-baseline mb-2">
                        <span className="text-5xl font-bold text-white">€29</span>
                        <span className="text-gray-400 ml-2">/ month</span>
                        </div>
                        <p className="text-sm text-gray-300">Save 20% with annual billing</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Advanced habit tracking</strong> with streaks</span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Professional trading journal</strong> with AI insights</span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Advanced goal planning</strong> with milestones</span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Discord integration</strong> for accountability</span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Premium analytics</strong> and reports</span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Priority support</strong></span>
                        </li>
                    </ul>

                    <Link 
                        href="/auth/register"
                        className="block w-full bg-gradient-to-r from-white to-neutral-200 text-black text-center py-4 rounded-xl font-bold hover:from-neutral-100 hover:to-neutral-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Get ALTIORA Pro
                    </Link>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <p className="text-gray-400 mb-4">
                    No hidden fees. Cancel anytime. Start building discipline today.
                    </p>
                    <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
                    <span>✓ 14-day money-back guarantee</span>
                    <span>✓ Secure payment</span>
                    <span>✓ No commitment</span>
                    </div>
                </div>

                </div>

                {/* Testimonials - Moving Left */}
                <div className="mt-20 w-full">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">What Our Users Say</h2>
                    <InfiniteMovingCards
                        items={testimonials1}
                        direction="left"
                        speed="slow"
                        className="mb-2"
                    />
                    <InfiniteMovingCards
                        items={testimonials2}
                        direction="right"
                        speed="slow"
                    />
                </div>
            </section>
            </>
        );
        } 