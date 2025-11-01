import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { DiscordService } from "@/server/services/discord";

export const getAuthUrlBase = protectedProcedure;

export const getAuthUrlHandler = getAuthUrlBase.handler(async () => {
    const state = crypto.randomUUID();
    const authUrl = DiscordService.getAuthUrl(state);

    return { authUrl, state };
});
