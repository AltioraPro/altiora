import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { SubscriptionStatus } from "@/components/profile/SubscriptionStatus";
import { DiscordConnection } from "@/components/profile/DiscordConnection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MessageCircle, CreditCard, Edit3, CheckCircle, XCircle, Crown, Shield } from "lucide-react";
import { api } from "@/trpc/client";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <>
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-argesta text-white mb-2">Profile</h1>
          <p className="text-white/60">
            Manage your account settings
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="border border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <User className="w-5 h-5" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-32 bg-white/5 rounded-lg animate-pulse" />}>
                  <ProfileForm />
                </Suspense>
              </CardContent>
            </Card>

            {/* Discord Card */}
            <Card className="border border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <MessageCircle className="w-5 h-5" />
                  <span>Discord Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-32 bg-white/5 rounded-lg animate-pulse" />}>
                  <DiscordConnection />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Subscription */}
          <div className="space-y-6">
            <Card className="border border-white/10 bg-black/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <CreditCard className="w-5 h-5" />
                  <span>Subscription</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-32 bg-white/5 rounded-lg animate-pulse" />}>
                  <SubscriptionStatus />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
} 