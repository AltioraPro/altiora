"use client";

import {
    ArrowUp,
    Cookie,
    FileText,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Send,
    Shield,
    Star,
    Target,
    TrendingUp,
    Twitter,
    Users,
    Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const DiscordIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

export const Footer = () => {
    const [email, setEmail] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const footerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (footerRef.current) {
                const rect = footerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
            }
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Newsletter signup:", email);
        setEmail("");
    };

    const navigationLinks = [
        { href: "/", label: "HOME", icon: Users },
        { href: "/trading-journal", label: "TRADING", icon: TrendingUp },
        { href: "/habits", label: "HABITS", icon: Target },
        { href: "/goals", label: "GOALS", icon: Zap },
        { href: "/pricing", label: "PRICING", icon: Star },
        { href: "/contact", label: "CONTACT", icon: Mail },
    ];

    const legalLinks = [
        { href: "/legal/privacy", label: "Privacy Policy", icon: Shield },
        { href: "/legal/terms", label: "Terms of Service", icon: FileText },
        { href: "/legal/cookies", label: "Cookies Policy", icon: Cookie },
    ];

    const socialLinks = [
        { href: "https://x.com/AltioraPro", label: "Twitter", icon: Twitter },
        {
            href: "https://www.linkedin.com/company/altiorapro/about/?viewAsMember=true",
            label: "LinkedIn",
            icon: Linkedin,
        },
        {
            href: "https://discord.gg/altiora",
            label: "Discord",
            icon: DiscordIcon,
        },
        {
            href: "https://www.instagram.com/altiorapro/",
            label: "Instagram",
            icon: Instagram,
        },
    ];

    return (
        <>
            <footer
                className="relative overflow-hidden bg-pure-black text-pure-white"
                ref={footerRef}
            >
                {/* Sophisticated "woaw" border with subtle animation */}
                <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

                {/* Elegant flowing accent */}
                <div className="absolute top-0 left-0 h-px w-full overflow-hidden">
                    <div
                        className="absolute top-0 h-px w-64 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        style={{
                            animation: "elegantFlow 12s ease-in-out infinite",
                        }}
                    />
                </div>

                {/* Dynamic background with mouse follow effect */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                        background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 30%, transparent 50%)`,
                    }}
                />

                {/* Background decorative elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Gradient mesh */}
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle, white 1px, transparent 1px)",
                            backgroundSize: "60px 60px",
                        }}
                    />

                    {/* Floating geometric shapes */}
                    <div
                        className="absolute top-20 left-20 h-6 w-6 rotate-45 animate-pulse border border-white/10"
                        style={{ animationDuration: "4s" }}
                    />
                    <div className="absolute top-40 right-32 h-8 w-8 rotate-12 border border-white/15" />
                    <div
                        className="absolute bottom-40 left-1/3 h-4 w-4 animate-pulse rounded-full bg-white/5"
                        style={{
                            animationDelay: "2s",
                            animationDuration: "6s",
                        }}
                    />

                    {/* Gradient lines */}
                </div>

                <div className="relative z-10 w-full px-6 py-20 lg:px-8">
                    {/* Main Footer Content */}
                    <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                        {/* Brand Section */}
                        <div className="space-y-6 lg:col-span-1">
                            <div className="mb-6 flex items-center space-x-3">
                                <Image
                                    alt="Altiora Logo"
                                    className="h-12 w-auto"
                                    height={22}
                                    priority
                                    src="/img/logo.png"
                                    width={80}
                                />
                            </div>

                            <p className="text-sm text-white/70 leading-relaxed">
                                Transform your discipline with our comprehensive
                                platform for trading, habits, and goals. Build
                                the mindset of a champion.
                            </p>

                            {/* Newsletter Signup */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm text-white tracking-wider">
                                    STAY UPDATED
                                </h4>
                                <form
                                    className="flex space-x-2"
                                    onSubmit={handleNewsletterSubmit}
                                >
                                    <div className="group relative flex-1">
                                        <input
                                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-white/40 focus:bg-white/10 focus:outline-none"
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="your@email.com"
                                            required
                                            type="email"
                                            value={email}
                                        />
                                        <div className="-z-10 absolute inset-0 rounded-xl bg-white/5 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                                    </div>
                                    <button
                                        className="group rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/20"
                                        type="submit"
                                    >
                                        <Send className="h-4 w-4 text-white/80 transition-colors duration-300 group-hover:text-white" />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-6">
                            <h4 className="flex items-center space-x-2 font-bold text-sm text-white tracking-wider">
                                <div className="h-1 w-1 rounded-full bg-white/60" />
                                <span>NAVIGATION</span>
                            </h4>
                            <ul className="space-y-3">
                                {navigationLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <li key={link.href}>
                                            <Link
                                                className="group flex items-center space-x-3 text-white/60 transition-all duration-300 hover:text-white"
                                                href={link.href}
                                            >
                                                <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                                                <span className="text-sm">
                                                    {link.label}
                                                </span>
                                                <div className="h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-6" />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Legal & Support */}
                        <div className="space-y-6">
                            <h4 className="flex items-center space-x-2 font-bold text-sm text-white tracking-wider">
                                <div className="h-1 w-1 rounded-full bg-white/60" />
                                <span>LEGAL & SUPPORT</span>
                            </h4>
                            <ul className="space-y-3">
                                {legalLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <li key={link.href}>
                                            <Link
                                                className="group flex items-center space-x-3 text-white/60 transition-all duration-300 hover:text-white"
                                                href={link.href}
                                            >
                                                <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                                                <span className="text-sm">
                                                    {link.label}
                                                </span>
                                                <div className="h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-6" />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Contact & Social */}
                        <div className="space-y-6">
                            <h4 className="flex items-center space-x-2 font-bold text-sm text-white tracking-wider">
                                <div className="h-1 w-1 rounded-full bg-white/60" />
                                <span>CONNECT</span>
                            </h4>

                            {/* Contact Info */}
                            <div className="space-y-3 text-sm text-white/60">
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-4 w-4" />
                                    <span className="">
                                        contact@altiora.app
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <MapPin className="h-4 w-4" />
                                    <span className="">Paris, France</span>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="space-y-4">
                                <h5 className="text-white/80 text-xs tracking-wider">
                                    FOLLOW US
                                </h5>
                                <div className="flex space-x-4">
                                    {socialLinks.map((social) => {
                                        const Icon = social.icon;
                                        return (
                                            <a
                                                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/15"
                                                href={social.href}
                                                key={social.href}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                                title={social.label}
                                            >
                                                <Icon className="h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-white" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="border-white/10 border-t pt-8">
                        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                            {/* Copyright */}
                            <div className="text-center md:text-left">
                                <p className="text-sm text-white/50">
                                    &copy; {new Date().getFullYear()} Altiora.
                                    All rights reserved.
                                </p>
                            </div>

                            {/* Additional Links */}
                            <div className="flex items-center space-x-6 text-white/50 text-xs">
                                <span className="flex items-center space-x-2">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                    <span className="">System Status</span>
                                </span>
                                <Link
                                    className="transition-colors duration-300 hover:text-white/70"
                                    href="/changelog"
                                >
                                    Changelog
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            <button
                aria-label="Scroll to top"
                className={`group fixed right-8 bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-pure-black/80 backdrop-blur-md transition-all duration-500 hover:scale-110 hover:border-white/40 hover:bg-white/10 ${
                    isVisible
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-4 opacity-0"
                }`}
                onClick={scrollToTop}
            >
                <ArrowUp className="h-5 w-5 text-white/80 transition-colors duration-300 group-hover:text-white" />
                <div className="-z-10 absolute inset-0 rounded-full bg-white/5 opacity-0 blur-xl transition-all duration-300 group-hover:scale-150 group-hover:opacity-100" />
            </button>
        </>
    );
};
