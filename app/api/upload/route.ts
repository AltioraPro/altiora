import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { getServerSession } from "@/lib/auth/utils";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = [
    "image/svg+xml",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
];

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split(".").pop() || "jpg";
        const filename = `profile-images/${session.user.id}/${timestamp}-${randomString}.${fileExtension}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: "public",
            token: env.BLOB_READ_WRITE_TOKEN,
        });

        return NextResponse.json({
            success: true,
            url: blob.url,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            {
                error: "Failed to upload file",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
