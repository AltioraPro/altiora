"use client";

import { RiCheckLine, RiLinkUnlink, RiSettings4Line } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/orpc/client";
import { ConnectCTraderDialog } from "./ConnectCTraderDialog";
import { ConnectMetaTraderDialog } from "./ConnectMetaTraderDialog";

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

    const { mutateAsync: disconnectBroker, isPending: isDisconnecting } =
        useMutation(
            orpc.integrations.disconnectBroker.mutationOptions({
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: ["integrations", "getBrokerConnection"],
                    });
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
    if (!(isConnected && provider) || isLoading) {
        return null;
    }

    return (
        <>
            <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button className="gap-2" variant="outline">
                        <RiCheckLine className="size-4 text-green-500" />
                        {provider === "ctrader" ? "cTrader" : "MetaTrader"}
                        <Badge className="ml-1 py-0 text-xs" variant="success">
                            Connected
                        </Badge>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Broker Integration</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {provider === "ctrader" && (
                        <DropdownMenuItem
                            className="cursor-pointer gap-2"
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
                            className="cursor-pointer gap-2"
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
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        disabled={isDisconnecting}
                        onSelect={(e) => {
                            e.preventDefault();
                            handleDisconnect();
                        }}
                    >
                        <RiLinkUnlink className="size-4" />
                        {isDisconnecting
                            ? "Disconnecting..."
                            : "Disconnect Broker"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConnectCTraderDialog
                journalId={journalId}
                onOpenChange={setCtraderDialogOpen}
                open={ctraderDialogOpen}
            />
            <ConnectMetaTraderDialog
                journalId={journalId}
                onOpenChange={setMetatraderDialogOpen}
                open={metatraderDialogOpen}
            />
        </>
    );
}
