import type { Metadata } from "next";
import { Providers } from "@/app/providers";

import "@/orpc/server"; // for pre-rendering
import "./globals.css";
import { PROJECT } from "@/constants/project";

export const metadata: Metadata = {
    title: PROJECT.NAME,
    description: PROJECT.DESCRIPTION,
    icons: {
        icon: { url: "/img/logo.png", sizes: "48x48", type: "image/png" },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html className="dark" lang="fr" style={{ colorScheme: "dark" }}>
            <body>
                <Providers>
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
}
