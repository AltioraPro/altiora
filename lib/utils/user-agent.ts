/**
 * Parses a user agent string to extract OS and browser information
 * @param userAgent - The user agent string to parse
 * @returns Formatted string like "macOS, Chrome" or "Windows, Firefox"
 */
export function parseUserAgent(userAgent: string | null | undefined): string {
    if (!userAgent) {
        return "Unknown";
    }

    const ua = userAgent.toLowerCase();

    // Detect OS
    const os = detectOS(ua);

    // Detect Browser
    const browser = detectBrowser(ua);

    return `${os}, ${browser}`;
}

function detectOS(ua: string): string {
    if (ua.includes("mac os x") || ua.includes("macintosh")) {
        return "macOS";
    }
    if (ua.includes("windows")) {
        return "Windows";
    }
    if (ua.includes("linux")) {
        return "Linux";
    }
    if (ua.includes("iphone") || ua.includes("ipad")) {
        return "iOS";
    }
    if (ua.includes("android")) {
        return "Android";
    }
    return "Unknown";
}

function detectBrowser(ua: string): string {
    if (ua.includes("edg/")) {
        return "Edge";
    }
    if (ua.includes("chrome/") && !ua.includes("edg/")) {
        return "Chrome";
    }
    if (ua.includes("firefox/")) {
        return "Firefox";
    }
    if (ua.includes("safari/") && !ua.includes("chrome/")) {
        return "Safari";
    }
    if (ua.includes("opera/") || ua.includes("opr/")) {
        return "Opera";
    }
    return "Unknown";
}

// Function to detect browser and OS
export function getDefaultPasskeyName(): string {
    if (typeof window === "undefined") {
        return "My Passkey";
    }

    // Browser detection
    const userAgent = navigator.userAgent;
    let browserName = "Browser";

    if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        browserName = "Safari";
    } else if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Firefox";
    } else if (userAgent.indexOf("Edge") > -1) {
        browserName = "Edge";
    } else if (
        userAgent.indexOf("Opera") > -1 ||
        userAgent.indexOf("OPR") > -1
    ) {
        browserName = "Opera";
    }

    // OS detection
    let osName = "Device";

    if (userAgent.indexOf("Win") > -1) {
        osName = "Windows";
    } else if (userAgent.indexOf("Mac") > -1) {
        osName = "Mac";
    } else if (userAgent.indexOf("Linux") > -1) {
        osName = "Linux";
    } else if (userAgent.indexOf("Android") > -1) {
        osName = "Android";
    } else if (
        userAgent.indexOf("iPhone") > -1 ||
        userAgent.indexOf("iPad") > -1
    ) {
        osName = "iOS";
    }

    return `${browserName} on ${osName}`;
}
