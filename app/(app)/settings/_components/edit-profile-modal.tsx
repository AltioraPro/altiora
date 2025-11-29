"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { uploadProfileImage } from "@/lib/blob";
import { orpc } from "@/orpc/client";

// Client-side schema that accepts File or URL string for the image field
const editProfileFormSchema = z.object({
	name: z.string().min(1, "Le nom est requis").max(255, "Le nom est trop long"),
	image: z
		.union([z.instanceof(File), z.url(), z.string().length(0)])
		.optional()
		.nullable(),
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

	const initialValues = useMemo<EditProfileForm>(
		() => ({
			name: userName || "",
			image: userImage || undefined,
		}),
		[userName, userImage],
	);

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { isSubmitting, isDirty },
	} = useForm<EditProfileForm>({
		resolver: zodResolver(editProfileFormSchema),
		defaultValues: initialValues,
	});

	const imageFile = watch("image");

	const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation(
		orpc.auth.updateProfile.mutationOptions({
			meta: {
				invalidateQueries: [orpc.auth.getCurrentUser.queryKey(), ["user"]],
			},
			onSuccess: () => {
				reset();
				onClose();
			},
		}),
	);

	const isFile = (value: unknown): value is File => value instanceof File;

	const onSubmit = async (data: EditProfileForm) => {
		try {
			let imageUrl: string | undefined;

			if (isFile(imageFile)) {
				setIsUploading(true);

				const filename = `user-avatar/${ulid()}.jpg`;
				imageUrl = await uploadProfileImage(filename, imageFile);
			}

			await updateProfile({
				name: data.name,
				image: imageUrl,
			});
		} catch (error) {
			console.error("Error updating profile:", error);
			// Error will be handled by React Query
			throw error;
		} finally {
			setIsUploading(false);
		}
	};

	const isPending = isUploading || isUpdating || isSubmitting;

	const handleClose = () => {
		if (isPending) {
			return;
		}

		reset();
		onClose();
	};

	return (
		<Dialog onOpenChange={handleClose} open={isOpen}>
			<form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-white">Edit Profile</DialogTitle>
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
							label="Profile Picture"
							maxSizeMB={2}
							name="image"
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
