"use client";

import { useEffect, useState } from "react";

export function useActiveSection(sectionIds: string[]) {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    setActiveSection(`#${entry.target.id}`);
                }
            }
        };

        const observerOptions: IntersectionObserverInit = {
            root: null,
            rootMargin: "-20% 0px -60% 0px",
            threshold: 0,
        };

        for (const sectionId of sectionIds) {
            const id = sectionId.replace("#", "");
            const element = document.getElementById(id);

            if (element) {
                const observer = new IntersectionObserver(
                    observerCallback,
                    observerOptions
                );
                observer.observe(element);
                observers.push(observer);
            }
        }

        return () => {
            for (const observer of observers) {
                observer.disconnect();
            }
        };
    }, [sectionIds]);

    return activeSection;
}
