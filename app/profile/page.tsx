import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ActivityStats } from "@/components/profile/ActivityStats";
import { HabitHeatmap } from "@/components/profile/HabitHeatmap";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import Image from "next/image";
import { api } from "@/trpc/server";

async function PomodoroStats() {
const stats = await api.profile.getUserStats();

return (
    <div className="bg-black/5 rounded-lg p-4 h-full flex flex-col justify-center">
    <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-4 text-center">Pomodoro</p>
    <div className="space-y-4">
        <div className="text-center">
        <p className="text-3xl font-light text-white leading-none">{stats.pomodoro.totalSessions}</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1.5">Total</p>
        </div>
        <div className="h-px w-full bg-white/10" />
        <div className="text-center">
        <p className="text-3xl font-light text-white leading-none">{stats.pomodoro.completedSessions}</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1.5">Done</p>
        </div>
        <div className="h-px w-full bg-white/10" />
        <div className="text-center">
        <p className="text-3xl font-light text-white leading-none">{Math.floor(stats.pomodoro.totalWorkTime / 60)}h</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1.5">Focus</p>
        </div>
    </div>
    </div>
);
}

export default async function ProfilePage() {
const user = await api.auth.getCurrentUser();

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    }).format(date);
};

return (
    <>
    <Header />
    
    <div className="min-h-screen bg-pure-black text-pure-white">
        <div className="relative w-full mx-auto">
        {/* Header */}
        <div className="relative border-b border-white/10 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="relative max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold font-argesta tracking-tight">
                    Profile
                </h1>
                <p className="text-white/60 text-sm mt-2">
                    Your account information and activity overview.
                </p>
                </div>
            </div>
            </div>
        </div>

        {/* Profile Card */}
        <div className="mb-8 max-w-7xl mx-auto">
            <Card className="border border-white/10 bg-black/20">
            <CardContent className="p-8">
                <div className="flex gap-8 justify-between">
                {/* Left Side - Avatar + Info + Heatmap */}
                <div className="flex-1 space-y-6">
                    {/* Avatar + Info */}
                    <div className="flex items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-2 border-white/20 bg-white/5 flex items-center justify-center overflow-hidden">
                        {user.discordConnected && user.discordAvatar ? (
                            <Image 
                            src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                            alt={user.name} 
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            priority
                            />
                        ) : user.image ? (
                            <Image 
                            src={user.image} 
                            alt={user.name} 
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            priority
                            />
                        ) : (
                            <User className="w-16 h-16 text-white/40" />
                        )}
                        </div>
                        {user.discordConnected && (
                        <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#5865F2] rounded-full border-2 border-black flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-argesta text-white font-bold">
                            {user.name}
                            </h2>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/60 font-medium uppercase tracking-wider">
                            {user.rank}
                            </span>
                        </div>
                        <p className="text-white/60">{user.email}</p>
                        </div>

                        {/* Member Since */}
                        <div className="mt-4">
                        <p className="text-white/40 text-sm">
                            Member since {formatDate(user.createdAt)}
                        </p>
                        </div>
                    </div>
                    </div>

                    {/* Habit Heatmap */}
                    <div>
                    <Suspense fallback={
                        <div className="animate-pulse">
                        <div className="h-6 bg-white/10 rounded w-40 mb-4" />
                        <div className="h-32 bg-white/10 rounded" />
                        </div>
                    }>
                        <HabitHeatmap />
                    </Suspense>
                    </div>
                </div>

                {/* Right Side - Pomodoro Stats */}
                <div className="w-56">
                    <Suspense fallback={
                    <div className="bg-black/5 rounded-lg p-4 animate-pulse h-full">
                        <div className="h-20 bg-white/5 rounded" />
                    </div>
                    }>
                    <PomodoroStats />
                    </Suspense>
                </div>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Activity Stats */}
        <div className="max-w-7xl mx-auto mb-8">
            <h2 className="text-2xl font-argesta text-white font-bold mb-6">Activity Overview</h2>
            <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                <div key={i} className="p-6 bg-black/20 rounded-lg border border-white/10 animate-pulse">
                    <div className="h-6 bg-white/10 rounded mb-3" />
                    <div className="h-8 bg-white/10 rounded mb-2" />
                    <div className="h-4 bg-white/10 rounded" />
                </div>
                ))}
            </div>
            }>
            <ActivityStats />
            </Suspense>
        </div>
        </div>

        {/* Background decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl" />
        </div>
    </div>
    </>
);
}

