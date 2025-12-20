export const RELEASES = [
    {
        version: "2.1.0",
        date: "2024-01-15",
        type: "major",
        title: "Discord Integration & Advanced Analytics",
        changes: [
            {
                type: "feature",
                text: "Discord bot integration for Pomodoro sessions",
            },
            {
                type: "feature",
                text: "Advanced trading analytics dashboard",
            },
            {
                type: "feature",
                text: "Habit streak analytics and insights",
            },
            {
                type: "improvement",
                text: "Improved performance across all modules",
            },
            {
                type: "fix",
                text: "Fixed timezone issues in habit tracking",
            },
        ],
    },
    {
        version: "2.0.0",
        date: "2024-01-01",
        type: "major",
        title: "Major Platform Overhaul",
        changes: [
            {
                type: "feature",
                text: "Complete UI/UX redesign with glassmorphism effects",
            },
            { type: "feature", text: "New goal planning system with OKRs" },
            {
                type: "feature",
                text: "Enhanced trading journal with emotion tracking",
            },
            {
                type: "improvement",
                text: "Faster load times and better mobile experience",
            },
            {
                type: "improvement",
                text: "Improved accessibility features",
            },
        ],
    },
    {
        version: "1.8.2",
        date: "2023-12-20",
        type: "patch",
        title: "Bug Fixes & Performance",
        changes: [
            {
                type: "fix",
                text: "Fixed habit completion not saving properly",
            },
            { type: "fix", text: "Resolved trading journal export issues" },
            {
                type: "improvement",
                text: "Optimized database queries for better performance",
            },
        ],
    },
    {
        version: "1.8.0",
        date: "2023-12-10",
        type: "minor",
        title: "Enhanced Habit Tracking",
        changes: [
            { type: "feature", text: "Calendar view for habit tracking" },
            { type: "feature", text: "Habit templates and suggestions" },
            {
                type: "improvement",
                text: "Better habit statistics and insights",
            },
            { type: "fix", text: "Fixed notification timing issues" },
        ],
    },
    {
        version: "1.7.0",
        date: "2023-11-25",
        type: "minor",
        title: "Trading Journal Enhancements",
        changes: [
            {
                type: "feature",
                text: "AI-powered trade analysis suggestions",
            },
            { type: "feature", text: "Custom tags and filtering system" },
            {
                type: "feature",
                text: "Trade performance visualization charts",
            },
            {
                type: "improvement",
                text: "Enhanced data export capabilities",
            },
        ],
    },
] as const;
