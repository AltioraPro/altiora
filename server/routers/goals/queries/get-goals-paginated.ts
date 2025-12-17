import { and, asc, desc, eq, inArray, like, lte, type SQL, sql } from "drizzle-orm";
import { goals } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { getGoalsPaginatedValidator } from "../validators";

export const getGoalsPaginatedBase = protectedProcedure.input(
    getGoalsPaginatedValidator
);

export const getGoalsPaginatedHandler = getGoalsPaginatedBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            search,
            type,
            status,
            categoryIds,
            showInactive,
        } = input;
        const offset = page * limit;

        console.info("Filter params:", { search, type, status, categoryIds, showInactive });

        const whereConditions = [eq(goals.userId, session.user.id)];

        if (!showInactive) {
            whereConditions.push(eq(goals.isActive, true));
        }

        if (search) {
            whereConditions.push(like(goals.title, `%${search}%`));
            console.info("Applied search filter:", search);
        }

        if (type) {
            whereConditions.push(eq(goals.type, type));
            console.info("Applied type filter:", type);
        }

        if (categoryIds && categoryIds.length > 0) {
            whereConditions.push(inArray(goals.categoryId, categoryIds));
            console.info("Applied category filter:", categoryIds);
        }

        if (status) {
            switch (status) {
                case "completed":
                    whereConditions.push(eq(goals.isCompleted, true));
                    console.info("🔍 [Goals API] Applied completed filter");
                    break;
                case "overdue":
                    whereConditions.push(eq(goals.isCompleted, false));
                    whereConditions.push(lte(goals.deadline, new Date()));
                    console.info("🔍 [Goals API] Applied overdue filter");
                    break;
                case "active":
                    whereConditions.push(eq(goals.isCompleted, false));
                    whereConditions.push(
                        sql`${goals.deadline} > NOW() OR ${goals.deadline} IS NULL`
                    );
                    console.info("🔍 [Goals API] Applied active filter");
                    break;
                default:
                    break;
            }
        }

        const whereClause =
            whereConditions.length === 1
                ? whereConditions[0]
                : and(...whereConditions);

        let orderByClause:
            | typeof goals.title
            | typeof goals.createdAt
            | typeof goals.deadline
            | typeof goals.sortOrder
            | SQL<unknown>;

        switch (sortBy) {
            case "title":
                orderByClause =
                    sortOrder === "asc" ? asc(goals.title) : desc(goals.title);
                break;
            case "createdAt":
                orderByClause =
                    sortOrder === "asc"
                        ? asc(goals.createdAt)
                        : desc(goals.createdAt);
                break;
            case "deadline":
                orderByClause =
                    sortOrder === "asc"
                        ? asc(goals.deadline)
                        : desc(goals.deadline);
                break;
            case "sortOrder":
                orderByClause =
                    sortOrder === "asc"
                        ? asc(goals.sortOrder)
                        : desc(goals.sortOrder);
                break;
            default:
                orderByClause = asc(goals.sortOrder);
        }

        const results = await db
            .select()
            .from(goals)
            .where(whereClause)
            .orderBy(orderByClause, desc(goals.createdAt))
            .limit(limit)
            .offset(offset);

        const total = await db
            .select({ count: sql<number>`count(*)` })
            .from(goals)
            .where(whereClause);

        return {
            goals: results,
            pagination: {
                page,
                limit,
                total: total[0]?.count || 0,
                totalPages: Math.ceil((total[0]?.count || 0) / limit),
            },
        };
    }
);
