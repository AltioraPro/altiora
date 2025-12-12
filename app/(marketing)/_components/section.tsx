import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
}

export function Section({ children, className, id }: SectionProps) {
    return (
        <section
            className={cn("mt-40 flex w-full flex-col gap-10", className)}
            id={id}
        >
            {children}
        </section>
    );
}
