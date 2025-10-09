  "use client";

  import { Suspense } from "react";
  import { useSearchParams } from "next/navigation";
  import { Mail, CheckCircle, RefreshCw, ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";
  import { useState, useEffect } from "react";
  import { api } from "@/trpc/client";
  import { DiscordWelcomePopup } from "@/components/auth/DiscordWelcomePopup";

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

  const sendVerificationMutation = api.auth.sendVerificationEmail.useMutation({
    onSuccess: () => {
      setEmailSent(true);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    if (emailStatusQuery.data && email) {
      if (!emailStatusQuery.data.exists) {
        setError("User not found. Please create an account first.");
        return;
      }
      
      if (emailStatusQuery.data.emailVerified) {
        setIsAlreadyVerified(true);
        const hasSeenDiscordPopup = localStorage.getItem('discord-welcome-seen');
        if (!hasSeenDiscordPopup) {
          setShowDiscordPopup(true);
        }
        return;
      }

      if (!emailSent && !sendVerificationMutation.isPending) {
        sendVerificationMutation.mutate({ email });
      }
    }
  }, [emailStatusQuery.data, email, emailSent, sendVerificationMutation]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
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
      const domain = email.split('@')[1];
      const providers: Record<string, string> = {
        'gmail.com': 'https://mail.google.com',
        'outlook.com': 'https://outlook.live.com',
        'hotmail.com': 'https://outlook.live.com',
        'yahoo.com': 'https://mail.yahoo.com',
        'icloud.com': 'https://www.icloud.com/mail'
      };
      
      const url = providers[domain] || `https://${domain}`;
      window.open(url, '_blank');
    }
  };

  const handleDiscordConnect = () => {
    // Rediriger vers la page de connexion Discord
    window.location.href = '/api/auth/discord';
  };

  return (
    <div className="min-h-screen bg-pure-black text-pure-white relative overflow-hidden">
      {/* Geometric decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-32 w-6 h-6 border border-white/15 rotate-12" />
        <div className="absolute bottom-40 left-40 w-3 h-3 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-60 right-20 w-8 h-8 border border-white/25 rotate-45" />
        <div className="absolute top-40 left-20 w-4 h-4 border border-white/20 rotate-45" />
        
      {/* Subtle grid of points */}
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
                Almost there.
              </p>
              <p className="text-base opacity-80">
                We&apos;ve sent you a verification email to complete 
                your account setup and start your journey.
              </p>
            </div>

            {/* Steps */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white/70">Account created</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center">
                  <Mail className="w-4 h-4 text-black" />
                </div>
                <span className="text-sm text-white font-medium">Email verification</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center">
                  <span className="text-xs text-white/50">3</span>
                </div>
                <span className="text-sm text-white/50">Start using Altiora</span>
              </div>
            </div>

            {/* Decorative line */}
            <div className="mt-12 flex items-center space-x-4">
              <div className="w-20 h-px bg-gradient-to-r from-white to-transparent" />
              <span className="text-xs text-white/60 tracking-widest">
                VERIFY
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

            {/* Central icon with animation */}
            <div className="text-center mb-8">
              {isAlreadyVerified ? (
                <>
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-6">
                    <div className="relative w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/40 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Email Already Verified
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Your email is already verified. You can sign in now.
                  </p>
                </>
              ) : (
                <>
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                    <div className="relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-gray-400 text-sm">
                    We&apos;ve sent a verification link to your inbox
                  </p>
                </>
              )}
            </div>

            {/* Email display */}
            {email && (
              <div className="mb-8 p-4 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="font-medium text-white text-sm font-mono">{email}</span>
                  </div>
                  <button 
                    onClick={openEmailProvider}
                    className="text-white/60 hover:text-white transition-colors"
                    title="Open email provider"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-8 space-y-4">
              {/* Error message */}
              {error && (
                <div className="flex items-start space-x-3 p-3 border border-red-500/20 bg-red-500/5 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-xs">{error}</p>
                </div>
              )}

              {!isAlreadyVerified && (
                <>
                  <div className="p-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg">
                    <h3 className="text-white font-medium mb-3 text-sm tracking-wide">
                      NEXT STEPS
                    </h3>
                    <ol className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start space-x-3">
                        <span className="text-white/40 font-mono text-xs mt-0.5">01</span>
                        <span>Check your email inbox (and spam folder)</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-white/40 font-mono text-xs mt-0.5">02</span>
                        <span>Click the verification link</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-white/40 font-mono text-xs mt-0.5">03</span>
                        <span>Return to the platform and sign in</span>
                      </li>
                    </ol>
                  </div>

                  {/* Warning for spam */}
                  <div className="flex items-start space-x-3 p-3 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-200 text-xs">
                      Can&apos;t find the email? Check your spam or promotions folder.
                    </p>
                  </div>
                </>
              )}

              {isAlreadyVerified && (
                <div className="p-4 border border-green-500/20 bg-green-500/5 backdrop-blur-sm rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <h3 className="text-green-400 font-medium text-sm">
                        VERIFICATION COMPLETE
                      </h3>
                      <p className="text-green-300 text-xs mt-1">
                        Your account is ready to use. Sign in to access your dashboard.
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
                  onClick={() => window.location.href = '/auth/login'}
                  className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-white/20 bg-white text-black hover:bg-gray-100 rounded-lg font-medium text-sm transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go to Login</span>
                </button>
              ) : (
                <>
                  {/* Resend button */}
                  <button
                    onClick={handleResendEmail}
                    disabled={!canResend || isResending}
                    className={`w-full flex items-center justify-center space-x-3 py-3 px-4 border rounded-lg font-medium text-sm transition-all duration-200 ${
                      canResend && !isResending
                        ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50'
                        : 'border-white/10 bg-white/5 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>
                          {canResend ? 'Resend email' : `Resend in ${timeLeft}s`}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Quick email access */}
                  {email && (
                    <button
                      onClick={openEmailProvider}
                      className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-white/20 bg-white text-black hover:bg-gray-100 rounded-lg font-medium text-sm transition-all duration-200"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Open Email App</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {/* Back to login */}
                  <button
                    onClick={() => window.location.href = '/auth/login'}
                    className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-white/10 text-white/70 hover:text-white hover:border-white/20 rounded-lg font-medium text-sm transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </button>
                </>
              )}
            </div>

            {/* Footer help */}
            <div className="mt-8 text-center">
              <p className="text-white/40 text-xs">
                Still having trouble? {' '}
                <a href="/contact" className="text-white/60 hover:text-white underline">
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
    <div className="min-h-screen bg-pure-black text-pure-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
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