"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    RiCheckLine,
    RiSettings4Line,
    RiLinkUnlink,
} from "@remixicon/react";
import { ConnectCTraderDialog } from "./ConnectCTraderDialog";
import { ConnectMetaTraderDialog } from "./ConnectMetaTraderDialog";
import { orpc } from "@/orpc/client";
import { toast } from "sonner";

interface BrokerConnectMenuProps {
    journalId: string;
}

export function BrokerConnectMenu({ journalId }: BrokerConnectMenuProps) {
    const [ctraderDialogOpen, setCtraderDialogOpen] = useState(false);
    const [metatraderDialogOpen, setMetatraderDialogOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const queryClient = useQueryClient();

    // Check current broker connection
    const { data: brokerConnection, isLoading } = useQuery(
        orpc.integrations.getBrokerConnection.queryOptions({
            input: { journalId },
        })
    );

    const { mutateAsync: disconnectBroker, isPending: isDisconnecting } = useMutation(
        orpc.integrations.disconnectBroker.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["integrations", "getBrokerConnection"] });
                toast.success("Broker disconnected successfully");
            },
            onError: () => {
                toast.error("Failed to disconnect broker");
            },
        })
    );

    const isConnected = !!brokerConnection?.isActive;
    const provider = brokerConnection?.provider;

    const openCTraderDialog = () => {
        setDropdownOpen(false);
        setTimeout(() => {
            setCtraderDialogOpen(true);
        }, 100);
    };

    const openMetaTraderDialog = () => {
        setDropdownOpen(false);
        setTimeout(() => {
            setMetatraderDialogOpen(true);
        }, 100);
    };

    const handleDisconnect = async () => {
        setDropdownOpen(false);
        await disconnectBroker({ journalId });
    };

    // Only show when connected - connection is handled during journal creation
    if (!isConnected || !provider || isLoading) {
        return null;
    }

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <RiCheckLine className="size-4 text-green-500" />
                        {provider === "ctrader" ? "cTrader" : "MetaTrader"}
                        <Badge variant="success" className="ml-1 text-xs py-0">
                            Connected
                        </Badge>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Broker Integration</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {provider === "ctrader" && (
                        <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onSelect={(e) => {
                                e.preventDefault();
                                openCTraderDialog();
                            }}
                        >
                            <RiSettings4Line className="size-4" />
                            cTrader Settings
                        </DropdownMenuItem>
                    )}
                    {provider === "metatrader" && (
                        <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onSelect={(e) => {
                                e.preventDefault();
                                openMetaTraderDialog();
                            }}
                        >
                            <RiSettings4Line className="size-4" />
                            MetaTrader Settings
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        onSelect={(e) => {
                            e.preventDefault();
                            handleDisconnect();
                        }}
                        disabled={isDisconnecting}
                    >
                        <RiLinkUnlink className="size-4" />
                        {isDisconnecting ? "Disconnecting..." : "Disconnect Broker"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConnectCTraderDialog
                open={ctraderDialogOpen}
                onOpenChange={setCtraderDialogOpen}
                journalId={journalId}
            />
            <ConnectMetaTraderDialog
                open={metatraderDialogOpen}
                onOpenChange={setMetatraderDialogOpen}
                journalId={journalId}
            />
        </>
    );
}

