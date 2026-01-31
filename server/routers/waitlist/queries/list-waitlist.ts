import { and, asc, desc, ilike, or, type SQL, sql } from "drizzle-orm";
import { waitlist } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { listWaitlistSchema } from "../validators";

export const listWaitlistBase = protectedProcedure.input(listWaitlistSchema);

export const listWaitlistHandler = listWaitlistBase.handler(
    async ({ input, context }) => {
        const { db } = context;

        const filters: SQL[] = [];

        if (input.search) {
            const pattern = `%${input.search}%`;
            const searchCondition = or(
                ilike(waitlist.email, pattern),
                ilike(waitlist.firstName, pattern)
            );
            if (searchCondition) {
                filters.push(searchCondition);
            }
        }

        const whereCondition = filters.length > 0 ? and(...filters) : undefined;

        const sortDirection = input.sortOrder === "asc" ? asc : desc;
        let sortColumn:
            | typeof waitlist.email
            | typeof waitlist.firstName
            | typeof waitlist.createdAt;
        switch (input.sortBy) {
            case "email":
                sortColumn = waitlist.email;
                break;
            case "firstName":
                sortColumn = waitlist.firstName;
                break;
            default:
                sortColumn = waitlist.createdAt;
                break;
        }

        const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(waitlist)
            .where(whereCondition ?? sql`true`);

        const total = countResult?.count ?? 0;

        const entries = await db
            .select()
            .from(waitlist)
            .where(whereCondition ?? sql`true`)
            .orderBy(sortDirection(sortColumn))
            .offset((input.page - 1) * input.limit)
            .limit(input.limit);

        return {
            entries,
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
