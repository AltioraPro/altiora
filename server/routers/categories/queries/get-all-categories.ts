import { goalCategories } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { eq } from "drizzle-orm";

export const getAllCategoriesBase = protectedProcedure;

export const getAllCategoriesHandler = getAllCategoriesBase.handler(
    async ({ context }) => {
        const { db, session } = context;

        const categories = await db
            .select({
                id: goalCategories.id,
                name: goalCategories.name,
                color: goalCategories.color,
                icon: goalCategories.icon,
            })
            .from(goalCategories)
            .where(eq(goalCategories.userId, session.user.id))
            .orderBy(goalCategories.name);

        return categories;
    }
);
