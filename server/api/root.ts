import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth/router";
import { discordRouter } from "./routers/discord/router";
import { goalsRouter } from "./routers/goals/router";
import { habitsRouter } from "./routers/habits/router";
import { leaderboardRouter } from "./routers/leaderboard/router";
import { profileRouter } from "./routers/profile/router";
import { remindersRouter } from "./routers/reminders/router";
import { tradingRouter } from "./routers/trading/router";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    habits: habitsRouter,
    discord: discordRouter,
    profile: profileRouter,
    // subscription: subscriptionRouter,
    goals: goalsRouter,
    reminders: remindersRouter,
    trading: tradingRouter,
    leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API
 */
export const createCaller = createCallerFactory(appRouter);
