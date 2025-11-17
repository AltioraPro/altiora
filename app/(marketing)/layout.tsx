import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense>
            {children}
            <Footer />
        </Suspense>
    );
}
