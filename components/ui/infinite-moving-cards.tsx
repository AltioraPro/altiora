"use client";

import { RiUserLine } from "@remixicon/react";
import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const InfiniteMovingCards = ({
    items,
    direction = "left",
    speed = "fast",
    pauseOnHover = true,
    className,
}: {
    items: {
        quote: string;
        name: string;
        title: string;
    }[];
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    pauseOnHover?: boolean;
    className?: string;
}) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollerRef = React.useRef<HTMLUListElement>(null);
    const [start, setStart] = useState(false);

    const getDirection = useCallback(() => {
        if (containerRef.current) {
            if (direction === "left") {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "forwards"
                );
            } else {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "reverse"
                );
            }
        }
    }, [direction]);

    const getSpeed = useCallback(() => {
        if (containerRef.current) {
            if (speed === "fast") {
                containerRef.current.style.setProperty(
                    "--animation-duration",
                    "20s"
                );
            } else if (speed === "normal") {
                containerRef.current.style.setProperty(
                    "--animation-duration",
                    "40s"
                );
            } else {
                containerRef.current.style.setProperty(
                    "--animation-duration",
                    "80s"
                );
            }
        }
    }, [speed]);

    const addAnimation = useCallback(() => {
        if (containerRef.current && scrollerRef.current) {
            const scrollerContent = Array.from(scrollerRef.current.children);

            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                if (scrollerRef.current) {
                    scrollerRef.current.appendChild(duplicatedItem);
                }
            });

            getDirection();
            getSpeed();
            setStart(true);
        }
    }, [getDirection, getSpeed]);

    useEffect(() => {
        addAnimation();
    }, [addAnimation]);
    return (
        <div
            className={cn(
                "scroller mask-[linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] relative z-20 w-full overflow-hidden",
                className
            )}
            ref={containerRef}
        >
            <ul
                className={cn(
                    "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
                    start && "animate-scroll",
                    pauseOnHover && "hover:paused"
                )}
                ref={scrollerRef}
            >
                {items.map((item) => (
                    <li
                        className="relative w-[350px] max-w-full shrink-0 border border-b-0 px-8 py-6 md:w-[450px]"
                        key={item.name}
                    >
                        <blockquote>
                            <div
                                aria-hidden="true"
                                className="user-select-none -top-0.5 -left-0.5 -z-1 pointer-events-none absolute h-[calc(100%+4px)] w-[calc(100%+4px)]"
                            />
                            <span className="relative z-20 font-normal text-sm text-white leading-[1.6]">
                                {item.quote}
                            </span>
                            <div className="relative z-20 mt-6 flex flex-row items-center">
                                <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800">
                                    <RiUserLine className="h-4 w-4 text-gray-400" />
                                </div>
                                <span className="flex flex-col gap-1">
                                    <span className="font-normal text-gray-300 text-sm leading-[1.6]">
                                        {item.name}
                                    </span>
                                    <span className="font-normal text-gray-400 text-sm leading-[1.6]">
                                        {item.title}
                                    </span>
                                </span>
                            </div>
                        </blockquote>
                    </li>
                ))}
            </ul>
        </div>
    );
};
