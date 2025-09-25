import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { users } from "@/server/db/schema";
import { type AuthQueryContext } from "./types";

export async function getCurrentUser({ db, session }: AuthQueryContext) {
  if (!session?.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: new Date(),
        rank: true,
        subscriptionPlan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        stripeSubscriptionEndDate: true,
        discordConnected: true,
        discordId: true,
        discordUsername: true,
        discordDiscriminator: true,
        discordAvatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      ...user,
    };
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