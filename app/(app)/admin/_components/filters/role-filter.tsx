"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface RoleFilterProps {
    onValueChange: (value: string) => void;
    value?: string | null;
}

export function RoleFilter({ onValueChange, value }: RoleFilterProps) {
    return (
        <Select onValueChange={onValueChange} value={value ?? "all"}>
            <Button asChild className="w-[140px]" variant="outline">
                <SelectTrigger>
                    <SelectValue placeholder="Role" />
                </SelectTrigger>
            </Button>
            <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
            </SelectContent>
        </Select>
    );
}
