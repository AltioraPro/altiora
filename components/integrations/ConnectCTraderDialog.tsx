"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ConnectCTraderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    journalId: string;
}

export function ConnectCTraderDialog({
    open,
    onOpenChange,
    journalId,
}: ConnectCTraderDialogProps) {
    const _router = useRouter();

    const handleOAuthConnect = () => {
        // Redirect to OAuth authorization
        const authUrl = `/api/integrations/ctrader/authorize?journalId=${journalId}`;
        window.location.href = authUrl;
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Connect cTrader Account</DialogTitle>
                    <DialogDescription>
                        Connect your cTrader account to automatically sync your
                        trades.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-muted-foreground text-sm">
                        Click the button below to authorize Altiora to access
                        your cTrader account. You'll be redirected to cTrader to
                        complete the authorization.
                    </p>
                    <Button className="w-full" onClick={handleOAuthConnect}>
                        Authorize with cTrader
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
