"use client";

import { useId } from "react";
import {
    Controller,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface FormCheckboxProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    description?: string;
    disabled?: boolean;
    className?: string;
    labelClassName?: string;
}

export function FormCheckbox<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    name,
    control,
    label,
    description,
    disabled,
    className,
    labelClassName,
    ...controllerProps
}: FormCheckboxProps<TFieldValues, TName>) {
    const uniqueId = useId();

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field, fieldState }) => {
                const {
                    onChange,
                    value,
                    disabled: fieldDisabled,
                    ...restFieldProps
                } = field;

                return (
                    <Field
                        data-invalid={!!fieldState.error}
                        data-disabled={disabled || fieldDisabled}
                        orientation="horizontal"
                    >
                        <div
                            className={cn("flex items-start gap-2", className)}
                        >
                            <Checkbox
                                id={uniqueId}
                                checked={!!value}
                                disabled={disabled || fieldDisabled}
                                onCheckedChange={onChange}
                                className={cn(
                                    fieldState.error &&
                                        "border-destructive focus-visible:ring-destructive"
                                )}
                                {...restFieldProps}
                            />
                            {label && (
                                <div className="flex flex-col gap-1">
                                    <FieldLabel
                                        htmlFor={uniqueId}
                                        className={cn(
                                            "cursor-pointer font-normal",
                                            labelClassName
                                        )}
                                    >
                                        {label}
                                    </FieldLabel>
                                    {description && (
                                        <FieldDescription>
                                            {description}
                                        </FieldDescription>
                                    )}
                                </div>
                            )}
                        </div>
                        {fieldState.error && (
                            <FieldError>{fieldState.error.message}</FieldError>
                        )}
                    </Field>
                );
            }}
        />
    );
}
