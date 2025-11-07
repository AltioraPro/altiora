import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
    getLeaderboardBase,
    getLeaderboardHandler,
} from "./queries/get-leaderboard";

export const leaderboardRouter = base.router({
    // Queries
    getLeaderboard: getLeaderboardBase
        .route({ method: "GET" })
        .handler(
            async ({ context, input }) =>
                await call(getLeaderboardHandler, input, { context })
        ),
});
