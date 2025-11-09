import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import type * as React from "react";
import { cn } from "@/lib/utils";

const staggeredFadeLoaderVariants = cva(
    "flex items-center justify-center transition duration-200 ease-out",
    {
        variants: {
            spacing: {
                default: "gap-1",
                tight: "gap-0.5",
                loose: "gap-2",
            },
        },
        defaultVariants: {
            spacing: "default",
        },
    }
);

const dotVariants = cva(
    "shrink-0 rounded-full transition duration-200 ease-out",
    {
        variants: {
            variant: {
                light: "bg-neutral-600",
                dark: "bg-neutral-950 dark:bg-neutral-50",
                muted: "bg-neutral-500",
            },
            size: {
                small: "size-0.5",
                default: "size-1",
                large: "size-1.5",
            },
        },
        defaultVariants: {
            variant: "dark",
            size: "default",
        },
    }
);

const circleVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

interface StaggeredFadeLoaderProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof staggeredFadeLoaderVariants>,
        VariantProps<typeof dotVariants> {
    asChild?: boolean;
}

export function StaggeredFadeLoader({
    className,
    variant,
    spacing,
    size,
    asChild,
    ...props
}: StaggeredFadeLoaderProps) {
    const Component = asChild ? Slot : "div";

    return (
        <Component
            className={cn(staggeredFadeLoaderVariants({ spacing }), className)}
            {...props}
        >
            {[...new Array(3)].map((_, index) => (
                <motion.div
                    animate="visible"
                    className={dotVariants({ variant, size })}
                    initial="hidden"
                    key={`dot-${index}`}
                    transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                    }}
                    variants={circleVariants}
                />
            ))}
        </Component>
    );
}
