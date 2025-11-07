import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { discordProfile, user } from "@/server/db/schema";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const discordId = searchParams.get("discordId");

        if (!discordId) {
            return NextResponse.json(
                { error: "discordId requis" },
                { status: 400 }
            );
        }

        // Rechercher l'utilisateur par discordId
        const [userData] = await db
            .select({ id: user.id, discordId: discordProfile.discordId })
            .from(user)
            .leftJoin(discordProfile, eq(user.id, discordProfile.userId))
            .where(eq(discordProfile.discordId, discordId))
            .limit(1);

        if (!userData) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            userId: userData.id,
            discordId: userData.discordId,
        });
    } catch (error) {
        console.error("Erreur lors de la recherche utilisateur:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}
