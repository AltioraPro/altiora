/**
 * User role constants
 */
export const USER_ROLES = {
    ADMIN: "admin",
    USER: "user",
} as const;

/**
 * Type representing all available user roles
 */
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Array of all available roles
 */
export const ALL_USER_ROLES = Object.values(USER_ROLES);
