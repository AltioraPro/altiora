"use client";

import { Plus } from "lucide-react";
import { useId, useState } from "react";
import {
    Controller,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import { Button, ButtonArrow } from "@/components/ui/button";
import {
    Command,
    CommandCheck,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
    value: string;
    label: string;
}

interface FormComboboxProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    required?: boolean;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    options: ComboboxOption[];
    className?: string;
    emptyText?: string;
    searchPlaceholder?: string;
    onCreate?: (value: string) => Promise<string> | string;
    isCreating?: boolean;
}

export function FormCombobox<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    name,
    control,
    label,
    required,
    description,
    placeholder = "Select an option...",
    disabled,
    options,
    className,
    emptyText = "No results found.",
    searchPlaceholder = "Search...",
    onCreate,
    isCreating = false,
    ...controllerProps
}: FormComboboxProps<TFieldValues, TName>) {
    const uniqueId = useId();
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field, fieldState }) => {
                const selectedOption = options.find(
                    (option) => option.value === field.value
                );

                const filteredOptions = options.filter((option) =>
                    option.label
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                );

                const canCreate =
                    onCreate &&
                    searchValue.trim().length > 0 &&
                    !filteredOptions.some(
                        (option) =>
                            option.label.toLowerCase() ===
                            searchValue.toLowerCase()
                    );

                const handleSelect = async (value: string) => {
                    if (value === "__create__" && onCreate) {
                        try {
                            const newValue = await onCreate(searchValue.trim());
                            field.onChange(newValue);
                            setSearchValue("");
                            setOpen(false);
                        } catch (error) {
                            console.error("Error creating option:", error);
                        }
                    } else {
                        field.onChange(value);
                        setSearchValue("");
                        setOpen(false);
                    }
                };

                return (
                    <Field
                        data-disabled={disabled}
                        data-invalid={!!fieldState.error}
                    >
                        {label && (
                            <FieldLabel htmlFor={uniqueId}>
                                {label}
                                {required && <span>*</span>}
                            </FieldLabel>
                        )}
                        <FieldContent>
                            {description && (
                                <FieldDescription>
                                    {description}
                                </FieldDescription>
                            )}
                            <Popover
                                onOpenChange={(isOpen) => {
                                    setOpen(isOpen);
                                    if (!isOpen) {
                                        setSearchValue("");
                                    }
                                }}
                                open={open}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        aria-expanded={open}
                                        className={cn(
                                            "w-full justify-between",
                                            fieldState.error &&
                                                "border-destructive focus:ring-destructive",
                                            className
                                        )}
                                        disabled={disabled || isCreating}
                                        id={uniqueId}
                                        mode="input"
                                        placeholder={!field.value}
                                        role="combobox"
                                        type="button"
                                        variant="outline"
                                    >
                                        <span className="truncate">
                                            {selectedOption
                                                ? selectedOption.label
                                                : placeholder}
                                        </span>
                                        <ButtonArrow />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            onValueChange={setSearchValue}
                                            placeholder={searchPlaceholder}
                                            value={searchValue}
                                        />
                                        <CommandList>
                                            {filteredOptions.length > 0 && (
                                                <CommandGroup>
                                                    {filteredOptions.map(
                                                        (option) => (
                                                            <CommandItem
                                                                key={
                                                                    option.value
                                                                }
                                                                onSelect={() =>
                                                                    handleSelect(
                                                                        option.value
                                                                    )
                                                                }
                                                                value={
                                                                    option.label
                                                                }
                                                            >
                                                                <span className="truncate">
                                                                    {
                                                                        option.label
                                                                    }
                                                                </span>
                                                                {field.value ===
                                                                    option.value && (
                                                                    <CommandCheck />
                                                                )}
                                                            </CommandItem>
                                                        )
                                                    )}
                                                </CommandGroup>
                                            )}
                                            {canCreate && (
                                                <CommandGroup>
                                                    <CommandItem
                                                        onSelect={() =>
                                                            handleSelect(
                                                                "__create__"
                                                            )
                                                        }
                                                        value="__create__"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create "
                                                        {searchValue.trim()}"
                                                    </CommandItem>
                                                </CommandGroup>
                                            )}
                                            {filteredOptions.length === 0 &&
                                                !canCreate && (
                                                    <CommandEmpty>
                                                        {emptyText}
                                                    </CommandEmpty>
                                                )}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {fieldState.error && (
                                <FieldError>
                                    {fieldState.error.message}
                                </FieldError>
                            )}
                        </FieldContent>
                    </Field>
                );
            }}
        />
    );
}
