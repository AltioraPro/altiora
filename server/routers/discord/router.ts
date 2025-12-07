import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
  autoSyncRankBase,
  autoSyncRankHandler,
  disconnectBase,
  disconnectHandler,
  finalizeDiscordLinkBase,
  finalizeDiscordLinkHandler,
  syncAllUsersBase,
  syncAllUsersHandler,
  syncRankBase,
  syncRankHandler,
  toggleHabitRemindersBase,
  toggleHabitRemindersHandler,
} from "./mutations";
import {
  checkBotStatusBase,
  checkBotStatusHandler,
} from "./queries/check-bot-status";
import {
  getConnectionStatusBase,
  getConnectionStatusHandler,
} from "./queries/get-connection-status";
import {
  getDiscordProfileBase,
  getDiscordProfileHandler,
} from "./queries/get-discord-profile";

export const discordRouter = base.router({
  getDiscordProfile: getDiscordProfileBase
    .route({ method: "GET" })
    .handler(
      async ({ context }) =>
        await call(getDiscordProfileHandler, undefined, { context })
    ),
  // Queries
  getConnectionStatus: getConnectionStatusBase
    .route({ method: "GET" })
    .handler(
      async ({ context }) =>
        await call(getConnectionStatusHandler, undefined, { context })
    ),

  checkBotStatus: checkBotStatusBase
    .route({ method: "GET" })
    .handler(
      async ({ context }) =>
        await call(checkBotStatusHandler, undefined, { context })
    ),

  // Mutations
  disconnect: disconnectBase
    .route({ method: "POST" })
    .handler(
      async ({ context }) =>
        await call(disconnectHandler, undefined, { context })
    ),

  syncRank: syncRankBase
    .route({ method: "POST" })
    .handler(
      async ({ context }) => await call(syncRankHandler, undefined, { context })
    ),

  autoSyncRank: autoSyncRankBase
    .route({ method: "POST" })
    .handler(
      async ({ context }) =>
        await call(autoSyncRankHandler, undefined, { context })
    ),

  finalizeLink: finalizeDiscordLinkBase.route({ method: "POST" }).handler(
    async ({ context }) =>
      await call(finalizeDiscordLinkHandler, undefined, {
        context,
      })
  ),

  syncAllUsers: syncAllUsersBase
    .route({ method: "POST" })
    .handler(
      async ({ context }) =>
        await call(syncAllUsersHandler, undefined, { context })
    ),

  toggleHabitReminders: toggleHabitRemindersBase
    .route({ method: "POST" })
    .handler(
      async ({ context, input }) =>
        await call(toggleHabitRemindersHandler, input, { context })
    ),
});
