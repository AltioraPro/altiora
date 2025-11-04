"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PAGES } from "@/constants/pages";

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [errorDetails, setErrorDetails] = useState<{
        code: string;
        message: string;
        suggestion: string;
    } | null>(null);

    const errorCode = searchParams.get("error") || "unknown_error";

    useEffect(() => {
        const errorMap: Record<
            string,
            { message: string; suggestion: string }
        > = {
            unable_to_link_account: {
                message: "Unable to link your Google account",
                suggestion:
                    "This account may already be linked to another user. Please try signing in with your existing account or contact support.",
            },
            oauth_callback_error: {
                message: "Authentication callback failed",
                suggestion:
                    "There was an issue completing the authentication process. Please try again.",
            },
            access_denied: {
                message: "Access denied by Google",
                suggestion:
                    "You denied access to your Google account. Please try again and grant the necessary permissions.",
            },
            invalid_request: {
                message: "Invalid authentication request",
                suggestion:
                    "The authentication request was malformed. Please try again or contact support.",
            },
            server_error: {
                message: "Authentication server error",
                suggestion:
                    "There was a temporary issue with our authentication system. Please try again in a few moments.",
            },
            configuration_error: {
                message: "Authentication configuration error",
                suggestion:
                    "There's a configuration issue with our authentication system. Please contact support.",
            },
            unknown_error: {
                message: "An unexpected error occurred",
                suggestion:
                    "Something went wrong during the authentication process. Please try again or contact support.",
            },
        };

        const error = errorMap[errorCode] || errorMap.unknown_error;
        setErrorDetails({
            code: errorCode,
            message: error.message,
            suggestion: error.suggestion,
        });
    }, [errorCode]);

    const handleRetry = () => {
        router.push(PAGES.SIGN_IN);
    };

    const handleGoHome = () => {
        router.push(PAGES.LANDING_PAGE);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-pure-black text-pure-white">
            ={" "}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-32 right-32 h-6 w-6 rotate-12 border border-white/15" />
                <div className="absolute bottom-40 left-40 h-3 w-3 animate-pulse rounded-full bg-white/10" />
                <div className="absolute right-20 bottom-60 h-8 w-8 rotate-45 border border-white/25" />
                ={" "}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "50px 50px",
                    }}
                />
            </div>
            <div className="relative z-10 flex min-h-screen">
                ={" "}
                <div className="hidden items-center justify-center bg-linear-to-br from-white/5 to-transparent p-12 lg:flex lg:w-1/2">
                    <div className="space-y-8 text-center">
                        <div className="space-y-4">
                            <h1 className="font-bold text-6xl text-pure-white tracking-tight">
                                ALTIORA
                            </h1>
                            <p className="font-medium text-gray-400 text-lg">
                                Personal coaching platform
                            </p>
                        </div>

                        <div className="max-w-md space-y-6">
                            <div className="h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Transform your habits, track your trading, and
                                achieve your goals with our comprehensive
                                coaching platform.
                            </p>
                            <div className="h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                    </div>
                </div>
                ={" "}
                <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
                    <div className="w-full max-w-md space-y-8">
                        ={" "}
                        <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                                <svg
                                    className="h-8 w-8 text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <title>Error Icon</title>
                                    <path
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                    />
                                </svg>
                            </div>
                        </div>
                        ={" "}
                        <div className="space-y-4 text-center">
                            <h1 className="font-bold text-2xl text-pure-white">
                                Authentication Error
                            </h1>
                            {errorDetails && (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                                        <p className="font-medium text-red-300">
                                            {errorDetails.message}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {errorDetails.suggestion}
                                        </p>
                                    </div>
                                </div>
                            )}
                            ={" "}
                            <div className="space-y-3 pt-4">
                                <button
                                    className="w-full rounded-lg bg-pure-white px-6 py-3 font-semibold text-pure-black transition-colors duration-200 hover:bg-gray-200"
                                    onClick={handleRetry}
                                    type="button"
                                >
                                    Try Again
                                </button>

                                <Link
                                    className="block w-full rounded-lg border border-white/20 bg-transparent px-6 py-3 text-center font-semibold text-pure-white transition-colors duration-200 hover:bg-white/5"
                                    href="/contact"
                                >
                                    Contact Support
                                </Link>

                                <button
                                    className="w-full px-4 py-2 font-medium text-gray-400 transition-colors duration-200 hover:text-pure-white"
                                    onClick={handleGoHome}
                                    type="button"
                                >
                                    Return to Home
                                </button>
                            </div>
                        </div>
                        ={" "}
                        <div className="border-white/10 border-t pt-6">
                            <p className="text-center text-gray-500 text-xs">
                                Error Code: {errorDetails?.code || "unknown"}
                            </p>
                            <p className="mt-1 text-center text-gray-500 text-xs">
                                If this problem persists, please contact our
                                support team with this error code.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-pure-black text-pure-white">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                </div>
            }
        >
            <AuthErrorContent />
        </Suspense>
    );
}
