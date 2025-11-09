"use client";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

interface BorderGradientProps extends React.HTMLAttributes<HTMLDivElement> {
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
}

export function BorderGradient({
    children,
    containerClassName,
    className,
    duration = 1,
    clockwise = true,
    ...props
}: React.PropsWithChildren<BorderGradientProps>) {
    const [direction, setDirection] = useState<Direction>("TOP");

    const movingMap: Record<Direction, string> = {
        TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
        LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
        BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
        RIGHT: "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setDirection((prevState) => {
                const directions: Direction[] = [
                    "TOP",
                    "LEFT",
                    "BOTTOM",
                    "RIGHT",
                ];
                const currentIndex = directions.indexOf(prevState);
                const nextIndex = clockwise
                    ? (currentIndex - 1 + directions.length) % directions.length
                    : (currentIndex + 1) % directions.length;
                return directions[nextIndex];
            });
        }, duration * 1000);
        return () => clearInterval(interval);
    }, [duration, clockwise]);

    return (
        <div
            {...props}
            className={cn(
                "relative flex h-min w-fit overflow-visible rounded-full border bg-white/20 box-decoration-clone p-px transition-all duration-500",
                containerClassName
            )}
        >
            <div
                className={cn(
                    "z-10 w-auto rounded-[inherit] bg-black px-4 py-2 text-white transition-all duration-300",
                    className
                )}
            >
                {children}
            </div>
            <motion.div
                animate={{
                    background: movingMap[direction],
                }}
                className={cn(
                    "absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit]"
                )}
                initial={{ background: movingMap[direction] }}
                style={{
                    filter: "blur(2px)",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                }}
                transition={{ ease: "linear", duration: duration ?? 1 }}
            />
            <div className="absolute inset-[2px] z-1 flex-none rounded-[inherit] bg-black transition-colors duration-300" />
        </div>
    );
}
