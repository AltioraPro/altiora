"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { signOut } from "@/server/actions/sign-out";

export const LogoutButton = ({
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={cn(className)} onClick={() => signOut()} {...props}>
        {children}
    </button>
);
