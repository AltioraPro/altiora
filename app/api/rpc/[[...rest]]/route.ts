import { ORPCError, onError, ValidationError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import {
    BatchHandlerPlugin,
    StrictGetMethodPlugin,
} from "@orpc/server/plugins";
import z from "zod";
import { db } from "@/server/db";
import { appRouter } from "@/server/routers/_app";
import { auth } from "@/lib/auth";

const handler = new RPCHandler(appRouter, {
    plugins: [new StrictGetMethodPlugin(), new BatchHandlerPlugin()],
    clientInterceptors: [
        onError((error) => {
            if (
                error instanceof ORPCError &&
                error.code === "BAD_REQUEST" &&
                error.data.cause instanceof ValidationError
            ) {
                const zodError = new z.ZodError(
                    error.data.cause.issues as z.core.$ZodIssue[]
                );

                throw new ORPCError("INPUT_VALIDATION_FAILED", {
                    status: 422,
                    message: z.prettifyError(zodError),
                    data: z.flattenError(zodError),
                    cause: error.data.cause,
                });
            }
        }),
    ],
});

async function handleRequest(request: Request) {
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: request.headers
        });
    } catch (e) {
        // Failed to get session, not fatal for public endpoints
        console.error("Failed to retrieve session in RPC handler", e);
    }

    const { response } = await handler.handle(request, {
        prefix: "/api/rpc",
        context: {
            headers: request.headers,
            db,
            session,
        },
    });

    return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
