"use client";

import { RiArrowRightLine } from "@remixicon/react";
import { type MotionProps, motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CardLargeProps extends React.HTMLAttributes<HTMLDivElement> {
    contentPosition?: "left" | "right";
}

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
        <div className="flex w-full max-w-[470px] flex-col gap-2 text-left text-xl md:text-2xl">
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
                    "flex size-full min-h-[400px] flex-col items-center justify-center gap-3 bg-background p-4 md:min-h-[600px] md:p-8",
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
                "flex size-full min-h-[400px] flex-col items-center justify-center gap-3 bg-background p-4 md:min-h-[600px] md:p-8",
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
    contentPosition = "right",
    ...props
}: CardLargeProps) {
    return (
        <div
            className={cn(
                "mt-20 flex w-full items-start justify-between gap-6 bg-neutral-900 p-4 md:mt-40 md:flex-row md:items-center md:gap-12 md:p-4.5",
                contentPosition === "right" ? "flex-col-reverse" : "flex-col",
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
