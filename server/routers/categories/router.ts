import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
    createCategoryBase,
    createCategoryHandler,
    updateCategoryBase,
    updateCategoryHandler,
    deleteCategoryBase,
    deleteCategoryHandler,
} from "./mutations";
import {
    getAllCategoriesBase,
    getAllCategoriesHandler,
} from "./queries";

export const categoriesRouter = base.router({
    // Queries
    getAll: getAllCategoriesBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getAllCategoriesHandler, undefined, { context })
        ),

    // Mutations
    create: createCategoryBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(createCategoryHandler, input, { context })
        ),

    update: updateCategoryBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateCategoryHandler, input, { context })
        ),

    delete: deleteCategoryBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(deleteCategoryHandler, input, { context })
        ),
});
