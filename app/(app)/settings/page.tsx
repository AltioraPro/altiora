import { ORPCError } from "@orpc/server";
import { RiBankCardLine, RiMessage3Line, RiShieldLine, RiUserLine } from "@remixicon/react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { DiscordConnection } from "@/components/profile/DiscordConnection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { LeaderboardVisibility } from "@/components/settings/LeaderboardVisibility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAGES } from "@/constants/pages";
import { tryCatch } from "@/lib/try-catch";
import { api } from "@/orpc/server";

export default async function SettingsPage() {
    const [error, user] = await tryCatch(api.auth.getCurrentUser());

    if (
        (error instanceof ORPCError && error.code === "UNAUTHORIZED") ||
        !user
    ) {
        return redirect(PAGES.SIGN_IN);
    }

    return (
        <>
            <div className="min-h-screen bg-pure-black text-pure-white">
                <div className="relative mx-auto w-full">
                    {/* Header */}
                    <div className="relative mb-8 border-white/10 border-b">
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent" />
                        <div className="relative mx-auto max-w-7xl px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="font-argesta font-bold text-3xl tracking-tight">
                                        Settings
                                    </h1>
                                    <p className="mt-2 text-sm text-white/60">
                                        Manage your account, integrations and
                                        subscription
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {/* Left Column - Account & Discord */}
                            <div className="space-y-6">
                                {/* Profile Card */}
                                <Card className="border border-white/10 bg-black/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 text-white">
                                            <RiUserLine className="h-5 w-5" />
                                            <span>Account Information</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Suspense
                                            fallback={
                                                <div className="h-32 animate-pulse rounded-lg bg-white/5" />
                                            }
                                        >
                                            <ProfileForm />
                                        </Suspense>
                                    </CardContent>
                                </Card>

                                {/* Discord Card */}
                                <Card className="border border-white/10 bg-black/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 text-white">
                                            <RiMessage3Line className="h-5 w-5" />
                                            <span>Discord Integration</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Suspense
                                            fallback={
                                                <div className="h-32 animate-pulse rounded-lg bg-white/5" />
                                            }
                                        >
                                            <DiscordConnection />
                                        </Suspense>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Subscription & Privacy */}
                            <div className="space-y-6">
                                <Card className="border border-white/10 bg-black/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 text-white">
                                            <RiBankCardLine className="h-5 w-5" />
                                            <span>Subscription</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Suspense
                                            fallback={
                                                <div className="h-32 animate-pulse rounded-lg bg-white/5" />
                                            }
                                        >
                                            {/* <SubscriptionStatus /> */}
                                        </Suspense>
                                    </CardContent>
                                </Card>

                                <Card className="border border-white/10 bg-black/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2 text-white">
                                            <RiShieldLine className="h-5 w-5" />
                                            <span>Privacy</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <LeaderboardVisibility
                                            initialIsPublic={
                                                user.isLeaderboardPublic
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background decoration */}
                <div className="-z-10 pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/1 blur-3xl" />
                    <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/0.5 blur-3xl" />
                </div>
            </div>

            {/* Discord Welcome Checker */}
            <DiscordWelcomeChecker forceShow={true} />
        </>
    );
}
