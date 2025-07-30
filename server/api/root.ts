import { createTRPCRouter, createCallerFactory } from "@/server/api/trpc";
import { authRouter } from "./routers/auth/router";
import { habitsRouter } from "./routers/habits/router";
import { discordRouter } from "./routers/discord/router";
import { profileRouter } from "./routers/profile/router";
import { subscriptionRouter } from "./routers/subscription/router";
import { goalsRouter } from "./routers/goals/router";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  habits: habitsRouter,
  discord: discordRouter,
  profile: profileRouter,
  subscription: subscriptionRouter,
  goals: goalsRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API
 */
export const createCaller = createCallerFactory(appRouter); 