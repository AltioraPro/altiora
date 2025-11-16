"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StatusFilterProps {
    onValueChange: (value: string) => void;
    value?: string | null;
}

export function StatusFilter({ onValueChange, value }: StatusFilterProps) {
    return (
        <Select onValueChange={onValueChange} value={value ?? "all"}>
            <Button asChild className="w-[140px]" variant="outline">
                <SelectTrigger>
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
            </Button>
            <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
        </Select>
    );
}
