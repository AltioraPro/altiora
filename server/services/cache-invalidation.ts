import { cacheUtils } from "@/server/db";

/**
 * Service d'invalidation intelligente du cache
 * Centralise la logique d'invalidation pour éviter les incohérences
 */
export class CacheInvalidationService {
  /**
   * Invalider le cache après modification d'un goal
   */
  static async invalidateGoalCache(userId: string, goalId?: string) {
    // Invalider les stats générales
    await cacheUtils.invalidateUserStats(userId, 'goals-stats');
    
    // Invalider les goals paginés
    await cacheUtils.invalidate(`goals:${userId}:*`);
    
    console.log(`🗑️ [Cache] Invalidated goal cache for user ${userId}`);
  }

  /**
   * Invalider le cache après modification d'une habitude
   */
  static async invalidateHabitCache(userId: string, habitId?: string) {
    // Invalider le dashboard des habitudes
    await cacheUtils.invalidateUserStats(userId, 'habits-dashboard');
    
    // Invalider les stats des habitudes
    await cacheUtils.invalidate(`habits:${userId}:*`);
    
    console.log(`🗑️ [Cache] Invalidated habit cache for user ${userId}`);
  }

  /**
   * Invalider le cache après modification d'un trade
   */
  static async invalidateTradingCache(userId: string, journalId?: string) {
    // Invalider le capital du journal
    if (journalId) {
      await cacheUtils.invalidate(`stats:${userId}:trading-capital:${JSON.stringify({ journalId })}`);
    }
    
    // Invalider toutes les stats de trading
    await cacheUtils.invalidate(`stats:${userId}:trading-*`);
    
    console.log(`🗑️ [Cache] Invalidated trading cache for user ${userId}${journalId ? `, journal ${journalId}` : ''}`);
  }

  /**
   * Invalider tout le cache d'un utilisateur
   */
  static async invalidateAllUserCache(userId: string) {
    await cacheUtils.invalidateUserStats(userId);
    await cacheUtils.invalidate(`goals:${userId}:*`);
    await cacheUtils.invalidate(`habits:${userId}:*`);
    await cacheUtils.invalidate(`trading:${userId}:*`);
    
    console.log(`🗑️ [Cache] Invalidated all cache for user ${userId}`);
  }

  /**
   * Invalider le cache après modification de profil/abonnement
   */
  static async invalidateUserProfileCache(userId: string) {
    // Invalider les stats qui dépendent du plan d'abonnement
    await cacheUtils.invalidateUserStats(userId, 'subscription-limits');
    await cacheUtils.invalidateUserStats(userId, 'usage-stats');
    
    console.log(`🗑️ [Cache] Invalidated profile cache for user ${userId}`);
  }
}
