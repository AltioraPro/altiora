"use client";

import { useId } from "react";
import {
    Controller,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SelectOption = {
    value: string;
    label: string;
};

interface FormSelectProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    required?: boolean;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    options: SelectOption[];
    className?: string;
}

export function FormSelect<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    name,
    control,
    label,
    required,
    description,
    placeholder,
    disabled,
    options,
    className,
    ...controllerProps
}: FormSelectProps<TFieldValues, TName>) {
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
                        <Select
                            disabled={disabled || field.disabled}
                            name={field.name}
                            onValueChange={(value) => {
                                field.onChange(value);
                                field.onBlur();
                            }}
                            value={field.value}
                        >
                            <SelectTrigger
                                className={cn(
                                    fieldState.error &&
                                        "border-destructive focus:ring-destructive",
                                    className
                                )}
                                id={uniqueId}
                            >
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {fieldState.error && (
                            <FieldError>{fieldState.error.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>
            )}
        />
    );
}
