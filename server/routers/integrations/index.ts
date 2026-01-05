import { z } from "zod";
import { base } from "@/server/context";
import { db } from "@/server/db";
import { brokerConnections } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { ctraderRouter } from "./ctrader";
import { metatraderRouter } from "./metatrader";

/**
 * Main integrations router
 * Aggregates all broker integration routers
 */
export const integrationsRouter = base.router({
	ctrader: ctraderRouter,
	metatrader: metatraderRouter,
	
	/**
	 * Get broker connection for a journal
	 */
	getBrokerConnection: base
		.input(z.object({ journalId: z.string() }))
		.route({ method: "GET" })
		.handler(async ({ input, context }) => {
			if (!context.session?.user) {
				return null;
			}

			const connections = await db
				.select()
				.from(brokerConnections)
				.where(
					and(
						eq(brokerConnections.userId, context.session.user.id),
						eq(brokerConnections.journalId, input.journalId),
						eq(brokerConnections.isActive, true)
					)
				)
				.limit(1);

			return connections[0] || null;
		}),

	/**
	 * Disconnect broker from a journal
	 */
	disconnectBroker: base
		.input(z.object({ journalId: z.string() }))
		.handler(async ({ input, context }) => {
			if (!context.session?.user) {
				throw new Error("Unauthorized");
			}

			await db
				.update(brokerConnections)
				.set({ 
					isActive: false,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(brokerConnections.userId, context.session.user.id),
						eq(brokerConnections.journalId, input.journalId),
						eq(brokerConnections.isActive, true)
					)
				);

			return { success: true };
		}),
});

