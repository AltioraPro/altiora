import { call } from "@orpc/server";
import { USER_ROLES } from "@/constants/roles";
import { base } from "@/server/context";
import {
    deleteWaitlistBase,
    deleteWaitlistHandler,
    joinWaitlistBase,
    joinWaitlistHandler,
} from "./mutations";
import { listWaitlistBase, listWaitlistHandler } from "./queries";

export const waitlistRouter = base.router({
    join: joinWaitlistBase
        .route({ method: "POST" })
        .handler(
            async ({ input, context }) =>
                await call(joinWaitlistHandler, input, { context })
        ),

    list: listWaitlistBase
        .route({ method: "GET" })
        .meta({ roles: [USER_ROLES.ADMIN] })
        .handler(
            async ({ input, context }) =>
                await call(listWaitlistHandler, input, { context })
        ),

    delete: deleteWaitlistBase
        .route({ method: "DELETE" })
        .meta({ roles: [USER_ROLES.ADMIN] })
        .handler(
            async ({ input, context }) =>
                await call(deleteWaitlistHandler, input, { context })
        ),
});
