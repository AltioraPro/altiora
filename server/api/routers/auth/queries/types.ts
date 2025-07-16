import { type db } from "@/server/db";

export interface AuthQueryContext {
  db: typeof db;
  session: {
    userId: string;
  } | null;
}

export interface AuthQueryContextWithInput<T> extends AuthQueryContext {
  input: T;
} 