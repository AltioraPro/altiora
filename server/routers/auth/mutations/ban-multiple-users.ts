import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { banMultipleUsersSchema } from "../validators";

export const banMultipleUsersBase = protectedProcedure
    .errors({
        INTERNAL_SERVER_ERROR: {},
    })
    .input(banMultipleUsersSchema);

export const banMultipleUsersHandler = banMultipleUsersBase.handler(
    async ({ input, errors }) => {
        const { userIds } = input;

        try {
            const headersList = await headers();
            await Promise.all(
                userIds.map((userId) =>
                    auth.api.banUser({
                        headers: headersList,
                        body: {
                            userId,
                        },
                    })
                )
            );

            return {
                success: true,
            };
        } catch (error) {
            console.error("Failed to ban users:", error);
            throw errors.INTERNAL_SERVER_ERROR();
        }
    }
);
