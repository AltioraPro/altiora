// "use client";

// import {
//     ArrowRight,
//     BarChart3,
//     BookOpen,
//     Calendar,
//     ChevronDown,
//     ChevronUp,
//     Crown,
//     Shield,
//     Star,
//     Target,
//     Zap,
// } from "lucide-react";
// import Link from "next/link";
// import { useState } from "react";
// import { api } from "@/trpc/client";

// export function SubscriptionStatus() {
//     const [showDetails, setShowDetails] = useState(false);
//     const {
//         data: user,
//         isLoading,
//         error,
//     } = api.auth.getCurrentUser.useQuery(undefined, {
//         retry: (failureCount, error) => {
//             if (
//                 error &&
//                 typeof error === "object" &&
//                 "data" in error &&
//                 error.data &&
//                 typeof error.data === "object" &&
//                 "code" in error.data &&
//                 error.data.code === "UNAUTHORIZED"
//             ) {
//                 return false;
//             }
//             return failureCount < 2;
//         },
//         refetchOnWindowFocus: false,
//         refetchOnMount: false,
//     });

//     if (error?.data?.code === "UNAUTHORIZED") {
//         return (
//             <div className="py-8 text-center">
//                 <div className="mb-4 text-white/60">
//                     Session expired. Please log in again.
//                 </div>
//                 <a className="text-white underline" href="/auth/login">
//                     Log in
//                 </a>
//             </div>
//         );
//     }

//     if (isLoading || !user) {
//         return (
//             <div className="space-y-8">
//                 <div className="text-center">
//                     <div className="inline-flex animate-pulse items-center space-x-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white/60">
//                         <div className="h-5 w-5 rounded bg-white/20" />
//                         <div className="h-4 w-24 rounded bg-white/20" />
//                     </div>
//                 </div>
//                 <div className="space-y-4">
//                     {Array.from({ length: 2 }).map((_, i) => (
//                         <div
//                             className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-4"
//                             key={i}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div className="h-4 w-20 rounded bg-white/20" />
//                                 <div className="h-4 w-16 rounded bg-white/20" />
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     const isPro =
//         (user.subscriptionPlan === "PRO" &&
//             user.stripeSubscriptionStatus === "active") ||
//         user.subscriptionPlan === "ALTIORANS";
//     const isAltiorans = user.subscriptionPlan === "ALTIORANS";

//     return (
//         <div className="space-y-8">
//             {/* Current Status */}
//             <div className="text-center">
//                 <div
//                     className={`inline-flex items-center space-x-3 rounded-full border px-6 py-3 ${
//                         isPro
//                             ? "border-green-400/30 bg-green-400/10 text-green-400"
//                             : "border-white/20 bg-white/10 text-white/60"
//                     }`}
//                 >
//                     {isPro ? (
//                         <>
//                             <Crown className="h-5 w-5" />
//                             <span className="font-bold tracking-wide">
//                                 ALTIORAN
//                             </span>
//                         </>
//                     ) : (
//                         <>
//                             <Shield className="h-5 w-5" />
//                             <span className="font-bold tracking-wide">
//                                 FREE PLAN
//                             </span>
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* Status Details */}
//             <div className="space-y-4">
//                 <div className="rounded-xl border border-white/10 bg-white/5 p-4">
//                     <div className="flex items-center justify-between">
//                         <span className="text-sm text-white/60 tracking-wide">
//                             PLAN TYPE
//                         </span>
//                         <span
//                             className={`font-bold ${isPro ? "text-green-400" : "text-white"}`}
//                         >
//                             {user.subscriptionPlan === "ALTIORANS"
//                                 ? "Altioran"
//                                 : isPro
//                                   ? "Professional"
//                                   : "Free"}
//                         </span>
//                     </div>
//                 </div>

//                 <div className="rounded-xl border border-white/10 bg-white/5 p-4">
//                     <div className="flex items-center justify-between">
//                         <span className="text-sm text-white/60 tracking-wide">
//                             STATUS
//                         </span>
//                         <span
//                             className={`font-bold ${isPro ? "text-green-400" : "text-white/80"}`}
//                         >
//                             {isPro ? "Active" : "Limited Access"}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* Action Button */}
//             <div className="space-y-4">
//                 {isPro ? (
//                     <Link
//                         className="group block w-full rounded-xl bg-white/10 px-6 py-4 text-center font-bold text-white transition-all duration-300 hover:bg-white/20"
//                         href="/billing"
//                     >
//                         <div className="flex items-center justify-center space-x-3">
//                             <Shield className="h-5 w-5" />
//                             <span>MANAGE SUBSCRIPTION</span>
//                             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                         </div>
//                     </Link>
//                 ) : (
//                     <Link
//                         className="group block w-full rounded-xl bg-gradient-to-r from-white to-white/90 px-6 py-4 text-center font-bold text-black transition-all duration-300 hover:from-white/90 hover:to-white"
//                         href="/pricing"
//                     >
//                         <div className="flex items-center justify-center space-x-3">
//                             <Crown className="h-5 w-5" />
//                             <span>UPGRADE TO PRO</span>
//                             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                         </div>
//                     </Link>
//                 )}
//             </div>

//             {/* Usage Stats */}
//             {limits && usage && (
//                 <div className="space-y-4">
//                     <h4 className="flex items-center space-x-2 font-bold text-base text-white tracking-wide">
//                         <BarChart3 className="h-4 w-4" />
//                         <span>USAGE THIS MONTH</span>
//                     </h4>

//                     <div className="grid grid-cols-1 gap-3">
//                         {/* Trading Journal Usage */}
//                         <div className="rounded-lg border border-white/10 bg-white/5 p-3">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <div className="flex items-center space-x-2">
//                                     <BookOpen className="h-4 w-4 text-white/60" />
//                                     <span className="text-sm text-white/80">
//                                         Trading Journal
//                                     </span>
//                                 </div>
//                                 <span className="text-sm text-white/60">
//                                     {usage.monthlyTradingEntries} /{" "}
//                                     {isAltiorans
//                                         ? "∞"
//                                         : limits.maxTradingEntries}
//                                 </span>
//                             </div>
//                             {!isAltiorans && (
//                                 <div className="h-2 w-full rounded-full bg-white/10">
//                                     <div
//                                         className={`h-2 rounded-full transition-all duration-300 ${
//                                             usage.monthlyTradingEntries >=
//                                             limits.maxTradingEntries
//                                                 ? "bg-red-400"
//                                                 : "bg-white/60"
//                                         }`}
//                                         style={{
//                                             width: `${Math.min((usage.monthlyTradingEntries / limits.maxTradingEntries) * 100, 100)}%`,
//                                         }}
//                                     />
//                                 </div>
//                             )}
//                         </div>

//                         {/* Habits Usage */}
//                         <div className="rounded-lg border border-white/10 bg-white/5 p-3">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <div className="flex items-center space-x-2">
//                                     <Target className="h-4 w-4 text-white/60" />
//                                     <span className="text-sm text-white/80">
//                                         Habits
//                                     </span>
//                                 </div>
//                                 <span className="text-sm text-white/60">
//                                     {usage.currentHabits} /{" "}
//                                     {isAltiorans ? "∞" : limits.maxHabits}
//                                 </span>
//                             </div>
//                             {!isAltiorans && (
//                                 <div className="h-2 w-full rounded-full bg-white/10">
//                                     <div
//                                         className={`h-2 rounded-full transition-all duration-300 ${
//                                             usage.currentHabits >=
//                                             limits.maxHabits
//                                                 ? "bg-red-400"
//                                                 : "bg-white/60"
//                                         }`}
//                                         style={{
//                                             width: `${Math.min((usage.currentHabits / limits.maxHabits) * 100, 100)}%`,
//                                         }}
//                                     />
//                                 </div>
//                             )}
//                         </div>

//                         {/* Goals Usage */}
//                         <div className="rounded-lg border border-white/10 bg-white/5 p-3">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <div className="flex items-center space-x-2">
//                                     <Calendar className="h-4 w-4 text-white/60" />
//                                     <span className="text-sm text-white/80">
//                                         Goals
//                                     </span>
//                                 </div>
//                                 <span className="text-sm text-white/60">
//                                     {usage.currentAnnualGoals +
//                                         usage.currentQuarterlyGoals}{" "}
//                                     /{" "}
//                                     {isAltiorans
//                                         ? "∞"
//                                         : limits.maxAnnualGoals +
//                                           limits.maxQuarterlyGoals}
//                                 </span>
//                             </div>
//                             {!isAltiorans && (
//                                 <div className="h-2 w-full rounded-full bg-white/10">
//                                     <div
//                                         className={`h-2 rounded-full transition-all duration-300 ${
//                                             (
//                                                 usage.currentAnnualGoals +
//                                                     usage.currentQuarterlyGoals
//                                             ) >=
//                                             (
//                                                 limits.maxAnnualGoals +
//                                                     limits.maxQuarterlyGoals
//                                             )
//                                                 ? "bg-red-400"
//                                                 : "bg-white/60"
//                                         }`}
//                                         style={{
//                                             width: `${Math.min(((usage.currentAnnualGoals + usage.currentQuarterlyGoals) / (limits.maxAnnualGoals + limits.maxQuarterlyGoals)) * 100, 100)}%`,
//                                         }}
//                                     />
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Features Summary */}
//             <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                     <h4 className="font-bold text-base text-white tracking-wide">
//                         FEATURES INCLUDED
//                     </h4>
//                     <button
//                         className="flex items-center space-x-1 text-sm text-white/60 transition-colors hover:text-white"
//                         onClick={() => setShowDetails(!showDetails)}
//                     >
//                         <span className="animatio-pulse font-bold">
//                             {showDetails ? "Show less" : "See more"}
//                         </span>
//                         {showDetails ? (
//                             <ChevronUp className="h-4 w-4" />
//                         ) : (
//                             <ChevronDown className="h-4 w-4" />
//                         )}
//                     </button>
//                 </div>

//                 {/* Basic features always visible */}
//                 <div className="space-y-2">
//                     <div className="flex items-center space-x-3">
//                         <div className="h-2 w-2 rounded-full bg-white/60" />
//                         <span className="text-sm text-white/80">
//                             Trading journal (10 entries/month)
//                         </span>
//                     </div>
//                     <div className="flex items-center space-x-3">
//                         <div className="h-2 w-2 rounded-full bg-white/60" />
//                         <span className="text-sm text-white/80">
//                             Habit tracking (3 max)
//                         </span>
//                     </div>
//                     <div className="flex items-center space-x-3">
//                         <div className="h-2 w-2 rounded-full bg-white/60" />
//                         <span className="text-sm text-white/80">
//                             1 annual goal + 1 quarterly
//                         </span>
//                     </div>
//                 </div>

//                 {/* Detailed features - collapsible with animation */}
//                 <div
//                     className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                         showDetails
//                             ? "max-h-96 opacity-100"
//                             : "max-h-0 opacity-0"
//                     }`}
//                 >
//                     <div className="space-y-4 border-white/10 border-t pt-4">
//                         {/* Free Features */}
//                         <div className="space-y-2">
//                             <div className="flex items-center space-x-3">
//                                 <div className="h-2 w-2 rounded-full bg-white/60" />
//                                 <span className="text-sm text-white/80">
//                                     Basic analytics
//                                 </span>
//                             </div>
//                             <div className="flex items-center space-x-3">
//                                 <div className="h-2 w-2 rounded-full bg-white/60" />
//                                 <span className="text-sm text-white/80">
//                                     Community access
//                                 </span>
//                             </div>
//                         </div>

//                         {/* Pro Features - Show if Pro or as locked */}
//                         {isPro ? (
//                             <div className="space-y-2 border-white/10 border-t pt-4">
//                                 <div className="flex items-center space-x-3">
//                                     <div className="h-2 w-2 rounded-full bg-green-400" />
//                                     <span className="text-green-400 text-sm">
//                                         Unlimited trading journal
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center space-x-3">
//                                     <div className="h-2 w-2 rounded-full bg-green-400" />
//                                     <span className="text-green-400 text-sm">
//                                         Unlimited habit tracking
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center space-x-3">
//                                     <div className="h-2 w-2 rounded-full bg-green-400" />
//                                     <span className="text-green-400 text-sm">
//                                         Unlimited goal planning
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center space-x-3">
//                                     <div className="h-2 w-2 rounded-full bg-green-400" />
//                                     <span className="text-green-400 text-sm">
//                                         Virtual assistant & Pomodoro
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center space-x-3">
//                                     <div className="h-2 w-2 rounded-full bg-green-400" />
//                                     <span className="text-green-400 text-sm">
//                                         Deep work tracking
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center space-x-3">
//                                     <div className="h-2 w-2 rounded-full bg-green-400" />
//                                     <span className="text-green-400 text-sm">
//                                         Discord integration
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center space-x-3">
//                                     <div className="h-2 w-2 rounded-full bg-green-400" />
//                                     <span className="text-green-400 text-sm">
//                                         Priority support
//                                     </span>
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="space-y-2 border-white/10 border-t pt-4">
//                                 <div className="flex items-center space-x-3 opacity-50">
//                                     <div className="h-2 w-2 rounded-full bg-white/20" />
//                                     <span className="text-sm text-white/40">
//                                         Unlimited trading journal
//                                     </span>
//                                     <Star className="h-3 w-3 text-white/20" />
//                                 </div>
//                                 <div className="flex items-center space-x-3 opacity-50">
//                                     <div className="h-2 w-2 rounded-full bg-white/20" />
//                                     <span className="text-sm text-white/40">
//                                         Unlimited habit tracking
//                                     </span>
//                                     <Star className="h-3 w-3 text-white/20" />
//                                 </div>
//                                 <div className="flex items-center space-x-3 opacity-50">
//                                     <div className="h-2 w-2 rounded-full bg-white/20" />
//                                     <span className="text-sm text-white/40">
//                                         Unlimited goal planning
//                                     </span>
//                                     <Star className="h-3 w-3 text-white/20" />
//                                 </div>
//                                 <div className="flex items-center space-x-3 opacity-50">
//                                     <div className="h-2 w-2 rounded-full bg-white/20" />
//                                     <span className="text-sm text-white/40">
//                                         Virtual assistant & Pomodoro
//                                     </span>
//                                     <Star className="h-3 w-3 text-white/20" />
//                                 </div>
//                                 <div className="flex items-center space-x-3 opacity-50">
//                                     <div className="h-2 w-2 rounded-full bg-white/20" />
//                                     <span className="text-sm text-white/40">
//                                         Deep work tracking
//                                     </span>
//                                     <Star className="h-3 w-3 text-white/20" />
//                                 </div>
//                                 <div className="flex items-center space-x-3 opacity-50">
//                                     <div className="h-2 w-2 rounded-full bg-white/20" />
//                                     <span className="text-sm text-white/40">
//                                         Discord integration
//                                     </span>
//                                     <Star className="h-3 w-3 text-white/20" />
//                                 </div>
//                                 <div className="flex items-center space-x-3 opacity-50">
//                                     <div className="h-2 w-2 rounded-full bg-white/20" />
//                                     <span className="text-sm text-white/40">
//                                         Priority support
//                                     </span>
//                                     <Star className="h-3 w-3 text-white/20" />
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Pro Benefits Highlight */}
//             {!isPro && (
//                 <div className="rounded-xl border border-white/20 bg-gradient-to-r from-white/5 to-white/10 p-4">
//                     <div className="mb-3 flex items-center space-x-3">
//                         <Zap className="h-5 w-5 text-white/60" />
//                         <span className="font-bold text-sm text-white tracking-wide">
//                             PRO BENEFITS
//                         </span>
//                     </div>
//                     <p className="text-sm text-white/70">
//                         Unlock advanced features, unlimited tracking, and
//                         exclusive Discord community access to accelerate your
//                         growth.
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// }
