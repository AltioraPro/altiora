// global.d.ts

import type { OperationKey } from "@orpc/tanstack-query";

declare module "@tanstack/react-table" {
    interface ColumnMeta<_TData extends RowData, _TValue> {
        className?: string;
    }
}

interface MutationMeta extends Record<string, unknown> {
    invalidateQueries?: OperationKey[];
}

declare module "@tanstack/react-query" {
    interface Register {
        mutationMeta: MutationMeta;
    }
}
