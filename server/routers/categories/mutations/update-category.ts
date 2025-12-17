import { goalCategories } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateCategoryValidator } from "../validators";
import { and, eq } from "drizzle-orm";

export const updateCategoryBase = protectedProcedure.input(updateCategoryValidator);

export const updateCategoryHandler = updateCategoryBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;

        const updateData: Partial<{
            name: string;
            color: string;
            icon: string | null;
            updatedAt: Date;
        }> = {
            updatedAt: new Date(),
        };

        if (input.name !== undefined) {
            updateData.name = input.name;
        }
        if (input.color !== undefined) {
            updateData.color = input.color;
        }
        if (input.icon !== undefined) {
            updateData.icon = input.icon;
        }

        await db
            .update(goalCategories)
            .set(updateData)
            .where(
                and(
                    eq(goalCategories.id, input.id),
                    eq(goalCategories.userId, session.user.id)
                )
            );

        const [category] = await db
            .select()
            .from(goalCategories)
            .where(eq(goalCategories.id, input.id))
            .limit(1);

        if (!category) {
            throw new Error("Category not found");
        }

        return {
            id: category.id,
            name: category.name,
            color: category.color,
            icon: category.icon,
        };
    }
);
