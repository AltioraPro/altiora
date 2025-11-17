"use client";

import {
    RiArrowUpLine,
    RiDiscordLine,
    RiFileTextLine,
    RiLightbulbLine,
    RiLinkedinLine,
    RiMailLine,
    RiMapPinLine,
    RiSendPlaneLine,
    RiShieldLine,
    RiStarLine,
    RiStockLine,
    RiTargetLine,
    RiTwitterLine,
    RiUserLine,
} from "@remixicon/react";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { PAGES } from "@/constants/pages";
import { Logo } from "../logo";

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
        setEmail("");
    };

    const navigationLinks = [
        { href: PAGES.LANDING_PAGE, label: "HOME", icon: RiUserLine },
        { href: PAGES.TRADING_JOURNALS, label: "TRADING", icon: RiStockLine },
        { href: PAGES.HABITS, label: "HABITS", icon: RiTargetLine },
        { href: PAGES.GOALS, label: "GOALS", icon: RiLightbulbLine },
        { href: PAGES.PRICING, label: "PRICING", icon: RiStarLine },
        { href: PAGES.CONTACT_US, label: "CONTACT", icon: RiMailLine },
    ];

    const legalLinks = [
        {
            href: PAGES.PRIVACY_POLICY,
            label: "Privacy Policy",
            icon: RiShieldLine,
        },
        {
            href: PAGES.TERMS_OF_SERVICE,
            label: "Terms of Service",
            icon: RiFileTextLine,
        },
    ];

    const socialLinks = [
        {
            href: "https://x.com/AltioraPro",
            label: "Twitter",
            icon: RiTwitterLine,
        },
        {
            href: "https://www.linkedin.com/company/altiorapro/about/?viewAsMember=true",
            label: "LinkedIn",
            icon: RiLinkedinLine,
        },
        {
            href: "https://discord.gg/altiora",
            label: "Discord",
            icon: RiDiscordLine,
        },
    ];

    return (
        <>
            <footer
                className="relative overflow-hidden bg-pure-black text-pure-white"
                ref={footerRef}
            >
                {/* Sophisticated "woaw" border with subtle animation */}
                <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/12 to-transparent" />

                {/* Elegant flowing accent */}
                <div className="absolute top-0 left-0 h-px w-full overflow-hidden">
                    <div
                        className="absolute top-0 h-px w-64 bg-linear-to-r from-transparent via-white/40 to-transparent"
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
                                <Logo className="h-8 w-fit sm:h-12" />
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
                                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 backdrop-blur-xs transition-all duration-300 focus:border-white/40 focus:bg-white/10 focus:outline-hidden"
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
                                        className="group rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xs transition-all duration-300 hover:border-white/40 hover:bg-white/20"
                                        type="submit"
                                    >
                                        <RiSendPlaneLine className="size-4 text-white/80 transition-colors duration-300 group-hover:text-white" />
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
                                    <RiMailLine className="size-4" />
                                    <span className="">
                                        contact@altiora.app
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RiMapPinLine className="size-4" />
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
                                                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-xs transition-all duration-300 hover:border-white/40 hover:bg-white/15"
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
                                <Suspense>
                                    <CurrentYear />
                                </Suspense>
                            </div>

                            {/* Additional Links */}
                            <div className="flex items-center space-x-6 text-white/50 text-xs">
                                <span className="flex items-center space-x-2">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                    <span className="">System Status</span>
                                </span>
                                <Link
                                    className="transition-colors duration-300 hover:text-white/70"
                                    href={PAGES.CHANGELOG}
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
                type="button"
            >
                <RiArrowUpLine className="size-5 text-white/80 transition-colors duration-300 group-hover:text-white" />
                <div className="-z-10 absolute inset-0 rounded-full bg-white/5 opacity-0 blur-xl transition-all duration-300 group-hover:scale-150 group-hover:opacity-100" />
            </button>
        </>
    );
};

function CurrentYear() {
    return (
        <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} Altiora. All rights reserved.
        </p>
    );
}
