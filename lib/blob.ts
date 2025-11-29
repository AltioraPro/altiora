import { upload } from "@vercel/blob/client";

/**
 * Upload a profile image directly from the client to Vercel Blob storage.
 * Uses client-side upload for better performance (file doesn't proxy through server).
 *
 * @param file - The image file to upload
 * @returns The URL of the uploaded image
 * @throws Error if upload fails
 */
export async function uploadProfileImage(
	filename: string,
	file: File,
): Promise<string> {
	const blob = await upload(filename, file, {
		access: "public",
		handleUploadUrl: "/api/upload/avatars",
	});

	return blob.url;
}
