import { CreditCard, MessageCircle, Shield, User } from "lucide-react";
import { Suspense } from "react";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { Header } from "@/components/layout/Header";
import { DiscordConnection } from "@/components/profile/DiscordConnection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { LeaderboardVisibility } from "@/components/settings/LeaderboardVisibility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/orpc/server";

export default async function SettingsPage() {
    const user = await api.auth.getCurrentUser();

    return (
        <>
            <Header />

            <div className="min-h-screen bg-pure-black text-pure-white">
                <div className="relative mx-auto w-full">
                    {/* Header */}
                    <div className="relative mb-8 border-white/10 border-b">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
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
                                            <User className="h-5 w-5" />
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
                                            <MessageCircle className="h-5 w-5" />
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
                                            <CreditCard className="h-5 w-5" />
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
                                            <Shield className="h-5 w-5" />
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
                    <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/[0.01] blur-3xl" />
                    <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/[0.005] blur-3xl" />
                </div>
            </div>

            {/* Discord Welcome Checker */}
            <DiscordWelcomeChecker forceShow={true} />
        </>
    );
}
