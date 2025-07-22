import { type db } from "@/server/db";
import { type Session } from "@/lib/auth";

export interface AuthMutationContext<T> {
  input: T;
  db: typeof db;
  session: Session | null;
} 