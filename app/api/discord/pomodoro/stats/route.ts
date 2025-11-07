import { and, desc, eq, gte } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { discordPomodoroSessions } from "@/server/db/schema";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const discordId = searchParams.get("discordId");
        const userId = searchParams.get("userId") as string;
        const days = Number.parseInt(searchParams.get("days") || "30", 10);

        if (!(discordId || userId)) {
            return NextResponse.json(
                { error: "discordId ou userId requis" },
                { status: 400 }
            );
        }

        // Calculer la date de début
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Construire la condition WHERE
        const whereCondition = and(
            discordId
                ? eq(discordPomodoroSessions.discordId, discordId)
                : eq(discordPomodoroSessions.userId, userId),
            gte(discordPomodoroSessions.startedAt, startDate)
        );

        // Récupérer les sessions
        const sessions = await db
            .select()
            .from(discordPomodoroSessions)
            .where(whereCondition)
            .orderBy(desc(discordPomodoroSessions.startedAt));

        // Calculer les statistiques
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(
            (s) => s.status === "completed"
        ).length;
        const cancelledSessions = sessions.filter(
            (s) => s.status === "cancelled"
        ).length;

        const totalWorkTime = sessions.reduce(
            (sum, s) => sum + (s.totalWorkTime || 0),
            0
        );
        const totalBreakTime = sessions.reduce(
            (sum, s) => sum + (s.totalBreakTime || 0),
            0
        );

        // Statistiques par format
        const formatStats = sessions.reduce(
            (acc, session) => {
                const format = session.format;
                if (!acc[format]) {
                    acc[format] = { count: 0, workTime: 0, breakTime: 0 };
                }
                acc[format].count++;
                acc[format].workTime += session.totalWorkTime || 0;
                acc[format].breakTime += session.totalBreakTime || 0;
                return acc;
            },
            {} as Record<
                string,
                { count: number; workTime: number; breakTime: number }
            >
        );

        // Sessions récentes (dernières 10)
        const recentSessions = sessions.slice(0, 10).map((session) => ({
            id: session.id,
            format: session.format,
            duration: session.duration,
            status: session.status,
            totalWorkTime: session.totalWorkTime,
            totalBreakTime: session.totalBreakTime,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
        }));

        const stats = {
            period: `${days} derniers jours`,
            totalSessions,
            completedSessions,
            cancelledSessions,
            completionRate:
                totalSessions > 0
                    ? Math.round((completedSessions / totalSessions) * 100)
                    : 0,
            totalWorkTime,
            totalBreakTime,
            averageWorkTime:
                completedSessions > 0
                    ? Math.round(totalWorkTime / completedSessions)
                    : 0,
            averageBreakTime:
                completedSessions > 0
                    ? Math.round(totalBreakTime / completedSessions)
                    : 0,
            formatStats,
            recentSessions,
        };

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des statistiques Pomodoro:",
            error
        );
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}
