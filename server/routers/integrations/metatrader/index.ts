import { z } from "zod";
import { base } from "@/server/context";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import {
	generateWebhookTokenSchema,
	getSetupInfoSchema,
	regenerateTokenSchema,
} from "./validators";
import { getSetupInfo } from "./queries";
import { generateWebhookToken, regenerateToken, disconnect } from "./mutations";

/**
 * MetaTrader Integration Router
 * Handles webhook token generation and connection management for MT4/MT5 EAs
 */
export const metatraderRouter = base.router({
	/**
	 * Get setup information for MetaTrader integration
	 * Returns webhook token and instructions if connection exists
	 */
	getSetupInfo: protectedProcedure
		.input(getSetupInfoSchema)
		.route({ method: "GET" })
		.handler(async ({ context, input }) => {
			const { db, session } = context;
			if (!session?.user) {
				throw new Error("Unauthorized");
			}
			return await getSetupInfo({ db, session, input });
		}),

	/**
	 * Generate a new webhook token for MetaTrader integration
	 * Creates a broker connection if none exists
	 */
	generateToken: protectedProcedure
		.input(generateWebhookTokenSchema)
		.route({ method: "POST" })
		.handler(async ({ context, input }) => {
			const { db, session } = context;
			if (!session?.user) {
				throw new Error("Unauthorized");
			}
			return await generateWebhookToken({ db, session, input });
		}),

	/**
	 * Regenerate webhook token (invalidates old token)
	 */
	regenerateToken: protectedProcedure
		.input(regenerateTokenSchema)
		.route({ method: "POST" })
		.handler(async ({ context, input }) => {
			const { db, session } = context;
			if (!session?.user) {
				throw new Error("Unauthorized");
			}
			return await regenerateToken({ db, session, input });
		}),

	/**
	 * Disconnect MetaTrader integration
	 */
	disconnect: protectedProcedure
		.input(z.object({ journalId: z.string() }))
		.route({ method: "POST" })
		.handler(async ({ context, input }) => {
			const { db, session } = context;
			if (!session?.user) {
				throw new Error("Unauthorized");
			}
			return await disconnect({ db, session, input });
		}),
});
