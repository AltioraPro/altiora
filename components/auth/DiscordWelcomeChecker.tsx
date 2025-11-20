"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";
import { DiscordWelcomePopup } from "./DiscordWelcomePopup";

interface DiscordWelcomeCheckerProps {
    forceShow?: boolean;
}

export function DiscordWelcomeChecker({
    forceShow = false,
}: DiscordWelcomeCheckerProps) {
    const [showDiscordPopup, setShowDiscordPopup] = useState(false);

    const { data: connectionStatus } = useQuery(
        orpc.discord.getConnectionStatus.queryOptions()
    );

    useEffect(() => {
        if (connectionStatus && !connectionStatus.connected) {
            if (forceShow) {
                setShowDiscordPopup(true);
            } else {
                const hasSeenDiscordPopup = localStorage.getItem(
                    "discord-welcome-seen"
                );
                if (!hasSeenDiscordPopup) {
                    setShowDiscordPopup(true);
                }
            }
        } else {
            setShowDiscordPopup(false);
        }
    }, [connectionStatus, forceShow]);

    const handleDiscordConnect = async () => {
        if (typeof window === "undefined") {
            return;
        }

        try {
            const origin = window.location.origin;
            await authClient.linkSocial({
                provider: "discord",
                callbackURL: `${origin}/settings?discord=linked`,
                errorCallbackURL: `${origin}/settings?discord=error`,
            });
        } catch {
            // Ignore errors; user can retry from settings.
        }
    };

    return (
        <DiscordWelcomePopup
            isOpen={showDiscordPopup}
            onClose={() => setShowDiscordPopup(false)}
            onConnect={handleDiscordConnect}
            skipLocalStorage={forceShow}
        />
    );
}
