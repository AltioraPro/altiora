// "use client";

// import { AlertTriangle, Crown, X } from "lucide-react";
// import Link from "next/link";
// import { useState } from "react";
// import { api } from "@/trpc/client";

// export function LimitsBanner() {
//     const [isVisible, setIsVisible] = useState(true);
//     const { data: limitsSummary } =
//         api.subscription.getLimitsSummary.useQuery();

//     if (!(isVisible && limitsSummary)) {
//         return null;
//     }

//     const { limits, usage, planName } =
//         limitsSummary as typeof limitsSummary & { planName?: string };
//     const isAltiorans = planName === "ALTIORANS";

//     if (isAltiorans) {
//         return null;
//     }

//     const isHabitsLimitReached =
//         usage.currentHabits >= limits.maxHabits && limits.maxHabits < 999_999;
//     const isTradingLimitReached =
//         usage.monthlyTradingEntries >= limits.maxTradingEntries &&
//         limits.maxTradingEntries < 999_999;
//     const isGoalsLimitReached =
//         usage.currentAnnualGoals + usage.currentQuarterlyGoals >=
//             limits.maxAnnualGoals + limits.maxQuarterlyGoals &&
//         limits.maxAnnualGoals + limits.maxQuarterlyGoals < 999_999;

//     if (
//         !(isHabitsLimitReached || isTradingLimitReached || isGoalsLimitReached)
//     ) {
//         return null;
//     }

//     const getLimitInfo = () => {
//         if (isHabitsLimitReached) {
//             return {
//                 type: "habits",
//                 message: `You have reached the limit of ${limitsSummary.limits.maxHabits} habits for your plan.`,
//                 upgradeMessage:
//                     "Upgrade to Pro plan to create unlimited habits.",
//                 current: usage.currentHabits,
//                 max: limits.maxHabits,
//             };
//         }
//         if (isTradingLimitReached) {
//             return {
//                 type: "trading",
//                 message: `You have reached the limit of ${limitsSummary.limits.maxTradingEntries} trading entries per month.`,
//                 upgradeMessage:
//                     "Upgrade to Pro plan for unlimited trading journal.",
//                 current: usage.monthlyTradingEntries,
//                 max: limits.maxTradingEntries,
//             };
//         }
//         if (isGoalsLimitReached) {
//             return {
//                 type: "goals",
//                 message: "You have reached the goals limit for your plan.",
//                 upgradeMessage: "Upgrade to Pro plan to create more goals.",
//                 current: usage.currentAnnualGoals + usage.currentQuarterlyGoals,
//                 max: limits.maxAnnualGoals + limits.maxQuarterlyGoals,
//             };
//         }
//         return null;
//     };

//     const limitInfo = getLimitInfo();
//     if (!limitInfo) {
//         return null;
//     }

//     return (
//         <div className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md">
//             <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-red-500/10 p-4 backdrop-blur-sm">
//                 <div className="flex items-start space-x-3">
//                     <div className="flex-shrink-0">
//                         <AlertTriangle className="h-5 w-5 text-amber-400" />
//                     </div>

//                     <div className="min-w-0 flex-1">
//                         <div className="mb-2 flex items-center justify-between">
//                             <h3 className="font-bold text-sm text-white">
//                                 LIMIT REACHED
//                             </h3>
//                             <button
//                                 className="text-white/60 transition-colors hover:text-white"
//                                 onClick={() => setIsVisible(false)}
//                             >
//                                 <X className="h-4 w-4" />
//                             </button>
//                         </div>

//                         <p className="mb-3 text-sm text-white/80">
//                             {limitInfo.message}
//                         </p>

//                         <div className="mb-3 flex items-center justify-between">
//                             <span className="text-white/60 text-xs">
//                                 Usage: {limitInfo.current}/
//                                 {limitInfo.max >= 999_999 ? "∞" : limitInfo.max}
//                             </span>
//                         </div>

//                         <div className="flex space-x-2">
//                             <Link
//                                 className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-500 px-4 py-2 text-center font-bold text-sm text-white transition-all duration-300 hover:from-amber-600 hover:to-red-600"
//                                 href="/pricing"
//                             >
//                                 <Crown className="h-4 w-4" />
//                                 <span>UPGRADE</span>
//                             </Link>
//                         </div>

//                         <p className="mt-2 text-white/60 text-xs">
//                             {limitInfo.upgradeMessage}
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
