import type { BetterAuthPlugin } from "better-auth";
import { APIError, getSessionFromCtx } from "better-auth/api";
import { createAuthEndpoint, createAuthMiddleware } from "better-auth/plugins";
import { z } from "zod";

import { ERROR_CODES, ERROR_MESSAGES } from "./errors";
import { schema } from "./schema";

interface AccessListEntry {
    id: string;
    email: string;
    status: ApprovalStatus;
    addedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface WhitelistPluginOptions {
    /**
     * Whether to enforce whitelist on registration
     * @default true
     */
    enforceOnRegistration?: boolean;
    /**
     * Whether to allow admin users to manage the whitelist
     * @default true
     */
    allowAdminManagement?: boolean;
    /**
     * Whether to allow users to join the waitlist if not whitelisted
     * @default true
     */
    allowWaitlist?: boolean;
    /**
     * List of user ids that should have admin access to the whitelist
     * If this is set, the `adminRole` option is ignored
     */
    adminUserIds?: string[];
    /**
     * Custom function to send notifications when waitlist status changes
     */
    sendStatusNotification?: (data: {
        email: string;
        status: ApprovalStatus;
        oldStatus?: ApprovalStatus | null;
    }) => Promise<void>;
}

export type ApprovalStatus = "approved" | "pending" | "rejected";

const defaultOptions: WhitelistPluginOptions = {
    enforceOnRegistration: true,
    allowAdminManagement: true,
    allowWaitlist: true,
};

const hasAdminAccess = (
    userId: string,
    role?: string,
    options?: WhitelistPluginOptions
) => {
    if (!options) {
        return false;
    }

    if (options.adminUserIds?.length) {
        return options.adminUserIds.includes(userId);
    }

    return role === "admin";
};

export const whitelist = (options: WhitelistPluginOptions = {}) => {
    const opts = { ...defaultOptions, ...options };

    const adminMiddleware = createAuthMiddleware(async (ctx) => {
        const session = await getSessionFromCtx(ctx);
        if (!session) {
            throw new APIError("UNAUTHORIZED", {
                message: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
                code: ERROR_CODES.UNAUTHORIZED,
            });
        }

        if (
            opts.allowAdminManagement &&
            !hasAdminAccess(session.user.id, session.user.role, opts)
        ) {
            throw new APIError("FORBIDDEN", {
                message: ERROR_MESSAGES[ERROR_CODES.ADMIN_REQUIRED],
                code: ERROR_CODES.ADMIN_REQUIRED,
            });
        }

        return { session };
    });

    return {
        id: "whitelist",
        schema,
        endpoints: {
            // Add an email directly to the whitelist (admin only)
            addToWhitelist: createAuthEndpoint(
                "/whitelist/add",
                {
                    method: "POST",
                    use: [adminMiddleware],
                    body: z.object({
                        email: z.email().meta({
                            description: "Email to add to the whitelist",
                        }),
                    }),
                    metadata: {
                        openapi: {
                            operationId: "addToWhitelist",
                            summary: "Add email to whitelist",
                            description:
                                "Add an email directly to the whitelist (admin only)",
                        },
                    },
                },
                async (ctx) => {
                    const now = new Date();
                    await ctx.context.adapter
                        .create({
                            model: "accessList",
                            data: {
                                email: ctx.body.email.toLowerCase(),
                                status: "approved",
                                addedBy: ctx.context.session.user.id,
                                createdAt: now,
                                updatedAt: now,
                            },
                        })
                        .catch(() => {
                            throw new APIError("BAD_REQUEST", {
                                message:
                                    ERROR_MESSAGES[
                                        ERROR_CODES.EMAIL_ALREADY_EXISTS
                                    ],
                                code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
                            });
                        });

                    if (opts.sendStatusNotification) {
                        opts.sendStatusNotification({
                            email: ctx.body.email.toLowerCase(),
                            status: "approved",
                            oldStatus: "pending",
                        });
                    }

                    return ctx.json({ success: true });
                }
            ),

            // Join the waitlist (public endpoint)
            joinWaitlist: createAuthEndpoint(
                "/waitlist/join",
                {
                    method: "POST",
                    body: z.object({
                        email: z.string().email().meta({
                            description: "Email to add to the waitlist",
                        }),
                    }),
                    metadata: {
                        openapi: {
                            operationId: "joinWaitlist",
                            summary: "Join the waitlist",
                            description:
                                "Join the waitlist for access if not already whitelisted",
                        },
                    },
                },
                async (ctx) => {
                    if (!opts.allowWaitlist) {
                        throw new APIError("FORBIDDEN", {
                            message:
                                ERROR_MESSAGES[ERROR_CODES.WAITLIST_DISABLED],
                            code: ERROR_CODES.WAITLIST_DISABLED,
                        });
                    }

                    // Check if email already exists in the access list
                    const existingEntries = (await ctx.context.adapter.findMany(
                        {
                            model: "accessList",
                            where: [
                                {
                                    field: "email",
                                    value: ctx.body.email.toLowerCase(),
                                },
                            ],
                            limit: 1,
                        }
                    )) as AccessListEntry[];

                    if (existingEntries.length > 0) {
                        const status = existingEntries[0].status;

                        if (status === "approved") {
                            return ctx.json({
                                success: true,
                                message: "Email is already approved",
                            });
                        }
                        if (status === "pending") {
                            return ctx.json({
                                success: true,
                                message: "Email is already on the waitlist",
                            });
                        }
                        // If previously rejected, update to pending
                        const now = new Date();
                        await ctx.context.adapter.update({
                            model: "accessList",
                            where: [
                                {
                                    field: "email",
                                    value: ctx.body.email.toLowerCase(),
                                },
                            ],
                            update: {
                                status: "pending",
                                updatedAt: now,
                            },
                        });

                        return ctx.json({
                            success: true,
                            message: "Successfully joined the waitlist",
                        });
                    }

                    // Add new waitlist entry
                    const now = new Date();
                    await ctx.context.adapter.create({
                        model: "accessList",
                        data: {
                            email: ctx.body.email.toLowerCase(),
                            status: "pending",
                            addedBy: null,
                            createdAt: now,
                            updatedAt: now,
                        },
                    });

                    return ctx.json({
                        success: true,
                        message: "Successfully joined the waitlist",
                    });
                }
            ),

            // Update access status (admin only)
            updateAccessStatus: createAuthEndpoint(
                "/access/update-status",
                {
                    method: "POST",
                    use: [adminMiddleware],
                    body: z.object({
                        email: z.string().email().meta({
                            description: "Email to update status for",
                        }),
                        status: z
                            .enum(["approved", "pending", "rejected"])
                            .meta({ description: "New status to set" }),
                    }),
                    metadata: {
                        openapi: {
                            operationId: "updateAccessStatus",
                            summary: "Update access status",
                            description:
                                "Approve or reject waitlist entries (admin only)",
                        },
                    },
                },
                async (ctx) => {
                    // Check if email exists
                    const existingEntries = (await ctx.context.adapter.findMany(
                        {
                            model: "accessList",
                            where: [
                                {
                                    field: "email",
                                    value: ctx.body.email.toLowerCase(),
                                },
                            ],
                            limit: 1,
                        }
                    )) as AccessListEntry[];

                    if (existingEntries.length === 0) {
                        throw new APIError("NOT_FOUND", {
                            message:
                                ERROR_MESSAGES[ERROR_CODES.EMAIL_NOT_FOUND],
                            code: ERROR_CODES.EMAIL_NOT_FOUND,
                        });
                    }

                    // Update status
                    const now = new Date();
                    await ctx.context.adapter.update({
                        model: "accessList",
                        where: [
                            {
                                field: "email",
                                value: ctx.body.email.toLowerCase(),
                            },
                        ],
                        update: {
                            status: ctx.body.status,
                            updatedAt: now,
                        },
                    });

                    // Prepare response
                    const response = {
                        success: true,
                        message: `Status updated to ${ctx.body.status}`,
                    };

                    // Send response first
                    ctx.json(response);

                    // Send notification asynchronously after response
                    if (opts.sendStatusNotification) {
                        opts.sendStatusNotification({
                            email: ctx.body.email.toLowerCase(),
                            status: ctx.body.status,
                            oldStatus: existingEntries[0].status,
                        }).catch(() => {
                            // Ignore notification errors - don't affect main response
                        });
                    }

                    return response;
                }
            ),

            // Approve a specific waitlist user (admin only)
            approveWaitlistUser: createAuthEndpoint(
                "/waitlist/approve",
                {
                    method: "POST",
                    use: [adminMiddleware],
                    body: z.object({
                        email: z.string().email().meta({
                            description: "Email to approve from waitlist",
                        }),
                    }),
                    metadata: {
                        openapi: {
                            operationId: "approveWaitlistUser",
                            summary: "Approve waitlist user",
                            description:
                                "Approve a specific user from the waitlist (admin only)",
                        },
                    },
                },
                async (ctx) => {
                    // Check if email exists and is in pending status
                    const existingEntries = (await ctx.context.adapter.findMany(
                        {
                            model: "accessList",
                            where: [
                                {
                                    field: "email",
                                    value: ctx.body.email.toLowerCase(),
                                },
                            ],
                            limit: 1,
                        }
                    )) as AccessListEntry[];

                    if (existingEntries.length === 0) {
                        throw new APIError("NOT_FOUND", {
                            message:
                                ERROR_MESSAGES[ERROR_CODES.EMAIL_NOT_FOUND],
                            code: ERROR_CODES.EMAIL_NOT_FOUND,
                        });
                    }

                    const entry = existingEntries[0];
                    if (entry.status === "approved") {
                        return ctx.json({
                            success: true,
                            message: "User is already approved",
                        });
                    }

                    // Update status to approved
                    const now = new Date();
                    await ctx.context.adapter.update({
                        model: "accessList",
                        where: [
                            {
                                field: "email",
                                value: ctx.body.email.toLowerCase(),
                            },
                        ],
                        update: {
                            status: "approved",
                            addedBy: ctx.context.session.user.id,
                            updatedAt: now,
                        },
                    });

                    // Prepare response
                    const response = {
                        success: true,
                        message: "User has been approved",
                    };

                    // Send response first
                    ctx.json(response);

                    // Send notification asynchronously after response
                    if (opts.sendStatusNotification) {
                        opts.sendStatusNotification({
                            email: ctx.body.email.toLowerCase(),
                            status: "approved",
                            oldStatus: entry.status,
                        });
                    }

                    return response;
                }
            ),

            // Approve a cohort of users from the waitlist (admin only)
            approveWaitlistCohort: createAuthEndpoint(
                "/waitlist/approve-cohort",
                {
                    method: "POST",
                    use: [adminMiddleware],
                    body: z.object({
                        count: z
                            .number()
                            .int()
                            .meta({
                                description:
                                    "Number of users to approve from waitlist",
                            })
                            .positive(),
                    }),
                    metadata: {
                        openapi: {
                            operationId: "approveWaitlistCohort",
                            summary: "Approve waitlist cohort",
                            description:
                                "Approve a cohort of users from the waitlist based on join date (admin only)",
                        },
                    },
                },
                async (ctx) => {
                    // Get pending waitlist entries sorted by createdAt
                    const pendingEntries = (await ctx.context.adapter.findMany({
                        model: "accessList",
                        where: [
                            {
                                field: "status",
                                value: "pending",
                            },
                        ],
                        sortBy: {
                            field: "createdAt",
                            direction: "asc",
                        },
                        limit: ctx.body.count,
                    })) as AccessListEntry[];

                    if (pendingEntries.length === 0) {
                        return ctx.json({
                            success: true,
                            message: "No pending waitlist entries found",
                            approvedCount: 0,
                        });
                    }

                    // Update all entries to approved
                    const now = new Date();
                    const approvedEmails = pendingEntries.map(
                        (entry) => entry.email
                    );

                    // Batch update all entries
                    await Promise.all(
                        approvedEmails.map((email) =>
                            ctx.context.adapter.update({
                                model: "accessList",
                                where: [
                                    {
                                        field: "email",
                                        value: email,
                                    },
                                ],
                                update: {
                                    status: "approved",
                                    addedBy: ctx.context.session.user.id,
                                    updatedAt: now,
                                },
                            })
                        )
                    );

                    // Prepare response
                    const response = {
                        success: true,
                        message: `Approved ${approvedEmails.length} users from the waitlist`,
                        approvedCount: approvedEmails.length,
                        approvedEmails,
                    };

                    // Send response first
                    ctx.json(response);

                    // Send notifications asynchronously after response
                    if (opts.sendStatusNotification) {
                        // Process notifications in background without blocking
                        for (const email of approvedEmails) {
                            opts.sendStatusNotification({
                                email,
                                status: "approved",
                                oldStatus: "pending", // Since we filtered for pending status
                            }).catch(() => {
                                // Ignore notification errors - don't affect main response
                            });
                        }
                    }

                    return response;
                }
            ),

            // Check access status (public endpoint)
            checkAccessStatus: createAuthEndpoint(
                "/access/check",
                {
                    method: "POST",
                    body: z.object({
                        email: z.string().email().meta({
                            description: "Email to check access status for",
                        }),
                    }),
                    metadata: {
                        openapi: {
                            operationId: "checkAccessStatus",
                            summary: "Check access status",
                            description:
                                "Check if an email is approved, pending, or rejected",
                        },
                    },
                },
                async (ctx) => {
                    const entries = (await ctx.context.adapter.findMany({
                        model: "accessList",
                        where: [
                            {
                                field: "email",
                                value: ctx.body.email.toLowerCase(),
                            },
                        ],
                        limit: 1,
                    })) as AccessListEntry[];

                    if (entries.length === 0) {
                        return ctx.json({
                            status: "not_found",
                            canJoinWaitlist: opts.allowWaitlist,
                        });
                    }

                    const accessStatus = entries[0].status;
                    return ctx.json({
                        status: accessStatus,
                        isApproved: accessStatus === "approved",
                        isPending: accessStatus === "pending",
                        isRejected: accessStatus === "rejected",
                    });
                }
            ),
        },
        // Add hook to validate email during registration
        hooks: {
            before: [
                {
                    matcher: (context) => {
                        // Handle sign-up validation
                        return !!(
                            context.path === "/sign-up/email" &&
                            opts.enforceOnRegistration
                        );
                    },
                    handler: createAuthMiddleware(async (ctx) => {
                        const { body } = ctx;

                        if (
                            !body ||
                            typeof body !== "object" ||
                            !("email" in body) ||
                            !body.email
                        ) {
                            throw new APIError("BAD_REQUEST", {
                                message:
                                    ERROR_MESSAGES[ERROR_CODES.EMAIL_REQUIRED],
                                code: ERROR_CODES.EMAIL_REQUIRED,
                            });
                        }

                        const email = body.email as string;

                        const accessEntries =
                            (await ctx.context.adapter.findMany({
                                model: "accessList",
                                where: [
                                    {
                                        field: "email",
                                        value: email.toLowerCase(),
                                    },
                                ],
                                limit: 1,
                            })) as AccessListEntry[];

                        // No entries found
                        if (accessEntries.length === 0) {
                            if (opts.allowWaitlist) {
                                throw new APIError("FORBIDDEN", {
                                    message:
                                        ERROR_MESSAGES[
                                            ERROR_CODES.NOT_WHITELISTED
                                        ],
                                    code: ERROR_CODES.NOT_WHITELISTED,
                                });
                            }
                            throw new APIError("FORBIDDEN", {
                                message:
                                    ERROR_MESSAGES[ERROR_CODES.NOT_WHITELISTED],
                                code: ERROR_CODES.NOT_WHITELISTED,
                            });
                        }

                        // Entry found but not approved
                        const accessStatus = accessEntries[0].status;
                        if (accessStatus !== "approved") {
                            if (accessStatus === "pending") {
                                throw new APIError("FORBIDDEN", {
                                    message:
                                        ERROR_MESSAGES[
                                            ERROR_CODES.PENDING_APPROVAL
                                        ],
                                    code: ERROR_CODES.PENDING_APPROVAL,
                                });
                            }
                            throw new APIError("FORBIDDEN", {
                                message:
                                    ERROR_MESSAGES[ERROR_CODES.ACCESS_REJECTED],
                                code: ERROR_CODES.ACCESS_REJECTED,
                            });
                        }

                        return {
                            context: ctx,
                        };
                    }),
                },
            ],
        },
        // Add rate limiting to prevent abuse
        rateLimit: [
            {
                pathMatcher: (path) =>
                    path.startsWith("/whitelist/") ||
                    path.startsWith("/waitlist/") ||
                    path.startsWith("/access/"),
                max: 10,
                window: 60, // 1 minute
            },
        ],
        $ERROR_CODES: ERROR_CODES,
    } satisfies BetterAuthPlugin;
};
