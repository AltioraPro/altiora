import {
  RiLightbulbFlashLine,
  RiShieldLine,
  RiSparklingLine,
  RiStarLine,
  RiStockLine,
  RiTargetLine,
  RiTrophyLine,
  RiVipCrownLine,
} from "@remixicon/react";

/**
 * Rank system ordered from HIGHEST to LOWEST for correct rank lookup.
 * When finding a user's rank, we iterate and return the first match
 * where the user's streak >= minStreak.
 */
export const RANK_SYSTEM = [
  {
    name: "IMMORTAL",
    icon: RiSparklingLine,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    minStreak: 365,
    description: "365+ consecutive days - Immortal legend of excellence",
    discordRole: "Immortal",
    benefits: [
      "Immortal Discord role",
      "Legendary status",
      "All features",
      "Personal consultation",
      "Exclusive merchandise",
      "Founders circle access",
      "Custom integrations",
    ],
  },
  {
    name: "GRANDMASTER",
    icon: RiShieldLine,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    minStreak: 180,
    description: "180+ consecutive days - Grand master of productivity",
    discordRole: "Grandmaster",
    benefits: [
      "Grandmaster Discord role",
      "Total access pass",
      "Personal mentor status",
      "Exclusive events",
      "Custom profile features",
      "Direct access to founders",
    ],
  },
  {
    name: "MASTER",
    icon: RiLightbulbFlashLine,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    minStreak: 90,
    description: "90+ consecutive days - Master of consistency and discipline",
    discordRole: "Master",
    benefits: [
      "Master Discord role",
      "Exclusive masterclasses",
      "Personal coaching sessions",
      "Priority support",
      "Custom Discord badge",
    ],
  },
  {
    name: "LEGEND",
    icon: RiVipCrownLine,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    minStreak: 30,
    description: "30+ consecutive days - Living legend of discipline",
    discordRole: "Legend",
    benefits: [
      "Legendary Discord role",
      "Exclusive access to all content",
      "Moderator status",
      "VIP event invitations",
    ],
  },
  {
    name: "EXPERT",
    icon: RiStarLine,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    minStreak: 14,
    description: "14+ consecutive days - Recognized productivity expert",
    discordRole: "Expert",
    benefits: [
      "VIP Discord role",
      "Access to masterclasses",
      "Ability to create challenges",
    ],
  },
  {
    name: "CHAMPION",
    icon: RiTrophyLine,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    minStreak: 7,
    description: "7+ consecutive days - Champion of daily discipline",
    discordRole: "Champion",
    benefits: [
      "Exclusive Discord role",
      "Access to private events",
      "Mentor other members",
    ],
  },
  {
    name: "RISING",
    icon: RiStockLine,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    minStreak: 3,
    description: "3+ consecutive days - Building momentum",
    discordRole: "Rising",
    benefits: ["Access to weekly challenges", "Special Discord badge"],
  },
  {
    name: "BEGINNER",
    icon: RiTargetLine,
    color: "text-white/60",
    bgColor: "bg-neutral-800/50",
    borderColor: "border-white/20",
    minStreak: 1,
    description: "1+ day with at least one habit validated",
    discordRole: "Beginner",
    benefits: ["Access to basic channels", "Expert advice"],
  },
  {
    name: "NEW",
    icon: RiTargetLine,
    color: "text-white/40",
    bgColor: "bg-neutral-800/50",
    borderColor: "border-white/10",
    minStreak: 0,
    description: "Ready to start your personal transformation",
    discordRole: "New",
    benefits: ["Discord server access", "Community support"],
  },
] as const;

export type RankInfo = (typeof RANK_SYSTEM)[number];

// Pre-sorted from lowest to highest for display purposes
export const RANK_SYSTEM_DISPLAY = [...RANK_SYSTEM].reverse();

/**
 * Find the current rank based on streak.
 * Iterates from highest rank to lowest and returns the first match.
 */
export function getCurrentRank(streak: number): RankInfo {
  return (
    RANK_SYSTEM.find((rank) => streak >= rank.minStreak) ??
    RANK_SYSTEM.at(-1) ??
    RANK_SYSTEM[0]
  );
}

/**
 * Find the next rank to achieve.
 * Returns undefined if the user is at the highest rank.
 */
export function getNextRank(streak: number): RankInfo | undefined {
  // Find ranks with higher minStreak than current streak, get the lowest one
  const higherRanks = RANK_SYSTEM.filter((rank) => rank.minStreak > streak);
  return higherRanks.at(-1); // Last item is the lowest among higher ranks
}

/**
 * Calculate days remaining to reach next rank.
 */
export function getDaysToNextRank(
  streak: number,
  nextRank: RankInfo | undefined
): number {
  return nextRank ? nextRank.minStreak - streak : 0;
}

/**
 * Get rank information by rank name.
 * Returns the rank info or the lowest rank (NEW) if not found.
 */
export function getRankByName(rankName: string): RankInfo {
  return (
    RANK_SYSTEM.find((rank) => rank.name === rankName) ??
    RANK_SYSTEM.at(-1) ??
    RANK_SYSTEM[0]
  );
}
