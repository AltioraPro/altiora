import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SettingsContentLayoutProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    children: React.ReactNode;
}

export function SettingsContentLayout({
    title,
    children,
    className,
    ...props
}: SettingsContentLayoutProps) {
    return (
        <div className={cn("space-y-8", className)} {...props}>
            <p className="mb-6 font-medium text-xl">{title}</p>
            {children}
        </div>
    );
}
