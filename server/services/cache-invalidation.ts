import { cacheUtils } from "@/server/db";

export class CacheInvalidationService {
  static async invalidateGoalCache(userId: string, goalId?: string) {
    await cacheUtils.invalidateUserStats(userId, 'goals-stats');
    await cacheUtils.invalidate(`goals:${userId}:*`);
    
    console.log(`Invalidated goal cache for user ${userId}`);
  }

  static async invalidateHabitCache(userId: string, habitId?: string) {
    await cacheUtils.invalidateUserStats(userId, 'habits-dashboard');
    await cacheUtils.invalidate(`habits:${userId}:*`);
    
    console.log(`Invalidated habit cache for user ${userId}`);
  }

  static async invalidateTradingCache(userId: string, journalId?: string) {
    if (journalId) {
      await cacheUtils.invalidate(`stats:${userId}:trading-capital:${JSON.stringify({ journalId })}`);
    }
    await cacheUtils.invalidate(`stats:${userId}:trading-*`);
    
    console.log(`Invalidated trading cache for user ${userId}${journalId ? `, journal ${journalId}` : ''}`);
  }

  static async invalidateAllUserCache(userId: string) {
    await cacheUtils.invalidateUserStats(userId);
    await cacheUtils.invalidate(`goals:${userId}:*`);
    await cacheUtils.invalidate(`habits:${userId}:*`);
    await cacheUtils.invalidate(`trading:${userId}:*`);
    
    console.log(`Invalidated all cache for user ${userId}`);
  }

  static async invalidateUserProfileCache(userId: string) {
    await cacheUtils.invalidateUserStats(userId, 'subscription-limits');
    await cacheUtils.invalidateUserStats(userId, 'usage-stats');
    
    console.log(`Invalidated profile cache for user ${userId}`);
  }
}
