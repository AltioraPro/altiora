                import React from "react";
        import { Header } from "@/components/layout/Header";
        import { Check, Zap, Crown, Sparkles, MessageCircle } from "lucide-react";
        import Link from "next/link";
        import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
        import ShinyText from "@/components/landing/ShinyText";
        import StripeCheckout from "@/components/subscription/StripeCheckout";

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
                        quote: "The Altioran plan gives me unlimited access to everything I need. No more worrying about limits or restrictions.",
                        name: "Michael T.",
                        title: "Altioran Member"
                    },
                    {
                        quote: "Unlimited goals, unlimited habits, unlimited journal entries. This is exactly what I needed to scale my trading.",
                        name: "Lisa P.",
                        title: "Altioran Member"
                    },
                    {
                        quote: "The private coaching session completely transformed my approach to life and trading. Worth every penny.",
                        name: "Robert K.",
                        title: "Private Coaching Client"
                    },
                    {
                        quote: "Having unlimited access to all features has accelerated my growth beyond what I thought was possible.",
                        name: "Jennifer W.",
                        title: "Altioran Member"
                    },
                    {
                        quote: "The private coaching helped me identify blind spots I never knew existed. Game-changing experience.",
                        name: "Thomas B.",
                        title: "Private Coaching Client"
                    }
                ];

                return (
                    <>
                    <Header />
                    
                    <section className="min-h-screen bg-gradient-to-br from-pure-black to-neutral-950 pt-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        
                        {/* Header Section */}
                        <div className="text-center mb-16">
                            <h1 className="text-5xl lg:text-6xl font-bold font-argesta text-white mb-6">
                            Choose Your Path.
                            </h1>
                            <ShinyText 
                            text="Start your journey to discipline and success with our proven platform"
                            className="text-xl text-neutral-400 max-w-2xl mx-auto"
                            speed={8}
                            />
                        </div>

                                {/* Pricing Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    
                    {/* Free Plan */}
                    <div className="relative bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300">
                    <div className="absolute top-4 right-4">
                        <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                        Free
                        </span>
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
                        <p className="text-gray-400 mb-4">Start your transformation</p>
                        
                        <div className="flex items-baseline mb-4">
                        <span className="text-3xl font-bold text-white">€0</span>
                        <span className="text-neutral-400 ml-2">/ month</span>
                        </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center text-neutral-300">
                        <Check className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span>Trading journal (10 entries/month)</span>
                        </li>
                        <li className="flex items-center text-neutral-300">
                        <Check className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span>Habit tracking (3 max)</span>
                        </li>
                        <li className="flex items-center text-neutral-300">
                        <Check className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span>1 annual goal + 1 quarterly</span>
                        </li>
                        <li className="flex items-center text-neutral-300">
                        <Check className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span>Basic analytics</span>
                        </li>
                        <li className="flex items-center text-neutral-300">
                        <Check className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span>Community access</span>
                        </li>
                    </ul>

                    <Link 
                        href="/auth/register"
                        className="block w-full bg-neutral-700 text-white text-center py-3 rounded-xl font-semibold hover:bg-neutral-600 transition-all duration-300 transform hover:scale-105"
                    >
                        Start Free
                    </Link>
                    </div>

                    {/* Altioran Plan - Featured */}
                    <div className="relative bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm border-2 border-purple-500/60 rounded-2xl p-10 hover:border-purple-500/80 transition-all duration-300 transform hover:scale-105 lg:scale-110 lg:z-10">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        Altioran
                        </span>
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="text-3xl font-bold text-white mb-3">Altioran</h3>
                        <p className="text-gray-300 mb-6">Unlimited access to everything</p>
                        
                        <div className="flex items-baseline mb-3">
                        <span className="text-6xl font-bold text-white">€15</span>
                        <span className="text-gray-300 ml-2">/ month</span>
                        </div>
                        <p className="text-sm text-gray-300">€150/year (save 17%)</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Unlimited trading journal</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Unlimited habit tracking</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Unlimited goal planning</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Virtual assistant & Pomodoro</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Deep work tracking</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Discord integration</strong></span>
                        </li>
                        <li className="flex items-center text-gray-300">
                        <Zap className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Priority support</strong></span>
                        </li>
                    </ul>

                    <StripeCheckout 
                        priceId="price_1SCdcHBtAefV566E4tUitB8Z"
                        className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-4 rounded-xl font-bold hover:from-purple-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Get Altioran
                    </StripeCheckout>
                    </div>

                    {/* Private Coaching Plan */}
                    <div className="relative bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-700 rounded-2xl p-6 hover:border-neutral-600 transition-all duration-300">
                    <div className="absolute top-4 right-4">
                        <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        Private
                        </span>
                    </div>
                    
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Private Coaching</h3>
                        <p className="text-gray-400 mb-4">Personalized transformation</p>
                        
                        <div className="flex items-baseline mb-4">
                        <span className="text-3xl font-bold text-white">Custom</span>
                        </div>
                        <p className="text-sm text-gray-300">Contact for quote</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center text-neutral-300">
                        <Sparkles className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Everything Altioran, plus:</strong></span>
                        </li>
                        <li className="flex items-center text-neutral-300">
                        <Sparkles className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">1-on-1 coaching sessions</strong></span>
                        </li>
                        <li className="flex items-center text-neutral-300">
                        <Sparkles className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Personalized life improvement</strong></span>
                        </li>
                        <li className="flex items-center text-neutral-300">
                        <Sparkles className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Custom goal strategies</strong></span>
                        </li>
                        <li className="flex items-center text-neutral-300">
                        <Sparkles className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">Accountability partner</strong></span>
                        </li>
                        <li className="flex items-center text-neutral-300">
                        <Sparkles className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
                        <span><strong className="text-white">24/7 priority support</strong></span>
                        </li>
                    </ul>

                    <Link
                        href="/contact"
                        className="block w-full bg-neutral-700 text-white text-center py-3 rounded-xl font-semibold hover:bg-neutral-600 transition-all duration-300 transform hover:scale-105"
                    >
                        Get Quote
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