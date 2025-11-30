"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ulid } from "ulid";
import { z } from "zod";
import { FormInput } from "@/components/form";
import { ImageDropzone } from "@/components/profile/image-dropzone";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { deleteProfileImage, uploadProfileImage } from "@/lib/blob";
import { orpc } from "@/orpc/client";

// Client-side schema that accepts URL string for the image field (upload happens immediately)
const editProfileFormSchema = z.object({
    name: z
        .string()
        .min(1, "Le nom est requis")
        .max(255, "Le nom est trop long"),
    image: z.url().optional().nullable(),
});

type EditProfileForm = z.infer<typeof editProfileFormSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    userImage: string | null;
    userName: string;
    onClose: () => void;
}

export function EditProfileModal({
    isOpen,
    userImage,
    userName,
    onClose,
}: EditProfileModalProps) {
    const [isUploading, setIsUploading] = useState(false);
    // Track the newly uploaded image URL to clean up on cancel
    const pendingUploadedUrlRef = useRef<string | null>(null);

    const initialValues = useMemo<EditProfileForm>(
        () => ({
            name: userName || "",
            image: userImage || undefined,
        }),
        [userName, userImage]
    );

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting, isDirty },
    } = useForm<EditProfileForm>({
        resolver: zodResolver(editProfileFormSchema),
        defaultValues: initialValues,
    });

    const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation(
        orpc.auth.updateProfile.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.auth.getCurrentUser.queryKey(),
                    ["user"],
                ],
            },
            onSuccess: () => {
                // Clear the pending upload ref since the image is now saved
                pendingUploadedUrlRef.current = null;
                reset();
                onClose();
            },
        })
    );

    // Upload immediately when a file is dropped
    const handleFileAdded = useCallback(async (file: File): Promise<string> => {
        setIsUploading(true);
        try {
            // Delete the previous pending upload if there was one
            if (pendingUploadedUrlRef.current) {
                await deleteProfileImage(pendingUploadedUrlRef.current).catch(
                    () => {
                        // Ignore errors when deleting old pending upload
                    }
                );
            }

            const filename = `user-avatar/${ulid()}.jpg`;
            const uploadedUrl = await uploadProfileImage(filename, file);

            // Track this as a pending upload (not yet saved to profile)
            pendingUploadedUrlRef.current = uploadedUrl;

            return uploadedUrl;
        } finally {
            setIsUploading(false);
        }
    }, []);

    // Clean up uploaded image when removed from dropzone
    const handleFileRemoved = useCallback(async () => {
        if (pendingUploadedUrlRef.current) {
            await deleteProfileImage(pendingUploadedUrlRef.current).catch(
                () => {
                    // Ignore errors when deleting
                }
            );
            pendingUploadedUrlRef.current = null;
        }
    }, []);

    const onSubmit = async (data: EditProfileForm) => {
        try {
            // Delete the previous user image if a new one was uploaded
            if (pendingUploadedUrlRef.current && userImage) {
                await deleteProfileImage(userImage).catch(() => {
                    // Ignore errors when deleting old image
                });
            }

            await updateProfile({
                name: data.name,
                image: data.image ?? undefined,
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const isPending = isUploading || isUpdating || isSubmitting;

    const handleClose = useCallback(async () => {
        if (isPending) {
            return;
        }

        // Clean up the pending uploaded image if the modal is closed without saving
        if (pendingUploadedUrlRef.current) {
            await deleteProfileImage(pendingUploadedUrlRef.current).catch(
                () => {
                    // Ignore errors when deleting
                }
            );
            pendingUploadedUrlRef.current = null;
        }

        reset();
        onClose();
    }, [isPending, reset, onClose]);

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Edit Profile
                        </DialogTitle>
                        <DialogDescription>
                            Update your profile information and profile picture.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <FormInput
                            control={control}
                            disabled={isPending}
                            label="Display Name"
                            name="name"
                            placeholder="Enter your display name"
                            required
                        />

                        <ImageDropzone
                            control={control}
                            description="Upload a profile picture (max 2MB)"
                            disabled={isPending}
                            isUploading={isUploading}
                            label="Profile Picture"
                            maxSizeMB={2}
                            name="image"
                            onFileAdded={handleFileAdded}
                            onFileRemoved={handleFileRemoved}
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                disabled={isPending}
                                onClick={handleClose}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={isPending || !isDirty}
                            form="edit-profile-form"
                            type="submit"
                        >
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
