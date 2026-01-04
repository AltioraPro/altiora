import { UTCDate } from "@date-fns/utc";
import {
    addDays,
    differenceInDays,
    isPast,
    isSameDay,
    parseISO,
} from "date-fns";

export function shouldShowUpgradeContent(
    trialEnd: string | null | undefined,
    status: string | null | undefined,
    hasActiveSubscription: boolean
): boolean {
    // Show upgrade content if there's no active subscription
    if (!hasActiveSubscription) {
        return true;
    }

    // Show upgrade content if trial has ended
    if (trialEnd && isPast(new Date(trialEnd))) {
        return true;
    }

    // Show upgrade content if subscription status is canceled or incomplete
    if (status === "canceled" || status === "incomplete") {
        return true;
    }

    return false;
}

export function getTrialDaysLeft(createdAt: string): number {
    // Parse dates using UTCDate for consistent timezone handling
    const rawCreatedAt = parseISO(createdAt);
    const today = new UTCDate();

    // Convert to UTCDate for consistent calculation
    const createdAtDate = new UTCDate(rawCreatedAt);

    // Set trial end date 14 days from creation
    const trialEndDate = addDays(createdAtDate, 14);

    return isSameDay(createdAtDate, today)
        ? 14
        : Math.max(0, differenceInDays(trialEndDate, today));
}
