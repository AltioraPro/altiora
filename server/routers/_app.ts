import { base } from "@/server/context";
import { authRouter } from "@/server/routers/auth/router";
import { categoriesRouter } from "@/server/routers/categories/router";
import { discordRouter } from "@/server/routers/discord/router";
import { goalsRouter } from "@/server/routers/goals/router";
import { habitsRouter } from "@/server/routers/habits/router";
import { leaderboardRouter } from "@/server/routers/leaderboard/router";
import { profileRouter } from "@/server/routers/profile/router";
import { remindersRouter } from "@/server/routers/reminders/router";
import { tradingRouter } from "@/server/routers/trading/router";

export const appRouter = base.router({
    auth: authRouter,
    categories: categoriesRouter,
    leaderboard: leaderboardRouter,
    reminders: remindersRouter,
    discord: discordRouter,
    goals: goalsRouter,
    profile: profileRouter,
    habits: habitsRouter,
    trading: tradingRouter,
});
