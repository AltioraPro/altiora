import { NextRequest, NextResponse } from "next/server";
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
      currentPhase,
      phaseStartTime,
    } = body;

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
      id: crypto.randomUUID(),
      userId,
      discordId,
      channelId,
      duration: parseInt(duration),
      workTime: parseInt(workTime),
      breakTime: parseInt(breakTime),
      format,
      status: status || "active",
      currentPhase: currentPhase || "work",
      phaseStartTime: phaseStartTime ? new Date(phaseStartTime) : new Date(),
      totalWorkTime: 0,
      totalBreakTime: 0,
    };

    const [newSession] = await db
      .insert(discordPomodoroSessions)
      .values(sessionData)
      .returning();

    return NextResponse.json({
      success: true,
      sessionId: newSession.id,
      message: "Session Pomodoro démarrée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du démarrage de la session Pomodoro:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
