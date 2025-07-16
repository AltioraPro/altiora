import { createTRPCRouter, createCallerFactory } from "@/server/api/trpc";
import { authRouter } from "./routers/auth/router";

/**
 * Router principal qui combine tous les sous-routers
 * Ici nous définissons tous les routers de l'application
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  // Ici nous ajouterons d'autres routers plus tard :
  // habits: habitsRouter,
  // trades: tradesRouter,
  // goals: goalsRouter,
  // pomodoro: pomodoroRouter,
});

// Export du type pour l'utilisation côté client
export type AppRouter = typeof appRouter;

/**
 * Créer un caller server-side pour les Server Components
 */
export const createCaller = createCallerFactory(appRouter); 