import { ORPCError, onError, ValidationError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import {
    BatchHandlerPlugin,
    StrictGetMethodPlugin,
} from "@orpc/server/plugins";
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/server/db";
import { appRouter } from "@/server/routers/_app";

const orpcHandler = new RPCHandler(appRouter, {
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

const app = new Elysia({ prefix: "/api/rpc" }).all(
    "*",
    async ({ request }: { request: Request }) => {
        const { response } = await orpcHandler.handle(request, {
            prefix: "/api/rpc",
            context: {
                headers: request.headers,
                db,
            },
        });

        return response ?? new Response("Not found", { status: 404 });
    },
    {
        parse: "none", // Disable Elysia body parser to prevent "body already used" error
    }
);

export const HEAD = app.fetch;
export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;
