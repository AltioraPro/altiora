import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { nanoid } from "nanoid";
import { Pool } from "pg";
import * as schema from "../server/db/schema";

// ============================================
// SEED SCRIPT - Trading Journals & Trades
// ============================================
// Usage: npx tsx scripts/seed-trading-data.ts <userId>
// Example: npx tsx scripts/seed-trading-data.ts user_abc123

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Symbols for trades
const SYMBOLS = [
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "XAUUSD",
    "BTCUSD",
    "NASDAQ",
    "SP500",
    "GBPJPY",
    "AUDUSD",
    "USDCAD",
];

// Exit reasons
const EXIT_REASONS = ["TP", "SL", "BE", "Manual"];

// Generate random number in range
function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

// Generate random date within last N days
function randomDate(daysAgo: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
    );
    return date;
}

// Generate a realistic trade
function generateTrade(
    userId: string,
    journalId: string,
    tradeDate: Date,
    bias: "positive" | "negative" | "neutral"
) {
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    // Bias affects win probability
    let winProbability = 0.5;
    if (bias === "positive") winProbability = 0.65;
    if (bias === "negative") winProbability = 0.35;

    const isWin = Math.random() < winProbability;
    const isBE = !isWin && Math.random() < 0.15; // 15% chance of BE if not a win

    let profitLossPercentage: number;
    let exitReason: string;

    if (isWin) {
        profitLossPercentage = random(0.5, 3.5); // +0.5% to +3.5%
        exitReason = "TP";
    } else if (isBE) {
        profitLossPercentage = random(-0.1, 0.1); // Around 0%
        exitReason = "BE";
    } else {
        profitLossPercentage = random(-2.5, -0.3); // -0.3% to -2.5%
        exitReason = Math.random() < 0.7 ? "SL" : "Manual";
    }

    return {
        id: nanoid(),
        userId,
        journalId,
        tradeDate,
        profitLossPercentage: profitLossPercentage.toFixed(2),
        profitLossAmount: (profitLossPercentage * 100).toFixed(2), // Assuming $10k account
        riskInput: random(0.5, 2).toFixed(1),
        exitReason,
        notes: isWin
            ? "Good setup, followed the plan."
            : isBE
              ? "Moved to BE, price reversed."
              : "Stop hit, market turned.",
        isClosed: true,
        source: "manual",
        syncStatus: "synced",
        createdAt: tradeDate,
        updatedAt: tradeDate,
    };
}

// Journal configurations
const JOURNALS_CONFIG = [
    {
        name: "Forex Main",
        description: "My primary forex trading account focusing on major pairs",
        tradesCount: 85,
        daysSpan: 120,
        bias: "positive" as const,
    },
    {
        name: "Scalping Account",
        description: "Quick scalps on XAUUSD and indices",
        tradesCount: 45,
        daysSpan: 60,
        bias: "positive" as const,
    },
    {
        name: "Swing Trading",
        description: "Longer term positions, 4H and Daily timeframes",
        tradesCount: 25,
        daysSpan: 90,
        bias: "neutral" as const,
    },
    {
        name: "Learning Account",
        description: "Testing new strategies and setups",
        tradesCount: 30,
        daysSpan: 45,
        bias: "negative" as const,
    },
    {
        name: "Crypto Portfolio",
        description: "Bitcoin and altcoin trades",
        tradesCount: 15,
        daysSpan: 60,
        bias: "neutral" as const,
    },
];

async function seed(userId: string) {
    console.log("🌱 Starting seed...");
    console.log(`👤 User ID: ${userId}`);

    const createdJournals: string[] = [];

    for (let i = 0; i < JOURNALS_CONFIG.length; i++) {
        const config = JOURNALS_CONFIG[i];
        const journalId = nanoid();

        console.log(`\n📔 Creating journal: ${config.name}`);

        // Create journal
        await db.insert(schema.tradingJournals).values({
            id: journalId,
            userId,
            name: config.name,
            description: config.description,
            isActive: true,
            order: i,
            startingCapital: "10000",
            usePercentageCalculation: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        createdJournals.push(journalId);

        // Generate trades
        const trades = [];
        for (let t = 0; t < config.tradesCount; t++) {
            const tradeDate = randomDate(config.daysSpan);
            trades.push(
                generateTrade(userId, journalId, tradeDate, config.bias)
            );
        }

        // Sort trades by date
        trades.sort((a, b) => a.tradeDate.getTime() - b.tradeDate.getTime());

        // Insert trades
        if (trades.length > 0) {
            await db.insert(schema.advancedTrades).values(trades);
        }

        // Calculate stats for display
        const totalPnL = trades.reduce(
            (sum, t) => sum + parseFloat(t.profitLossPercentage),
            0
        );
        const wins = trades.filter(
            (t) => parseFloat(t.profitLossPercentage) > 0.1
        ).length;
        const winRate = ((wins / trades.length) * 100).toFixed(1);

        console.log(`   ✅ Created ${trades.length} trades`);
        console.log(
            `   📊 P&L: ${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}%`
        );
        console.log(`   🎯 Win Rate: ${winRate}%`);
    }

    console.log("\n✨ Seed completed!");
    console.log(`📔 Created ${createdJournals.length} journals`);
    console.log(`📝 Journal IDs: ${createdJournals.join(", ")}`);
}

// Main execution
const userId = process.argv[2];

if (!userId) {
    console.log("⚠️  No user ID provided, fetching first user from database...");

    db.query.user
        .findFirst()
        .then((user) => {
            if (!user) {
                console.error("❌ No users found in database");
                process.exit(1);
            }
            console.log(`👤 Found user: ${user.email} (${user.id})`);
            return seed(user.id);
        })
        .then(() => {
            console.log("\n🎉 Done!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Error:", error);
            process.exit(1);
        });
} else {
    seed(userId)
        .then(() => {
            console.log("\n🎉 Done!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Error:", error);
            process.exit(1);
        });
}
