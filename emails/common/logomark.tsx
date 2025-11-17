import type React from "react";
import { Logo } from "@/components/logo";
import { PROJECT } from "@/constants/project";
import { cn } from "@/lib/utils";

interface LogomarkProps {
    className?: string;
    logoClassName?: string;
    textClassName?: string;
}

function Logomark({
    className,
    logoClassName,
    textClassName,
    ...props
}: LogomarkProps & Omit<React.ComponentProps<"div">, "className">) {
    return (
        <div
            className={cn("mt-4 flex items-center gap-4", className)}
            {...props}
        >
            <Logo className={cn("h-8 w-fit", logoClassName)} />
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
