import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import type { AuthQueryContext } from "./types";

export async function getCurrentUser({ db, session }: AuthQueryContext) {
    if (!session?.userId) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource",
        });
    }

    try {
        const currentUser = await db.query.user.findFirst({
            where: eq(user.id, session.userId),
            columns: {
                id: true,
                email: true,
                name: true,
                image: true,
                emailVerified: true,
                rank: true,
                isLeaderboardPublic: true,
                stripeCustomerId: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!currentUser) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }

        return currentUser;
    } catch (error) {
        if (error instanceof TRPCError) {
            throw error;
        }

        console.error("Error retrieving user:", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error retrieving user",
        });
    }
}
