import { RiSparklingLine } from "@remixicon/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { HabitCardWithProvider } from "./habit-card-with-provider";
import { CreateGoalCard } from "./onboarding/create-goal-card";
import { CreateJournalCard } from "./onboarding/create-journal-card";

export function OnboardingContent() {
    return (
        <div>
            <div className="mb-16">
                <div className="mb-8 flex items-center gap-2">
                    <RiSparklingLine className="h-5 w-5 text-white/50" />
                    <h2 className="font-semibold text-lg text-white/90">
                        Get Started
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <CreateJournalCard />
                    <HabitCardWithProvider />
                    <CreateGoalCard />
                </div>
            </div>

            <div className="text-center">
                <p className="mb-2 text-sm text-white/50">
                    Connect your Discord account for notifications and reminders
                </p>
                <Link href={PAGES.PROFILE}>
                    <Button size="sm" variant="outline">
                        Connect Discord
                    </Button>
                </Link>
            </div>
        </div>
    );
}
