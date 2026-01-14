import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { goalCategories } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { createCategoryValidator } from "../validators";

export const createCategoryBase = protectedProcedure.input(
    createCategoryValidator
);

export const createCategoryHandler = createCategoryBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const id = nanoid();

        await db.insert(goalCategories).values({
            id,
            userId: session.user.id,
            name: input.name,
            color: input.color,
            icon: input.icon ?? null,
        });

        const [category] = await db
            .select()
            .from(goalCategories)
            .where(eq(goalCategories.id, id))
            .limit(1);

        if (!category) {
            throw new Error("Failed to create category");
        }

        return {
            id: category.id,
            name: category.name,
            color: category.color,
            icon: category.icon,
        };
    }
);
