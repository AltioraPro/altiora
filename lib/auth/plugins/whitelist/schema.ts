import type { BetterAuthPlugin } from "better-auth";

// Schema definition
export const schema = {
    accessList: {
        fields: {
            email: {
                type: "string",
                required: true,
                unique: true,
            },
            status: {
                type: "string", // "approved", "pending", "rejected"
                required: true,
            },
            addedBy: {
                type: "string",
                required: false, // Can be null for self-registrations to waitlist
                references: {
                    model: "user",
                    field: "id",
                    onDelete: "set null",
                },
            },
            userId: {
                type: "string",
                required: false,
                references: {
                    model: "user",
                    field: "id",
                    onDelete: "cascade",
                },
            },
            createdAt: {
                type: "date",
                required: true,
            },
            updatedAt: {
                type: "date",
                required: true,
            },
        },
    },
} satisfies BetterAuthPlugin["schema"];
