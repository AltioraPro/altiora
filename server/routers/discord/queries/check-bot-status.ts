import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const checkBotStatusBase = protectedProcedure;

export const checkBotStatusHandler = checkBotStatusBase.handler(async () => {
    try {
        const botUrl =
            process.env.DISCORD_BOT_WEBHOOK_URL || "http://localhost:3001";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${botUrl}/health`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        return {
            online: response.ok,
            status: response.status,
            url: botUrl,
        };
    } catch (error) {
        return {
            online: false,
            error: error instanceof Error ? error.message : "Unknown error",
            url:
                process.env.DISCORD_BOT_WEBHOOK_URL ||
                "http://localhost:3001",
        };
    }
});
