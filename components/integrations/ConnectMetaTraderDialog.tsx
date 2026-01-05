"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { orpc } from "@/orpc/client";

interface ConnectMetaTraderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    journalId: string;
}

type Platform = "mt4" | "mt5";

export function ConnectMetaTraderDialog({
    open,
    onOpenChange,
    journalId,
}: ConnectMetaTraderDialogProps) {
    const [copied, setCopied] = useState(false);
    const queryClient = useQueryClient();

    const { data: setupInfo, isLoading } = useQuery({
        ...orpc.integrations.metatrader.getSetupInfo.queryOptions({
            input: { journalId },
        }),
        enabled: open,
    });

    const { mutateAsync: regenerateToken, isPending: isRegenerating } = useMutation(
        orpc.integrations.metatrader.regenerateToken.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: orpc.integrations.metatrader.getSetupInfo.queryKey({
                        input: { journalId },
                    }),
                });
                toast.success("Token regenerated");
            },
        })
    );

    const handleCopyToken = async () => {
        if (setupInfo?.webhookToken) {
            await navigator.clipboard.writeText(setupInfo.webhookToken);
            setCopied(true);
            toast.success("Token copied");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadEA = (platform: Platform) => {
        if (!setupInfo?.webhookToken) return;
        const downloadUrl = `/api/integrations/metatrader/download-ea?platform=${platform}&token=${encodeURIComponent(setupInfo.webhookToken)}`;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.click();
        toast.success("EA downloaded");
    };

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!setupInfo?.hasConnection || !setupInfo?.webhookToken) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>No Connection</DialogTitle>
                        <DialogDescription>
                            This journal is not connected to MetaTrader.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>MetaTrader Settings</DialogTitle>
                    <DialogDescription>
                        Your connection details for MetaTrader
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Download EA */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">1</span>
                            <span className="font-medium">Download EA</span>
                        </div>
                        <div className="ml-8 space-y-2">
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => handleDownloadEA("mt5")} className="flex-1">
                                    MetaTrader 5
                                </Button>
                                <Button variant="outline" onClick={() => handleDownloadEA("mt4")} className="flex-1">
                                    MetaTrader 4
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Place the file in your <code className="text-foreground">Experts</code> folder, then drag it onto any chart
                            </p>
                        </div>
                    </div>

                    {/* Token */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">2</span>
                            <span className="font-medium">Your token</span>
                        </div>
                        <div className="ml-8 flex gap-2">
                            <Input
                                readOnly
                                value={setupInfo.webhookToken}
                                className="font-mono text-sm"
                            />
                            <Button
                                variant={copied ? "primary" : "outline"}
                                onClick={handleCopyToken}
                                className="shrink-0 w-20"
                            >
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>

                    {/* URL Authorization */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">3</span>
                            <span className="font-medium">Allow web requests</span>
                        </div>
                        <div className="ml-8 space-y-2">
                            <p className="text-xs text-muted-foreground">
                                In MetaTrader: <span className="text-foreground">Tools → Options → Expert Advisors</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Enable web requests and add this URL:
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={typeof window !== "undefined" ? window.location.origin : "https://altiora.app"}
                                    className="font-mono text-xs"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.origin);
                                        toast.success("URL copied");
                                    }}
                                    className="shrink-0 w-20"
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-row justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => regenerateToken({ journalId })}
                        disabled={isRegenerating}
                        className="text-muted-foreground"
                    >
                        {isRegenerating ? "Regenerating..." : "Regenerate token"}
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
