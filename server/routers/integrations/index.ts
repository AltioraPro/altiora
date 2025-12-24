import { z } from "zod";
import { base } from "@/server/context";
import { db } from "@/server/db";
import { brokerConnections } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { ctraderRouter } from "./ctrader";

console.log("[IntegrationsRouter] Loading...");

/**
 * Main integrations router
 * Aggregates all broker integration routers
 */
export const integrationsRouter = base.router({
	ctrader: ctraderRouter,
	
	/*
	 * Get broker connection for a journal
	 */
	getBrokerConnection: base
		.input(
			z.object({
				journalId: z.string(),
			}),
		)
		.route({ method: "GET" })
		.handler(async ({ input, context }) => {
			try {
				if (!context.session?.user) {
					console.warn("[getBrokerConnection] Unauthorized access attempt");
					return null;
				}

				console.log("[getBrokerConnection] Input:", input);
				console.log("[getBrokerConnection] User:", context.session.user.id);
				
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

				const connection = connections[0] || null;

				console.log("[getBrokerConnection] Finding connection result:", connection ? "FOUND" : "NOT FOUND");
				return connection;
			} catch (error) {
				console.error("[getBrokerConnection] CRITICAL ERROR:", error);
				return null; 
			}
		}),
	
	// metatrader: metatraderRouter, // To be added in Week 3
});
