"use client";

import { useEffect, useRef, useState } from "react";

interface FloatingElement {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
}

export const FloatingElements = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
        []
    );

    useEffect(() => {
        const elements = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 40 + 20,
            duration: Math.random() * 20 + 10,
        }));
        setFloatingElements(elements);
    }, []);

    useEffect(() => {
        const handleMouseMove = () => {
            // Mouse position tracking can be added here if needed in the future
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("mousemove", handleMouseMove);
            return () =>
                container.removeEventListener("mousemove", handleMouseMove);
        }
    }, []);

    const getBorderRadius = (id: number) => {
        if (id % 3 === 0) {
            return "50%";
        }
        if (id % 2 === 0) {
            return "0";
        }
        return "30%";
    };

    return (
        <div className="pointer-events-none absolute inset-0">
            {floatingElements.map((element) => (
                <div
                    className="absolute border border-white/20 opacity-5"
                    key={element.id}
                    style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        width: `${element.size}px`,
                        height: `${element.size}px`,
                        borderRadius: getBorderRadius(element.id),
                        animation: `float-${element.id} ${element.duration}s ease-in-out infinite`,
                        transform: `rotate(${element.id * 45}deg)`,
                    }}
                />
            ))}
        </div>
    );
};
