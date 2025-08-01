import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { ActivityStats } from "@/components/profile/ActivityStats";
import { SubscriptionStatus } from "@/components/profile/SubscriptionStatus";
import { DiscordConnection } from "@/components/profile/DiscordConnection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { UsageStats } from "@/components/subscription/UsageStats";

export default function ProfilePage() {
  return (
    <>
      <Header />
      
      <section className="min-h-screen bg-gradient-to-br from-pure-black to-neutral-950 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 font-argesta">
              Profile
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-argesta">
              Manage your account and track your progress
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Activity Stats */}
              <Suspense fallback={<div className="h-64 bg-white/5 rounded-xl animate-pulse" />}>
                <ActivityStats />
              </Suspense>

              {/* Profile Form */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 font-argesta">Profile Information</h2>
                <ProfileForm />
              </div>

              {/* Discord Connection */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 font-argesta">Discord Connection</h2>
                <DiscordConnection />
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Subscription Status */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 font-argesta">Subscription</h2>
                <Suspense fallback={<div className="h-32 bg-white/5 rounded-xl animate-pulse" />}>
                  <SubscriptionStatus />
                </Suspense>
              </div>

              {/* Usage Stats - Client component outside Suspense */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-8">
                <UsageStats />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 