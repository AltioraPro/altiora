import { nanoid } from "nanoid";

/**
 * Default trading sessions configuration (UTC+2)
 */
export const DEFAULT_SESSIONS = [
    {
        name: "Asian Session",
        description: "Asian trading session (Tokyo/Hong Kong)",
        startTime: "23:00",
        endTime: "07:00",
        timezone: "UTC+2",
    },
    {
        name: "London Session",
        description: "London trading session",
        startTime: "09:00",
        endTime: "11:00",
        timezone: "UTC+2",
    },
    {
        name: "New York Session",
        description: "New York trading session",
        startTime: "14:00",
        endTime: "16:00",
        timezone: "UTC+2",
    },
    {
        name: "Off Session",
        description: "Outside major trading sessions",
        startTime: "00:00",
        endTime: "23:59",
        timezone: "UTC+2",
    },
] as const;

/**
 * Determine which session a trade belongs to based on time
 * @param tradeTime Date object of the trade (close time)
 * @returns Session name that matches the time
 */
export function determineSessionFromTime(tradeTime: Date): string {
    // Get hours and minutes in UTC+2
    // Convert to UTC+2 by adding 2 hours to UTC time
    const utc = tradeTime.getTime();
    const utcPlus2 = new Date(utc + 2 * 60 * 60 * 1000);

    const hours = utcPlus2.getUTCHours();
    const minutes = utcPlus2.getUTCMinutes();
    const timeInMinutes = hours * 60 + minutes;

    // Asian Session: 23:00 - 07:00 (crosses midnight)
    // 23:00 = 1380 minutes, 07:00 = 420 minutes
    if (timeInMinutes >= 1380 || timeInMinutes < 420) {
        return "Asian Session";
    }

    // London Session: 09:00 - 11:00
    // 09:00 = 540 minutes, 11:00 = 660 minutes
    if (timeInMinutes >= 540 && timeInMinutes < 660) {
        return "London Session";
    }

    // New York Session: 14:00 - 16:00
    // 14:00 = 840 minutes, 16:00 = 960 minutes
    if (timeInMinutes >= 840 && timeInMinutes < 960) {
        return "New York Session";
    }

    // Everything else is Off Session
    return "Off Session";
}

/**
 * Create default sessions for a journal
 * @param journalId Journal ID
 * @param userId User ID
 * @returns Array of session objects ready for insertion
 */
export function createDefaultSessions(journalId: string, userId: string) {
    return DEFAULT_SESSIONS.map((session) => ({
        id: nanoid(),
        userId,
        journalId,
        name: session.name,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        timezone: session.timezone,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }));
}
