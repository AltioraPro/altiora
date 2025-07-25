import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth/router";
import { habitsRouter } from "@/server/api/routers/habits/router";
import { profileRouter } from "@/server/api/routers/profile/router";
import { discordRouter } from "@/server/api/routers/discord/router";

/**
 * Router principal de l'API tRPC
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  habits: habitsRouter,
  profile: profileRouter,
  discord: discordRouter,
});

// Export des types
export type AppRouter = typeof appRouter;

/**
 * Créer un caller côté serveur pour l'API tRPC
 */
export const createCaller = createCallerFactory(appRouter); 