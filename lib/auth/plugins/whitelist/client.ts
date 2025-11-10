import type { BetterAuthClientPlugin } from "better-auth/client";
import type { whitelist } from "./server";

export const whitelistClient = () =>
    ({
        id: "whitelist",
        $InferServerPlugin: {} as ReturnType<typeof whitelist>,
    }) satisfies BetterAuthClientPlugin;
