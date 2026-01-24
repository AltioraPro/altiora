import type { Route } from "next";
import { PAGES } from "./pages";

type InternalCta = {
    label: string;
    href: Route;
    external?: false;
};

type ExternalCta = {
    label: string;
    href: string;
    external: true;
};

export type PricingPlan = {
    id: "performance" | "mentoring";
    name: string;
    tagline: string;
    description: string;
    price: {
        amount: string;
        period?: string;
    };
    features: string[];
    cta: InternalCta | ExternalCta;
    badge?: string;
    footnote: string;
};

export const PRICING_PLANS: PricingPlan[] = [
    {
        id: "performance",
        name: "Altiora Performance",
        tagline: "Drive your performance.",
        description:
            "Centralize your trades, habits, and goals. No more chaos, just clarity.",
        price: {
            amount: "€14.90",
            period: "/ month",
        },
        features: [
            "Unlimited Trading Journal",
            "Habits Tracker",
            "Goals Tracker",
            "Deep Work Statistics",
            "Global Dashboard",
            "Auto Broker Connection",
            "Leaderboard Access",
            "Advanced Analytics",
        ],
        cta: {
            label: "Start Free Trial",
            href: PAGES.SIGN_UP,
        },
        badge: "Most Popular",
        footnote: "Best to get started",
    },
    {
        id: "mentoring",
        name: "1:1 Mentoring",
        tagline: "No more stagnation and excuses.",
        description:
            "We optimize your entire routine. Trading, Business, Sport: nothing left to chance.",
        price: {
            amount: "By Application",
        },
        features: [
            "Altiora Access Included",
            "Full Audit of Your Situation",
            "Custom System Creation",
            "Weekly Follow-up (Business / Sport / Life)",
            "Private Contact Access",
        ],
        cta: {
            label: "Apply for Mentoring",
            href: "https://cal.com",
            external: true,
        },
        footnote: "Best value for individuals.",
    },
];

export function getPlanById(id: PricingPlan["id"]): PricingPlan | undefined {
    return PRICING_PLANS.find((plan) => plan.id === id);
}
