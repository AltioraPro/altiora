import { db } from "@/server/db";
import { goals, subGoals, goalTasks, goalReminders } from "@/server/db/schema";
import { eq, and, desc, asc, like, gte, lte, sql, or } from "drizzle-orm";
import { type Goal, type SubGoal, type GoalTask } from "@/server/db/schema";

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
    type?: "annual" | "quarterly" | "custom";
    status?: "active" | "completed" | "overdue";
    showInactive?: boolean;
  }
) {
  const { page, limit, sortBy, sortOrder, search, type, status, showInactive } = input;
  const offset = page * limit;

  console.log("🔍 [Goals API] Filter params:", { search, type, status, showInactive });

  let whereConditions = [eq(goals.userId, userId)];

  if (!showInactive) {
    whereConditions.push(eq(goals.isActive, true));
  }

  if (search) {
    whereConditions.push(like(goals.title, `%${search}%`));
    console.log("🔍 [Goals API] Applied search filter:", search);
  }

  if (type) {
    whereConditions.push(eq(goals.type, type));
    console.log("🔍 [Goals API] Applied type filter:", type);
  }

  if (status) {
    switch (status) {
      case "completed":
        whereConditions.push(eq(goals.isCompleted, true));
        console.log("🔍 [Goals API] Applied completed filter");
        break;
      case "overdue":
        whereConditions.push(
          and(
            eq(goals.isCompleted, false),
            lte(goals.deadline, new Date())
          )
        );
        console.log("🔍 [Goals API] Applied overdue filter");
        break;
      case "active":
        whereConditions.push(
          and(
            eq(goals.isCompleted, false),
            sql`${goals.deadline} > NOW() OR ${goals.deadline} IS NULL`
          )
        );
        console.log("🔍 [Goals API] Applied active filter");
        break;
    }
  }

  const sortColumn = goals[sortBy as keyof typeof goals];
  const sortDirection = sortOrder === "asc" ? asc : desc;

  const results = await db
    .select()
    .from(goals)
    .where(and(...whereConditions))
    .orderBy(sortDirection(sortColumn), desc(goals.createdAt))
    .limit(limit)
    .offset(offset);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(goals)
    .where(and(...whereConditions));

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
  userId: string,
  input: { period: "week" | "month" | "quarter" | "year" }
) {
  const { period } = input;
  const now = new Date();

  // Récupérer tous les goals de l'utilisateur pour calculer les stats
  const allGoals = await db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.userId, userId),
        eq(goals.isActive, true) // Seulement les goals actifs
      )
    );

  // Calculer les stats basées sur les goals réels
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

  // Calcul du taux de completion
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    overdue,
    active,
    completionRate,
  };
}

export async function getGoalsByType(userId: string, type: "annual" | "quarterly" | "custom") {
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