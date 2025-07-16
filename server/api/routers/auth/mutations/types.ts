import { type db } from "@/server/db";

export interface AuthMutationContext<T> {
  input: T;
  db: typeof db;
  session: {
    userId: string;
  } | null;
} 