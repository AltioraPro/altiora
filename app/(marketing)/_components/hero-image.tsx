"use client";

import { cn } from "@/lib/utils";
import {
  RiCheckboxLine,
  RiPieChartLine,
  RiStockLine,
  RiTargetLine,
} from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
    <div className="relative mt-12 aspect-4/3 w-full bg-neutral-800 sm:mt-16 sm:aspect-video">
      <div className="-top-5 -translate-x-1/2 absolute left-1/2 z-30 flex items-center justify-center gap-1.5 border border-neutral-800 bg-background px-2 py-1.5 sm:-top-6 sm:gap-3 sm:px-3 sm:py-2">
        {MENU_ITEMS.map((item, index) => (
          <button
            className={cn(
              "flex cursor-pointer items-center gap-1.5 px-2 py-1.5 text-xs ring-1 ring-neutral-800 sm:gap-2.5 sm:px-3 sm:py-2",
              "hover:bg-neutral-800  whitespace-nowrap",
              activeItemIndex === index && "bg-neutral-800",
            )}
            key={item.slug}
            onClick={() => handleItemClick(index)}
            type="button"
          >
            <item.icon className="size-4" />
            <span className="hidden sm:inline">{item.label}</span>
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
                className="w-full border border-neutral-800 sm:w-4/5"
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
