import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get("platform");
        const token = searchParams.get("token");

        if (!(platform && ["mt4", "mt5"].includes(platform))) {
            return NextResponse.json(
                { error: "Invalid platform. Must be 'mt4' or 'mt5'" },
                { status: 400 }
            );
        }

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 }
            );
        }

        const fileName =
            platform === "mt4"
                ? "TradeWebhook_MT4.mq4"
                : "TradeWebhook_MT5.mq5";

        const filePath = join(process.cwd(), "public", fileName);

        let content = await readFile(filePath, "utf-8");

        // Replace the empty token with the user's token
        content = content.replace(
            /input\s+string\s+InpUserToken\s*=\s*"[^"]*"/,
            `input string InpUserToken = "${token}"`
        );

        // Update the API URL
        const origin =
            request.headers.get("origin") || request.headers.get("host");
        if (origin) {
            const apiUrl = origin.startsWith("http")
                ? `${origin}/api/integrations/metatrader/webhook`
                : `https://${origin}/api/integrations/metatrader/webhook`;

            content = content.replace(
                /input\s+string\s+InpApiUrl\s*=\s*"[^"]*"/,
                `input string InpApiUrl = "${apiUrl}"`
            );
        }

        const customFileName =
            platform === "mt4"
                ? "TradeWebhook_Altiora.mq4"
                : "TradeWebhook_Altiora.mq5";

        return new NextResponse(content, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Content-Disposition": `attachment; filename="${customFileName}"`,
            },
        });
    } catch (error) {
        console.error("[Download EA] Error:", error);
        return NextResponse.json(
            { error: "Failed to download EA file" },
            { status: 500 }
        );
    }
}
