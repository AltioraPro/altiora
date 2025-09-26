"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/client";
import { DiscordWelcomePopup } from "./DiscordWelcomePopup";

interface DiscordWelcomeCheckerProps {
  forceShow?: boolean; // Pour forcer l'affichage sur le profil
}

export function DiscordWelcomeChecker({ forceShow = false }: DiscordWelcomeCheckerProps) {
  const [showDiscordPopup, setShowDiscordPopup] = useState(false);

  const { data: connectionStatus } = api.discord.getConnectionStatus.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    // Afficher la popup UNIQUEMENT si Discord n'est pas connecté
    if (connectionStatus && !connectionStatus.connected) {
      if (forceShow) {
        // Sur le profil, afficher à chaque fois
        setShowDiscordPopup(true);
      } else {
        // Sur le dashboard, utiliser la logique avec localStorage
        const hasSeenDiscordPopup = localStorage.getItem('discord-welcome-seen');
        if (!hasSeenDiscordPopup) {
          setShowDiscordPopup(true);
        }
      }
    } else {
      // Si Discord est connecté, ne pas afficher la popup
      setShowDiscordPopup(false);
    }
  }, [connectionStatus, forceShow]);

  const handleDiscordConnect = () => {
    // Rediriger vers la page de connexion Discord
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
