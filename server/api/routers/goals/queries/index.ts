import { and, asc, desc, eq, gte, like, lte, type SQL, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { type Goal, goals, goalTasks, subGoals } from "@/server/db/schema";

export async function getUserGoals(userId: string): Promise<Goal[]> {
    return await db
        .select()
        .from(goals)
        .where(eq(goals.userId, userId))
        .orderBy(asc(goals.sortOrder), desc(goals.createdAt));
}

export async function getGoalsPaginated(
    userId: string,
    input: {
        page: number;
        limit: number;
        sortBy: "title" | "createdAt" | "deadline" | "sortOrder";
        sortOrder: "asc" | "desc";
        search?: string;
        type?: "annual" | "quarterly" | "monthly";
        status?: "active" | "completed" | "overdue";
        showInactive?: boolean;
    }
) {
    const {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        type,
        status,
        showInactive,
    } = input;
    const offset = page * limit;

    console.info("Filter params:", { search, type, status, showInactive });

    const whereConditions = [eq(goals.userId, userId)];

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

export async function getGoalById(
    goalId: string,
    userId: string
): Promise<Goal | null> {
    const results = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
        .limit(1);

    return results[0] || null;
}

export async function getGoalWithDetails(goalId: string, userId: string) {
    const goal = await getGoalById(goalId, userId);
    if (!goal) {
        return null;
    }

    const subGoalsList = await db
        .select()
        .from(subGoals)
        .where(and(eq(subGoals.goalId, goalId), eq(subGoals.userId, userId)))
        .orderBy(asc(subGoals.sortOrder));

    const tasks = await db
        .select()
        .from(goalTasks)
        .where(and(eq(goalTasks.goalId, goalId), eq(goalTasks.userId, userId)))
        .orderBy(asc(goalTasks.sortOrder));

    return {
        goal,
        subGoals: subGoalsList,
        tasks,
    };
}

export async function getGoalStats(userId: string) {
    const now = new Date();

    const [totalResult, completedResult, overdueResult, activeResult] =
        await Promise.all([
            db
                .select({ count: sql<number>`count(*)` })
                .from(goals)
                .where(and(eq(goals.userId, userId), eq(goals.isActive, true))),

            db
                .select({ count: sql<number>`count(*)` })
                .from(goals)
                .where(
                    and(
                        eq(goals.userId, userId),
                        eq(goals.isActive, true),
                        eq(goals.isCompleted, true)
                    )
                ),

            db
                .select({ count: sql<number>`count(*)` })
                .from(goals)
                .where(
                    and(
                        eq(goals.userId, userId),
                        eq(goals.isActive, true),
                        eq(goals.isCompleted, false),
                        lte(goals.deadline, now)
                    )
                ),

            db
                .select({ count: sql<number>`count(*)` })
                .from(goals)
                .where(
                    and(
                        eq(goals.userId, userId),
                        eq(goals.isActive, true),
                        eq(goals.isCompleted, false),
                        sql`(${goals.deadline} > NOW() OR ${goals.deadline} IS NULL)`
                    )
                ),
        ]);

    const total = Number(totalResult[0]?.count || 0);
    const completed = Number(completedResult[0]?.count || 0);
    const overdue = Number(overdueResult[0]?.count || 0);
    const active = Number(activeResult[0]?.count || 0);
    const completionRate =
        total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        total,
        completed,
        overdue,
        active,
        completionRate,
    };
}

export async function getGoalsByType(
    userId: string,
    type: "annual" | "quarterly" | "monthly"
) {
    return await db
        .select()
        .from(goals)
        .where(and(eq(goals.userId, userId), eq(goals.type, type)))
        .orderBy(asc(goals.sortOrder), desc(goals.createdAt));
}

export async function getUpcomingDeadlines(userId: string, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await db
        .select()
        .from(goals)
        .where(
            and(
                eq(goals.userId, userId),
                eq(goals.isCompleted, false),
                eq(goals.isActive, true),
                gte(goals.deadline, new Date()),
                lte(goals.deadline, futureDate)
            )
        )
        .orderBy(asc(goals.deadline));
}
