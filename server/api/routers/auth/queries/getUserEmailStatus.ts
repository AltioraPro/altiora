import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

interface GetUserEmailStatusParams {
  email: string;
}

export async function getUserEmailStatus({ email }: GetUserEmailStatusParams) {
  const user = await db.select({
    id: users.id,
    email: users.email,
    emailVerified: users.emailVerified,
  }).from(users).where(eq(users.email, email)).limit(1);

  if (!user.length) {
    return { exists: false, emailVerified: false };
  }

  return {
    exists: true,
    emailVerified: user[0].emailVerified,
    userId: user[0].id,
  };
} 