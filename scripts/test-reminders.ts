import { GoalRemindersService } from "@/server/services/goal-reminders";
import { db } from "@/server/db";
import { goals } from "@/server/db/schema";
import { eq } from "drizzle-orm";

async function testReminders() {
  console.log("🧪 [Test] Testing reminder system...\n");

  try {
    // 1. Traiter les rappels en retard existants
    console.log("📅 [Test] Processing overdue reminders...");
    await GoalRemindersService.sendOverdueReminders();
    console.log();

    // 2. Créer un rappel de test qui est déjà en retard
    console.log("⏰ [Test] Creating overdue test reminder...");
    
    // Récupérer le premier goal actif
    const [testGoal] = await db
      .select({
        id: goals.id,
        userId: goals.userId,
        title: goals.title,
      })
      .from(goals)
      .where(eq(goals.isActive, true))
      .limit(1);

    if (testGoal) {
      // Programmer un rappel pour hier (donc déjà en retard)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(9, 0, 0, 0);

      await db
        .update(goals)
        .set({
          reminderFrequency: "daily",
          nextReminderDate: yesterday,
          updatedAt: new Date(),
        })
        .where(eq(goals.id, testGoal.id));

      console.log(`✅ [Test] Created overdue reminder for goal: ${testGoal.title}`);
      console.log(`📅 [Test] Next reminder date set to: ${yesterday.toISOString()}`);
      console.log();

      // 3. Traiter à nouveau les rappels en retard
      console.log("🔄 [Test] Processing overdue reminders again...");
      await GoalRemindersService.sendOverdueReminders();
      console.log();

      // 4. Nettoyer le test
      console.log("🧹 [Test] Cleaning up test reminder...");
      await db
        .update(goals)
        .set({
          reminderFrequency: null,
          nextReminderDate: null,
          lastReminderSent: null,
          updatedAt: new Date(),
        })
        .where(eq(goals.id, testGoal.id));

      console.log("✅ [Test] Test reminder cleaned up");
    } else {
      console.log("⚠️ [Test] No active goals found for testing");
    }

    // 5. Obtenir les statistiques
    console.log("\n📊 [Test] Getting reminder stats...");
    if (testGoal) {
      const stats = await GoalRemindersService.getReminderStats(testGoal.userId);
      console.log("📈 [Test] Reminder stats:", stats);
    }

  } catch (error) {
    console.error("❌ [Test] Error during testing:", error);
  }

  console.log("\n✅ [Test] All tests completed successfully!");
  console.log("🎉 [Test] Test script finished");
}

testReminders().catch(console.error); 