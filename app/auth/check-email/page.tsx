"use client";

import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    ExternalLink,
    Mail,
    RefreshCw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DiscordWelcomePopup } from "@/components/auth/DiscordWelcomePopup";
import { api } from "@/trpc/client";

function CheckEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
    const [showDiscordPopup, setShowDiscordPopup] = useState(false);

    const emailStatusQuery = api.auth.getUserEmailStatus.useQuery(
        { email: email || "" },
        { enabled: !!email }
    );

    const sendVerificationMutation = api.auth.sendVerificationEmail.useMutation(
        {
            onSuccess: () => {
                setEmailSent(true);
                setError(null);
            },
            onError: (error) => {
                setError(error.message);
            },
        }
    );

    useEffect(() => {
        if (emailStatusQuery.data && email) {
            if (!emailStatusQuery.data.exists) {
                setError("User not found. Please create an account first.");
                return;
            }

            if (emailStatusQuery.data.emailVerified) {
                setIsAlreadyVerified(true);
                const hasSeenDiscordPopup = localStorage.getItem(
                    "discord-welcome-seen"
                );
                if (!hasSeenDiscordPopup) {
                    setShowDiscordPopup(true);
                }
                return;
            }

            if (!(emailSent || sendVerificationMutation.isPending)) {
                sendVerificationMutation.mutate({ email });
            }
        }
    }, [emailStatusQuery.data, email, emailSent, sendVerificationMutation]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
        setCanResend(true);
    }, [timeLeft]);

    const handleResendEmail = async () => {
        if (!email) return;

        setIsResending(true);
        setError(null);

        try {
            await sendVerificationMutation.mutateAsync({ email });
            setTimeLeft(60);
            setCanResend(false);
        } catch {
        } finally {
            setIsResending(false);
        }
    };

    const openEmailProvider = () => {
        if (email) {
            const domain = email.split("@")[1];
            const providers: Record<string, string> = {
                "gmail.com": "https://mail.google.com",
                "outlook.com": "https://outlook.live.com",
                "hotmail.com": "https://outlook.live.com",
                "yahoo.com": "https://mail.yahoo.com",
                "icloud.com": "https://www.icloud.com/mail",
            };

            const url = providers[domain] || `https://${domain}`;
            window.open(url, "_blank");
        }
    };

    const handleDiscordConnect = () => {
        // Rediriger vers la page de connexion Discord
        window.location.href = "/api/auth/discord";
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-pure-black text-pure-white">
            {/* Geometric decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-32 right-32 h-6 w-6 rotate-12 border border-white/15" />
                <div className="absolute bottom-40 left-40 h-3 w-3 animate-pulse rounded-full bg-white/10" />
                <div className="absolute right-20 bottom-60 h-8 w-8 rotate-45 border border-white/25" />
                <div className="absolute top-40 left-20 h-4 w-4 rotate-45 border border-white/20" />

                {/* Subtle grid of points */}
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
                {/* Left section - Branding */}
                <div className="hidden flex-col justify-center px-12 lg:flex lg:w-1/2 xl:px-20">
                    <div className="max-w-lg">
                        <h1 className="mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text font-argesta font-bold text-[4rem] text-transparent leading-none">
                            ALTIORA
                        </h1>

                        <div className="space-y-4 text-gray-300">
                            <p className="text-xl">Almost there.</p>
                            <p className="text-base opacity-80">
                                We&apos;ve sent you a verification email to
                                complete your account setup and start your
                                journey.
                            </p>
                        </div>

                        {/* Steps */}
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
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white">
                                    <Mail className="h-4 w-4 text-black" />
                                </div>
                                <span className="font-medium text-sm text-white">
                                    Email verification
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/30">
                                    <span className="text-white/50 text-xs">
                                        3
                                    </span>
                                </div>
                                <span className="text-sm text-white/50">
                                    Start using Altiora
                                </span>
                            </div>
                        </div>

                        {/* Decorative line */}
                        <div className="mt-12 flex items-center space-x-4">
                            <div className="h-px w-20 bg-gradient-to-r from-white to-transparent" />
                            <span className="text-white/60 text-xs tracking-widest">
                                VERIFY
                            </span>
                            <div className="h-px w-20 bg-gradient-to-l from-white to-transparent" />
                        </div>
                    </div>
                </div>

                {/* Right section - Main content */}
                <div className="flex flex-1 items-center justify-center p-8 lg:w-1/2">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="mb-8 text-center lg:hidden">
                            <h1 className="font-argesta font-bold text-3xl text-white">
                                ALTIORA
                            </h1>
                            <p className="mt-2 text-gray-400 text-sm">
                                Personal coaching platform
                            </p>
                        </div>

                        {/* Central icon with animation */}
                        <div className="mb-8 text-center">
                            {isAlreadyVerified ? (
                                <>
                                    <div className="relative mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center">
                                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-green-500/40 bg-green-500/20 backdrop-blur-sm">
                                            <CheckCircle className="h-8 w-8 text-green-400" />
                                        </div>
                                    </div>

                                    <h2 className="mb-2 font-bold text-2xl text-white">
                                        Email Already Verified
                                    </h2>
                                    <p className="text-gray-400 text-sm">
                                        Your email is already verified. You can
                                        sign in now.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="relative mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center">
                                        <div className="absolute inset-0 animate-ping rounded-full border-2 border-white/20" />
                                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                                            <Mail className="h-8 w-8 text-white" />
                                        </div>
                                    </div>

                                    <h2 className="mb-2 font-bold text-2xl text-white">
                                        Check Your Email
                                    </h2>
                                    <p className="text-gray-400 text-sm">
                                        We&apos;ve sent a verification link to
                                        your inbox
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Email display */}
                        {email && (
                            <div className="mb-8 rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-2 w-2 rounded-full bg-green-400" />
                                        <span className="font-medium font-mono text-sm text-white">
                                            {email}
                                        </span>
                                    </div>
                                    <button
                                        className="text-white/60 transition-colors hover:text-white"
                                        onClick={openEmailProvider}
                                        title="Open email provider"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="mb-8 space-y-4">
                            {/* Error message */}
                            {error && (
                                <div className="flex items-start space-x-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                                    <p className="text-red-200 text-xs">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {!isAlreadyVerified && (
                                <>
                                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                        <h3 className="mb-3 font-medium text-sm text-white tracking-wide">
                                            NEXT STEPS
                                        </h3>
                                        <ol className="space-y-2 text-gray-300 text-sm">
                                            <li className="flex items-start space-x-3">
                                                <span className="mt-0.5 font-mono text-white/40 text-xs">
                                                    01
                                                </span>
                                                <span>
                                                    Check your email inbox (and
                                                    spam folder)
                                                </span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <span className="mt-0.5 font-mono text-white/40 text-xs">
                                                    02
                                                </span>
                                                <span>
                                                    Click the verification link
                                                </span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <span className="mt-0.5 font-mono text-white/40 text-xs">
                                                    03
                                                </span>
                                                <span>
                                                    Return to the platform and
                                                    sign in
                                                </span>
                                            </li>
                                        </ol>
                                    </div>

                                    {/* Warning for spam */}
                                    <div className="flex items-start space-x-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
                                        <p className="text-xs text-yellow-200">
                                            Can&apos;t find the email? Check
                                            your spam or promotions folder.
                                        </p>
                                    </div>
                                </>
                            )}

                            {isAlreadyVerified && (
                                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 backdrop-blur-sm">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <div>
                                            <h3 className="font-medium text-green-400 text-sm">
                                                VERIFICATION COMPLETE
                                            </h3>
                                            <p className="mt-1 text-green-300 text-xs">
                                                Your account is ready to use.
                                                Sign in to access your
                                                dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            {isAlreadyVerified ? (
                                /* Email already verified - Login button */
                                <button
                                    className="flex w-full items-center justify-center space-x-3 rounded-lg border border-white/20 bg-white px-4 py-3 font-medium text-black text-sm transition-all duration-200 hover:bg-gray-100"
                                    onClick={() =>
                                        (window.location.href = "/auth/login")
                                    }
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Go to Login</span>
                                </button>
                            ) : (
                                <>
                                    {/* Resend button */}
                                    <button
                                        className={`flex w-full items-center justify-center space-x-3 rounded-lg border px-4 py-3 font-medium text-sm transition-all duration-200 ${
                                            canResend && !isResending
                                                ? "border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20"
                                                : "cursor-not-allowed border-white/10 bg-white/5 text-white/50"
                                        }`}
                                        disabled={!canResend || isResending}
                                        onClick={handleResendEmail}
                                    >
                                        {isResending ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4" />
                                                <span>
                                                    {canResend
                                                        ? "Resend email"
                                                        : `Resend in ${timeLeft}s`}
                                                </span>
                                            </>
                                        )}
                                    </button>

                                    {/* Quick email access */}
                                    {email && (
                                        <button
                                            className="flex w-full items-center justify-center space-x-3 rounded-lg border border-white/20 bg-white px-4 py-3 font-medium text-black text-sm transition-all duration-200 hover:bg-gray-100"
                                            onClick={openEmailProvider}
                                        >
                                            <Mail className="h-4 w-4" />
                                            <span>Open Email App</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </button>
                                    )}

                                    {/* Back to login */}
                                    <button
                                        className="flex w-full items-center justify-center space-x-3 rounded-lg border border-white/10 px-4 py-3 font-medium text-sm text-white/70 transition-all duration-200 hover:border-white/20 hover:text-white"
                                        onClick={() =>
                                            (window.location.href =
                                                "/auth/login")
                                        }
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back to Login</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Footer help */}
                        <div className="mt-8 text-center">
                            <p className="text-white/40 text-xs">
                                Still having trouble?{" "}
                                <a
                                    className="text-white/60 underline hover:text-white"
                                    href="/contact"
                                >
                                    Contact support
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discord Welcome Popup */}
            <DiscordWelcomePopup
                isOpen={showDiscordPopup}
                onClose={() => setShowDiscordPopup(false)}
                onConnect={handleDiscordConnect}
            />
        </div>
    );
}

function CheckEmailFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-pure-black text-pure-white">
            <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <p className="text-white/70">Loading...</p>
            </div>
        </div>
    );
}

export default function CheckEmailPage() {
    return (
        <Suspense fallback={<CheckEmailFallback />}>
            <CheckEmailContent />
        </Suspense>
    );
}
