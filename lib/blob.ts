import { upload } from "@vercel/blob/client";

/**
 * Upload a profile image directly from the client to Vercel Blob storage.
 * Uses client-side upload for better performance (file doesn't proxy through server).
 *
 * @param filename - The filename to use for the uploaded file
 * @param file - The image file to upload
 * @returns The URL of the uploaded image
 * @throws Error if upload fails
 */
export async function uploadProfileImage(
    filename: string,
    file: File
): Promise<string> {
    const blob = await upload(filename, file, {
        access: "public",
        handleUploadUrl: "/api/upload/avatars",
    });

    return blob.url;
}

/**
 * Delete a blob from Vercel Blob storage via API.
 * This calls a server-side API endpoint since deletion requires server-side execution.
 *
 * @param url - The URL of the blob to delete
 * @throws Error if deletion fails
 */
export async function deleteProfileImage(url: string): Promise<void> {
    const response = await fetch("/api/upload/avatars", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete image");
    }
}
