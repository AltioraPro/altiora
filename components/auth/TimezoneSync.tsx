"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { orpc } from "@/orpc/client";

export function TimezoneSync() {
    const hasSynced = useRef(false);

    const { data: currentUser } = useQuery(
        orpc.auth.getCurrentUser.queryOptions({})
    );

    const { mutateAsync: updateTimezone } = useMutation(
        orpc.auth.updateTimezone.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.auth.getCurrentUser.queryKey({ input: {} }),
                ],
            },
        })
    );

    useEffect(() => {
        if (hasSynced.current) {
            return;
        }

        if (!currentUser) {
            return;
        }

        const browserTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userTimezone = currentUser.timezone;

        if (browserTimezone && browserTimezone !== userTimezone) {
            hasSynced.current = true;

            updateTimezone({ timezone: browserTimezone })
                .then(() => {
                    console.info(
                        `Timezone synchronized: ${userTimezone || "undefined"} → ${browserTimezone}`
                    );
                })
                .catch((error) => {
                    console.error("Failed to sync timezone:", error);
                    hasSynced.current = false;
                });
        }
    }, [currentUser, updateTimezone]);

    return null;
}
