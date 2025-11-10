import { Section } from "@react-email/components";
import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
}

export function Card({ children }: CardProps) {
    return (
        <Section className="my-4 w-full rounded-md border border-neutral-800 bg-neutral-900 p-10">
            {children}
        </Section>
    );
}
