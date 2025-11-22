import type { Passkey } from "@better-auth/passkey";
import { RiDeleteBinLine, RiDeviceLine, RiEditLine } from "@remixicon/react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { DeletePasskeyModal } from "./delete-passkey-modal";
import { EditPasskeyModal } from "./edit-passkey-modal";
import { DEVICE_ICON_MAPPINGS } from "./passkeys-section";

interface PasskeyEntryProps {
    passkey: Passkey;
    onRefetch: () => void;
}

export function PasskeyEntry({ passkey, onRefetch }: PasskeyEntryProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleEdit = useCallback(() => {
        setShowEditDialog(true);
    }, []);

    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const getDeviceIcon = (
        name: string | undefined,
        deviceType: Passkey["deviceType"]
    ) => {
        if (!name) {
            return RiDeviceLine;
        }

        if (deviceType === "multiDevice") {
            return RiDeviceLine;
        }

        const lowercaseName = name.toLowerCase();

        for (const [browserName, IconComponent] of Object.entries(
            DEVICE_ICON_MAPPINGS.browsers
        )) {
            if (lowercaseName.includes(browserName)) {
                return IconComponent;
            }
        }

        for (const deviceInfo of Object.values(DEVICE_ICON_MAPPINGS.devices)) {
            if (
                deviceInfo.keywords.some((keyword) =>
                    lowercaseName.includes(keyword)
                )
            ) {
                return deviceInfo.icon;
            }
        }

        return RiDeviceLine;
    };

    const DeviceIcon = getDeviceIcon(passkey.name, passkey.deviceType);

    const formattedDate = new Date(passkey.createdAt).toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

    return (
        <>
            <div
                className="flex items-center justify-between border border-neutral-800 bg-neutral-900 p-4"
                key={passkey.id}
            >
                <div className="flex items-center space-x-3">
                    <DeviceIcon size={20} />
                    <div className="flex flex-col text-sm">
                        <span>{passkey.name}</span>
                        <span className="text-neutral-400">
                            Added on {formattedDate}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleEdit} size="sm" variant="outline">
                        <RiEditLine className="size-4" />
                        Edit
                    </Button>
                    <Button
                        className="hover:border-red-500/10 hover:bg-red-500/5 hover:text-red-500"
                        onClick={handleDelete}
                        size="sm"
                        variant="outline"
                    >
                        <RiDeleteBinLine className="size-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <EditPasskeyModal
                isOpen={showEditDialog}
                onSuccess={onRefetch}
                passkey={passkey}
                setIsOpen={setShowEditDialog}
            />
            <DeletePasskeyModal
                isOpen={showDeleteDialog}
                onSuccess={onRefetch}
                passkey={passkey}
                setIsOpen={setShowDeleteDialog}
            />
        </>
    );
}
