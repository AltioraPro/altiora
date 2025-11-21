import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { parseUserAgent } from "@/lib/utils/user-agent";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getSessionsBase = protectedProcedure;

export const getSessionsHandler = getSessionsBase.handler(
    async ({ context }) => {
        const { session } = context;

        const sessions = await auth.api.listSessions({
            headers: await headers(),
        });

        const formattedSessions = sessions.map((s) => {
            const deviceInfo = parseUserAgent(s.userAgent);
            const isCurrent = s.id === session.session.id;

            return {
                ...s,
                deviceInfo,
                isCurrent,
            };
        });

        return formattedSessions;
    }
);
