import { inArray } from "drizzle-orm";
import { waitlist } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { deleteWaitlistSchema } from "../validators";

export const deleteWaitlistBase =
    protectedProcedure.input(deleteWaitlistSchema);

export const deleteWaitlistHandler = deleteWaitlistBase.handler(
    async ({ input, context }) => {
        const { db } = context;

        await db.delete(waitlist).where(inArray(waitlist.id, input.ids));

        return { success: true, deletedCount: input.ids.length };
    }
);
