"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { RiErrorWarningLine, RiAddLine, RiSearchLine, RiDeleteBinLine } from "@remixicon/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc/client";

interface SessionsManagerProps {
    journalId: string;
}

export function SessionsManager({ journalId }: SessionsManagerProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [newSession, setNewSession] = useState({
        name: "",
        description: "",
        startTime: "",
        endTime: "",
        timezone: "UTC",
    });

    const { data: sessions, isLoading } = useQuery(
        orpc.trading.getSessions.queryOptions({ input: { journalId } })
    );

    const { data: trades } = useQuery(
        orpc.trading.getTrades.queryOptions({ input: { journalId } })
    );

    const createSessionMutation = useMutation(
        orpc.trading.createSession.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getSessions.queryKey({ input: { journalId } }),
                ],
            },
            onSuccess: () => {
                setNewSession({
                    name: "",
                    description: "",
                    startTime: "",
                    endTime: "",
                    timezone: "UTC",
                });
            },
        })
    );

    const { mutateAsync: deleteSession } = useMutation(
        orpc.trading.deleteSession.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getSessions.queryKey({ input: { journalId } }),
                ],
            },
        })
    );

    const handleCreateSession = async () => {
        if (!newSession.name.trim()) {
            return;
        }

        try {
            await createSessionMutation.mutateAsync({
                journalId,
                name: newSession.name.trim(),
                description: newSession.description.trim() || undefined,
                startTime: newSession.startTime || undefined,
                endTime: newSession.endTime || undefined,
                timezone: newSession.timezone,
            });
        } catch (error) {
            console.error("Error creating session:", error);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        await deleteSession({ id: sessionId });
    };

    const sessionPerformances =
        sessions?.map((session) => {
            const sessionTrades =
                trades?.filter((trade) => trade.sessionId === session.id) || [];
            const totalPnL = sessionTrades.reduce((sum, trade) => {
                const pnl = Number(trade.profitLossPercentage);
                return sum + pnl;
            }, 0);

            return {
                ...session,
                totalPnL,
                tradesCount: sessionTrades.length,
            };
        }) || [];

    const filteredSessions = sessionPerformances.filter(
        (session) =>
            session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <Card className="border border-white/10 bg-black/20">
                <CardHeader>
                    <CardTitle className="text-white">Sessions</CardTitle>
                    <CardDescription className="text-white/60">
                        Loading sessions...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-white border-b-2" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-white/10 bg-black/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-white">Sessions</CardTitle>
                        <CardDescription className="text-white/60">
                            {sessions?.length || 0} sessions • Manage your
                            trading sessions
                        </CardDescription>
                    </div>
                    <Button
                        className="bg-white text-black hover:bg-gray-200"
                        onClick={() => setIsCreating(!isCreating)}
                    >
                        <RiAddLine className="mr-2 h-4 w-4" />
                        Add Session
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <RiSearchLine className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-white/40" />
                    <Input
                        className="border-white/30 bg-black pl-10 text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search sessions..."
                        value={searchTerm}
                    />
                </div>

                {/* Create new session form */}
                {isCreating && (
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                        <h3 className="mb-4 font-medium text-white">
                            Create New Session
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-white/80">Name *</Label>
                                <Input
                                    className="border-white/30 bg-black text-white placeholder:text-white/50 focus:border-white focus:ring-1 focus:ring-white"
                                    onChange={(e) =>
                                        setNewSession((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="London Session"
                                    value={newSession.name}
                                />
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <Button
                                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                                    onClick={() => setIsCreating(false)}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-white text-black hover:bg-gray-200"
                                    disabled={
                                        !newSession.name.trim() ||
                                        createSessionMutation.isPending
                                    }
                                    onClick={handleCreateSession}
                                >
                                    {createSessionMutation.isPending
                                        ? "Creating..."
                                        : "Create Session"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sessions list */}
                {filteredSessions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredSessions.map((session) => (
                            <div
                                className="group relative flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:border-white/20"
                                key={session.id}
                                title={`Performance: ${session.totalPnL >= 0 ? "+" : ""}${session.totalPnL.toFixed(1)}% • ${session.tradesCount} trades`}
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">
                                        {session.name}
                                    </span>
                                    <span
                                        className={`text-xs ${session.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                                    >
                                        {session.totalPnL >= 0 ? "+" : ""}
                                        {session.totalPnL.toFixed(1)}%
                                    </span>
                                </div>
                                <Button
                                    className="h-8 w-8 p-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    onClick={() =>
                                        handleDeleteSession(session.id)
                                    }
                                    size="sm"
                                    variant="ghost"
                                >
                                    <RiDeleteBinLine className="h-4 w-4" />
                                </Button>

                                {/* Tooltip détaillé au hover */}
                                <div className="-translate-x-1/2 pointer-events-none absolute top-full left-1/2 z-50 mt-2 transform whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 py-2 text-black text-sm opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                    <div className="text-center">
                                        <div className="font-medium text-black">
                                            {session.name}
                                        </div>
                                        <div
                                            className={`${session.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {session.totalPnL >= 0 ? "+" : ""}
                                            {session.totalPnL.toFixed(1)}%
                                        </div>
                                        <div className="text-gray-600 text-xs">
                                            {session.tradesCount} trade
                                            {session.tradesCount !== 1
                                                ? "s"
                                                : ""}
                                        </div>
                                    </div>
                                    {/* Flèche du tooltip */}
                                    <div className="-translate-x-1/2 absolute bottom-full left-1/2 h-0 w-0 transform border-transparent border-r-4 border-b-4 border-b-white border-l-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <RiErrorWarningLine className="mx-auto mb-4 h-12 w-12 text-white/40" />
                        <p className="text-white/60">
                            {searchTerm
                                ? "No sessions found matching your search"
                                : "No sessions found"}
                        </p>
                        <p className="text-sm text-white/40">
                            {searchTerm
                                ? "Try a different search term"
                                : "Start by creating your first session"}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
