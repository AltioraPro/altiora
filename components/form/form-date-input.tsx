"use client";

import { format } from "date-fns";
import { RiCalendarLine, RiCloseLine } from "@remixicon/react";
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
    placeholder = "Select date...",
    disabled,
    dateFormat = "PPP", // Default to long date format
    className,
    ...controllerProps
}: FormDateInputProps<TFieldValues, TName>) {
    const [open, setOpen] = useState(false);
    const uniqueId = useId();

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field, fieldState }) => (
                <Field
                    data-disabled={disabled}
                    data-invalid={!!fieldState.error}
                >
                    {label && (
                        <FieldLabel htmlFor={uniqueId}>
                            {label}
                            {required && (
                                <span className="ml-1 text-destructive">*</span>
                            )}
                        </FieldLabel>
                    )}
                    <FieldContent>
                        {description && (
                            <FieldDescription>{description}</FieldDescription>
                        )}
                        <Popover onOpenChange={setOpen} open={open}>
                            <PopoverTrigger asChild>
                                <div className="relative">
                                    <Button
                                        className="w-full"
                                        mode="input"
                                        placeholder={!field.value}
                                        type="button"
                                        variant="outline"
                                    >
                                        <RiCalendarLine />
                                        {field.value ? (
                                            format(
                                                new Date(field.value),
                                                "dd MMM, yyyy"
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                    {field.value && (
                                        <Button
                                            className="-translate-y-1/2 absolute end-0 top-1/2"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                field.onChange("");
                                            }}
                                            size="sm"
                                            type="button"
                                            variant="dim"
                                        >
                                            <RiCloseLine />
                                        </Button>
                                    )}
                                </div>
                            </PopoverTrigger>
                            <PopoverContent
                                align="start"
                                className="w-auto p-0"
                            >
                                <Calendar
                                    autoFocus
                                    mode="single"
                                    onSelect={(date) => {
                                        field.onChange(date);
                                        setOpen(false);
                                    }}
                                    selected={field.value}
                                />
                            </PopoverContent>
                        </Popover>
                        {fieldState.error && (
                            <FieldError>{fieldState.error.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>
            )}
        />
    );
}
