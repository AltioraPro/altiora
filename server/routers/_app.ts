import { base } from "@/server/context";
import { authRouter } from "./auth/router";
import { discordRouter } from "./discord/router";
import { goalsRouter } from "./goals/router";
import { habitsRouter } from "./habits/router";
import { leaderboardRouter } from "./leaderboard/router";
import { profileRouter } from "./profile/router";
import { remindersRouter } from "./reminders/router";
import { tradingRouter } from "./trading/router";

export const appRouter = base.router({
    auth: authRouter,
    leaderboard: leaderboardRouter,
    reminders: remindersRouter,
    discord: discordRouter,
    goals: goalsRouter,
    profile: profileRouter,
    habits: habitsRouter,
    trading: tradingRouter,
});
