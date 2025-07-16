import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { createCaller, type AppRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { createQueryClient } from "./query-client";

/**
 * Créer le contexte tRPC pour les Server Components
 * Utilise cache() pour éviter les appels multiples dans le même rendu
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

/**
 * Créer l'API caller pour les Server Components
 */
const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

/**
 * Helpers pour l'hydratation dans les Server Components
 */
export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);

/**
 * API directe pour les Server Components (quand pas utilisé côté client)
 */
export const api = caller; 