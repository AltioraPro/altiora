import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateMultipleUsersStatusSchema } from "../validators";

export const updateMultipleUsersStatusBase = protectedProcedure.input(
    updateMultipleUsersStatusSchema
);

export const updateMultipleUsersStatusHandler =
    updateMultipleUsersStatusBase.handler(async ({ input }) => {
        const { emails, status } = input;

        const requestHeaders = await headers();

        await Promise.all(
            emails.map((email) =>
                auth.api.updateAccessStatus({
                    headers: requestHeaders,
                    body: {
                        email,
                        status,
                    },
                })
            )
        );

        return {
            success: true,
            status,
        };
    });
