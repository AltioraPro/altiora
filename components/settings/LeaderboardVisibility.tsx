"use client";

import { useState } from "react";
import { api } from "@/trpc/client";

interface LeaderboardVisibilityProps {
    initialIsPublic: boolean;
}

export function LeaderboardVisibility({
    initialIsPublic,
}: LeaderboardVisibilityProps) {
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
                    <p className="font-medium text-sm text-white">
                        Public Leaderboard
                    </p>
                    <p className="mt-1 text-white/40 text-xs">
                        Share your deep work progress
                    </p>
                </div>

                <button
                    className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                        isPublic ? "bg-white" : "bg-white/20"
                    } ${updateVisibility.isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    disabled={updateVisibility.isPending}
                    onClick={handleToggle}
                >
                    <div
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-all duration-300 ${
                            isPublic
                                ? "translate-x-5 bg-black"
                                : "translate-x-0 bg-white"
                        }`}
                    />
                </button>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-white/40 text-xs leading-relaxed">
                    {isPublic ? (
                        <>
                            Your Discord username and deep work hours are
                            visible on the public leaderboard.
                        </>
                    ) : (
                        <>
                            Your progress remains private and won&apos;t appear
                            on the leaderboard.
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
