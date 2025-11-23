"use client";

import { useId, useRef, useState } from "react";
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
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import { cn } from "@/lib/utils";

interface FormMultiSelectProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    required?: boolean;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    options: Option[];
    className?: string;
    maxSelected?: number;
    onMaxSelected?: (maxLimit: number) => void;
    hidePlaceholderWhenSelected?: boolean;
    emptyIndicator?: React.ReactNode;
    emptyText?: string;
    loadingIndicator?: React.ReactNode;
    creatable?: boolean;
    onCreate?: (value: string) => Promise<string> | string;
    isCreating?: boolean;
    onSearch?: (value: string) => Promise<Option[]>;
    onSearchSync?: (value: string) => Option[];
    delay?: number;
    triggerSearchOnFocus?: boolean;
    hideClearAllButton?: boolean;
}

export function FormMultiSelect<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    name,
    control,
    label,
    required,
    description,
    placeholder = "Select options...",
    disabled,
    options,
    className,
    maxSelected,
    onMaxSelected,
    hidePlaceholderWhenSelected,
    emptyIndicator,
    emptyText = "No options available.",
    loadingIndicator,
    creatable,
    onCreate,
    isCreating = false,
    onSearch,
    onSearchSync,
    delay,
    triggerSearchOnFocus,
    hideClearAllButton,
    ...controllerProps
}: FormMultiSelectProps<TFieldValues, TName>) {
    const uniqueId = useId();
    const inputValueRef = useRef<string>("");
    const [isCreatingItem, setIsCreatingItem] = useState(false);

    const handleCreateNewOption = async (
        newOption: Option,
        allNewOptions: Option[],
        onCreateFn: (value: string) => Promise<string> | string,
        onChange: (options: string[]) => void,
        onBlur: () => void,
        selectedOptions: Option[]
    ) => {
        setIsCreatingItem(true);
        const inputLabel = inputValueRef.current;
        try {
            const newValue = await onCreateFn(inputLabel);
            // Replace the temporary option with the real one
            // Use the input label for display, newValue (ID) as the value
            const updatedOptions = allNewOptions.map((opt) =>
                opt.value === newOption.value
                    ? { value: newValue, label: inputLabel }
                    : opt
            );
            const values = updatedOptions.map((opt) => opt.value);
            onChange(values);
            inputValueRef.current = "";
        } catch (error) {
            console.error("Error creating option:", error);
            // Revert to previous selection on error
            const values = selectedOptions.map((opt) => opt.value);
            onChange(values);
        } finally {
            setIsCreatingItem(false);
        }
        onBlur();
    };

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field, fieldState }) => {
                // Convert form value (string[]) to Option[] for MultipleSelector
                const fieldValue = field.value as string[] | undefined;
                const selectedOptions: Option[] =
                    fieldValue
                        ?.map((value) =>
                            options.find((opt) => opt.value === value)
                        )
                        .filter((opt): opt is Option => opt !== undefined) ||
                    [];

                const handleChange = async (newOptions: Option[]) => {
                    // Check if a new option was added that doesn't exist in the original options
                    const newlyAdded = newOptions.filter(
                        (newOpt) =>
                            !selectedOptions.some(
                                (sel) => sel.value === newOpt.value
                            )
                    );

                    // If onCreate is provided and a new item was created via creatable
                    if (
                        onCreate &&
                        newlyAdded.length > 0 &&
                        inputValueRef.current
                    ) {
                        const newOption = newlyAdded[0];
                        // Check if this is a creatable item:
                        // 1. Value or label matches the input (creatable creates with input as both)
                        // 2. The option doesn't exist in the original options list
                        const existsInOptions = options.some(
                            (opt) => opt.value === newOption.value
                        );
                        const isCreatableItem =
                            (newOption.value === inputValueRef.current ||
                                newOption.label === inputValueRef.current) &&
                            !existsInOptions;

                        if (isCreatableItem && onCreate) {
                            await handleCreateNewOption(
                                newOption,
                                newOptions,
                                onCreate,
                                field.onChange,
                                field.onBlur,
                                selectedOptions
                            );
                            return;
                        }
                    }

                    // Convert Option[] back to string[] for form
                    const values = newOptions.map((opt) => opt.value);
                    field.onChange(values);
                    field.onBlur();
                };

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
                            <MultipleSelector
                                className={cn(
                                    fieldState.error &&
                                        "has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20",
                                    className
                                )}
                                creatable={creatable || !!onCreate}
                                delay={delay}
                                disabled={
                                    disabled ||
                                    field.disabled ||
                                    isCreating ||
                                    isCreatingItem
                                }
                                emptyIndicator={emptyIndicator || emptyText}
                                hideClearAllButton={hideClearAllButton}
                                hidePlaceholderWhenSelected={
                                    hidePlaceholderWhenSelected
                                }
                                inputProps={{
                                    onValueChange: (value: string) => {
                                        inputValueRef.current = value;
                                    },
                                }}
                                loadingIndicator={
                                    isCreating || isCreatingItem
                                        ? loadingIndicator
                                        : undefined
                                }
                                maxSelected={maxSelected}
                                onChange={handleChange}
                                onMaxSelected={onMaxSelected}
                                onSearch={onSearch}
                                onSearchSync={onSearchSync}
                                options={options}
                                placeholder={placeholder}
                                triggerSearchOnFocus={triggerSearchOnFocus}
                                value={selectedOptions}
                            />
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
