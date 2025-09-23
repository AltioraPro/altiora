import { db, cacheUtils } from "@/server/db";
import { goals, subGoals, goalTasks } from "@/server/db/schema";
import { eq, and, desc, asc, like, gte, lte, sql } from "drizzle-orm";
import { type Goal } from "@/server/db/schema";

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
  const { page, limit, sortBy, sortOrder, search, type, status, showInactive } = input;
  const offset = page * limit;

  console.log("Filter params:", { search, type, status, showInactive });

  const whereConditions = [eq(goals.userId, userId)];

  if (!showInactive) {
    whereConditions.push(eq(goals.isActive, true));
  }

  if (search) {
    whereConditions.push(like(goals.title, `%${search}%`));
    console.log("Applied search filter:", search);
  }

  if (type) {
    whereConditions.push(eq(goals.type, type));
    console.log("Applied type filter:", type);
  }

  if (status) {
    switch (status) {
      case "completed":
        whereConditions.push(eq(goals.isCompleted, true));
        console.log("🔍 [Goals API] Applied completed filter");
        break;
      case "overdue":
        whereConditions.push(eq(goals.isCompleted, false));
        whereConditions.push(lte(goals.deadline, new Date()));
        console.log("🔍 [Goals API] Applied overdue filter");
        break;
      case "active":
        whereConditions.push(eq(goals.isCompleted, false));
        whereConditions.push(sql`${goals.deadline} > NOW() OR ${goals.deadline} IS NULL`);
        console.log("🔍 [Goals API] Applied active filter");
        break;
    }
  }

  const whereClause = whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions);

  let orderByClause;
  switch (sortBy) {
    case "title":
      orderByClause = sortOrder === "asc" ? asc(goals.title) : desc(goals.title);
      break;
    case "createdAt":
      orderByClause = sortOrder === "asc" ? asc(goals.createdAt) : desc(goals.createdAt);
      break;
    case "deadline":
      orderByClause = sortOrder === "asc" ? asc(goals.deadline) : desc(goals.deadline);
      break;
    case "sortOrder":
      orderByClause = sortOrder === "asc" ? asc(goals.sortOrder) : desc(goals.sortOrder);
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

export async function getGoalById(goalId: string, userId: string): Promise<Goal | null> {
  const results = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);

  return results[0] || null;
}

export async function getGoalWithDetails(goalId: string, userId: string) {
  const goal = await getGoalById(goalId, userId);
  if (!goal) return null;

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

export async function getGoalStats(
  userId: string
) {
  const cached = await cacheUtils.getStats(userId, 'goals-stats');
  if (cached) {
    return cached;
  }

  const now = new Date();

  const allGoals = await db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.userId, userId),
        eq(goals.isActive, true) // Seulement les goals actifs
      )
    );

  const total = allGoals.length;
  const completed = allGoals.filter(goal => goal.isCompleted).length;
  const overdue = allGoals.filter(goal => 
    !goal.isCompleted && 
    goal.deadline && 
    new Date(goal.deadline) < now
  ).length;
  const active = allGoals.filter(goal => 
    !goal.isCompleted && 
    (!goal.deadline || new Date(goal.deadline) >= now)
  ).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = {
    total,
    completed,
    overdue,
    active,
    completionRate,
  };

  await cacheUtils.setStats(userId, 'goals-stats', stats, {}, 300);

  return stats;
}

export async function getGoalsByType(userId: string, type: "annual" | "quarterly" | "monthly") {
  return await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.type, type)))
    .orderBy(asc(goals.sortOrder), desc(goals.createdAt));
}

export async function getUpcomingDeadlines(userId: string, days: number = 7) {
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