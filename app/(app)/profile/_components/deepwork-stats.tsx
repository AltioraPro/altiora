"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function DeepworkStats() {
    const { data: stats } = useSuspenseQuery(
        orpc.profile.getUserStats.queryOptions({})
    );

    return (
        <div className="flex h-full flex-col justify-center rounded-lg bg-black/5 p-4">
            <p className="mb-4 text-center text-[10px] text-white/40 uppercase tracking-[0.2em]">
                Deepwork
            </p>
            <div className="space-y-4">
                <div className="text-center">
                    <p className="font-light text-3xl text-white leading-none">
                        {stats.deepwork.totalSessions}
                    </p>
                    <p className="mt-1.5 text-[10px] text-white/40 uppercase tracking-widest">
                        Sessions
                    </p>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="text-center">
                    <p className="font-light text-3xl text-white leading-none">
                        {stats.deepwork.completedSessions}
                    </p>
                    <p className="mt-1.5 text-[10px] text-white/40 uppercase tracking-widest">
                        Completed
                    </p>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="text-center">
                    <p className="font-light text-3xl text-white leading-none">
                        {Math.floor(stats.deepwork.totalWorkTime / 60)}h
                    </p>
                    <p className="mt-1.5 text-[10px] text-white/40 uppercase tracking-widest">
                        Focus Time
                    </p>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="text-center">
                    <p className="font-light text-3xl text-white leading-none">
                        {Math.floor(stats.deepwork.averageSessionDuration / 60)}
                        h
                    </p>
                    <p className="mt-1.5 text-[10px] text-white/40 uppercase tracking-widest">
                        Avg Duration
                    </p>
                </div>
            </div>
        </div>
    );
}
