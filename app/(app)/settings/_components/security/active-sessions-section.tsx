"use client";

import {
    RiComputerLine,
    RiDeleteBinLine,
    RiDeviceLine,
    RiLogoutBoxLine,
} from "@remixicon/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";
import { signOut } from "@/server/actions/sign-out";

export function ActiveSessionsSection() {
    const [isTerminating, setIsTerminating] = useState(false);

    const { data: sessions, refetch } = useSuspenseQuery(
        orpc.auth.getSessions.queryOptions({})
    );

    const handleTerminate = async (sessionId: string) => {
        try {
            setIsTerminating(true);
            await authClient.revokeSession({
                token: sessionId,
            });
            refetch();
        } catch (error) {
            console.error("Error terminating session:", error);
        } finally {
            setIsTerminating(false);
        }
        refetch();
    };

    return (
        <div>
            <div className="mb-2 flex items-center gap-2">
                <RiDeviceLine size={16} />
                <h3 className="font-semibold">Active Sessions</h3>
            </div>
            <p className="mb-4 text-sm text-white/60">
                View and manage your active sessions.
            </p>

            <div className="space-y-2">
                {sessions.length === 0 ? (
                    <p className="text-sm text-white/60">
                        No active sessions found.
                    </p>
                ) : (
                    sessions.map((session) => (
                        <div
                            className="flex items-center justify-between border border-neutral-800 bg-neutral-900 p-4"
                            key={session.id}
                        >
                            <div className="flex items-center space-x-3">
                                <RiComputerLine size={20} />
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-white">
                                        {session.deviceInfo}
                                    </span>
                                    {session.isCurrent && (
                                        <Badge className="border-green-500/30 bg-green-500/20 text-green-300 hover:bg-green-500/20 hover:text-green-300">
                                            Current
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {session.isCurrent ? (
                                    <Button
                                        className="hover:border-red-500/10 hover:bg-red-500/5 hover:text-red-500"
                                        onClick={() => signOut()}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <RiLogoutBoxLine className="size-4" />
                                        Sign Out
                                    </Button>
                                ) : (
                                    <Button
                                        className="hover:border-red-500/10 hover:bg-red-500/5 hover:text-red-500"
                                        disabled={isTerminating}
                                        onClick={() =>
                                            handleTerminate(session.token)
                                        }
                                        size="sm"
                                        variant="outline"
                                    >
                                        <RiDeleteBinLine className="size-4" />
                                        Terminate
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
