# Waitlist System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a waitlist system that redirects auth pages, collects emails, stores them in DB + Resend, and provides admin management.

**Architecture:** Middleware-based redirection with env toggle. Public ORPC procedure for joining waitlist. Admin procedures for listing/deleting entries. Email templates using existing React Email components.

**Tech Stack:** Next.js 16, Drizzle ORM, ORPC, Resend, TanStack Table, React Hook Form + Zod

---

## Task 1: Environment Variables

**Files:**
- Modify: `env.ts`

**Step 1: Add waitlist environment variables**

In `env.ts`, add to the `server` object:

```typescript
// After BLOB_READ_WRITE_TOKEN line (around line 49)
WAITLIST_ENABLED: z.enum(["true", "false"]).optional(),
RESEND_WAITLIST_AUDIENCE_ID: z.string().min(1).optional(),
```

**Step 2: Commit**

```bash
git add env.ts
git commit -m "$(cat <<'EOF'
feat(waitlist): add environment variables for waitlist system

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Database Schema

**Files:**
- Create: `server/db/schema/waitlist/schema.ts`
- Create: `server/db/schema/waitlist/index.ts`
- Modify: `server/db/schema/index.ts`

**Step 1: Create waitlist schema**

Create `server/db/schema/waitlist/schema.ts`:

```typescript
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const waitlist = pgTable("waitlist", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    email: text("email").notNull().unique(),
    firstName: text("first_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
```

**Step 2: Create index export**

Create `server/db/schema/waitlist/index.ts`:

```typescript
export * from "./schema";
```

**Step 3: Add to main schema index**

In `server/db/schema/index.ts`, add at the end:

```typescript
export * from "./waitlist";
```

**Step 4: Generate migration**

Run: `bun drizzle-kit generate`

**Step 5: Run migration**

Run: `bun drizzle-kit migrate`

**Step 6: Commit**

```bash
git add server/db/schema/waitlist/ server/db/schema/index.ts drizzle/
git commit -m "$(cat <<'EOF'
feat(waitlist): add database schema and migration

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Email Templates

**Files:**
- Create: `emails/waitlist-confirmation.tsx`
- Create: `emails/waitlist-beta-launch.tsx`

**Step 1: Create confirmation email template**

Create `emails/waitlist-confirmation.tsx`:

```typescript
import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";

interface WaitlistConfirmationProps {
    firstName: string;
}

export default function WaitlistConfirmationTemplate({
    firstName,
}: WaitlistConfirmationProps) {
    return (
        <EmailLayout previewText="Bienvenue sur la waitlist Altiora !">
            <div className="flex w-full items-center justify-center">
                <Logomark />
            </div>

            <Card>
                <EmailHeading>Bienvenue sur la waitlist !</EmailHeading>
                <EmailText>Salut {firstName},</EmailText>
                <EmailText>
                    Merci de ton intérêt pour Altiora ! Tu es maintenant sur la
                    liste d&apos;attente.
                </EmailText>
                <EmailText>
                    On te préviendra dès que la beta sera ouverte.
                </EmailText>
            </Card>

            <EmailFooter />
        </EmailLayout>
    );
}

WaitlistConfirmationTemplate.PreviewProps = {
    firstName: "Thomas",
} as WaitlistConfirmationProps;
```

**Step 2: Create beta launch email template**

Create `emails/waitlist-beta-launch.tsx`:

```typescript
import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";

interface WaitlistBetaLaunchProps {
    firstName: string;
}

export default function WaitlistBetaLaunchTemplate({
    firstName,
}: WaitlistBetaLaunchProps) {
    return (
        <EmailLayout previewText="La beta Altiora est ouverte !">
            <div className="flex w-full items-center justify-center">
                <Logomark />
            </div>

            <Card>
                <EmailHeading>La beta est ouverte !</EmailHeading>
                <EmailText>Salut {firstName},</EmailText>
                <EmailText>
                    L&apos;attente est terminée ! Tu peux maintenant créer ton
                    compte sur Altiora.
                </EmailText>
                <EmailText className="font-medium">Ce qui t&apos;attend :</EmailText>
                <ul className="list-disc pl-6 text-neutral-300">
                    <li>Suivi de tes trades avec analytics détaillés</li>
                    <li>Journal de trading personnalisé</li>
                    <li>Objectifs et habitudes pour progresser</li>
                </ul>

                <EmailButton href="https://altiora.pro/register">
                    Créer mon compte
                </EmailButton>
            </Card>

            <EmailFooter />
        </EmailLayout>
    );
}

WaitlistBetaLaunchTemplate.PreviewProps = {
    firstName: "Thomas",
} as WaitlistBetaLaunchProps;
```

**Step 3: Commit**

```bash
git add emails/waitlist-confirmation.tsx emails/waitlist-beta-launch.tsx
git commit -m "$(cat <<'EOF'
feat(waitlist): add email templates for confirmation and beta launch

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: ORPC Procedures

**Files:**
- Create: `server/routers/waitlist/validators.ts`
- Create: `server/routers/waitlist/mutations/join-waitlist.ts`
- Create: `server/routers/waitlist/mutations/delete-waitlist.ts`
- Create: `server/routers/waitlist/mutations/index.ts`
- Create: `server/routers/waitlist/queries/list-waitlist.ts`
- Create: `server/routers/waitlist/queries/index.ts`
- Create: `server/routers/waitlist/router.ts`
- Modify: `orpc/router.ts` (add waitlist router)

**Step 1: Create validators**

Create `server/routers/waitlist/validators.ts`:

```typescript
import { z } from "zod";

export const joinWaitlistSchema = z.object({
    email: z.string().email("Email invalide"),
    firstName: z.string().min(1, "Prénom requis").max(100, "Prénom trop long"),
});

export const listWaitlistSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().min(1).max(100).default(25),
    sortBy: z.enum(["email", "firstName", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().nullable(),
});

export const deleteWaitlistSchema = z.object({
    ids: z.array(z.string()).min(1),
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
export type ListWaitlistInput = z.infer<typeof listWaitlistSchema>;
export type DeleteWaitlistInput = z.infer<typeof deleteWaitlistSchema>;
```

**Step 2: Create join mutation**

Create `server/routers/waitlist/mutations/join-waitlist.ts`:

```typescript
import { render } from "@react-email/components";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { resend } from "@/lib/resend";
import { waitlist } from "@/server/db/schema";
import { publicProcedure } from "@/server/procedure/public.procedure";
import WaitlistConfirmationTemplate from "@/emails/waitlist-confirmation";
import { joinWaitlistSchema } from "../validators";

export const joinWaitlistBase = publicProcedure.input(joinWaitlistSchema);

export const joinWaitlistHandler = joinWaitlistBase.handler(
    async ({ input, context }) => {
        const { db } = context;

        // Check if email already exists
        const existing = await db
            .select({ id: waitlist.id })
            .from(waitlist)
            .where(eq(waitlist.email, input.email.toLowerCase()))
            .limit(1);

        if (existing.length > 0) {
            return { success: true, alreadyExists: true };
        }

        // Insert into database
        await db.insert(waitlist).values({
            email: input.email.toLowerCase(),
            firstName: input.firstName,
        });

        // Add to Resend audience (non-blocking)
        const audienceId = env.RESEND_WAITLIST_AUDIENCE_ID;
        if (audienceId) {
            resend.contacts
                .create({
                    audienceId,
                    email: input.email.toLowerCase(),
                    firstName: input.firstName,
                    unsubscribed: false,
                })
                .catch((error) => {
                    console.error("Failed to add contact to Resend:", error);
                });
        }

        // Send confirmation email
        const html = await render(
            WaitlistConfirmationTemplate({ firstName: input.firstName })
        );

        await resend.emails.send({
            from: "Altiora <noreply@altiora.pro>",
            to: input.email,
            subject: "Bienvenue sur la waitlist Altiora !",
            html,
        });

        return { success: true, alreadyExists: false };
    }
);
```

**Step 3: Create delete mutation**

Create `server/routers/waitlist/mutations/delete-waitlist.ts`:

```typescript
import { inArray } from "drizzle-orm";
import { waitlist } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { deleteWaitlistSchema } from "../validators";

export const deleteWaitlistBase = protectedProcedure.input(deleteWaitlistSchema);

export const deleteWaitlistHandler = deleteWaitlistBase.handler(
    async ({ input, context }) => {
        const { db } = context;

        await db.delete(waitlist).where(inArray(waitlist.id, input.ids));

        return { success: true, deletedCount: input.ids.length };
    }
);
```

**Step 4: Create mutations index**

Create `server/routers/waitlist/mutations/index.ts`:

```typescript
export * from "./join-waitlist";
export * from "./delete-waitlist";
```

**Step 5: Create list query**

Create `server/routers/waitlist/queries/list-waitlist.ts`:

```typescript
import { and, asc, desc, ilike, or, type SQL, sql } from "drizzle-orm";
import { waitlist } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedure/protected.procedure";
import { listWaitlistSchema } from "../validators";

export const listWaitlistBase = protectedProcedure.input(listWaitlistSchema);

export const listWaitlistHandler = listWaitlistBase.handler(
    async ({ input, context }) => {
        const { db } = context;

        const filters: SQL[] = [];

        if (input.search) {
            const pattern = `%${input.search}%`;
            const searchCondition = or(
                ilike(waitlist.email, pattern),
                ilike(waitlist.firstName, pattern)
            );
            if (searchCondition) {
                filters.push(searchCondition);
            }
        }

        const whereCondition = filters.length > 0 ? and(...filters) : undefined;

        const sortDirection = input.sortOrder === "asc" ? asc : desc;
        let sortColumn:
            | typeof waitlist.email
            | typeof waitlist.firstName
            | typeof waitlist.createdAt;
        switch (input.sortBy) {
            case "email":
                sortColumn = waitlist.email;
                break;
            case "firstName":
                sortColumn = waitlist.firstName;
                break;
            default:
                sortColumn = waitlist.createdAt;
                break;
        }

        const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(waitlist)
            .where(whereCondition ?? sql`true`);

        const total = countResult?.count ?? 0;

        const entries = await db
            .select()
            .from(waitlist)
            .where(whereCondition ?? sql`true`)
            .orderBy(sortDirection(sortColumn))
            .offset((input.page - 1) * input.limit)
            .limit(input.limit);

        return {
            entries,
            pagination: {
                total,
                page: input.page,
                limit: input.limit,
                totalPages: Math.ceil(total / input.limit),
                hasNextPage: input.page < Math.ceil(total / input.limit),
                hasPreviousPage: input.page > 1,
            },
        };
    }
);
```

**Step 6: Create queries index**

Create `server/routers/waitlist/queries/index.ts`:

```typescript
export * from "./list-waitlist";
```

**Step 7: Create router**

Create `server/routers/waitlist/router.ts`:

```typescript
import { call } from "@orpc/server";
import { USER_ROLES } from "@/constants/roles";
import { base } from "@/server/context";
import {
    deleteWaitlistBase,
    deleteWaitlistHandler,
    joinWaitlistBase,
    joinWaitlistHandler,
} from "./mutations";
import { listWaitlistBase, listWaitlistHandler } from "./queries";

export const waitlistRouter = base.router({
    join: joinWaitlistBase.route({ method: "POST" }).handler(
        async ({ input, context }) =>
            await call(joinWaitlistHandler, input, { context })
    ),

    list: listWaitlistBase
        .route({ method: "GET" })
        .meta({ roles: [USER_ROLES.ADMIN] })
        .handler(
            async ({ input, context }) =>
                await call(listWaitlistHandler, input, { context })
        ),

    delete: deleteWaitlistBase
        .route({ method: "DELETE" })
        .meta({ roles: [USER_ROLES.ADMIN] })
        .handler(
            async ({ input, context }) =>
                await call(deleteWaitlistHandler, input, { context })
        ),
});
```

**Step 8: Add to main router**

Find the main ORPC router file (likely `orpc/router.ts` or similar) and add:

```typescript
import { waitlistRouter } from "@/server/routers/waitlist/router";

// In the router definition, add:
waitlist: waitlistRouter,
```

**Step 9: Commit**

```bash
git add server/routers/waitlist/ orpc/
git commit -m "$(cat <<'EOF'
feat(waitlist): add ORPC procedures for join, list, and delete

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Waitlist Page

**Files:**
- Create: `app/(auth)/waitlist/page.tsx`
- Create: `app/(auth)/waitlist/_components/waitlist-form.tsx`
- Modify: `constants/pages.ts`

**Step 1: Add page constant**

In `constants/pages.ts`, add to `AUTH_PAGES`:

```typescript
WAITLIST: route("/waitlist"),
```

**Step 2: Create waitlist form component**

Create `app/(auth)/waitlist/_components/waitlist-form.tsx`:

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiAlertLine, RiCheckboxCircleFill } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/client";

const waitlistSchema = z.object({
    firstName: z.string().min(1, "Prénom requis"),
    email: z.string().email("Email invalide"),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export function WaitlistForm() {
    const [success, setSuccess] = useState(false);
    const [alreadyExists, setAlreadyExists] = useState(false);

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<WaitlistFormValues>({
        resolver: zodResolver(waitlistSchema),
        defaultValues: {
            firstName: "",
            email: "",
        },
    });

    const { mutate, isPending, error } = useMutation(
        orpc.waitlist.join.mutationOptions({
            onSuccess: (data) => {
                if (data.alreadyExists) {
                    setAlreadyExists(true);
                } else {
                    setSuccess(true);
                    reset();
                }
            },
        })
    );

    const onSubmit = (values: WaitlistFormValues) => {
        setSuccess(false);
        setAlreadyExists(false);
        mutate(values);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
                    <RiCheckboxCircleFill className="size-8 text-green-400" />
                </div>
                <h3 className="font-semibold text-xl">Tu es sur la liste !</h3>
                <p className="text-muted-foreground">
                    Merci de ton intérêt pour Altiora. On te préviendra dès que
                    la beta sera ouverte.
                </p>
            </div>
        );
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
                aria-invalid={!!errors.firstName}
                control={control}
                label="Prénom"
                name="firstName"
                placeholder="Ton prénom"
                type="text"
            />

            <FormInput
                aria-invalid={!!errors.email}
                control={control}
                label="Email"
                name="email"
                placeholder="ton@email.com"
                type="email"
            />

            {error && (
                <div className="flex items-center gap-3 border border-destructive bg-destructive/40 p-4">
                    <RiAlertLine className="mt-0.5 size-5 shrink-0 text-white" />
                    <p className="text-sm text-white">{error.message}</p>
                </div>
            )}

            {alreadyExists && (
                <div className="flex items-center gap-3 border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <RiCheckboxCircleFill className="size-5 shrink-0 text-yellow-400" />
                    <p className="text-sm text-yellow-400">
                        Tu es déjà inscrit sur la waitlist !
                    </p>
                </div>
            )}

            <Button
                className="mt-4 w-full"
                disabled={isPending}
                size="lg"
                type="submit"
            >
                {isPending ? (
                    <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current/20 border-t-current" />
                        Inscription...
                    </>
                ) : (
                    "Rejoindre la waitlist"
                )}
            </Button>
        </form>
    );
}
```

**Step 3: Create waitlist page**

Create `app/(auth)/waitlist/page.tsx`:

```typescript
import Image from "next/image";
import Dither from "@/app/(marketing)/_components/dither";
import { WaitlistForm } from "./_components/waitlist-form";

export default function WaitlistPage() {
    return (
        <div className="flex min-h-screen p-4">
            {/* Left section - Form */}
            <div className="flex w-full flex-col justify-center pt-12 lg:w-1/2">
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center space-y-8">
                    {/* Form title */}
                    <div className="mb-8">
                        <h2 className="mb-2 font-bold font-serif text-2xl text-white">
                            Rejoins la waitlist
                        </h2>
                        <p className="text-muted-foreground">
                            Sois parmi les premiers à accéder à Altiora.
                        </p>
                    </div>

                    <WaitlistForm />
                </div>
            </div>

            {/* Right section - Image */}
            <div className="relative hidden overflow-hidden border border-neutral-900 lg:flex lg:w-1/2 lg:items-center lg:justify-end">
                <div className="absolute inset-0 z-0 size-full opacity-50">
                    <Dither
                        colorNum={4}
                        disableAnimation={false}
                        enableMouseInteraction={false}
                        waveAmplitude={0}
                        waveColor={[0.4, 0.4, 0.4]}
                        waveFrequency={3}
                        waveSpeed={0.005}
                    />
                </div>
                <Image
                    alt="Altiora Dashboard"
                    className="z-40 size-5/6 object-cover object-left"
                    height={1000}
                    priority
                    src="/img/hero-journal3.png"
                    width={1000}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-background to-transparent" />
            </div>
        </div>
    );
}
```

**Step 4: Commit**

```bash
git add app/\(auth\)/waitlist/ constants/pages.ts
git commit -m "$(cat <<'EOF'
feat(waitlist): add waitlist page with form

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Middleware Redirection

**Files:**
- Create: `middleware.ts`

**Step 1: Create middleware**

Create `middleware.ts` at the root:

```typescript
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
    const isWaitlistEnabled = process.env.WAITLIST_ENABLED === "true";
    const pathname = request.nextUrl.pathname;

    // If waitlist enabled and trying to access auth routes -> redirect to /waitlist
    if (isWaitlistEnabled && AUTH_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL("/waitlist", request.url));
    }

    // If waitlist disabled and trying to access /waitlist -> redirect to /login
    if (!isWaitlistEnabled && pathname === "/waitlist") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/register", "/forgot-password", "/reset-password", "/waitlist"],
};
```

**Step 2: Commit**

```bash
git add middleware.ts
git commit -m "$(cat <<'EOF'
feat(waitlist): add middleware for auth route redirection

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Admin Waitlist Table

**Files:**
- Create: `app/(app)/admin/waitlist/page.tsx`
- Create: `app/(app)/admin/waitlist/_components/waitlist-table.tsx`
- Create: `app/(app)/admin/waitlist/_components/columns.tsx`
- Create: `app/(app)/admin/waitlist/_components/filters.tsx`
- Create: `app/(app)/admin/waitlist/search-params.ts`

**Step 1: Create search params**

Create `app/(app)/admin/waitlist/search-params.ts`:

```typescript
import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";

export const sortableColumns = ["email", "firstName", "createdAt"];

export type SortableColumn = "email" | "firstName" | "createdAt";

export const adminWaitlistParsers = {
    search: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(25),
    sortBy: parseAsStringEnum(sortableColumns).withDefault("createdAt"),
    sortOrder: parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
};

export const adminWaitlistParsersCache =
    createSearchParamsCache(adminWaitlistParsers);
```

**Step 2: Create columns**

Create `app/(app)/admin/waitlist/_components/columns.tsx`:

```typescript
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

export interface WaitlistItem {
    id: string;
    email: string;
    firstName: string;
    createdAt: Date;
}

export const columns: ColumnDef<WaitlistItem>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                aria-label="Select all"
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                aria-label="Select row"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
        ),
        size: 28,
        enableSorting: false,
        enableHiding: false,
    },
    {
        header: "Prénom",
        accessorKey: "firstName",
        size: 150,
    },
    {
        header: "Email",
        accessorKey: "email",
        size: 250,
    },
    {
        header: "Date d'inscription",
        accessorKey: "createdAt",
        cell: ({ row }) => (
            <span>{format(row.getValue("createdAt"), "d LLL yyyy HH:mm")}</span>
        ),
        size: 180,
    },
];
```

**Step 3: Create filters**

Create `app/(app)/admin/waitlist/_components/filters.tsx`:

```typescript
"use client";

import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import { useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminWaitlistParsers } from "../search-params";

export function Filters() {
    const [{ search }, setQueryStates] = useQueryStates(adminWaitlistParsers);

    const hasFilters = !!search;

    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <RiSearchLine className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    onChange={(e) => setQueryStates({ search: e.target.value || null, page: 1 })}
                    placeholder="Rechercher..."
                    value={search ?? ""}
                />
            </div>

            {hasFilters && (
                <Button
                    onClick={() => setQueryStates({ search: null, page: 1 })}
                    size="sm"
                    variant="ghost"
                >
                    <RiCloseLine className="size-4" />
                    Effacer
                </Button>
            )}
        </div>
    );
}
```

**Step 4: Create waitlist table**

Create `app/(app)/admin/waitlist/_components/waitlist-table.tsx`:

```typescript
"use client";

import { RiDeleteBinLine } from "@remixicon/react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    handleSortingChange,
    queryParamsToSortingState,
} from "@/lib/table/sorting-state";
import { orpc } from "@/orpc/client";
import { adminWaitlistParsers, type SortableColumn } from "../search-params";
import { columns, type WaitlistItem } from "./columns";
import { Filters } from "./filters";
import TablePagination from "@/app/(app)/admin/_components/pagination";

export default function WaitlistTable() {
    const queryClient = useQueryClient();
    const [{ search, sortBy, sortOrder, page, limit }, setQueryStates] =
        useQueryStates(adminWaitlistParsers);

    const setSortBy = (value: SortableColumn | null) => {
        setQueryStates({ sortBy: value });
    };

    const setSortOrder = (value: "asc" | "desc" | null) => {
        setQueryStates({ sortOrder: value });
    };

    const setPage = (value: number | null) => {
        setQueryStates({ page: value });
    };

    const setLimit = (value: number | null) => {
        setQueryStates({ limit: value });
    };

    const { data: waitlistData } = useQuery(
        orpc.waitlist.list.queryOptions({
            input: {
                page,
                limit,
                sortBy: sortBy as SortableColumn,
                sortOrder,
                search,
            },
            placeholderData: keepPreviousData,
        })
    );

    const deleteMutation = useMutation(
        orpc.waitlist.delete.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["waitlist", "list"] });
                table.resetRowSelection();
            },
        })
    );

    const data = useMemo(
        () =>
            (waitlistData?.entries ?? []).map((entry) => ({
                id: entry.id,
                email: entry.email,
                firstName: entry.firstName,
                createdAt: entry.createdAt,
            })) as WaitlistItem[],
        [waitlistData]
    );

    const table = useReactTable<WaitlistItem>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        onSortingChange: (updaterOrValue) => {
            handleSortingChange<SortableColumn>({
                updaterOrValue,
                currentSorting: queryParamsToSortingState(sortBy, sortOrder),
                setSortBy,
                setSortOrder,
                setPage,
                currentPage: page,
            });
        },
        state: {
            sorting: queryParamsToSortingState(sortBy, sortOrder),
        },
        enableRowSelection: true,
    });

    const selectedIds = table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id);

    const handleDelete = () => {
        if (selectedIds.length > 0) {
            deleteMutation.mutate({ ids: selectedIds });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-2xl">Waitlist</h1>
                <span className="text-muted-foreground">
                    {waitlistData?.pagination.total ?? 0} inscrits
                </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Filters />
                {selectedIds.length > 0 && (
                    <Button
                        disabled={deleteMutation.isPending}
                        onClick={handleDelete}
                        size="sm"
                        variant="destructive"
                    >
                        <RiDeleteBinLine className="size-4" />
                        Supprimer ({selectedIds.length})
                    </Button>
                )}
            </div>

            <div className="overflow-hidden border bg-background">
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                className="hover:bg-transparent"
                                key={headerGroup.id}
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        className="h-11"
                                        key={header.id}
                                        style={{ width: `${header.getSize()}px` }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    data-state={row.getIsSelected() && "selected"}
                                    key={row.id}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    className="h-24 text-center"
                                    colSpan={columns.length}
                                >
                                    Aucun résultat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {waitlistData?.pagination && (
                <TablePagination
                    limit={limit}
                    onLimitChange={setLimit}
                    onPageChange={setPage}
                    page={page}
                    pagination={waitlistData.pagination}
                />
            )}
        </div>
    );
}
```

**Step 5: Create admin page**

Create `app/(app)/admin/waitlist/page.tsx`:

```typescript
import WaitlistTable from "./_components/waitlist-table";

export default function AdminWaitlistPage() {
    return (
        <div className="space-y-8 px-6 py-8">
            <WaitlistTable />
        </div>
    );
}
```

**Step 6: Commit**

```bash
git add app/\(app\)/admin/waitlist/
git commit -m "$(cat <<'EOF'
feat(waitlist): add admin table for waitlist management

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Final Testing & Lint

**Step 1: Run linter**

Run: `bun x ultracite fix`

**Step 2: Run type check**

Run: `bun tsc --noEmit`

**Step 3: Test the flow**

1. Set `WAITLIST_ENABLED=true` in `.env.local`
2. Start dev server: `bun dev`
3. Navigate to `/login` - should redirect to `/waitlist`
4. Submit the waitlist form
5. Check admin at `/admin/waitlist`

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "$(cat <<'EOF'
fix(waitlist): lint and type fixes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | env.ts | Add WAITLIST_ENABLED and RESEND_WAITLIST_AUDIENCE_ID |
| 2 | server/db/schema/waitlist/* | Create waitlist table schema |
| 3 | emails/waitlist-*.tsx | Create email templates |
| 4 | server/routers/waitlist/* | Create ORPC procedures |
| 5 | app/(auth)/waitlist/* | Create waitlist page and form |
| 6 | middleware.ts | Add auth route redirection |
| 7 | app/(app)/admin/waitlist/* | Create admin table |
| 8 | - | Lint, type check, and test |
