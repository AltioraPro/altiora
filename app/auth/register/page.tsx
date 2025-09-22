"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, User, CheckCircle } from "lucide-react";
import { z } from "zod";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { data: result, error } = await signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      });

      if (error) {
        if (error.message?.includes("existing email") || error.status === 422) {
          setAuthError("This email is already registered. Please use a different email or sign in.");
        } else {
          setAuthError(error.message || "Registration error");
        }
      } else if (result?.user) {
        router.push(`/auth/check-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error: unknown) {
      let errorMessage = "Registration error";
      
      if (error instanceof Error) {
        if (error.message.includes("422") || error.message.includes("existing email")) {
          errorMessage = "This email is already registered. Please use a different email or sign in.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (error) {
        setAuthError(error.message || "Google sign-up failed. Please try again.");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Google sign-up error";
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
                Start your transformation.
              </p>
              <p className="text-base opacity-80">
                Create your account and join a community dedicated to excellence 
                in trading and personal development.
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 space-y-3">
              {[
                "Professional trading journal",
                "Smart habit tracking", 
                "Goal planning",
                "Discord integration",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/70">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Decorative line */}
            <div className="mt-12 flex items-center space-x-4">
              <div className="w-20 h-px bg-gradient-to-r from-white to-transparent" />
              <span className="text-xs text-white/60 font-argesta tracking-widest">
                SIGN UP
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
                Create Account
              </h2>
              <p className="text-gray-400">
                Join thousands of users who are transforming their lives
              </p>
            </div>

            {/* Message d'erreur global */}
            {authError && (
              <div className="mb-6 p-4 border border-red-500/20 bg-red-500/10 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{authError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* First and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2 tracking-widest">
                    FIRST NAME
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      {...register("firstName")}
                      type="text"
                      placeholder="John"
                      className="w-full pl-10 pr-3 py-3 bg-transparent border border-white/20 rounded-lg focus:border-white focus:outline-none transition-all duration-300 text-white placeholder-white/40"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2 tracking-widest">
                    LAST NAME
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      {...register("lastName")}
                      type="text"
                      placeholder="Doe"
                      className="w-full pl-10 pr-3 py-3 bg-transparent border border-white/20 rounded-lg focus:border-white focus:outline-none transition-all duration-300 text-white placeholder-white/40"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2 tracking-widest">
                  PASSWORD
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

              {/* Terms acceptance */}
              <div>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    {...register("acceptTerms")}
                    type="checkbox"
                    className="mt-1 w-4 h-4 bg-transparent border border-white/20 rounded text-white focus:ring-white/20"
                  />
                  <span className="text-sm text-white/80 leading-relaxed">
                    I accept the{" "}
                    <Link href="/legal/terms" className="text-white hover:text-gray-300 underline">
                      terms of service
                    </Link>{" "}
                    and{" "}
                    <Link href="/legal/privacy" className="text-white hover:text-gray-300 underline">
                      privacy policy
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-red-400 text-sm mt-1">{errors.acceptTerms.message}</p>
                )}
              </div>

              {/* Sign up button */}
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
                      <span className="font-argesta tracking-widest">CREATING...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-argesta tracking-widest">CREATE ACCOUNT</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6 flex items-center">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-xs text-white/60 font-argesta tracking-widest">OR</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="group relative w-full py-3 bg-transparent border border-white/20 rounded-lg overflow-hidden transition-all duration-300 hover:border-white/40 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative flex items-center justify-center space-x-3">
                <GoogleIcon />
                <span className="font-medium text-sm">Continue with Google</span>
              </div>
            </button>

            {/* Sign in link */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
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

 