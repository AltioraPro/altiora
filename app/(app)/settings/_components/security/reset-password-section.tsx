"use client";

import { RiLockLine, RiRefreshLine } from "@remixicon/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChangePasswordModal } from "./change-password-modal";

export function ResetPasswordSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <RiLockLine size={16} />
                    <h3 className="font-semibold">Password</h3>
                </div>
                <p className="mb-4 text-sm text-white/60">
                    Change your password to keep your account secure.
                </p>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    size="sm"
                    variant="outline"
                >
                    <RiRefreshLine className="mr-2 size-4" />
                    Change Password
                </Button>
            </div>
            <ChangePasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
