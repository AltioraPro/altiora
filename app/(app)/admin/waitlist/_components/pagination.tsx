import {
    RiArrowLeftSFill,
    RiArrowLeftSLine,
    RiArrowRightSFill,
    RiArrowRightSLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface PaginationData {
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface TablePaginationProps {
    pagination: PaginationData;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    itemName?: string;
}

export default function TablePagination({
    pagination,
    page,
    limit,
    onPageChange,
    onLimitChange,
    itemName = "users",
}: TablePaginationProps) {
    const { total, totalPages, hasNextPage, hasPreviousPage } = pagination;

    return (
        <div className="flex items-center justify-between gap-8">
            {/* Results per page */}
            <div className="flex items-center gap-3">
                <Label className="max-sm:sr-only" htmlFor="limit">
                    <span className="capitalize">{itemName}</span> per page
                </Label>
                <Select
                    onValueChange={(value) => {
                        onLimitChange(Number(value));
                    }}
                    value={limit.toString()}
                >
                    <SelectTrigger
                        className="w-fit whitespace-nowrap"
                        id="limit"
                    >
                        <SelectValue placeholder="Select number of results" />
                    </SelectTrigger>
                    <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
                        {[5, 10, 25, 50].map((pageSize) => (
                            <SelectItem
                                key={pageSize}
                                value={pageSize.toString()}
                            >
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {/* Page number information */}
            <div className="flex grow justify-end whitespace-nowrap text-muted-foreground text-sm">
                <p
                    aria-live="polite"
                    className="whitespace-nowrap text-muted-foreground text-sm"
                >
                    {page * limit - limit + 1} to{" "}
                    {Math.min(page * limit, total)} of {pagination.total}{" "}
                    {itemName}
                </p>
            </div>
            <div>
                <Pagination>
                    <PaginationContent>
                        {/* First page button */}
                        <PaginationItem>
                            <Button
                                aria-label="Go to first page"
                                className="disabled:pointer-events-none disabled:opacity-50"
                                disabled={!hasPreviousPage}
                                onClick={() => onPageChange(1)}
                                size="icon"
                                variant="outline"
                            >
                                <RiArrowLeftSFill
                                    aria-hidden="true"
                                    size={16}
                                />
                            </Button>
                        </PaginationItem>
                        {/* Previous page button */}
                        <PaginationItem>
                            <Button
                                aria-label="Go to previous page"
                                className="disabled:pointer-events-none disabled:opacity-50"
                                disabled={!hasPreviousPage}
                                onClick={() => onPageChange(page - 1)}
                                size="icon"
                                variant="outline"
                            >
                                <RiArrowLeftSLine
                                    aria-hidden="true"
                                    size={16}
                                />
                            </Button>
                        </PaginationItem>
                        {/* Next page button */}
                        <PaginationItem>
                            <Button
                                aria-label="Go to next page"
                                className="disabled:pointer-events-none disabled:opacity-50"
                                disabled={!hasNextPage}
                                onClick={() => onPageChange(page + 1)}
                                size="icon"
                                variant="outline"
                            >
                                <RiArrowRightSLine
                                    aria-hidden="true"
                                    size={16}
                                />
                            </Button>
                        </PaginationItem>
                        {/* Last page button */}
                        <PaginationItem>
                            <Button
                                aria-label="Go to last page"
                                className="disabled:pointer-events-none disabled:opacity-50"
                                disabled={!hasNextPage}
                                onClick={() => onPageChange(totalPages)}
                                size="icon"
                                variant="outline"
                            >
                                <RiArrowRightSFill
                                    aria-hidden="true"
                                    size={16}
                                />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}

