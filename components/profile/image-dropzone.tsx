"use client";

import {
    RiCloseLine,
    RiImage2Fill,
    RiLoader4Line,
    RiUpload2Fill,
} from "@remixicon/react";
import { useCallback, useId, useRef } from "react";
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
import { useFileUpload, type FileWithPreview } from "@/hooks/use-file-upload";

interface ImageDropzoneProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    description?: string;
    maxSizeMB?: number;
    disabled?: boolean;
    /** Called when a file is added to the dropzone for immediate upload */
    onFileAdded?: (file: File) => Promise<string>;
    /** Called when the image is removed from the dropzone */
    onFileRemoved?: () => void;
    /** Whether an upload is currently in progress */
    isUploading?: boolean;
}

const DEFAULT_MAX_SIZE_MB = 2;

function getPreviewUrl(
    filePreview: string | undefined,
    fieldValue: unknown
): string | null {
    if (filePreview) {
        return filePreview;
    }
    if (typeof fieldValue === "string" && fieldValue.length > 0) {
        return fieldValue;
    }
    return null;
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
    onFileAdded,
    onFileRemoved,
    isUploading = false,
    ...controllerProps
}: ImageDropzoneProps<TFieldValues, TName>) {
    const uniqueId = useId();
    const maxSize = maxSizeMB * 1024 * 1024;
    // Ref to store the field onChange callback for use in the onFilesAdded callback
    const fieldOnChangeRef = useRef<((value: string | null) => void) | null>(
        null
    );

    const handleFilesAdded = useCallback(
        async (addedFiles: FileWithPreview[]) => {
            const file = addedFiles[0]?.file;
            if (!(file instanceof File) || !onFileAdded) {
                return;
            }

            try {
                const uploadedUrl = await onFileAdded(file);
                fieldOnChangeRef.current?.(uploadedUrl);
            } catch (error) {
                console.error("Upload failed:", error);
            }
        },
        [onFileAdded]
    );

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
            clearFiles,
        },
    ] = useFileUpload({
        accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
        maxSize,
        multiple: false,
        onFilesAdded: handleFilesAdded,
    });

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field, fieldState }) => {
                // Store field.onChange in ref for the onFilesAdded callback
                fieldOnChangeRef.current = field.onChange;

                const previewUrl = getPreviewUrl(
                    files[0]?.preview,
                    field.value
                );
                const hasError = !!fieldState.error || uploadErrors.length > 0;
                const errorMessage =
                    fieldState.error?.message || uploadErrors[0] || null;
                const isDisabled = disabled || isUploading;

                const handleRemove = () => {
                    if (files[0]?.id) {
                        removeFile(files[0].id);
                    }
                    clearFiles();
                    field.onChange(null);
                    onFileRemoved?.();
                };

                return (
                    <Field data-disabled={isDisabled} data-invalid={hasError}>
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
                                    onDrop={handleDrop}
                                >
                                    <input
                                        {...getInputProps({
                                            id: uniqueId,
                                            disabled: isDisabled,
                                            "aria-label": "Upload image file",
                                            className: "sr-only",
                                        })}
                                    />
                                    {isUploading ? (
                                        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                                            <RiLoader4Line className="size-8 animate-spin text-muted-foreground" />
                                            <p className="mt-2 font-medium text-muted-foreground text-sm">
                                                Uploading...
                                            </p>
                                        </div>
                                    ) : previewUrl ? (
                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                            <img
                                                alt="Uploaded image"
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
                                                disabled={isDisabled}
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

                                {previewUrl && !isUploading && (
                                    <div className="absolute top-4 right-4">
                                        <button
                                            aria-label="Remove image"
                                            className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            disabled={isDisabled}
                                            onClick={handleRemove}
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
