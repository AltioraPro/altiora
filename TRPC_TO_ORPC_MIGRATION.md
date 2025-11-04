# tRPC to oRPC Migration Guide

This guide outlines the process for migrating routers from tRPC to oRPC based on the auth router migration.

## Directory Structure

### Old Structure (tRPC)
```
server/api/routers/[router-name]/
├── router.ts
├── validators.ts
├── queries/
│   ├── index.ts
│   ├── [query-name].ts
│   └── types.ts
└── mutations/
    ├── index.ts
    ├── [mutation-name].ts
    └── types.ts
```

### New Structure (oRPC)
```
server/routers/[router-name]/
├── router.ts
├── validators.ts
├── queries/
│   └── [query-name].ts
└── mutations/
    ├── index.ts
    └── [mutation-name].ts
```

## Migration Steps

### 1. Create Validators File

**Old (tRPC):**
```typescript
// server/api/routers/auth/validators.ts
import { z } from "zod";

export const mySchema = z.object({
    field: z.string().email(),
});

export type MyInput = z.infer<typeof mySchema>;
```

**New (oRPC):**
```typescript
// server/routers/auth/validators.ts
import { z } from "zod";

export const mySchema = z.object({
    field: z.email(), // Use the newer z.email() syntax
});

export type MyInput = z.infer<typeof mySchema>;
```

### 2. Migrate Query Handlers

**Old (tRPC):**
```typescript
// server/api/routers/auth/queries/getUser.ts
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";

interface GetUserParams {
    userId: string;
}

export async function getUser({ userId }: GetUserParams) {
    const userData = await db.query.user.findFirst({
        where: eq(user.id, userId),
    });

    if (!userData) {
        throw new Error("User not found");
    }

    return userData;
}
```

**New (oRPC):**
```typescript
// server/routers/auth/queries/get-user.ts
import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
// or publicProcedure for public queries
import { getUserSchema } from "../validators";

// Export the base with input schema (if needed)
export const getUserBase = protectedProcedure.input(getUserSchema);

// Export the handler
export const getUserHandler = getUserBase.handler(async ({ context, input }) => {
    const { db } = context;
    const { userId } = input;

    const userData = await db.query.user.findFirst({
        where: eq(user.id, userId),
    });

    if (!userData) {
        throw new ORPCError("NOT_FOUND", {
            message: "User not found",
        });
    }

    return userData;
});
```

**For queries without input:**
```typescript
// server/routers/auth/queries/get-me.ts
import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";

export const getMeBase = protectedProcedure;

export const getMeHandler = getMeBase.handler(async ({ context }) => {
    const { db, session } = context;

    const currentUser = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
    });

    if (!currentUser) {
        throw new ORPCError("NOT_FOUND", {
            message: "User not found",
        });
    }

    return currentUser;
});
```

### 3. Migrate Mutation Handlers

**Old (tRPC):**
```typescript
// server/api/routers/auth/mutations/updateProfile.ts
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "@/server/db/schema";
import type { AuthMutationContext } from "./types";

export async function updateProfile(
    { db, session }: AuthMutationContext<z.infer<typeof updateProfileSchema>>,
    input: z.infer<typeof updateProfileSchema>
) {
    if (!session?.user?.id) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
        });
    }

    const [updatedUser] = await db
        .update(user)
        .set({ name: input.name })
        .where(eq(user.id, session.user.id))
        .returning();

    if (!updatedUser) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
        });
    }

    return updatedUser;
}
```

**New (oRPC):**
```typescript
// server/routers/auth/mutations/update-profile.ts
import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { updateProfileSchema } from "../validators";

export const updateProfileBase = protectedProcedure.input(updateProfileSchema);

export const updateProfileHandler = updateProfileBase.handler(
    async ({ context, input }) => {
        const { db, session } = context;
        const { name } = input;

        const [updatedUser] = await db
            .update(user)
            .set({ name, updatedAt: new Date() })
            .where(eq(user.id, session.user.id))
            .returning();

        if (!updatedUser) {
            throw new ORPCError("NOT_FOUND", {
                message: "User not found",
            });
        }

        return updatedUser;
    }
);
```

### 4. Create Mutations Index

```typescript
// server/routers/auth/mutations/index.ts
export * from "./send-verification-email";
export * from "./sync-user";
export * from "./update-leaderboard-visibility";
export * from "./update-profile";
export * from "./update-rank";
export * from "./verify-email";
```

### 5. Migrate Router

**Old (tRPC):**
```typescript
// server/api/routers/auth/router.ts
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import { updateProfile, syncUser } from "./mutations";
import { getCurrentUser } from "./queries";
import {
    updateProfileSchema,
    syncUserSchema,
} from "./validators";

export const authRouter = createTRPCRouter({
    getCurrentUser: protectedProcedure
        .query(async ({ ctx }) => {
            return await getCurrentUser({ userId: ctx.session.user.id });
        }),

    updateProfile: protectedProcedure
        .input(updateProfileSchema)
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            return await updateProfile({ db, session, input }, input);
        }),

    syncUser: publicProcedure
        .input(syncUserSchema)
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            return await syncUser({ input, db, session });
        }),
});
```

**New (oRPC):**
```typescript
// server/routers/auth/router.ts
import { call } from "@orpc/server";
import { base } from "@/server/context";
import { getMeBase, getMeHandler } from "./queries/get-me";
import {
    updateProfileBase,
    updateProfileHandler,
    syncUserBase,
    syncUserHandler,
} from "./mutations";

export const authRouter = base.router({
    // Queries
    getCurrentUser: getMeBase
        .route({ method: "GET" })
        .handler(
            async ({ context }) =>
                await call(getMeHandler, undefined, { context })
        ),

    // Mutations
    updateProfile: updateProfileBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(updateProfileHandler, input, { context })
        ),

    syncUser: syncUserBase
        .route({ method: "POST" })
        .handler(
            async ({ context, input }) =>
                await call(syncUserHandler, input, { context })
        ),
});
```

## Key Changes Checklist

### Imports
- [ ] Replace `TRPCError` → `ORPCError` from `@orpc/client`
- [ ] Replace `createTRPCRouter` → `base.router()` from `@/server/context`
- [ ] Replace `protectedProcedure/publicProcedure` from `@/server/api/trpc` → from `@/server/procedure/[procedure-name].procedure`
- [ ] Add `import { call } from "@orpc/server"` in router

### Error Handling
```typescript
// Old (tRPC)
throw new TRPCError({
    code: "NOT_FOUND",
    message: "User not found",
});

// New (oRPC)
throw new ORPCError("NOT_FOUND", {
    message: "User not found",
});
```

### Session Access
```typescript
// Old (tRPC)
session.user.id

// New (oRPC)
session.user.id
```

### Handler Structure
```typescript
// Old (tRPC) - Direct function
export async function myHandler({ db, session }, input) { }

// New (oRPC) - Base + Handler pattern
export const myBase = protectedProcedure.input(mySchema);
export const myHandler = myBase.handler(async ({ context, input }) => { });
```

### Router Definitions
```typescript
// Old (tRPC)
myEndpoint: protectedProcedure
    .input(mySchema)
    .query(async ({ ctx, input }) => { })

// New (oRPC) - Queries
myEndpoint: myBase
    .route({ method: "GET" })
    .handler(async ({ context, input }) =>
        await call(myHandler, input, { context })
    )

// Old (tRPC)
myEndpoint: protectedProcedure
    .input(mySchema)
    .mutation(async ({ ctx, input }) => { })

// New (oRPC) - Mutations
myEndpoint: myBase
    .route({ method: "POST" })
    .handler(async ({ context, input }) =>
        await call(myHandler, input, { context })
    )
```

### For endpoints without input
```typescript
// New (oRPC)
getCurrentUser: getMeBase
    .route({ method: "GET" })
    .handler(
        async ({ context }) =>
            await call(getMeHandler, undefined, { context })
    )
```

## Common Error Codes Mapping

| tRPC Code | oRPC Code |
|-----------|-----------|
| `UNAUTHORIZED` | `UNAUTHORIZED` |
| `NOT_FOUND` | `NOT_FOUND` |
| `BAD_REQUEST` | `BAD_REQUEST` |
| `INTERNAL_SERVER_ERROR` | `INTERNAL_SERVER_ERROR` |
| `FORBIDDEN` | `FORBIDDEN` |
| `CONFLICT` | `CONFLICT` |

## File Naming Convention

- Use kebab-case for file names: `get-user-email-status.ts` instead of `getUserEmailStatus.ts`
- Keep the same pattern: queries and mutations in separate folders
- Export both `[name]Base` and `[name]Handler` from each handler file

## Database Access

The database is accessed via `context.db` instead of importing it directly:

```typescript
// Old (tRPC)
import { db } from "@/server/db";

// New (oRPC)
const { db } = context;
```

## Notes

- The `context` object in oRPC handlers contains `db`, `session`, and any other context properties
- Always export both the `base` and `handler` for each endpoint
- Use `call()` to invoke handlers in the router
- Protected procedures automatically have session available in context
- Public procedures may or may not have session (check if it exists)
