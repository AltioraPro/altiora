import { goalCategories, goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { deleteCategoryValidator } from "../validators";
import { and, eq } from "drizzle-orm";

export const deleteCategoryBase = protectedProcedure.input(deleteCategoryValidator);

export const deleteCategoryHandler = deleteCategoryBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;

        // Set categoryId to null for all goals with this category
        await db
            .update(goals)
            .set({ categoryId: null })
            .where(
                and(
                    eq(goals.categoryId, input.id),
                    eq(goals.userId, session.user.id)
                )
            );

        // Delete the category
        await db
            .delete(goalCategories)
            .where(
                and(
                    eq(goalCategories.id, input.id),
                    eq(goalCategories.userId, session.user.id)
                )
            );

        return { success: true };
    }
);
