import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ActivityStats } from "@/components/profile/ActivityStats";
import { Header } from "@/components/layout/Header";
import { SubscriptionStatus } from "@/components/profile/SubscriptionStatus";
import { DiscordConnection } from "@/components/profile/DiscordConnection";

export default async function ProfilePage() {
  try {
    const user = await api.auth.getCurrentUser();
    const stats = await api.profile.getUserStats();

    return (
      <>
        <Header />
        <div className="min-h-screen bg-pure-black text-pure-white pt-20">
          {/* Hero Section with Dynamic Background */}
          <div className="relative overflow-hidden">
            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-6 py-12">
              {/* Page Header */}
              <div className="text-center mb-16">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/30" />
                  <span className="text-xs font-argesta tracking-[0.3em] text-white/60">PROFILE</span>
                  <div className="w-16 h-px bg-gradient-to-l from-transparent to-white/30" />
                </div>
                
                <h1 className="text-5xl md:text-6xl font-argesta font-bold mb-6">
                  <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    YOUR
                  </span>
                  <br />
                  <span className="text-white">DIGITAL IDENTITY</span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-argesta">
                  Manage your account, track your progress, and unlock your full potential
                </p>
              </div>

              {/* Profile Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Profile Information */}
                <div className="xl:col-span-2 space-y-8">
                  {/* Profile Card */}
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-argesta font-bold tracking-wide">
                        ACCOUNT OVERVIEW
                      </h2>
                      <div className="w-12 h-px bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                    <ProfileForm user={user} />
                  </div>

                  {/* Activity Stats */}
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-argesta font-bold tracking-wide">
                        ACTIVITY INSIGHTS
                      </h2>
                      <div className="w-12 h-px bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                    
                    <ActivityStats stats={stats} />
                  </div>
                </div>

                {/* Right Column - Subscription & Quick Actions */}
                <div className="space-y-8">
                  {/* Discord Connection */}
                  <DiscordConnection />

                  {/* Subscription Status */}
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-argesta font-bold tracking-wide">
                        SUBSCRIPTION
                      </h2>
                      <div className="w-12 h-px bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                    <SubscriptionStatus user={user} />
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-argesta font-bold tracking-wide">
                        QUICK ACTIONS
                      </h2>
                      <div className="w-12 h-px bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                    
                    <div className="space-y-4">
                      <a href="/habits" className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <span className="text-lg">🎯</span>
                          </div>
                          <div>
                            <div className="font-argesta font-medium text-white">Habits Tracker</div>
                            <div className="text-sm text-white/60">Build your daily discipline</div>
                          </div>
                        </div>
                      </a>
                      
                      <a href="/trading-journal" className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <span className="text-lg">📈</span>
                          </div>
                          <div>
                            <div className="font-argesta font-medium text-white">Trading Journal</div>
                            <div className="text-sm text-white/60">Track your trading performance</div>
                          </div>
                        </div>
                      </a>
                      
                      <a href="/goals" className="block p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <span className="text-lg">🎯</span>
                          </div>
                          <div>
                            <div className="font-argesta font-medium text-white">Goal Planning</div>
                            <div className="text-sm text-white/60">Set and achieve your objectives</div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } catch {
    redirect("/auth/login");
  }
} 