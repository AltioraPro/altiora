"use client";

import { useMutation } from "@tanstack/react-query";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle,
    Mail,
    RefreshCw,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<
        "loading" | "success" | "error" | "expired"
    >("loading");
    const [message, setMessage] = useState("");
    const [isRetrying, setIsRetrying] = useState(false);
    const hasVerified = useRef(false);

    const verifyEmailMutation = useMutation(
        orpc.auth.verifyEmail.mutationOptions({
            onSuccess: (data) => {
                setStatus("success");
                setMessage(data.message);
            },
            onError: (error) => {
                const errorMessage = error.message || "";

                if (
                    errorMessage.includes("expired") ||
                    errorMessage.includes("invalid")
                ) {
                    setStatus("expired");
                    setMessage(
                        "The verification link has expired or is invalid."
                    );
                } else {
                    setStatus("error");
                    setMessage("Verification failed. Please try again.");
                }
            },
        })
    );

    useEffect(() => {
        const verifyEmail = async () => {
            if (hasVerified.current) {
                return;
            }

            const token = searchParams.get("token");

            if (!token) {
                setStatus("error");
                setMessage(
                    "Missing verification token. Please use the complete link sent to your email."
                );
                return;
            }

            hasVerified.current = true;

            try {
                await verifyEmailMutation.mutateAsync({ token });
            } catch (error) {
                console.error("Verification error:", error);
            }
        };

        verifyEmail();
    }, [searchParams, verifyEmailMutation]);

    const handleRetry = async () => {
        setIsRetrying(true);

        hasVerified.current = false;

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsRetrying(false);

        const token = searchParams.get("token");
        if (token) {
            try {
                await verifyEmailMutation.mutateAsync({ token });
            } catch (error) {
                console.error("Retry verification error:", error);
            }
        }
    };

    const handleNavigateToDashboard = () => {
        window.location.href = "/dashboard";
    };

    const handleNavigateToRegister = () => {
        window.location.href = "/auth/register";
    };

    const getStatusIcon = () => {
        switch (status) {
            case "loading":
                return (
                    <div className="relative mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center">
                        <div className="absolute inset-0 animate-ping rounded-full border-2 border-white/20" />
                        <div className="animation-delay-75 absolute inset-2 animate-ping rounded-full border-2 border-white/40" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                            <RefreshCw className="h-8 w-8 animate-spin text-white" />
                        </div>
                    </div>
                );
            case "success":
                return (
                    <div className="relative mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center">
                        <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/20" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-green-500/40 bg-green-500/20 backdrop-blur-sm">
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                );
            case "expired":
                return (
                    <div className="relative mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/20 backdrop-blur-sm">
                            <AlertTriangle className="h-8 w-8 text-yellow-400" />
                        </div>
                    </div>
                );
            case "error":
                return (
                    <div className="relative mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-500/40 bg-red-500/20 backdrop-blur-sm">
                            <XCircle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getStatusTitle = () => {
        switch (status) {
            case "loading":
                return "Verifying Email";
            case "success":
                return "Email Verified";
            case "expired":
                return "Link Expired";
            case "error":
                return "Verification Failed";
            default:
                return "";
        }
    };

    const getStatusDescription = () => {
        switch (status) {
            case "loading":
                return "Validating your email address...";
            case "success":
                return "Your account is now activated";
            case "expired":
                return "The verification link is no longer valid";
            case "error":
                return "An error occurred during verification";
            default:
                return "";
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-pure-black text-pure-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-32 right-32 h-6 w-6 rotate-12 border border-white/15" />
                <div className="absolute bottom-40 left-40 h-3 w-3 animate-pulse rounded-full bg-white/10" />
                <div className="absolute right-20 bottom-60 h-8 w-8 rotate-45 border border-white/25" />
                <div className="absolute top-40 left-20 h-4 w-4 rotate-45 border border-white/20" />
                <div className="absolute top-60 right-40 h-5 w-5 rounded-full border border-white/10" />

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
                <div className="hidden flex-col justify-center px-12 lg:flex lg:w-1/2 xl:px-20">
                    <div className="max-w-lg">
                        <h1 className="mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text font-argesta font-bold text-[4rem] text-transparent leading-none">
                            ALTIORA
                        </h1>

                        <div className="space-y-4 text-gray-300">
                            <p className="text-xl">
                                {status === "success"
                                    ? "Welcome."
                                    : "Verification."}
                            </p>
                            <p className="text-base opacity-80">
                                {status === "success"
                                    ? "Your account is now activated. You can access your personal space and begin your transformation."
                                    : "Validating your email address to secure your account and unlock all features."}
                            </p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                                    <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-white/70">
                                    Account created
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div
                                    className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-full",
                                        status === "success" &&
                                            "border-2 border-green-400 bg-green-500/30",
                                        status === "loading" &&
                                            "animate-pulse border-2 border-white bg-white",
                                        status !== "success" &&
                                            "error" &&
                                            "border-2 border-white/40 bg-white/20"
                                    )}
                                >
                                    {status === "success" ? (
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                    ) : (
                                        <Mail className="h-4 w-4 text-black" />
                                    )}
                                </div>
                                <span
                                    className={`text-sm ${
                                        status === "success"
                                            ? "font-medium text-green-400"
                                            : "font-medium text-white"
                                    }`}
                                >
                                    Email verification
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                        status === "success"
                                            ? "border-white bg-white/10"
                                            : "border-white/30"
                                    }`}
                                >
                                    <span
                                        className={`text-xs ${
                                            status === "success"
                                                ? "text-white"
                                                : "text-white/50"
                                        }`}
                                    >
                                        3
                                    </span>
                                </div>
                                <span
                                    className={`text-sm ${
                                        status === "success"
                                            ? "text-white/90"
                                            : "text-white/50"
                                    }`}
                                >
                                    Start using Altiora
                                </span>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center space-x-4">
                            <div className="h-px w-20 bg-gradient-to-r from-white to-transparent" />
                            <span className="text-white/60 text-xs tracking-widest">
                                {status === "success" ? "COMPLETE" : "VERIFY"}
                            </span>
                            <div className="h-px w-20 bg-gradient-to-l from-white to-transparent" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center p-8 lg:w-1/2">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center lg:hidden">
                            <h1 className="font-argesta font-bold text-3xl text-white">
                                ALTIORA
                            </h1>
                            <p className="mt-2 text-gray-400 text-sm">
                                Personal coaching platform
                            </p>
                        </div>

                        <div className="mb-8 text-center">
                            {getStatusIcon()}

                            <h2 className="mb-2 font-bold text-2xl text-white">
                                {getStatusTitle()}
                            </h2>
                            <p className="text-gray-400">
                                {getStatusDescription()}
                            </p>
                        </div>

                        {message && (
                            <div
                                className={cn(
                                    "mb-8 rounded-lg border p-4",
                                    status === "success" &&
                                        "border-green-500/20 bg-green-500/10",
                                    status === "expired" &&
                                        "border-yellow-500/20 bg-yellow-500/10",
                                    status === "error" &&
                                        "border-red-500/20 bg-red-500/10"
                                )}
                            >
                                <p
                                    className={cn(
                                        "text-sm",
                                        status === "success" &&
                                            "text-green-300",
                                        status === "expired" &&
                                            "text-yellow-300",
                                        status === "error" && "text-red-300"
                                    )}
                                >
                                    {message}
                                </p>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                <h3 className="mb-3 font-medium text-sm text-white tracking-wide">
                                    NEXT STEPS
                                </h3>
                                <ul className="space-y-2 text-gray-300 text-sm">
                                    <li className="flex items-start space-x-3">
                                        <span className="mt-0.5 font-mono text-white/40 text-xs">
                                            01
                                        </span>
                                        <span>Access your dashboard</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="mt-0.5 font-mono text-white/40 text-xs">
                                            02
                                        </span>
                                        <span>Set up your profile</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <span className="mt-0.5 font-mono text-white/40 text-xs">
                                            03
                                        </span>
                                        <span>Explore your coaching tools</span>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {(status === "expired" || status === "error") && (
                            <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                <h3 className="mb-3 font-medium text-sm text-white tracking-wide">
                                    WHAT TO DO?
                                </h3>
                                <ul className="space-y-2 text-gray-300 text-sm">
                                    {status === "expired" ? (
                                        <>
                                            <li className="flex items-start space-x-3">
                                                <span className="mt-0.5 font-mono text-white/40 text-xs">
                                                    01
                                                </span>
                                                <span>
                                                    Request a new verification
                                                    link
                                                </span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <span className="mt-0.5 font-mono text-white/40 text-xs">
                                                    02
                                                </span>
                                                <span>
                                                    Check your email inbox
                                                </span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <span className="mt-0.5 font-mono text-white/40 text-xs">
                                                    03
                                                </span>
                                                <span>
                                                    Click the new verification
                                                    link
                                                </span>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="flex items-start space-x-3">
                                                <span className="mt-0.5 font-mono text-white/40 text-xs">
                                                    01
                                                </span>
                                                <span>
                                                    Try verification again
                                                </span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <span className="mt-0.5 font-mono text-white/40 text-xs">
                                                    02
                                                </span>
                                                <span>
                                                    Contact support if issue
                                                    persists
                                                </span>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-4">
                            {status === "success" && (
                                <button
                                    className="group relative w-full overflow-hidden rounded-lg border border-white/30 bg-transparent py-4 transition-all duration-300 hover:border-white"
                                    onClick={handleNavigateToDashboard}
                                    type="button"
                                >
                                    <div className="absolute inset-0 translate-y-full transform bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />

                                    <div className="relative flex items-center justify-center space-x-3">
                                        <span className="tracking-widest">
                                            GO TO DASHBOARD
                                        </span>
                                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </button>
                            )}

                            {(status === "expired" || status === "error") && (
                                <>
                                    <button
                                        className="group relative w-full overflow-hidden rounded-lg border border-white/30 bg-transparent py-4 transition-all duration-300 hover:border-white disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={isRetrying}
                                        onClick={handleRetry}
                                        type="button"
                                    >
                                        <div className="absolute inset-0 translate-y-full transform bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />

                                        <div className="relative flex items-center justify-center space-x-3">
                                            {isRetrying ? (
                                                <>
                                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                                    <span className="tracking-widest">
                                                        RETRYING...
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="tracking-widest">
                                                        TRY AGAIN
                                                    </span>
                                                    <RefreshCw className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        className="w-full rounded-lg border border-white/20 px-4 py-3 text-sm text-white/80 transition-all duration-200 hover:border-white/40 hover:text-white"
                                        onClick={handleNavigateToRegister}
                                        type="button"
                                    >
                                        Create new account
                                    </button>
                                </>
                            )}

                            {status === "loading" && (
                                <div className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-4">
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                        <span className="text-sm text-white/70">
                                            Verification in progress...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 space-y-3 text-center">
                            <button
                                className="text-sm text-white/60 transition-colors hover:text-white/80"
                                onClick={() => router.push("/auth/login")}
                                type="button"
                            >
                                ← Back to login
                            </button>

                            <div className="text-white/40 text-xs">
                                Still having trouble?{" "}
                                <Link
                                    className="text-white/60 underline hover:text-white"
                                    href="/contact"
                                >
                                    Contact support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VerifyEmailFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-pure-black text-pure-white">
            <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <p className="text-white/70">Loading...</p>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<VerifyEmailFallback />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
