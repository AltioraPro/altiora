import { RiSparklingLine } from "@remixicon/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/constants/pages";
import { HabitCardWithProvider } from "./habit-card-with-provider";
import { CreateGoalCard } from "./onboarding/create-goal-card";
import { CreateJournalCard } from "./onboarding/create-journal-card";

export function OnboardingContent() {
    return (
        <div className="container mx-auto min-h-screen px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-16 text-center">
                    <h1 className="mb-3 font-argesta font-bold text-5xl text-white">
                        Welcome to Altiora!
                    </h1>
                    <p className="text-base text-white/50">
                        Create your first journal, habit, or goal to start
                        building your knowledge base.
                    </p>
                </div>

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
                        Connect your Discord account for notifications and
                        reminders
                    </p>
                    <Link href={PAGES.PROFILE}>
                        <Button
                            className="border-white/20 bg-transparent text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                            size="sm"
                            variant="outline"
                        >
                            Connect Discord
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
