"use client";

import {
    RiCalendarLine,
    RiCheckboxLine,
    RiDashboardLine,
    RiStockLine,
    RiTargetLine,
    RiTrophyLine,
} from "@remixicon/react";

import { Logo } from "@/components/logo";

// Icons for each module position
const moduleIcons = [
    RiTargetLine, // 0° - Goals
    RiCheckboxLine, // 60° - Habits
    RiStockLine, // 120° - Trading
    RiCalendarLine, // 180° - Calendar
    RiDashboardLine, // 240° - Dashboard
    RiTrophyLine, // 300° - Leaderboard
];

// Illustration 1: Centralized Tools - Static marquee pattern with DIVs
export function CentralizedToolsIllustration() {
    // Create repeating pattern of icons for marquee
    const marqueeIcons = [...moduleIcons, ...moduleIcons];
    const reversedMarqueeIcons = [
        ...moduleIcons.reverse(),
        ...moduleIcons.reverse(),
    ];

    return (
        <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden bg-neutral-800"
            role="img"
        >
            {/* First marquee line - top */}
            <div className="absolute top-[35%] left-1 flex w-full gap-6">
                {reversedMarqueeIcons.map((IconComponent, index) => (
                    <div
                        className="flex shrink-0 items-center justify-center border border-neutral-700 p-3"
                        key={`marquee-1-${index}`}
                    >
                        <IconComponent className="size-8 text-neutral-600" />
                    </div>
                ))}
            </div>

            {/* Second marquee line - bottom, offset */}
            <div className="absolute top-[55%] left-[-8%] flex w-full gap-6">
                {marqueeIcons.map((IconComponent, index) => (
                    <div
                        className="flex shrink-0 items-center justify-center border border-neutral-700 p-3"
                        key={`marquee-2-${index}`}
                    >
                        <IconComponent className="size-8 text-neutral-600" />
                    </div>
                ))}
            </div>

            {/* Center Altiora Logo - on top */}
            <div className="relative z-10 flex items-center justify-center border border-neutral-500 bg-neutral-900 p-4">
                <Logo className="size-10" />
            </div>
        </div>
    );
}

// Illustration 2: Modern Interface - Device mockups
export function ModernInterfaceIllustration() {
    return (
        <svg
            aria-labelledby="modern-interface-title"
            className="size-full"
            fill="none"
            role="img"
            viewBox="0 0 400 378"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title id="modern-interface-title">
                Modern interface illustration showing responsive device mockups
            </title>
            <defs>
                <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="screenGradient"
                    x1="0%"
                    x2="100%"
                    y1="0%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#262626" />
                    <stop offset="100%" stopColor="#171717" />
                </linearGradient>
                <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="glassShine"
                    x1="0%"
                    x2="100%"
                    y1="0%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#404040" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#171717" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Desktop monitor - back */}
            <g key="desktop-monitor">
                {/* Monitor frame */}
                <rect
                    fill="#1a1a1a"
                    height="160"
                    stroke="#404040"
                    strokeWidth="1"
                    width="220"
                    x="90"
                    y="110"
                />
                {/* Screen */}
                <rect
                    fill="url(#screenGradient)"
                    height="130"
                    width="200"
                    x="100"
                    y="120"
                />
                {/* Screen content - UI elements */}
                <g opacity="0.8">
                    {/* Header bar */}
                    <rect
                        fill="#262626"
                        height="20"
                        width="200"
                        x="100"
                        y="120"
                    />
                    <circle cx="112" cy="130" fill="#404040" r="4" />
                    <circle cx="126" cy="130" fill="#404040" r="4" />
                    <circle cx="140" cy="130" fill="#404040" r="4" />

                    {/* Sidebar */}
                    <rect
                        fill="#1f1f1f"
                        height="110"
                        width="40"
                        x="100"
                        y="140"
                    />
                    <rect
                        fill="#404040"
                        height="8"
                        width="30"
                        x="105"
                        y="150"
                    />
                    <rect
                        fill="#333333"
                        height="6"
                        width="30"
                        x="105"
                        y="165"
                    />
                    <rect
                        fill="#333333"
                        height="6"
                        width="30"
                        x="105"
                        y="178"
                    />

                    {/* Main content area */}
                    <rect
                        fill="#252525"
                        height="50"
                        width="145"
                        x="145"
                        y="145"
                    />
                    <rect
                        fill="#404040"
                        height="8"
                        width="80"
                        x="155"
                        y="155"
                    />
                    <rect
                        fill="#333333"
                        height="6"
                        width="100"
                        x="155"
                        y="170"
                    />
                    <rect
                        fill="#333333"
                        height="6"
                        width="60"
                        x="155"
                        y="182"
                    />

                    {/* Chart area */}
                    <rect
                        fill="#252525"
                        height="40"
                        width="145"
                        x="145"
                        y="200"
                    />
                    <path
                        d="M155 230 L175 215 L195 225 L215 205 L235 220 L255 210 L275 215"
                        fill="none"
                        stroke="#525252"
                        strokeLinecap="round"
                        strokeWidth="1"
                    />
                </g>
                {/* Glass shine effect */}
                <rect
                    fill="url(#glassShine)"
                    height="130"
                    width="200"
                    x="100"
                    y="120"
                />
            </g>

            {/* Tablet - floating right */}
            <g key="tablet">
                <rect
                    fill="#1a1a1a"
                    height="110"
                    stroke="#404040"
                    strokeWidth="1"
                    width="80"
                    x="240"
                    y="165"
                />
                <rect
                    fill="url(#screenGradient)"
                    height="95"
                    width="70"
                    x="245"
                    y="172"
                />
                {/* Tablet content */}
                <rect fill="#262626" height="12" width="70" x="245" y="172" />
                <rect fill="#404040" height="20" width="60" x="250" y="190" />
                <rect fill="#333333" height="15" width="60" x="250" y="215" />
                <rect fill="#333333" height="15" width="60" x="250" y="235" />
            </g>

            {/* Phone - floating left */}
            <g key="phone">
                <rect
                    fill="#1a1a1a"
                    height="90"
                    stroke="#404040"
                    strokeWidth="1"
                    width="45"
                    x="75"
                    y="185"
                />
                <rect
                    fill="url(#screenGradient)"
                    height="78"
                    width="39"
                    x="78"
                    y="191"
                />
                {/* Phone content */}
                <rect fill="#262626" height="10" width="39" x="78" y="191" />
                <rect fill="#404040" height="25" width="33" x="81" y="207" />
                <rect fill="#333333" height="10" width="33" x="81" y="237" />
                <rect fill="#333333" height="10" width="33" x="81" y="252" />
            </g>
        </svg>
    );
}

// Illustration 3: Best Value - Simple pricing visualization
export function BestValueIllustration() {
    return (
        <svg
            aria-labelledby="best-value-title"
            className="size-full"
            fill="none"
            role="img"
            viewBox="0 0 400 378"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title id="best-value-title">
                Best value illustration showing pricing comparison
            </title>
            <defs>
                <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="valueGradient"
                    x1="200"
                    x2="200"
                    y1="80"
                    y2="300"
                >
                    <stop offset="0%" stopColor="#333333" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#171717" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="checkGradient"
                    x1="0%"
                    x2="100%"
                    y1="0%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#525252" />
                    <stop offset="100%" stopColor="#404040" />
                </linearGradient>
            </defs>

            {/* Radial background pattern */}
            <circle
                cx="200"
                cy="189"
                fill="url(#valueGradient)"
                opacity="0.3"
                r="160"
            />

            {/* Main price card */}
            <g key="price-card">
                {/* Card shadow */}
                <rect
                    fill="#171717"
                    height="200"
                    opacity="0.5"
                    width="160"
                    x="124"
                    y="97"
                />

                {/* Card background */}
                <rect
                    fill="#1f1f1f"
                    height="200"
                    stroke="#404040"
                    strokeWidth="1"
                    width="160"
                    x="120"
                    y="89"
                />

                {/* Card header */}
                <rect fill="#262626" height="50" width="160" x="120" y="89" />
                <rect fill="#262626" height="25" width="160" x="120" y="114" />

                {/* Plan badge */}
                <rect fill="#333333" height="20" width="60" x="170" y="99" />
                <text
                    fill="#a3a3a3"
                    fontFamily="system-ui"
                    fontSize="10"
                    textAnchor="middle"
                    x="200"
                    y="113"
                >
                    PRO
                </text>

                {/* Price */}
                <text
                    fill="#e5e5e5"
                    fontFamily="system-ui"
                    fontSize="36"
                    fontWeight="600"
                    textAnchor="middle"
                    x="200"
                    y="175"
                >
                    $9
                </text>
                <text
                    fill="#737373"
                    fontFamily="system-ui"
                    fontSize="12"
                    textAnchor="middle"
                    x="200"
                    y="195"
                >
                    /month
                </text>

                {/* Feature checkmarks */}
                {[
                    { y: 220, text: "Unlimited trades" },
                    { y: 245, text: "All features" },
                    { y: 270, text: "No hidden fees" },
                ].map((feature, i) => (
                    <g key={feature.text}>
                        <circle
                            cx="145"
                            cy={feature.y - 4}
                            fill="url(#checkGradient)"
                            r="8"
                        />
                        <path
                            d="M141 ${feature.y - 4} l3 3 6-6"
                            fill="none"
                            stroke="#a3a3a3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            transform={`translate(0, ${(i - 1) * 0})`}
                        >
                            <animate
                                attributeName="d"
                                dur="0.001s"
                                fill="freeze"
                                values={`M141 ${feature.y - 4} l3 3 6-6`}
                            />
                        </path>
                        {/* Checkmark path */}
                        <path
                            d={`M141 ${feature.y - 4} l3 3 6-6`}
                            fill="none"
                            stroke="#a3a3a3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                        />
                        <text
                            fill="#a3a3a3"
                            fontFamily="system-ui"
                            fontSize="11"
                            x="160"
                            y={feature.y}
                        >
                            {feature.text}
                        </text>
                    </g>
                ))}
            </g>

            {/* Floating comparison cards (faded, smaller) */}
            {/* Left card - crossed out */}
            <g key="left-card">
                <rect
                    fill="#1a1a1a"
                    height="100"
                    stroke="#2a2a2a"
                    strokeWidth="1"
                    width="80"
                    x="20"
                    y="140"
                />
                <text
                    fill="#525252"
                    fontFamily="system-ui"
                    fontSize="20"
                    textAnchor="middle"
                    x="60"
                    y="200"
                >
                    $29
                </text>
                <line
                    stroke="#525252"
                    strokeWidth="1"
                    x1="35"
                    x2="85"
                    y1="193"
                    y2="195"
                />
            </g>

            {/* Right card - crossed out */}
            <g key="right-card">
                <rect
                    fill="#1a1a1a"
                    height="100"
                    stroke="#2a2a2a"
                    strokeWidth="1"
                    width="80"
                    x="300"
                    y="140"
                />
                <text
                    fill="#525252"
                    fontFamily="system-ui"
                    fontSize="20"
                    textAnchor="middle"
                    x="340"
                    y="200"
                >
                    $49
                </text>
                <line
                    stroke="#525252"
                    strokeWidth="1"
                    x1="315"
                    x2="365"
                    y1="193"
                    y2="195"
                />
            </g>

            {/* Sparkle/star decorations */}
            {[
                { x: 95, y: 100 },
                { x: 305, y: 95 },
                { x: 85, y: 270 },
                { x: 320, y: 280 },
            ].map((pos, i) => (
                <g key={`sparkle-${i}`}>
                    <path
                        d={`M${pos.x} ${pos.y - 6} L${pos.x} ${pos.y + 6} M${pos.x - 6} ${pos.y} L${pos.x + 6} ${pos.y}`}
                        stroke="#525252"
                        strokeLinecap="round"
                        strokeWidth="1"
                    />
                </g>
            ))}
        </svg>
    );
}
