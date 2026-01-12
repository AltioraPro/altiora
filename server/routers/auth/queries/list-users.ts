import { and, asc, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { subscription, user } from "@/server/db/schema/auth/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { listUsersSchema } from "../validators";

export const listUsersBase = protectedProcedure.input(listUsersSchema);

export const listUsersHandler = listUsersBase.handler(
    async ({ input, context }) => {
        const { db } = context;

        const filters: SQL[] = [];

        if (input.search) {
            const pattern = `%${input.search}%`;
            const searchCondition = or(
                ilike(user.name, pattern),
                ilike(user.email, pattern)
            );
            if (searchCondition) {
                filters.push(searchCondition);
            }
        }

        if (input.role && input.role !== "all") {
            filters.push(eq(user.role, input.role));
        }

        const whereCondition = filters.length > 0 ? and(...filters) : undefined;

        const sortDirection = input.sortOrder === "asc" ? asc : desc;
        let sortColumn:
            | typeof user.name
            | typeof user.role
            | typeof user.createdAt;
        switch (input.sortBy) {
            case "user":
                sortColumn = user.name;
                break;
            case "role":
                sortColumn = user.role;
                break;
            default:
                sortColumn = user.createdAt;
                break;
        }

        const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(user)
            .where(whereCondition ?? sql`true`);

        const total = countResult?.count ?? 0;

        const rows = await db
            .select({
                user,
                subscription: {
                    id: subscription.id,
                    status: subscription.status,
                    plan: subscription.plan,
                },
            })
            .from(user)
            .leftJoin(subscription, eq(user.id, subscription.referenceId))
            .where(whereCondition ?? sql`true`)
            .orderBy(sortDirection(sortColumn))
            .offset((input.page - 1) * input.limit)
            .limit(input.limit);

        const users = rows.map((r) => ({
            ...r.user,
            subscriptionId: r.subscription?.id ?? null,
            subscriptionStatus: r.subscription?.status ?? null,
            subscriptionPlan: r.subscription?.plan ?? null,
        }));

        return {
            users,
            pagination: {
                total,
                page: input.page,
                limit: input.limit,
                totalPages: Math.ceil(total / input.limit),
                hasNextPage: input.page < Math.ceil(total / input.limit),
                hasPreviousPage: input.page > 1,
            },
        };
    }
);
