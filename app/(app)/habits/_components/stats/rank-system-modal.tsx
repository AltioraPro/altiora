"use client";

import { memo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";
import { AllRanksList } from "./all-ranks-list";
import { CurrentRankCard } from "./current-rank-card";
import { NextRankProgress } from "./next-rank-progress";
import { getDaysToNextRank, type RankInfo } from "./rank-system";

interface RankSystemModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRank: RankInfo;
    nextRank: RankInfo | undefined;
    currentStreak: number;
}

function RankSystemModalComponent({
    isOpen,
    onClose,
    currentRank,
    nextRank,
    currentStreak,
}: RankSystemModalProps) {
    const daysToNextRank = getDaysToNextRank(currentStreak, nextRank);

    return (
        <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
            <DialogPortal>
                <DialogOverlay />
            </DialogPortal>
            <DialogContent
                className="max-h-[90vh] max-w-2xl overflow-y-auto"
                overlay={false}
            >
                <DialogHeader>
                    <DialogTitle>RANK SYSTEM</DialogTitle>
                </DialogHeader>

                <CurrentRankCard rank={currentRank} />

                {nextRank && (
                    <NextRankProgress
                        currentStreak={currentStreak}
                        daysToNextRank={daysToNextRank}
                        nextRank={nextRank}
                    />
                )}

                <AllRanksList
                    currentRank={currentRank}
                    currentStreak={currentStreak}
                />
            </DialogContent>
        </Dialog>
    );
}

export const RankSystemModal = memo(RankSystemModalComponent);
