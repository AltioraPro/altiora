import { ORPCError } from "@orpc/client";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { DiscordService } from "@/server/services/discord";

export const syncAllUsersBase = protectedProcedure;

export const syncAllUsersHandler = syncAllUsersBase.handler(async () => {
    try {
        const result = await DiscordService.syncAllConnectedUsers();
        return result;
    } catch (error) {
        console.error("Failed to sync all users:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to sync all users with Discord",
        });
    }
});
