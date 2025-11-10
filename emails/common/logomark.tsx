import type React from "react";

import { PROJECT } from "@/constants/project";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

interface LogomarkProps {
    className?: string;
    logoClassName?: string;
    textClassName?: string;
    logoUrl?: string;
}

function Logomark({
    className,
    logoClassName,
    textClassName,
    logoUrl,
    ...props
}: LogomarkProps & Omit<React.ComponentProps<"div">, "className">) {
    return (
        <div
            className={cn("mt-4 flex items-center gap-4", className)}
            {...props}
        >
            <Logo
                className={cn("h-16 text-white", logoClassName)}
                src={logoUrl}
            />
            <span
                className={cn(
                    "m-0 font-medium text-lg text-white tracking-tight",
                    textClassName
                )}
            >
                {PROJECT.NAME}
            </span>
        </div>
    );
}

export { Logomark };
