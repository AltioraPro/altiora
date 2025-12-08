import type { Metadata } from "next";
import { Providers } from "@/app/providers";

import "@/orpc/server"; // for pre-rendering
import "./globals.css";
import { Hedvig_Letters_Sans, Hedvig_Letters_Serif } from "next/font/google";
import { PROJECT } from "@/constants/project";

const hedvigSans = Hedvig_Letters_Sans({
    weight: "400",
    subsets: ["latin"],
    display: "swap",
    variable: "--font-hedvig-sans",
});

const hedvigSerif = Hedvig_Letters_Serif({
    weight: "400",
    subsets: ["latin"],
    display: "swap",
    variable: "--font-hedvig-serif",
});

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
        <html
            className={`dark overscroll-none font-sans ${hedvigSans.variable} ${hedvigSerif.variable}`}
            lang="fr"
            style={{ colorScheme: "dark" }}
            suppressHydrationWarning
        >
            <body className="bg-background">
                <Providers>
                    <div>{children}</div>
                </Providers>
            </body>
        </html>
    );
}
