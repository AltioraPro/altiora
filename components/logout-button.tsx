"use client";

import { useRouter } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const LogoutButton = ({
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const router = useRouter();

    return (
        <button
            className={cn(className)}
            onClick={async () => {
                await signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            router.push(PAGES.LANDING_PAGE);
                        },
                    },
                });
            }}
            {...props}
        >
            {children}
        </button>
    );
};
