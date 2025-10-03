"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { CheckCircle, XCircle, Mail, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import { api } from "@/trpc/client";



// Page de vérification d'email

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [message, setMessage] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const hasVerified = useRef(false);

  const verifyEmailMutation = api.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message);
    },
    onError: (error) => {
      const errorMessage = error.message || "";
      
      if (errorMessage.includes("expired") || errorMessage.includes("invalid")) {
        setStatus("expired");
        setMessage("The verification link has expired or is invalid.");
      } else {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      }
    },
  });

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasVerified.current) return;
      
      const token = searchParams.get("token");
      
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token. Please use the complete link sent to your email.");
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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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

  const handleNavigateToLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleNavigateToRegister = () => {
    window.location.href = "/auth/register";
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return (
          <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-2 border-white/40 animate-ping animation-delay-75"></div>
            <div className="relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
        );
      case "success":
        return (
          <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/40 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        );
      case "expired":
        return (
          <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-8">
            <div className="relative w-16 h-16 rounded-full bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/40 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        );
      case "error":
        return (
          <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-8">
            <div className="relative w-16 h-16 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/40 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        );
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
    }
  };

  return (
    <div className="min-h-screen bg-pure-black text-pure-white relative overflow-hidden">
      {/* Decorative geometric elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-32 w-6 h-6 border border-white/15 rotate-12" />
        <div className="absolute bottom-40 left-40 w-3 h-3 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-60 right-20 w-8 h-8 border border-white/25 rotate-45" />
        <div className="absolute top-40 left-20 w-4 h-4 border border-white/20 rotate-45" />
        <div className="absolute top-60 right-40 w-5 h-5 border border-white/10 rounded-full" />
        
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{
               backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
               backgroundSize: '50px 50px',
             }} 
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left section - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <div className="max-w-lg">
            <h1 className="text-[4rem] font-bold font-argesta leading-none mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              ALTIORA
            </h1>
            
            <div className="space-y-4 text-gray-300">
              <p className="text-xl">
                {status === "success" ? "Welcome." : "Verification."}
              </p>
              <p className="text-base opacity-80">
                {status === "success" 
                  ? "Your account is now activated. You can access your personal space and begin your transformation."
                  : "Validating your email address to secure your account and unlock all features."
                }
              </p>
            </div>

            {/* Verification steps */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white/70">Account created</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  status === "success" 
                    ? "bg-green-500/30 border-2 border-green-400" 
                    : status === "loading"
                    ? "bg-white border-2 border-white animate-pulse"
                    : "bg-white/20 border-2 border-white/40"
                }`}>
                  {status === "success" ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Mail className="w-4 h-4 text-black" />
                  )}
                </div>
                <span className={`text-sm ${
                  status === "success" ? "text-green-400 font-medium" : "text-white font-medium"
                }`}>
                  Email verification
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  status === "success" 
                    ? "border-white bg-white/10" 
                    : "border-white/30"
                }`}>
                  <span className={`text-xs ${
                    status === "success" ? "text-white" : "text-white/50"
                  }`}>3</span>
                </div>
                <span className={`text-sm ${
                  status === "success" ? "text-white/90" : "text-white/50"
                }`}>
                  Start using Altiora
                </span>
              </div>
            </div>

            {/* Decorative line */}
            <div className="mt-12 flex items-center space-x-4">
              <div className="w-20 h-px bg-gradient-to-r from-white to-transparent" />
              <span className="text-xs text-white/60 tracking-widest">
                {status === "success" ? "COMPLETE" : "VERIFY"}
              </span>
              <div className="w-20 h-px bg-gradient-to-l from-white to-transparent" />
            </div>
          </div>
        </div>

        {/* Right section - Main content */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold font-argesta text-white">ALTIORA</h1>
              <p className="text-gray-400 text-sm mt-2">Personal coaching platform</p>
            </div>

            {/* Status icon with animation */}
            <div className="text-center mb-8">
              {getStatusIcon()}
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {getStatusTitle()}
              </h2>
              <p className="text-gray-400">
                {getStatusDescription()}
              </p>
            </div>

            {/* Detailed message */}
            {message && (
              <div className={`mb-8 p-4 rounded-lg border ${
                status === "success" 
                  ? "border-green-500/20 bg-green-500/10" 
                  : status === "expired"
                  ? "border-yellow-500/20 bg-yellow-500/10"
                  : "border-red-500/20 bg-red-500/10"
              }`}>
                <p className={`text-sm ${
                  status === "success" 
                    ? "text-green-300" 
                    : status === "expired"
                    ? "text-yellow-300"
                    : "text-red-300"
                }`}>
                  {message}
                </p>
              </div>
            )}

            {/* Status-specific instructions */}
            {status === "success" && (
              <div className="mb-8 p-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg">
                <h3 className="text-white font-medium mb-3 text-sm tracking-wide">
                  NEXT STEPS
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start space-x-3">
                    <span className="text-white/40 font-mono text-xs mt-0.5">01</span>
                    <span>Sign in to your account</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-white/40 font-mono text-xs mt-0.5">02</span>
                    <span>Set up your profile</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-white/40 font-mono text-xs mt-0.5">03</span>
                    <span>Explore your coaching tools</span>
                  </li>
                </ul>
              </div>
            )}

            {(status === "expired" || status === "error") && (
              <div className="mb-8 p-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg">
                <h3 className="text-white font-medium mb-3 text-sm tracking-wide">
                  WHAT TO DO?
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  {status === "expired" ? (
                    <>
                      <li className="flex items-start space-x-3">
                        <span className="text-white/40 font-mono text-xs mt-0.5">01</span>
                        <span>Request a new verification link</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-white/40 font-mono text-xs mt-0.5">02</span>
                        <span>Check your email inbox</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-white/40 font-mono text-xs mt-0.5">03</span>
                        <span>Click the new verification link</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start space-x-3">
                        <span className="text-white/40 font-mono text-xs mt-0.5">01</span>
                        <span>Try verification again</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-white/40 font-mono text-xs mt-0.5">02</span>
                        <span>Contact support if issue persists</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}

            {/* Main actions */}
            <div className="space-y-4">
              {status === "success" && (
                <button
                  onClick={handleNavigateToLogin}
                  className="group relative w-full py-4 bg-transparent border border-white/30 rounded-lg overflow-hidden transition-all duration-300 hover:border-white"
                >
                  <div className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  
                  <div className="relative flex items-center justify-center space-x-3">
                    <span className="tracking-widest">SIGN IN</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>
              )}

              {(status === "expired" || status === "error") && (
                <>
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="group relative w-full py-4 bg-transparent border border-white/30 rounded-lg overflow-hidden transition-all duration-300 hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    
                    <div className="relative flex items-center justify-center space-x-3">
                      {isRetrying ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span className="tracking-widest">RETRYING...</span>
                        </>
                      ) : (
                        <>
                          <span className="tracking-widest">TRY AGAIN</span>
                          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={handleNavigateToRegister}
                    className="w-full py-3 px-4 border border-white/20 text-white/80 hover:text-white hover:border-white/40 rounded-lg transition-all duration-200 text-sm"
                  >
                    Create new account
                  </button>
                </>
              )}

              {status === "loading" && (
                <div className="w-full py-4 px-4 border border-white/10 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-white/70 text-sm">Verification in progress...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer navigation */}
            <div className="mt-8 space-y-3 text-center">
              <button 
                onClick={() => window.location.href = "/auth/login"}
                className="text-sm text-white/60 hover:text-white/80 transition-colors"
              >
                ← Back to login
              </button>
              
              <div className="text-xs text-white/40">
                Still having trouble? {' '}
                <a href="/contact" className="text-white/60 hover:text-white underline">
                  Contact support
                </a>
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
    <div className="min-h-screen bg-pure-black text-pure-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
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