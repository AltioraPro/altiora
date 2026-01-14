import type { Session } from "@/lib/auth";
import type { Database } from "@/server/db";
import type {
    GenerateWebhookTokenInput,
    RegenerateTokenInput,
} from "../validators";

/**
 * Base context for MetaTrader mutations
 */
export interface MetaTraderMutationContext {
    db: Database;
    session: Session;
}

/**
 * Context with input for mutations that require parameters
 */
export interface MetaTraderMutationContextWithInput<T>
    extends MetaTraderMutationContext {
    input: T;
}

// Specific input types
export type GenerateWebhookTokenContext =
    MetaTraderMutationContextWithInput<GenerateWebhookTokenInput>;
export type RegenerateTokenContext =
    MetaTraderMutationContextWithInput<RegenerateTokenInput>;
