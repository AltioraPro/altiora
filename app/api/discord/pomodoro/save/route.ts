import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { discordPomodoroSessions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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
    } = body;

    // Validation des données requises
    if (
      !userId ||
      !discordId ||
      !channelId ||
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
      duration: parseInt(duration),
      workTime: parseInt(workTime),
      breakTime: parseInt(breakTime),
      format,
      status: status || "completed",
      totalWorkTime: parseInt(totalWorkTime) || 0,
      totalBreakTime: parseInt(totalBreakTime) || 0,
      endedAt: endedAt ? new Date(endedAt) : new Date(),
      updatedAt: new Date(),
    };

    const existingSession = await db
      .select()
      .from(discordPomodoroSessions)
      .where(eq(discordPomodoroSessions.discordId, discordId))
      .limit(1);

    let result;
    if (existingSession.length > 0) {
      [result] = await db
        .update(discordPomodoroSessions)
        .set(sessionData)
        .where(eq(discordPomodoroSessions.id, existingSession[0].id))
        .returning();
    } else {
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
