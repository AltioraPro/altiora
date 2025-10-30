import type { Session } from "@/lib/auth";
import type { db } from "@/server/db";

export interface AuthMutationContext<T> {
    input: T;
    db: typeof db;
    session: Session | null;
}
