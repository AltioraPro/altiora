import { Button } from "@react-email/components";
import type { ReactNode } from "react";

interface EmailButtonProps {
    href: string;
    children: ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
    return (
        <Button
            className="mx-auto my-5 block w-auto rounded-sm border border-neutral-700 bg-neutral-800 px-6 py-3 text-center font-medium text-base text-white no-underline"
            href={href}
        >
            {children}
        </Button>
    );
}
