import { Suspense } from "react";
import { Footer } from "@/app/(marketing)/_components/footer";

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
