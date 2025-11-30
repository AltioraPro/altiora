import { del } from "@vercel/blob";
import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/utils";

/**
 * API route for handling client-side uploads to Vercel Blob
 * This is required for the client-side Vercel Blob SDK to work
 *
 * @see https://vercel.com/docs/vercel-blob/client-upload
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
                const session = await getServerSession();

                if (!session) {
                    return {
                        allowedContentTypes: [],
                        tokenPayload: null,
                    };
                }

                return {
                    allowedContentTypes: ["image/jpeg", "image/png"],
                    tokenPayload: JSON.stringify({
                        userId: session.user.id,
                    }),
                };
            },
            onUploadCompleted: async () => {
                // Cleanup old avatar is handled by the client
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}

/**
 * API route for deleting blobs from Vercel Blob storage
 * Requires authentication to prevent unauthorized deletions
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { url } = (await request.json()) as { url: string };

        if (!url) {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        // Only allow deletion of user-avatar files to prevent abuse
        if (!url.includes("user-avatar/")) {
            return NextResponse.json(
                { error: "Invalid blob URL" },
                { status: 400 }
            );
        }

        await del(url);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
