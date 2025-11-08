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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormTextareaProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    required?: boolean;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    className?: string;
}

export function FormTextarea<
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
    rows = 3,
    className,
    ...controllerProps
}: FormTextareaProps<TFieldValues, TName>) {
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
                        <Textarea
                            className={cn(
                                fieldState.error &&
                                    "border-destructive focus-visible:ring-destructive",
                                className
                            )}
                            disabled={disabled}
                            id={uniqueId}
                            placeholder={placeholder}
                            rows={rows}
                            {...field}
                        />
                        {fieldState.error && (
                            <FieldError>{fieldState.error.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>
            )}
        />
    );
}
