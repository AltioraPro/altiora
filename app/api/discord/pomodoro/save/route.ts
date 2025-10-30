import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { discordPomodoroSessions } from "@/server/db/schema";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            discordId,
            channelId,
            duration,
            workTime,
            breakTime,
            format,
            status,
            totalWorkTime,
            totalBreakTime,
            endedAt,
            sessionId, // ID de la session à mettre à jour (si existe)
        } = body;

        // Validation des données requises
        if (
            !(userId && discordId && channelId) ||
            duration === undefined ||
            workTime === undefined ||
            breakTime === undefined ||
            !format
        ) {
            return NextResponse.json(
                { error: "Données manquantes requises" },
                { status: 400 }
            );
        }

        const sessionData = {
            userId,
            discordId,
            channelId,
            duration: Number.parseInt(duration),
            workTime: Number.parseInt(workTime),
            breakTime: Number.parseInt(breakTime),
            format,
            status: status || "completed",
            totalWorkTime: Number.parseInt(totalWorkTime) || 0,
            totalBreakTime: Number.parseInt(totalBreakTime) || 0,
            endedAt: endedAt ? new Date(endedAt) : new Date(),
            updatedAt: new Date(),
        };

        let result;

        // Si on a un sessionId, on met à jour la session existante
        if (sessionId) {
            [result] = await db
                .update(discordPomodoroSessions)
                .set(sessionData)
                .where(eq(discordPomodoroSessions.id, sessionId))
                .returning();

            if (!result) {
                return NextResponse.json(
                    { error: "Session not found" },
                    { status: 404 }
                );
            }
        } else {
            // Sinon, on crée une nouvelle session
            [result] = await db
                .insert(discordPomodoroSessions)
                .values({
                    id: crypto.randomUUID(),
                    ...sessionData,
                })
                .returning();
        }

        return NextResponse.json({
            success: true,
            sessionId: result.id,
            message: "Session Pomodoro sauvegardée avec succès",
        });
    } catch (error) {
        console.error(
            "Erreur lors de la sauvegarde de la session Pomodoro:",
            error
        );
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}
