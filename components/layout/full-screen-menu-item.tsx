import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const RADIUS = 180;

interface FullScreenMenuItemProps {
    item: {
        href: Route;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        angle: number;
    };
    toggleMenu: () => void;
    isMenuOpen: boolean;
    x: number;
    y: number;
    index: number;
}

export function FullScreenMenuItem({
    item,
    toggleMenu,
    isMenuOpen,
    x,
    y,
    index,
}: FullScreenMenuItemProps) {
    const Icon = item.icon;

    const getLeftPosition = () => {
        if (x > 0) {
            return "100%";
        }
        if (x < 0) {
            return "-100%";
        }
        return "50%";
    };

    const getTopPosition = () => {
        if (y > 0) {
            return "100%";
        }
        if (y < 0) {
            return "-100%";
        }
        return "50%";
    };

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
                        left: getLeftPosition(),
                        top: getTopPosition(),
                        transformOrigin: "center",
                    }}
                >
                    <div className="rounded-lg border border-white/30 bg-black/90 px-3 py-1.5 shadow-lg backdrop-blur-xs">
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
                        height: `${RADIUS * 0.3}px`,
                        background:
                            "linear-gradient(to center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
                        left: "50%",
                        top: "50%",
                        transformOrigin: "top center",
                        transform: `translate(-50%, -50%) rotate(${item.angle + 180}deg)`,
                    }}
                />
            </div>
        </Link>
    );
}
