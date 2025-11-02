"use client";

import {
    Home,
    LogOut,
    Phone,
    Settings,
    Target,
    TrendingUp,
    Trophy,
    User,
    Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PAGES } from "@/constants/pages";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface HeaderProps {
    className?: string;
}

export const Header = ({ className }: HeaderProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { data: session, isPending } = useSession();

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(!isMenuOpen);
    }, [isMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [lastScrollY]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isMenuOpen) {
                toggleMenu();
            }
        };

        if (isMenuOpen) {
            window.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMenuOpen, toggleMenu]);

    const menuItems = [
        { href: PAGES.LANDING_PAGE, label: "HOME", icon: Home, angle: -70 },
        {
            href: PAGES.TRADING_JOURNALS,
            label: "TRADING",
            icon: TrendingUp,
            angle: -45,
        },
        { href: PAGES.HABITS, label: "HABITS", icon: Target, angle: -20 },
        { href: PAGES.GOALS, label: "GOALS", icon: Users, angle: 5 },
        {
            href: PAGES.LEADERBOARD,
            label: "LEADERBOARD",
            icon: Trophy,
            angle: 30,
        },
        { href: PAGES.SETTINGS, label: "SETTINGS", icon: Settings, angle: 55 },
        { href: PAGES.CONTACT_US, label: "CONTACT", icon: Phone, angle: 80 },
    ];

    return (
        <>
            <header
                className={`fixed top-0 right-0 left-0 z-30 border border-white/10 bg-transparent backdrop-blur-md transition-transform duration-300 ease-in-out ${className} ${
                    isVisible ? "translate-y-0" : "-translate-y-full"
                }`}
            >
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex h-16 items-center">
                        {/* Menu Button - Left */}
                        <div className="relative z-10">
                            <button
                                aria-label="Toggle menu"
                                className="group relative flex h-12 w-12 items-center justify-center"
                                onClick={toggleMenu}
                                type="button"
                            >
                                <div className="relative h-6 w-6 cursor-pointer">
                                    <div
                                        className={
                                            "absolute inset-0 transition-all duration-700 ease-out"
                                        }
                                    />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span
                                            className={`block h-0.5 bg-white transition-all duration-500 ease-out ${
                                                isMenuOpen
                                                    ? "w-4 translate-y-[1px] rotate-45 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                                    : "w-4 translate-y-[-3px] rotate-0 group-hover:w-5"
                                            }`}
                                        />
                                        <span
                                            className={`block h-0.5 bg-white transition-all duration-300 ${
                                                isMenuOpen
                                                    ? "w-0 opacity-0"
                                                    : "w-3 opacity-100 group-hover:w-4"
                                            }`}
                                        />
                                        <span
                                            className={`block h-0.5 bg-white transition-all duration-500 ease-out ${
                                                isMenuOpen
                                                    ? "-rotate-45 w-4 translate-y-[-1px] shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                                    : "w-4 translate-y-[3px] rotate-0 group-hover:w-5"
                                            }`}
                                        />
                                    </div>

                                    {/* Pulse Effect */}
                                    <div
                                        className={`absolute inset-0 transition-all duration-300 ${
                                            isMenuOpen
                                                ? "opacity-0"
                                                : "animate-ping bg-white/5 opacity-0 group-hover:opacity-100"
                                        }`}
                                    />
                                </div>
                            </button>
                        </div>

                        {/* Logo - Centre absolu */}
                        <div className="-translate-x-1/2 absolute left-1/2 z-5 transform">
                            <Link
                                className="flex items-center"
                                href={PAGES.LANDING_PAGE}
                            >
                                <Image
                                    alt="Altiora Logo"
                                    className="h-10 w-auto"
                                    height={20}
                                    priority
                                    src="/img/logo.png"
                                    width={70}
                                />
                            </Link>
                        </div>

                        {/* Auth Section - Right */}
                        <div className="z-10 ml-auto flex items-center space-x-3">
                            {isPending ? (
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            ) : session?.user ? (
                                /* User Profile - Connecté */
                                <div className="flex items-center space-x-3">
                                    <Link
                                        className="group flex items-center space-x-2 rounded-xl border border-white/20 px-3 py-2 text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
                                        href={PAGES.SETTINGS}
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span className="font-medium text-sm">
                                            Settings
                                        </span>
                                    </Link>

                                    <Link
                                        className="group flex items-center space-x-2 rounded-xl border border-white/20 px-3 py-2 text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
                                        href={PAGES.PROFILE}
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                                            <User className="h-3 w-3" />
                                        </div>
                                        <span className="font-medium text-sm">
                                            {session.user.name?.split(" ")[0] ||
                                                session.user.email.split(
                                                    "@"
                                                )[0]}
                                        </span>
                                    </Link>

                                    <button
                                        className="rounded-xl border border-white/20 p-2 text-white/60 transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
                                        onClick={async () => {
                                            await signOut();
                                            window.location.href =
                                                PAGES.LANDING_PAGE;
                                        }}
                                        title="Sign Out"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    className="group rounded-xl border border-white/20 px-4 py-2 font-semibold text-sm text-white/80 tracking-wider backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
                                    href={PAGES.SIGN_IN}
                                >
                                    <span className="relative">
                                        Login
                                        <div className="-bottom-1 absolute left-0 h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-full" />
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Revolutionary Full-Screen Menu */}
            <div
                className={`fixed inset-0 z-50 transition-all duration-700 ease-out ${
                    isMenuOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            >
                {/* Dynamic Background with Mouse Follow Effect */}
                <div
                    className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                    style={{
                        background: isMenuOpen
                            ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.95) 100%)`
                            : "rgba(0,0,0,0.95)",
                    }}
                />

                {/* Central Menu Container */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative flex flex-col items-center">
                        {/* Central Logo/Title */}
                        <div
                            className={`mb-8 text-center transition-all duration-1000 ${
                                isMenuOpen
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                            }`}
                        >
                            <h1 className="mb-2 bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-5xl text-transparent leading-none">
                                ALTIORA
                            </h1>
                            <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                        </div>

                        <div className="relative mx-auto mb-8 h-[450px] w-[450px]">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                const radius = 180;
                                const angleRad = (item.angle * Math.PI) / 180;
                                const x = Math.cos(angleRad) * radius;
                                const y = Math.sin(angleRad) * radius;

                                return (
                                    <Link
                                        className={cn(
                                            "group absolute z-10 transition-all duration-700 ease-out",
                                            isMenuOpen
                                                ? "translate-x-0 translate-y-0 opacity-100"
                                                : "translate-x-0 translate-y-0 opacity-0"
                                        )}
                                        href={item.href}
                                        key={item.href}
                                        onClick={toggleMenu}
                                        style={{
                                            left: `calc(50% + ${x}px)`,
                                            top: `calc(50% + ${y}px)`,
                                            transform: "translate(-50%, -50%)",
                                            transitionDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        {/* Menu Item Container */}
                                        <div className="relative">
                                            {/* Glow Effect */}
                                            <div className="absolute inset-0 scale-0 rounded-full bg-white/5 blur-xl transition-all duration-500 group-hover:scale-150" />

                                            {/* Main Button */}
                                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-white/60 group-hover:bg-white/10">
                                                <Icon className="h-6 w-6 text-white/70 transition-colors duration-300 group-hover:text-white" />
                                            </div>

                                            {/* Label - Positioned outward from circle */}
                                            <div
                                                className="absolute z-20 opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
                                                style={{
                                                    left: `${x > 0 ? "100%" : x < 0 ? "-100%" : "50%"}`,
                                                    top: `${y > 0 ? "100%" : y < 0 ? "-100%" : "50%"}`,
                                                    transform: `translate(${x > 0 ? "12px" : x < 0 ? "-12px" : "-50%"}, ${y > 0 ? "12px" : y < 0 ? "-12px" : "-50%"})`,
                                                    transformOrigin: "center",
                                                }}
                                            >
                                                <div className="rounded-lg border border-white/30 bg-black/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                                                    <span className="whitespace-nowrap font-medium text-white text-xs tracking-widest">
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Connection Line to Center */}
                                            <div
                                                className="absolute z-0 opacity-0 transition-all duration-500 group-hover:opacity-30"
                                                style={{
                                                    width: "2px",
                                                    height: `${radius * 0.3}px`,
                                                    background:
                                                        "linear-gradient(to center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
                                                    left: "50%",
                                                    top: "50%",
                                                    transformOrigin:
                                                        "top center",
                                                    transform: `translate(-50%, -50%) rotate(${item.angle + 180}deg)`,
                                                }}
                                            />
                                        </div>
                                    </Link>
                                );
                            })}

                            {/* Central Logo */}
                            <div
                                className={`-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-5 transform transition-all duration-1000 ${
                                    isMenuOpen
                                        ? "scale-100 opacity-100"
                                        : "scale-0 opacity-0"
                                }`}
                            >
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-md transition-all duration-300 group-hover:border-white/40">
                                    <Image
                                        alt="Altiora Logo"
                                        className="h-20 w-auto opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                                        height={14}
                                        priority
                                        src="/img/logo.png"
                                        width={50}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action */}
                        <div
                            className={`space-y-4 text-center transition-all delay-500 duration-1000 ${
                                isMenuOpen
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                            }`}
                        >
                            <Link
                                className="group inline-flex items-center rounded-full border border-white/20 bg-white/5 px-8 py-3 font-medium text-white/80 tracking-wide backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white"
                                href="/pricing"
                                onClick={toggleMenu}
                            >
                                GET STARTED
                                <div className="ml-2 h-1 w-1 rounded-full bg-white/60 transition-all duration-300 group-hover:h-0.5 group-hover:w-6" />
                            </Link>

                            {/* Auth Section - Conditional */}
                            {session?.user ? (
                                /* User Profile Section - Connecté */
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="flex items-center space-x-3 text-white/80">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-sm tracking-wide">
                                                {session.user.name?.split(
                                                    " "
                                                )[0] ||
                                                    session.user.email.split(
                                                        "@"
                                                    )[0]}
                                            </p>
                                            <p className="text-white/50 text-xs">
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center space-x-6">
                                        <Link
                                            className="group font-medium text-sm text-white/60 tracking-wide transition-all duration-300 hover:text-white"
                                            href="/profile"
                                            onClick={toggleMenu}
                                        >
                                            PROFILE
                                            <div className="mt-1 h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-full" />
                                        </Link>
                                        <div className="h-4 w-px bg-white/20" />
                                        <Link
                                            className="group font-medium text-sm text-white/60 tracking-wide transition-all duration-300 hover:text-white"
                                            href="/settings"
                                            onClick={toggleMenu}
                                        >
                                            SETTINGS
                                            <div className="mt-1 h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-full" />
                                        </Link>
                                        <div className="h-4 w-px bg-white/20" />
                                        <button
                                            className="group font-medium text-sm text-white/60 tracking-wide transition-all duration-300 hover:text-red-400"
                                            onClick={async () => {
                                                await signOut();
                                                toggleMenu();
                                                window.location.href = "/";
                                            }}
                                            type="button"
                                        >
                                            LOGOUT
                                            <div className="mt-1 h-px w-0 bg-red-400/60 transition-all duration-300 group-hover:w-full" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Auth Links - Non connecté */
                                <div className="flex items-center justify-center space-x-6">
                                    <Link
                                        className="group font-medium text-sm text-white/60 tracking-wide transition-all duration-300 hover:text-white"
                                        href={PAGES.SIGN_IN}
                                        onClick={toggleMenu}
                                    >
                                        LOGIN
                                        <div className="mt-1 h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-full" />
                                    </Link>
                                    <div className="h-4 w-px bg-white/20" />
                                    <Link
                                        className="group font-medium text-sm text-white/60 tracking-wide transition-all duration-300 hover:text-white"
                                        href={PAGES.SIGN_UP}
                                        onClick={toggleMenu}
                                    >
                                        REGISTER
                                        <div className="mt-1 h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-full" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ESC Hint - Positioned absolutely in corner */}
                    <button
                        className={`group absolute top-8 right-8 cursor-pointer transition-all delay-700 duration-1000 hover:opacity-100 ${
                            isMenuOpen
                                ? "translate-y-0 opacity-60"
                                : "translate-y-[-10px] opacity-0"
                        }`}
                        onClick={toggleMenu}
                        type="button"
                    >
                        <span className="text-white/40 text-xs tracking-widest transition-colors duration-200 group-hover:text-white/80">
                            ESC TO CLOSE
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};
