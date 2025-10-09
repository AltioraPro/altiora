import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { SubscriptionStatus } from "@/components/profile/SubscriptionStatus";
import { DiscordConnection } from "@/components/profile/DiscordConnection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { DiscordWelcomeChecker } from "@/components/auth/DiscordWelcomeChecker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MessageCircle, CreditCard } from "lucide-react";


export default function SettingsPage() {
  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-pure-black text-pure-white">
        <div className="relative w-full mx-auto">
          {/* Header */}
          <div className="relative border-b border-white/10 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="relative max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold font-argesta tracking-tight">
                    Settings
                  </h1>
                  <p className="text-white/60 text-sm mt-2">
                    Manage your account, integrations and subscription
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Account & Discord */}
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
        </div>

        {/* Background decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/[0.005] rounded-full blur-3xl" />
        </div>
      </div>

      {/* Discord Welcome Checker */}
      <DiscordWelcomeChecker forceShow={true} />
    </>
  );
}


