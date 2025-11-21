"use client";

import {
    RiAddLine,
    RiChromeLine,
    RiComputerLine,
    RiEdgeLine,
    RiFirefoxLine,
    RiKey2Line,
    RiMacbookLine,
    RiSmartphoneLine,
    RiUbuntuLine,
    RiWindowsLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { AddPasskeyModal } from "./add-passkey-modal";
import { PasskeyEntry } from "./passkey-entry";

export const DEVICE_ICON_MAPPINGS = {
    browsers: {
        chrome: RiChromeLine,
        firefox: RiFirefoxLine,
        edge: RiEdgeLine,
    },
    devices: {
        mobile: {
            keywords: ["iphone", "android", "ios"],
            icon: RiSmartphoneLine,
        },
        mac: {
            keywords: ["mac"],
            icon: RiMacbookLine,
        },
        windows: {
            keywords: ["windows"],
            icon: RiWindowsLine,
        },
        linux: {
            keywords: ["linux", "ubuntu"],
            icon: RiUbuntuLine,
        },
        computer: {
            keywords: ["computer", "pc"],
            icon: RiComputerLine,
        },
    },
} as const;

export function PasskeysSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: passkeys, refetch } = useQuery({
        queryKey: ["passkeys"],
        queryFn: () => authClient.passkey.listUserPasskeys(),
    });

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="mb-2 flex items-center gap-2">
                <RiKey2Line size={16} />
                <h3 className="font-semibold">Passkeys</h3>
            </div>
            <p className="mb-4 max-w-xl text-sm text-white/60">
                Add a passkey to your account to enhance your security.
            </p>
            <Button
                className="mb-4"
                onClick={handleOpenModal}
                size="sm"
                variant="outline"
            >
                <RiAddLine className="mr-2 size-4" />
                Add Passkey
            </Button>

            <div className="space-y-2">
                {passkeys?.data?.map((passkey) => (
                    <PasskeyEntry
                        key={passkey.id}
                        onRefetch={refetch}
                        passkey={passkey}
                    />
                ))}
            </div>

            <AddPasskeyModal
                isModalOpen={isModalOpen}
                onComplete={refetch}
                setIsModalOpen={setIsModalOpen}
            />
        </div>
    );
}
