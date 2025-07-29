        import React from "react";
import { Header } from "@/components/layout/Header";
import { Check, Star, Zap, Crown, Sparkles } from "lucide-react";
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
                quote: "The Altiorans plan gives me access to exclusive features that have accelerated my growth beyond expectations.",
                name: "Michael T.",
                title: "Altiorans Member"
            },
            {
                quote: "Premium Discord access and monthly challenges keep me engaged and motivated. Worth every penny.",
                name: "Lisa P.",
                title: "Premium Member"
            },
            {
                quote: "Early access to new features and personalized coaching have been invaluable for my trading journey.",
                name: "Robert K.",
                title: "Altiorans Member"
            },
            {
                quote: "The community aspect with other serious traders has been the missing piece in my development.",
                name: "Jennifer W.",
                title: "Pro Member"
            },
            {
                quote: "Unlimited goals and custom objectives have allowed me to create a truly personalized trading system.",
                name: "Thomas B.",
                title: "Altiorans Member"
            }
        ];

        return (
            <>
            <Header />
            
            <section className="min-h-screen bg-gradient-to-br from-pure-black to-neutral-950 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    
                                {/* Free Plan */}
                <div className="relative bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8 hover:border-neutral-600 transition-all duration-300">
                <div className="absolute top-4 right-4">
                    <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                    Free
                    </span>
                </div>
                
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
                    <p className="text-gray-400 mb-6">Start your transformation</p>
                    
                    <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-white">€0</span>
                    <span className="text-neutral-400 ml-2">/ month</span>
                    </div>
                </div>

                <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-neutral-300">
                    <Check className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                    <span>Trading journal (10 entries/month)</span>
                    </li>
                    <li className="flex items-center text-neutral-300">
                    <Check className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                    <span>Habit tracking (3 max)</span>
                    </li>
                    <li className="flex items-center text-neutral-300">
                    <Check className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                    <span>1 annual goal + 1 quarterly</span>
                    </li>
                    <li className="flex items-center text-neutral-300">
                    <Check className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                    <span>Basic analytics</span>
                    </li>
                </ul>

                <Link 
                    href="/auth/register"
                    className="block w-full bg-neutral-700 text-white text-center py-4 rounded-xl font-semibold hover:bg-neutral-600 transition-all duration-300 transform hover:scale-105"
                >
                    Start Free
                </Link>
                </div>

                    {/* Pro Plan */}
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/30 rounded-2xl p-8 hover:border-white/40 transition-all duration-300 transform hover:scale-105">
                    <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-white to-neutral-200 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Pro
                        </span>
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
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
                        <span><strong className="text-white">Everything from Free, plus:</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Unlimited trading journal</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Unlimited habit tracking</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">5 annual goals + quarterly breakdowns</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Discord integration</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Priority support</strong> (response &lt; 24h)</span>
                        </li>
                    </ul>

                    <Link 
                        href="/auth/register"
                        className="block w-full bg-gradient-to-r from-white to-neutral-200 text-black text-center py-4 rounded-xl font-bold hover:from-neutral-100 hover:to-neutral-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Get ALTIORA Pro
                    </Link>
                    </div>

                    {/* Altiorans Plan */}
                    <div className="relative bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm border border-purple-500/40 rounded-2xl p-8 hover:border-purple-500/60 transition-all duration-300 transform hover:scale-105">
                    <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Crown className="w-4 h-4" />
                        Altiorans
                        </span>
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Altiorans</h3>
                        <p className="text-gray-400 mb-6">Exclusive and personalized access</p>
                        
                        <div className="flex items-baseline mb-2">
                        <span className="text-5xl font-bold text-white">€49</span>
                        <span className="text-gray-400 ml-2">/ month</span>
                        </div>
                        <p className="text-sm text-gray-300">Save 25% with annual billing</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center text-gray-300">
                        <Sparkles className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Everything Pro, plus:</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Sparkles className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Unlimited custom goals</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Sparkles className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Early access to new features</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Sparkles className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Exclusive monthly challenge</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Sparkles className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Premium Discord channel</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Sparkles className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Personalized coaching</strong></span>
                        </li>
                    </ul>

                    <Link
                        href="/auth/register"
                        className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-4 rounded-xl font-bold hover:from-purple-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Become Altiorans
                    </Link>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <p className="text-gray-400 mb-4">
                      No hidden fees. Cancel anytime. Start building your discipline today.
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
                    <h2 className="text-3xl font-bold text-white text-center mb-8">What our users say</h2>
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