"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

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
    const errorMap: Record<string, { message: string; suggestion: string }> = {
    unable_to_link_account: {
        message: "Unable to link your Google account",
        suggestion: "This account may already be linked to another user. Please try signing in with your existing account or contact support."
    },
    oauth_callback_error: {
        message: "Authentication callback failed",
        suggestion: "There was an issue completing the authentication process. Please try again."
    },
    access_denied: {
        message: "Access denied by Google",
        suggestion: "You denied access to your Google account. Please try again and grant the necessary permissions."
    },
    invalid_request: {
        message: "Invalid authentication request",
        suggestion: "The authentication request was malformed. Please try again or contact support."
    },
    server_error: {
        message: "Authentication server error",
        suggestion: "There was a temporary issue with our authentication system. Please try again in a few moments."
    },
    configuration_error: {
        message: "Authentication configuration error",
        suggestion: "There's a configuration issue with our authentication system. Please contact support."
    },
    unknown_error: {
        message: "An unexpected error occurred",
        suggestion: "Something went wrong during the authentication process. Please try again or contact support."
    }
    };

    const error = errorMap[errorCode] || errorMap.unknown_error;
    setErrorDetails({
    code: errorCode,
    message: error.message,
    suggestion: error.suggestion
    });
}, [errorCode]);

const handleRetry = () => {
    router.push("/auth/login");
};

const handleGoHome = () => {
    router.push("/");
};

return (
    <div className="min-h-screen bg-pure-black text-pure-white relative overflow-hidden">
=    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-32 w-6 h-6 border border-white/15 rotate-12" />
        <div className="absolute bottom-40 left-40 w-3 h-3 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-60 right-20 w-8 h-8 border border-white/25 rotate-45" />
        
=        <div className="absolute inset-0 opacity-[0.02]" 
            style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            }} 
        />
    </div>

    <div className="relative z-10 flex min-h-screen">
=        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-white/5 to-transparent items-center justify-center p-12">
        <div className="text-center space-y-8">
            <div className="space-y-4">
            <h1 className="text-6xl font-bold text-pure-white tracking-tight">
                ALTIORA
            </h1>
            <p className="text-gray-400 text-lg font-medium">
                Personal coaching platform
            </p>
            </div>
            
            <div className="space-y-6 max-w-md">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-gray-300 text-sm leading-relaxed">
                Transform your habits, track your trading, and achieve your goals with our comprehensive coaching platform.
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
        </div>
        </div>

=        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
=            <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>
            </div>

=            <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-pure-white">
                Authentication Error
            </h1>
            
            {errorDetails && (
                <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-300 font-medium">
                    {errorDetails.message}
                    </p>
                </div>
                
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-gray-300 text-sm leading-relaxed">
                    {errorDetails.suggestion}
                    </p>
                </div>
                </div>
            )}

=            <div className="space-y-3 pt-4">
                <button
                onClick={handleRetry}
                className="w-full bg-pure-white text-pure-black py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
                >
                Try Again
                </button>
                
                <Link
                href="/contact"
                className="block w-full bg-transparent border border-white/20 text-pure-white py-3 px-6 rounded-lg font-semibold hover:bg-white/5 transition-colors duration-200 text-center"
                >
                Contact Support
                </Link>
                
                <button
                onClick={handleGoHome}
                className="w-full text-gray-400 py-2 px-4 font-medium hover:text-pure-white transition-colors duration-200"
                >
                Return to Home
                </button>
            </div>
            </div>

=            <div className="pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
                Error Code: {errorDetails?.code || "unknown"}
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
                If this problem persists, please contact our support team with this error code.
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
    <Suspense fallback={
      <div className="min-h-screen bg-pure-black text-pure-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
