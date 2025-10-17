"use client";

import { useState } from "react";
import { api } from "@/trpc/client";

interface LeaderboardVisibilityProps {
    initialIsPublic: boolean;
}

export function LeaderboardVisibility({ initialIsPublic }: LeaderboardVisibilityProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const utils = api.useUtils();

    const updateVisibility = api.auth.updateLeaderboardVisibility.useMutation({
        onSuccess: () => {
            utils.auth.getCurrentUser.invalidate();
        },
        onError: (error) => {
            console.error("Error updating leaderboard visibility:", error);
            setIsPublic(!isPublic);
        },
    });

    const handleToggle = () => {
        const newValue = !isPublic;
        setIsPublic(newValue);
        updateVisibility.mutate({ isPublic: newValue });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white text-sm font-medium">Public Leaderboard</p>
                    <p className="text-white/40 text-xs mt-1">
                        Share your deep work progress
                    </p>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={updateVisibility.isPending}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isPublic ? "bg-white" : "bg-white/20"
                        } ${updateVisibility.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                    <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-300 ${isPublic ? "translate-x-5 bg-black" : "translate-x-0 bg-white"
                            }`}
                    />
                </button>
            </div>

            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/40 text-xs leading-relaxed">
                    {isPublic ? (
                        <>
                            Your Discord username and deep work hours are visible on the public leaderboard.
                        </>
                    ) : (
                        <>
                            Your progress remains private and won&apos;t appear on the leaderboard.
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

