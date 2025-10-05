"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset email");
      }

      setIsSuccess(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-pure-black text-pure-white relative overflow-hidden">
        {/* Éléments décoratifs géométriques */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 right-32 w-6 h-6 border border-white/15 rotate-12" />
          <div className="absolute bottom-40 left-40 w-3 h-3 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute bottom-60 right-20 w-8 h-8 border border-white/25 rotate-45" />
          
          {/* Grille de points subtile */}
          <div className="absolute inset-0 opacity-[0.02]" 
               style={{
                 backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                 backgroundSize: '50px 50px',
               }} 
          />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            
            {/* Success icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Success message */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-4">
                Check Your Email
              </h1>
              <p className="text-gray-400 mb-2">
                We&apos;ve sent a password reset link to:
              </p>
              <p className="text-white font-medium">
                {getValues("email")}
              </p>
              <p className="text-gray-400 text-sm mt-4">
                Click the link in the email to reset your password. 
                The link will expire in 1 hour.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setError(null);
                }}
                className="w-full py-3 bg-transparent border border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all duration-300 text-white"
              >
                Send Another Email
              </button>
              
              <Link 
                href="/auth/login"
                className="block w-full py-3 bg-transparent border border-white/30 rounded-lg hover:border-white hover:bg-white/10 transition-all duration-300 text-center"
              >
                <div className="flex items-center justify-center space-x-3">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="tracking-widest">BACK TO LOGIN</span>
                </div>
              </Link>
            </div>

            {/* Help text */}
            <div className="mt-8">
              <p className="text-gray-400 text-sm">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setError(null);
                  }}
                  className="text-white hover:text-gray-300 underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pure-black text-pure-white relative overflow-hidden">
      {/* Éléments décoratifs géométriques */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-32 w-6 h-6 border border-white/15 rotate-12" />
        <div className="absolute bottom-40 left-40 w-3 h-3 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-60 right-20 w-8 h-8 border border-white/25 rotate-45" />
        
        {/* Grille de points subtile */}
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
                Reset your password.
              </p>
              <p className="text-base opacity-80">
                Enter your email address and we&apos;ll send you a link 
                to reset your password.
              </p>
            </div>

            {/* Decorative line */}
            <div className="mt-12 flex items-center space-x-4">
              <div className="w-20 h-px bg-gradient-to-r from-white to-transparent" />
              <span className="text-xs text-white/60 tracking-widest">
                RESET
              </span>
              <div className="w-20 h-px bg-gradient-to-l from-white to-transparent" />
            </div>
          </div>
        </div>

        {/* Right section - Form */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold font-argesta text-white">ALTIORA</h1>
              <p className="text-gray-400 text-sm mt-2">Personal coaching platform</p>
            </div>

            {/* Back link */}
            <div className="mb-6">
              <Link 
                href="/auth/login"
                className="inline-flex items-center space-x-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to login</span>
              </Link>
            </div>

            {/* Form title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Forgot Password
              </h2>
              <p className="text-gray-400">
                Enter your email to receive a password reset link
              </p>
            </div>

            {/* Message d'erreur global */}
            {error && (
              <div className="mb-6 p-4 border border-red-500/20 bg-red-500/10 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2 tracking-widest">
                  EMAIL
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-3 py-3 bg-transparent border border-white/20 rounded-lg focus:border-white focus:outline-none transition-all duration-300 text-white placeholder-white/40"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Send reset link button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="group relative w-full py-4 bg-transparent border border-white/30 rounded-lg overflow-hidden transition-all duration-300 hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Hover effects */}
                <div className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                
                <div className="relative flex items-center justify-center space-x-3">
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span className="tracking-widest">SENDING...</span>
                    </>
                  ) : (
                    <>
                      <span className="tracking-widest">SEND RESET LINK</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Login link */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Remember your password?{" "}
                <Link 
                  href="/auth/login" 
                  className="text-white hover:text-gray-300 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Back to home */}
            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="text-sm text-white/60 hover:text-white/80 transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
