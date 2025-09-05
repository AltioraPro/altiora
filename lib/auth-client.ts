"use client";

import { createAuthClient } from "better-auth/react";

function resolveBaseUrl(): string {
  // Côté client: utiliser l'origine actuelle
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // Côté serveur: prioriser NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback Vercel avec protocole HTTPS
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Développement local
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveBaseUrl(),
});

export const {
  signIn,
  signUp,
  signOut,
  useSession, 
  getSession,
} = authClient; 

