import {
    and,
    asc,
    desc,
    eq,
    isNull,
    like,
    not,
    type SQL,
    sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { accessList, user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { listWaitlistSchema } from "../validators";

export const listWaitlistBase = protectedProcedure
    .errors({
        INTERNAL_SERVER_ERROR: {},
    })
    .input(listWaitlistSchema);

export const listWaitlistHandler = listWaitlistBase.handler(
    async ({ input, context, errors }) => {
        const { db } = context;

        try {
            const waitlistFilters: SQL[] = [];

            if (input.search) {
                waitlistFilters.push(
                    like(accessList.email, `%${input.search}%`)
                );
            }

            if (input.waitlistStatus && input.waitlistStatus !== "all") {
                waitlistFilters.push(
                    eq(accessList.status, input.waitlistStatus)
                );
            }

            let registrationFilter: SQL | undefined;
            if (input.registrationStatus === "registered") {
                registrationFilter = not(isNull(user.id));
            } else if (input.registrationStatus === "unregistered") {
                registrationFilter = isNull(user.id);
            } else {
                registrationFilter = undefined;
            }

            const whereCondition = and(
                waitlistFilters.length > 0
                    ? and(...waitlistFilters)
                    : undefined,
                registrationFilter
            );

            const [countResult] = await db
                .select({ count: sql<number>`count(*)` })
                .from(accessList)
                .leftJoin(user, eq(accessList.email, user.email))
                .where(whereCondition);

            const total = Number(countResult.count ?? 0);

            let sortColumn:
                | typeof accessList.email
                | typeof accessList.status
                | typeof accessList.createdAt;

            if (input.sortBy === "email") {
                sortColumn = accessList.email;
            } else if (input.sortBy === "waitlistStatus") {
                sortColumn = accessList.status;
            } else if (input.sortBy === "registrationStatus") {
                sortColumn = accessList.createdAt; // No direct column for registration status, fallback to createdAt
            } else {
                sortColumn = accessList.createdAt;
            }

            const sortDirection = input.sortOrder === "asc" ? asc : desc;

            // Define alias for the added by user
            const addedByUser = alias(user, "added_by_user");

            type WaitlistEntry = {
                accessList: typeof accessList.$inferSelect;
                user: typeof user.$inferSelect | null;
                added_by_user: {
                    id: string | null;
                    name: string | null;
                    email: string | null;
                    image: string | null;
                } | null;
            };

            const waitlist = (await db
                .select({
                    accessList,
                    user,
                    added_by_user: {
                        id: addedByUser.id,
                        name: addedByUser.name,
                        email: addedByUser.email,
                        image: addedByUser.image,
                    },
                })
                .from(accessList)
                .leftJoin(user, eq(accessList.email, user.email))
                .leftJoin(addedByUser, eq(accessList.addedBy, addedByUser.id))
                .where(whereCondition)
                .orderBy(sortDirection(sortColumn))
                .offset((input.page - 1) * input.limit)
                .limit(input.limit)) as WaitlistEntry[];

            // Return paginated result with user data for the frontend
            return {
                waitlist: waitlist.map((entry) => ({
                    id: entry.accessList.id,
                    email: entry.accessList.email,
                    status: entry.accessList.status,
                    createdAt: entry.accessList.createdAt,
                    addedBy: entry.accessList.addedBy,
                    isRegistered: !!entry.user?.id,
                    user: entry.user
                        ? {
                              id: entry.user.id,
                              name: entry.user.name,
                              email: entry.user.email,
                              image: entry.user.image,
                              role: entry.user.role,
                              emailVerified: entry.user.emailVerified,
                          }
                        : null,
                    addedByUser: entry.added_by_user?.id
                        ? {
                              id: entry.added_by_user.id,
                              name: entry.added_by_user.name,
                              email: entry.added_by_user.email,
                              image: entry.added_by_user.image,
                          }
                        : null,
                })),
                pagination: {
                    total,
                    page: input.page,
                    limit: input.limit,
                    totalPages: Math.ceil(total / input.limit),
                    hasNextPage: input.page < Math.ceil(total / input.limit),
                    hasPreviousPage: input.page > 1,
                },
            };
        } catch (error) {
            console.error("Failed to list waitlist:", error);
            throw errors.INTERNAL_SERVER_ERROR();
        }
    }
);
