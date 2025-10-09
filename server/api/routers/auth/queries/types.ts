import { type db } from "@/server/db";
import { Session } from "better-auth";

export interface AuthQueryContext {
	db: typeof db;
	session: Session;
}

export interface AuthQueryContextWithInput<T> extends AuthQueryContext {
	input: T;
}
