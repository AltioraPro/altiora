"use client";

import { RiArrowRightLine } from "@remixicon/react";
import { type MotionProps, motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CardLargeProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardLargeTextProps {
    title: string;
    description: string;
    linkText?: string;
    linkHref?: Route;
}

interface CardLargeContentProps extends React.HTMLAttributes<HTMLDivElement> {
    motionProps?: MotionProps;
}

function CardLargeText({
    title,
    description,
    linkText,
    linkHref,
}: CardLargeTextProps) {
    return (
        <div className="flex max-w-[470px] flex-col gap-2 text-2xl">
            <h2 className="font-medium">{title}</h2>
            <p className="text-neutral-400">{description}</p>
            {linkText && linkHref && (
                <Link
                    className="mt-2 inline-flex items-center gap-1.5 text-base hover:text-neutral-300"
                    href={linkHref}
                >
                    {linkText}
                    <RiArrowRightLine className="size-4" />
                </Link>
            )}
        </div>
    );
}

CardLargeText.displayName = "CardLargeText";

function CardLargeContent({
    className,
    children,
    motionProps,
    ...props
}: CardLargeContentProps) {
    if (motionProps) {
        return (
            <motion.div
                {...motionProps}
                className={cn(
                    "flex size-full min-h-[600px] flex-col items-center justify-center gap-3 bg-background p-8",
                    className
                )}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div
            className={cn(
                "flex size-full min-h-[600px] flex-col items-center justify-center gap-3 bg-background p-8",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

CardLargeContent.displayName = "CardLargeContent";

export function CardLargeRoot({
    children,
    className,
    ...props
}: CardLargeProps) {
    return (
        <div
            className={cn(
                "mt-40 flex w-full items-center justify-between gap-12 bg-neutral-900 p-4.5",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

CardLargeRoot.displayName = "CardLargeRoot";

export {
    CardLargeRoot as Root,
    CardLargeText as Text,
    CardLargeContent as Content,
};
