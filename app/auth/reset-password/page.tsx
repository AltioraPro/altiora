"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Lock, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid or missing reset token");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token,
          password: data.password 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password");
      }

      setIsSuccess(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password";
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
              <h1 className="text-2xl font-bold text-white mb-4 font-argesta">
                Password Reset Successful
              </h1>
              <p className="text-gray-400">
                Your password has been successfully reset. 
                You can now sign in with your new password.
              </p>
            </div>

            {/* Action */}
            <Link 
              href="/auth/login"
              className="group relative w-full py-4 bg-transparent border border-white/30 rounded-lg overflow-hidden transition-all duration-300 hover:border-white inline-block"
            >
              {/* Hover effects */}
              <div className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              
              <div className="relative flex items-center justify-center space-x-3">
                <span className="font-argesta tracking-widest">SIGN IN</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
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
              <p className="text-xl font-argesta">
                Create a new password.
              </p>
              <p className="text-base opacity-80">
                Enter a strong password to secure your account.
              </p>
            </div>

            {/* Decorative line */}
            <div className="mt-12 flex items-center space-x-4">
              <div className="w-20 h-px bg-gradient-to-r from-white to-transparent" />
              <span className="text-xs text-white/60 font-argesta tracking-widest">
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

            {/* Form title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Reset Password
              </h2>
              <p className="text-gray-400">
                Enter your new password below
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
              
              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2 tracking-widest">
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-transparent border border-white/20 rounded-lg focus:border-white focus:outline-none transition-all duration-300 text-white placeholder-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2 tracking-widest">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-transparent border border-white/20 rounded-lg focus:border-white focus:outline-none transition-all duration-300 text-white placeholder-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Reset password button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading || !token}
                className="group relative w-full py-4 bg-transparent border border-white/30 rounded-lg overflow-hidden transition-all duration-300 hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Hover effects */}
                <div className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                
                <div className="relative flex items-center justify-center space-x-3">
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span className="font-argesta tracking-widest">RESETTING...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-argesta tracking-widest">RESET PASSWORD</span>
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
