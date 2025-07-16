import { type Database } from "@/server/db";

export interface AuthMutationContext<T> {
  input: T;
  db: Database;
  session: {
    userId: string;
  } | null;
} 