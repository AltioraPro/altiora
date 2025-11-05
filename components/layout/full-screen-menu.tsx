"use client";

import type { User } from "better-auth";
import { Home, Target, TrendingUp, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PAGES } from "@/constants/pages";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { FullScreenMenuItem, RADIUS } from "./full-screen-menu-item";
import { ToggleMenu } from "./toggle-menu";

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
];

interface FullScreenMenuProps {
    user?: User;
}

export function FullScreenMenu({ user }: FullScreenMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(!isMenuOpen);
    }, [isMenuOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isMenuOpen) {
                toggleMenu();
            }
        };

        if (isMenuOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMenuOpen, toggleMenu]);

    return (
        <>
            <ToggleMenu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
            <div
                className={cn(
                    "fixed top-0 right-0 bottom-0 left-0 z-50 h-screen w-screen transition-all duration-700 ease-out",
                    isMenuOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                )}
            >
                {/* Dynamic Background with Mouse Follow Effect */}
                <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />

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
                            <h1 className="mb-2 bg-linear-to-b from-white to-gray-400 bg-clip-text font-bold text-5xl text-transparent leading-none">
                                ALTIORA
                            </h1>
                            <div className="mx-auto h-px w-20 bg-linear-to-r from-transparent via-white to-transparent opacity-50" />
                        </div>

                        <div className="relative mx-auto mb-8 h-[450px] w-[450px]">
                            {menuItems.map((item, index) => {
                                const angleRad = (item.angle * Math.PI) / 180;
                                const x = Math.cos(angleRad) * RADIUS;
                                const y = Math.sin(angleRad) * RADIUS;

                                return (
                                    <FullScreenMenuItem
                                        index={index}
                                        isMenuOpen={isMenuOpen}
                                        item={item}
                                        key={index}
                                        toggleMenu={toggleMenu}
                                        x={x}
                                        y={y}
                                    />
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
                            className={cn(
                                "space-y-4 text-center transition-all delay-500 duration-1000",
                                isMenuOpen
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                            )}
                        >
                            {user && (
                                <div className="flex flex-col items-center space-y-4">
                                    {user.image && (
                                        <Image
                                            alt="User Avatar"
                                            className="size-10 rounded-full border border-white/20 object-cover"
                                            height={40}
                                            src={user.image}
                                            width={40}
                                        />
                                    )}
                                    <div className="text-white/80">
                                        <p className="font-medium text-sm">
                                            {user.name?.split(" ")[0] ||
                                                user.email.split("@")[0]}
                                        </p>
                                        <p className="text-white/50 text-xs">
                                            {user.email}
                                        </p>
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
}
