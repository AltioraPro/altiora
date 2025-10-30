import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";

interface GetUserEmailStatusParams {
    email: string;
}

export async function getUserEmailStatus({ email }: GetUserEmailStatusParams) {
    const [userData] = await db
        .select({
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
        })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

    if (!userData) {
        return { exists: false, emailVerified: false };
    }

    return {
        exists: true,
        emailVerified: userData.emailVerified,
        userId: userData.id,
    };
}
