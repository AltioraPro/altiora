"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";

interface LeaderboardVisibilityProps {
    initialIsPublic: boolean;
}

export function LeaderboardVisibility({
    initialIsPublic,
}: LeaderboardVisibilityProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);

    const { mutateAsync: updateVisibility, isPending } = useMutation(
        orpc.auth.updateLeaderboardVisibility.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.auth.getCurrentUser.queryKey({ input: {} }),
                ],
            },
        })
    );

    const handleToggle = async () => {
        const newValue = !isPublic;
        setIsPublic(newValue);
        await updateVisibility({ isPublic: newValue });
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
                    className={cn(
                        "relative h-6 w-11 rounded-full transition-colors duration-300",
                        isPublic ? "bg-white" : "bg-white/20",
                        isPending
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                    )}
                    disabled={isPending}
                    onClick={handleToggle}
                    type="button"
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
