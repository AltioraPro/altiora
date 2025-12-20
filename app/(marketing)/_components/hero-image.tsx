"use client";

import {
    RiCheckboxLine,
    RiPieChartLine,
    RiStockLine,
    RiTargetLine,
} from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Dither from "./dither";

const MENU_ITEMS = [
    {
        icon: RiStockLine,
        slug: "trading-journal",
        label: "Trading Journal",
        image: "/img/hero-journal3.png",
    },
    {
        icon: RiTargetLine,
        slug: "goals",
        label: "Goals",
        image: "/img/hero-journal-goals.png",
    },
    {
        icon: RiCheckboxLine,
        slug: "habits",
        label: "Habits",
        image: "/img/hero-journal-habits.png",
    },
    {
        icon: RiPieChartLine,
        slug: "backtesting",
        label: "Backtesting",
        image: "/img/hero-journal-goals.png",
    },
] as const;

const INTERVAL_DURATION = 5000;

export function HeroImage() {
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleItemClick = (index: number) => {
        setActiveItemIndex(index);

        // Reset l'interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setActiveItemIndex((prev) => (prev + 1) % MENU_ITEMS.length);
        }, INTERVAL_DURATION);
    };

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setActiveItemIndex((prev) => (prev + 1) % MENU_ITEMS.length);
        }, INTERVAL_DURATION);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <div className="relative mt-16 aspect-video w-full bg-neutral-800">
            <div className="-top-6 -translate-x-1/2 absolute left-1/2 z-30 flex items-center justify-center gap-3 border border-neutral-800 bg-background px-3 py-2">
                {MENU_ITEMS.map((item, index) => (
                    <button
                        className={cn(
                            "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs ring-1 ring-neutral-800",
                            "hover:bg-neutral-800",
                            activeItemIndex === index && "bg-neutral-800"
                        )}
                        key={item.slug}
                        onClick={() => handleItemClick(index)}
                        type="button"
                    >
                        <item.icon className="size-4" />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="relative z-20 flex size-full items-center justify-center overflow-clip border-neutral-800 border-t border-b">
                <AnimatePresence mode="popLayout">
                    {MENU_ITEMS.map((item, index) => {
                        if (index !== activeItemIndex) {
                            return null;
                        }

                        return (
                            <motion.div
                                animate={{
                                    scale: 1,
                                    backdropFilter: "blur(0px)",
                                }}
                                className="w-4/5 border border-neutral-800"
                                exit={{
                                    scale: 0.93,
                                    backdropFilter: "blur(20px)",
                                }}
                                initial={{
                                    scale: 0.93,
                                    backdropFilter: "blur(20px)",
                                }}
                                key={item.slug}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeInOut",
                                    type: "spring",
                                }}
                            >
                                <Image
                                    alt={item.label}
                                    className="w-full"
                                    height={1000}
                                    src={item.image}
                                    width={1000}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="absolute inset-0 z-0 size-full opacity-50">
                <Dither
                    colorNum={4}
                    disableAnimation={false}
                    enableMouseInteraction={false}
                    waveAmplitude={0}
                    waveColor={[0.4, 0.4, 0.4]}
                    waveFrequency={3}
                    waveSpeed={0.005}
                />
            </div>
        </div>
    );
}
