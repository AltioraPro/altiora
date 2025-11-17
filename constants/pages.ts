import { route, routeFn } from "@/lib/utils/routes";

export const AUTH_PAGES = {
    SIGN_IN: route("/login"),
    SIGN_UP: route("/register"),
    FORGOT_PASSWORD: route("/forgot-password"),
    VERIFICATION: route("/check-email"),
    RESET_PASSWORD: route("/reset-password"),
    CONFIRM_ACCESS: route("/confirm-2fa"),
    WAITLIST: route("/waitlist"),
    ERROR: route("/error"),
};

export const MARKETING_PAGES = {
    LANDING_PAGE: route("/"),
    ABOUT_US: route("/about"),
    CONTACT_US: route("/contact"),
    CHANGELOG: route("/changelog"),
    PRICING: route("/pricing"),
    PRIVACY_POLICY: route("/privacy-policy"),
    TERMS_OF_SERVICE: route("/terms-of-service"),
};

export const APPLICATION_PAGES = {
    DASHBOARD: route("/dashboard"),
    PROFILE: route("/profile"),
    GOALS: route("/goals"),
    HABITS: route("/habits"),
    TRADING: route("/trading"),
    TRADING_JOURNALS: route("/trading/journals"),
    TRADING_JOURNAL: routeFn((id: string) => `/trading/journals/${id}`),
    TRADING_CALENDAR: route("/trading/calendar"),
    LEADERBOARD: route("/leaderboard"),
    SETTINGS: route("/settings"),
};

export const SETTINGS_PAGES = {
    ACCOUNT_SETTINGS: route("/settings/account"),
    NOTIFICATION_SETTINGS: route("/settings/notification"),
    PRIVACY_SECURITY_SETTINGS: route("/settings/privacy-security"),
    ORG_GENERAL_SETTINGS: route("/org-settings/general"),
    ORG_MEMBERS_SETTINGS: route("/org-settings/members"),
};

export const ADMIN_PAGES = {
    ADMIN: route("/admin"),
    ADMIN_USERS: route("/admin/users"),
    ADMIN_WAITLIST: route("/admin/waitlist"),
};

export const ORGANIZATION_ONBOARDING_PAGES = {
    CREATE_ORGANIZATION: route("/organization/create"),
    INVITATIONS: route("/organization/invitations"),
};

export const PAGES = {
    ...AUTH_PAGES,
    ...MARKETING_PAGES,
    ...APPLICATION_PAGES,
    ...SETTINGS_PAGES,
    ...ADMIN_PAGES,
    ...ORGANIZATION_ONBOARDING_PAGES,
};
