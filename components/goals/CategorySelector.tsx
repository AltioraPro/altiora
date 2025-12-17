"use client";

import { RiAddLine, RiCheckLine, RiCloseLine } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { orpc } from "@/orpc/client";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CategorySelectorProps {
    value?: string | null;
    onChange: (categoryId: string | null) => void;
}

const PRESET_COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308",
    "#84cc16", "#22c55e", "#10b981", "#14b8a6",
    "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
];

export function CategorySelector({
    value,
    onChange,
}: CategorySelectorProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

    const { data: categories, refetch } = useQuery(
        orpc.categories.getAll.queryOptions({ input: undefined })
    );

    const createMutation = useMutation(
        orpc.categories.create.mutationOptions({
            onSuccess: (data) => {
                refetch();
                onChange(data.id);
                setNewCategoryName("");
                // Pick a new random color for next time
                setSelectedColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
            },
        })
    );

    const handleCreate = () => {
        if (newCategoryName.trim()) {
            createMutation.mutate({
                name: newCategoryName.trim(),
                color: selectedColor,
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleCreate();
        }
    };

    const selectedCategory = categories?.find((cat) => cat.id === value);

    return (
        <div className="space-y-2">
            <Label>Category (Optional)</Label>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {selectedCategory ? (
                            <div className="flex items-center gap-2">
                                <div
                                    className="size-2 rounded-full shrink-0"
                                    style={{ backgroundColor: selectedCategory.color }}
                                />
                                <span>{selectedCategory.name}</span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground">Select a category...</span>
                        )}
                    </button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-[300px] p-2" sideOffset={8}>
                    <div className="space-y-3">
                        {/* Creation Section */}
                        <div className="flex gap-2">
                            <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="size-9 shrink-0 rounded-md border border-input transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring"
                                        style={{ backgroundColor: selectedColor }}
                                    />
                                </PopoverTrigger>
                                <PopoverContent className="w-[180px] p-2" side="top">
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {PRESET_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    setIsColorPickerOpen(false);
                                                }}
                                                className={cn(
                                                    "size-8 rounded-full border border-transparent transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/20",
                                                    selectedColor === color && "border-white ring-2 ring-white/20 scale-110"
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Input
                                placeholder="New category name..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-9"
                            />

                            <Button
                                size="icon"
                                variant="secondary"
                                onClick={handleCreate}
                                disabled={!newCategoryName.trim()}
                                className="size-9 shrink-0"
                            >
                                <RiAddLine className="size-4" />
                            </Button>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Actions */}
                        <div>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(null);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                    !value && "bg-accent/50 text-accent-foreground"
                                )}
                            >
                                <div className="flex size-4 items-center justify-center rounded-full border border-muted-foreground/30">
                                    <RiCloseLine className="size-3 text-muted-foreground" />
                                </div>
                                <span className="text-muted-foreground">No category</span>
                                {!value && <RiCheckLine className="ml-auto size-4" />}
                            </button>
                        </div>

                        {/* List */}
                        <div className="max-h-[200px] overflow-y-auto space-y-1">
                            {categories?.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(cat.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                        value === cat.id && "bg-accent text-accent-foreground font-medium"
                                    )}
                                >
                                    <div
                                        className="size-3 rounded-full shrink-0"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="truncate">{cat.name}</span>
                                    {value === cat.id && <RiCheckLine className="ml-auto size-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
