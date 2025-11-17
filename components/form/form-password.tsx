"use client";

import { RiEyeLine, RiEyeOffLine, RiLockLine } from "@remixicon/react";
import { useId, useState } from "react";
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
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "../ui/input-group";

interface FormPasswordProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    required?: boolean;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    size?: "medium" | "small" | "xsmall";
}

export function FormPassword<
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
    size,
    ...controllerProps
}: FormPasswordProps<TFieldValues, TName>) {
    const [showPassword, setShowPassword] = useState(false);
    const uniqueId = useId();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

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
                        <InputGroup aria-invalid={!!fieldState.error}>
                            <InputGroupAddon>
                                <RiLockLine />
                            </InputGroupAddon>
                            <InputGroupInput
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                                disabled={disabled}
                                id={uniqueId}
                                placeholder={placeholder}
                                type={showPassword ? "text" : "password"}
                                {...field}
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    aria-pressed={showPassword}
                                    onClick={togglePasswordVisibility}
                                    title={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    type="button"
                                >
                                    {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        {fieldState.error && (
                            <FieldError>{fieldState.error.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>
            )}
        />
    );
}
