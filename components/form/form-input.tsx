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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    required?: boolean;
    description?: string;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    className?: string;
    step?: string;
}

export function FormInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    name,
    control,
    label,
    required,
    description,
    placeholder,
    type = "text",
    disabled,
    className,
    step,
    ...controllerProps
}: FormInputProps<TFieldValues, TName>) {
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
                                <span className="text-destructive">*</span>
                            )}
                        </FieldLabel>
                    )}
                    <FieldContent>
                        {description && (
                            <FieldDescription>{description}</FieldDescription>
                        )}
                        <Input
                            className={cn(
                                fieldState.error &&
                                    "border-destructive focus-visible:ring-destructive",
                                className
                            )}
                            disabled={disabled}
                            id={uniqueId}
                            placeholder={placeholder}
                            step={step}
                            type={type}
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
