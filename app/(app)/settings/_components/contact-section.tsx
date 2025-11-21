import {
    RiArrowRightUpLine,
    RiDiscordLine,
    RiMailLine,
    RiTwitterXLine,
} from "@remixicon/react";
import type { Route } from "next";
import Link from "next/link";
import { PROJECT } from "@/constants/project";
import { SettingsContentLayout } from "./settings-content-layout";

const contactItems = [
    {
        label: "Send us a message",
        description:
            "Having issues with your account, subscription or billing ? Send us a email we'll get back to you as soon as possible. Include as much details as possible about your issue.",
        icon: RiMailLine,
        href: `mailto:${PROJECT.EMAIL}`,
    },
    {
        label: "X (previously Twitter)",
        description: "Follow us on X to get the latest news and updates",
        icon: RiTwitterXLine,
        href: PROJECT.X_URL,
    },
    {
        label: "Discord",
        description:
            "Join our community ! Chat with other users and get help with your issues",
        icon: RiDiscordLine,
        href: PROJECT.DISCORD_INVITE,
    },
];

const isRoute = (href: string | Route): href is Route =>
    typeof href === "string";

export function ContactSection() {
    return (
        <SettingsContentLayout title="Contact">
            <div className="space-y-4">
                <div className="space-y-2">
                    {contactItems.map((item) => {
                        if (isRoute(item.href)) {
                            return (
                                <Link
                                    className="flex space-x-3 border border-white/10 bg-white/5 p-4 text-sm hover:bg-white/10"
                                    href={item.href}
                                    key={item.href}
                                >
                                    <item.icon className="mt-0.5 size-5 text-neutral-400" />
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium text-neutral-50">
                                            {item.label}
                                        </p>
                                        <p className="text-neutral-400">
                                            {item.description}
                                        </p>
                                    </div>
                                    <RiArrowRightUpLine className="size-5 text-neutral-400" />
                                </Link>
                            );
                        }

                        return (
                            <a
                                className="flex space-x-3 border border-white/10 bg-white/5 p-4 text-sm hover:bg-white/10"
                                href={item.href}
                                key={item.href}
                            >
                                <item.icon className="mt-0.5 size-5 text-neutral-400" />
                                <div className="flex-1 space-y-1">
                                    <p className="font-medium text-neutral-50">
                                        {item.label}
                                    </p>
                                    <p className="text-neutral-400">
                                        {item.description}
                                    </p>
                                </div>
                                <RiArrowRightUpLine className="size-5 text-neutral-400" />
                            </a>
                        );
                    })}
                </div>
            </div>
        </SettingsContentLayout>
    );
}
