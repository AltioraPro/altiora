import { RiMailLine, RiMapPinLine } from "@remixicon/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { Logo } from "../../../components/logo";

export const Footer = () => {
    const navigationLinks = [
        { href: PAGES.LANDING_PAGE, label: "Home" },
        { href: PAGES.TRADING_JOURNALS, label: "Trading" },
        { href: PAGES.HABITS, label: "Habits" },
        { href: PAGES.GOALS, label: "Goals" },
        { href: PAGES.PRICING, label: "Pricing" },
        { href: PAGES.CONTACT_US, label: "Contact" },
    ];

    const legalLinks = [
        {
            href: PAGES.PRIVACY_POLICY,
            label: "Privacy Policy",
        },
        {
            href: PAGES.TERMS_OF_SERVICE,
            label: "Terms of Service",
        },
    ];

    return (
        <footer className="relative w-full overflow-hidden border-neutral-800 border-t bg-neutral-900">
            <div className="mx-auto w-full max-w-7xl">
                <div className="flex items-center justify-between border-neutral-800 border-b py-12">
                    <div className="mb-6 flex items-center space-x-3">
                        <Logo className="h-10 w-fit" />
                    </div>

                    <p className="text-2xl text-neutral-50">
                        All-in-one platform for traders.
                    </p>
                </div>

                <div className="flex w-full justify-between py-12">
                    <div className="flex flex-col justify-between space-y-8 leading-8 md:w-1/2 md:flex-row md:space-y-0">
                        <div>
                            <h4 className="mb-2 font-medium text-neutral-50">
                                Navigation
                            </h4>
                            <ul>
                                {navigationLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            className="text-neutral-400 hover:text-neutral-50"
                                            href={link.href}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal & Support */}
                        <div>
                            <h4 className="mb-2 font-medium text-neutral-50">
                                Legal & Support
                            </h4>
                            <ul>
                                {legalLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            className="font-normal text-neutral-400 hover:text-neutral-50"
                                            href={link.href}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact & Social */}
                        <div>
                            <h4 className="mb-2 font-medium text-neutral-50">
                                Contact & Social
                            </h4>

                            {/* Contact Info */}
                            <div className="text-neutral-400">
                                <div className="flex items-center space-x-3">
                                    <RiMailLine className="size-4" />
                                    <span>contact@altiora.app</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RiMapPinLine className="size-4" />
                                    <span>Paris, France</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-1/2 flex-col items-end">
                        <form>
                            <fieldset className="relative">
                                <input
                                    aria-label="Email address"
                                    autoComplete="email"
                                    className="h-11 w-[360px] border border-neutral-800 bg-transparent px-3 py-1 text-primary text-sm placeholder-primary-complex-600 outline-none"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    required
                                    type="email"
                                />
                                <Button
                                    className="absolute top-2 right-2 z-10 h-7 bg-primary px-4 font-medium text-primary-foreground text-sm"
                                    type="submit"
                                    variant="primary"
                                >
                                    Subscribe
                                </Button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </footer>
    );
};
