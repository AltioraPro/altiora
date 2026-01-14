"use client";

import { RiDeleteBinLine } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRESET_COLORS = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#eab308", // yellow-500
    "#84cc16", // lime-500
    "#22c55e", // green-500
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#0ea5e9", // sky-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#a855f7", // purple-500
    "#d946ef", // fuchsia-500
    "#ec4899", // pink-500
];

export function CategoryManager({
    isOpen,
    onClose,
}: CategoryManagerProps): React.JSX.Element {
    const [newName, setNewName] = useState("");
    const [_editingId, _setEditingId] = useState<string | null>(null);

    const { data: categories, refetch } = useQuery(
        orpc.categories.getAll.queryOptions({ input: undefined })
    );

    const createMutation = useMutation(
        orpc.categories.create.mutationOptions({
            onSuccess: () => {
                refetch();
                setNewName("");
            },
        })
    );

    const updateMutation = useMutation(
        orpc.categories.update.mutationOptions({
            onSuccess: () => {
                refetch();
            },
        })
    );

    const deleteMutation = useMutation(
        orpc.categories.delete.mutationOptions({
            onSuccess: () => {
                refetch();
            },
        })
    );

    const handleCreate = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter" && newName.trim()) {
            // Pick a random default color or cycle through them
            const randomColor =
                PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
            createMutation.mutate({
                name: newName.trim(),
                color: randomColor,
            });
        }
    };

    return (
        <Dialog onOpenChange={onClose} open={isOpen}>
            <DialogContent className="max-w-md gap-0 p-0 sm:max-w-lg">
                <DialogHeader className="px-6 py-4">
                    <DialogTitle className="text-xl">Categories</DialogTitle>
                </DialogHeader>

                <div className="space-y-1 p-2">
                    {/* Creation Input */}
                    <div className="px-2 pb-2">
                        <Input
                            autoFocus
                            className="h-12 border-0 bg-secondary/50 text-base shadow-none focus-visible:ring-0"
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleCreate}
                            placeholder="Type a new category name and press Enter..."
                            value={newName}
                        />
                    </div>

                    {/* Category List */}
                    <div className="max-h-[50vh] overflow-y-auto px-2">
                        <div className="space-y-1">
                            {categories?.map((cat) => (
                                <div
                                    className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-secondary/40"
                                    key={cat.id}
                                >
                                    {/* Color Picker Popover */}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                className="size-4 shrink-0 rounded-full ring-2 ring-transparent transition-all hover:scale-110 hover:ring-white/20"
                                                style={{
                                                    backgroundColor: cat.color,
                                                }}
                                                type="button"
                                            />
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="start"
                                            className="w-[180px] p-2"
                                        >
                                            <div className="grid grid-cols-4 gap-2">
                                                {PRESET_COLORS.map((color) => (
                                                    <button
                                                        className={cn(
                                                            "size-8 rounded-full border border-white/5 transition-transform hover:scale-110",
                                                            cat.color ===
                                                                color &&
                                                                "ring-2 ring-white/50"
                                                        )}
                                                        key={color}
                                                        onClick={() =>
                                                            updateMutation.mutate(
                                                                {
                                                                    id: cat.id,
                                                                    color,
                                                                }
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                color,
                                                        }}
                                                        type="button"
                                                    />
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    {/* Editable Name */}
                                    <div className="flex-1">
                                        <input
                                            className="w-full bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus:placeholder:text-transparent"
                                            defaultValue={cat.name}
                                            onBlur={(e) => {
                                                if (
                                                    e.target.value.trim() !==
                                                    cat.name
                                                ) {
                                                    updateMutation.mutate({
                                                        id: cat.id,
                                                        name: e.target.value,
                                                    });
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Delete Action */}
                                    <button
                                        className="text-muted-foreground opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                                        onClick={() => {
                                            if (
                                                confirm("Delete this category?")
                                            ) {
                                                deleteMutation.mutate({
                                                    id: cat.id,
                                                });
                                            }
                                        }}
                                        type="button"
                                    >
                                        <RiDeleteBinLine className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {categories?.length === 0 && (
                    <div className="pb-8 text-center text-muted-foreground text-sm">
                        No categories found. Start typing above to create one.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
