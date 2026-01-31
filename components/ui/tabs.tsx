"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva("inline-flex items-center text-muted-foreground", {
    variants: {
        variant: {
            default: "h-9 justify-center rounded-lg bg-muted p-1",
            line: "h-10 w-full justify-start gap-2 rounded-none border-b bg-transparent p-0",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

const tabsTriggerVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "rounded-md px-3 py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                line: "rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface TabsListProps
    extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
        VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    TabsListProps
>(({ className, variant, ...props }, ref) => (
    <TabsPrimitive.List
        className={cn(tabsListVariants({ variant, className }))}
        ref={ref}
        {...props}
    />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps
    extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
        VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
    <TabsPrimitive.Trigger
        className={cn(tabsTriggerVariants({ variant, className }))}
        ref={ref}
        {...props}
    />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        ref={ref}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
