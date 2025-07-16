import { type Database } from "@/server/db";

export interface AuthQueryContext {
  db: Database;
  session: {
    userId: string;
  } | null;
}

export interface AuthQueryContextWithInput<T> extends AuthQueryContext {
  input: T;
} 