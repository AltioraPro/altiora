"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/client";
import { DiscordWelcomePopup } from "./DiscordWelcomePopup";

interface DiscordWelcomeCheckerProps {
  forceShow?: boolean;  
}

export function DiscordWelcomeChecker({ forceShow = false }: DiscordWelcomeCheckerProps) {
  const [showDiscordPopup, setShowDiscordPopup] = useState(false);

  const { data: connectionStatus } = api.discord.getConnectionStatus.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (connectionStatus && !connectionStatus.connected) {
      if (forceShow) {
        setShowDiscordPopup(true);
      } else {
        const hasSeenDiscordPopup = localStorage.getItem('discord-welcome-seen');
        if (!hasSeenDiscordPopup) {
          setShowDiscordPopup(true);
        }
      }
    } else {
      setShowDiscordPopup(false);
    }
  }, [connectionStatus, forceShow]);

  const handleDiscordConnect = () => {
    window.location.href = '/api/auth/discord';
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
