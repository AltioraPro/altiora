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
                // Cleanup old avatar
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
