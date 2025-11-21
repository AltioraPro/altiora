"use client";

import { RiCloseLine, RiImage2Fill, RiUpload2Fill } from "@remixicon/react";
import { useEffect, useId, useRef } from "react";
import {
    Controller,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { useFileUpload } from "@/hooks/use-file-upload";

interface ImageDropzoneProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    description?: string;
    maxSizeMB?: number;
    disabled?: boolean;
}

const DEFAULT_MAX_SIZE_MB = 2;

function isFile(value: unknown): value is File {
    return value instanceof File;
}

function getPreviewUrl(
    filePreview: string | undefined,
    fieldValue: unknown
): string | null {
    if (filePreview) {
        return filePreview;
    }
    if (isFile(fieldValue)) {
        return URL.createObjectURL(fieldValue);
    }
    if (typeof fieldValue === "string" && fieldValue.length > 0) {
        return fieldValue;
    }
    return null;
}

function getAltText(fileName: string | undefined, fieldValue: unknown): string {
    if (fileName) {
        return fileName;
    }
    if (isFile(fieldValue)) {
        return fieldValue.name;
    }
    return "Uploaded image";
}

export function ImageDropzone<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    name,
    control,
    label,
    description,
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    disabled,
    ...controllerProps
}: ImageDropzoneProps<TFieldValues, TName>) {
    const uniqueId = useId();
    const maxSize = maxSizeMB * 1024 * 1024;
    const fieldOnChangeRef = useRef<((value: File | null) => void) | null>(
        null
    );
    const fieldValueRef = useRef<unknown>(null);

    const [
        { files, isDragging, errors: uploadErrors },
        {
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            removeFile,
            getInputProps,
            addFiles,
        },
    ] = useFileUpload({
        accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
        maxSize,
        multiple: false,
    });

    // Sync files to form field at top level
    useEffect(() => {
        if (!fieldOnChangeRef.current) {
            return;
        }

        if (files.length > 0 && files[0]?.file instanceof File) {
            const currentFile = files[0].file;
            if (fieldValueRef.current !== currentFile) {
                fieldOnChangeRef.current(currentFile);
                fieldValueRef.current = currentFile;
            }
        } else if (files.length === 0 && isFile(fieldValueRef.current)) {
            fieldOnChangeRef.current(null);
            fieldValueRef.current = null;
        }
    }, [files]);

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field, fieldState }) => {
                // Store field.onChange and field.value in refs for useEffect
                fieldOnChangeRef.current = field.onChange;
                fieldValueRef.current = field.value;

                const previewUrl = getPreviewUrl(
                    files[0]?.preview,
                    field.value
                );
                const altText = getAltText(files[0]?.file?.name, field.value);
                const hasError = !!fieldState.error || uploadErrors.length > 0;
                const errorMessage =
                    fieldState.error?.message || uploadErrors[0] || null;

                return (
                    <Field data-disabled={disabled} data-invalid={hasError}>
                        {label && (
                            <FieldLabel htmlFor={uniqueId}>{label}</FieldLabel>
                        )}
                        <FieldContent>
                            {description && (
                                <FieldDescription>
                                    {description}
                                </FieldDescription>
                            )}
                            <div className="relative">
                                {/* Drop area */}
                                <div
                                    className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden border border-input border-dashed p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
                                    data-dragging={isDragging || undefined}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => {
                                        handleDrop(e);
                                        if (e.dataTransfer.files.length > 0) {
                                            addFiles([e.dataTransfer.files[0]]);
                                        }
                                    }}
                                >
                                    <input
                                        {...getInputProps({
                                            id: uniqueId,
                                            disabled,
                                            "aria-label": "Upload image file",
                                            className: "sr-only",
                                        })}
                                    />
                                    {previewUrl ? (
                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                            <img
                                                alt={altText}
                                                className="mx-auto max-h-full rounded object-contain"
                                                height={200}
                                                src={previewUrl}
                                                width={200}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                                            <div
                                                aria-hidden="true"
                                                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                                            >
                                                <RiImage2Fill className="size-4 opacity-60" />
                                            </div>
                                            <p className="mb-1.5 font-medium text-sm">
                                                Drop your image here
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                SVG, PNG, JPG or GIF (max.{" "}
                                                {maxSizeMB}MB)
                                            </p>
                                            <Button
                                                className="mt-4"
                                                disabled={disabled}
                                                onClick={openFileDialog}
                                                type="button"
                                                variant="outline"
                                            >
                                                <RiUpload2Fill
                                                    aria-hidden="true"
                                                    className="-ms-1 size-4 opacity-60"
                                                />
                                                Select image
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {previewUrl && (
                                    <div className="absolute top-4 right-4">
                                        <button
                                            aria-label="Remove image"
                                            className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            disabled={disabled}
                                            onClick={() => {
                                                if (files[0]?.id) {
                                                    removeFile(files[0].id);
                                                }
                                                field.onChange(null);
                                            }}
                                            type="button"
                                        >
                                            <RiCloseLine
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {hasError && (
                                <FieldError
                                    errors={
                                        errorMessage
                                            ? [{ message: errorMessage }]
                                            : undefined
                                    }
                                />
                            )}
                        </FieldContent>
                    </Field>
                );
            }}
        />
    );
}
