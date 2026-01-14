import type { Session } from "@/lib/auth";
import type { Database } from "@/server/db";
import type { GetSetupInfoInput } from "../validators";

/**
 * Base context for MetaTrader queries
 */
export interface MetaTraderQueryContext {
    db: Database;
    session: Session;
}

/**
 * Context with input for queries that require parameters
 */
export interface MetaTraderQueryContextWithInput<T>
    extends MetaTraderQueryContext {
    input: T;
}

// Specific input types
export type GetSetupInfoContext =
    MetaTraderQueryContextWithInput<GetSetupInfoInput>;
