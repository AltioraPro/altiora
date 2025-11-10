// Error codes
export const ERROR_CODES = {
    NOT_WHITELISTED: "NOT_WHITELISTED",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    ACCESS_REJECTED: "ACCESS_REJECTED",
    ADMIN_REQUIRED: "ADMIN_REQUIRED",
    EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
    EMAIL_NOT_FOUND: "EMAIL_NOT_FOUND",
    UNAUTHORIZED: "UNAUTHORIZED",
    WAITLIST_DISABLED: "WAITLIST_DISABLED",
    EMAIL_REQUIRED: "EMAIL_REQUIRED",
} as const;

export const ERROR_MESSAGES = {
    [ERROR_CODES.NOT_WHITELISTED]:
        "Email not on whitelist. Please join the waitlist first.",
    [ERROR_CODES.PENDING_APPROVAL]: "Email is pending approval",
    [ERROR_CODES.ACCESS_REJECTED]: "Access has been rejected",
    [ERROR_CODES.ADMIN_REQUIRED]: "Admin access required",
    [ERROR_CODES.EMAIL_ALREADY_EXISTS]: "Email already exists",
    [ERROR_CODES.EMAIL_NOT_FOUND]: "Email not found",
    [ERROR_CODES.UNAUTHORIZED]: "Unauthorized",
    [ERROR_CODES.WAITLIST_DISABLED]: "Waitlist is disabled",
    [ERROR_CODES.EMAIL_REQUIRED]: "Email is required",
};
