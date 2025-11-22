"use client";

import { RiCalendarLine } from "@remixicon/react";
import { useId, useState } from "react";
import {
    Controller,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import { Calendar } from "@/components/ui/calendar";
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
import { Button } from "../ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "../ui/input-group";

interface FormDateInputProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    required?: boolean;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    dateFormat?: string;
    className?: string;
}

export function FormDateInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    name,
    control,
    label,
    required,
    description,
    disabled,
    dateFormat = "PPP", // Default to long date format
    className,
    ...controllerProps
}: FormDateInputProps<TFieldValues, TName>) {
    const [open, setOpen] = useState(false);
    const uniqueId = useId();

    const isDate = (value: unknown): value is Date =>
        value !== null &&
        value !== undefined &&
        typeof value === "object" &&
        "getTime" in value &&
        typeof (value as Date).getTime === "function";

    const formatDateForInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field, fieldState }) => {
                const displayValue = isDate(field.value)
                    ? formatDateForInput(field.value)
                    : field.value || "";

                return (
                    <Field
                        data-disabled={disabled}
                        data-invalid={!!fieldState.error}
                    >
                        {label && (
                            <FieldLabel htmlFor={uniqueId}>
                                {label}
                                {required && (
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                )}
                            </FieldLabel>
                        )}
                        <FieldContent>
                            {description && (
                                <FieldDescription>
                                    {description}
                                </FieldDescription>
                            )}

                            <InputGroup>
                                <InputGroupInput
                                    className="w-full"
                                    disabled={disabled}
                                    id={uniqueId}
                                    type="date"
                                    {...field}
                                    value={displayValue}
                                />
                                <InputGroupAddon align="inline-end">
                                    <Popover onOpenChange={setOpen} open={open}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                className="-translate-y-1/2 absolute end-0 top-1/2"
                                                size="sm"
                                                type="button"
                                                variant="dim"
                                            >
                                                <RiCalendarLine />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="end"
                                            className="w-auto p-0"
                                            sideOffset={10}
                                        >
                                            <Calendar
                                                autoFocus
                                                mode="single"
                                                onSelect={(date) => {
                                                    if (date) {
                                                        field.onChange(date);
                                                        setOpen(false);
                                                    }
                                                }}
                                                selected={field.value}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </InputGroupAddon>
                            </InputGroup>

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
