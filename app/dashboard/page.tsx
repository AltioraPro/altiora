"use client";

import { useSession } from "@/lib/auth-client";
import { 
TrendingUp, Target, Clock, BarChart3,
CheckCircle, User, Timer, Trophy, ChevronRight, Plus
} from "lucide-react";
import Link from "next/link";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import BlurText from "@/components/landing/BlurText";
import { Header } from "@/components/layout/Header";

interface DashboardCardProps {
title: string;
description: string;
href: string;
icon: React.ElementType;
progress?: number;
metric?: string;
status?: "active" | "paused" | "completed";
featured?: boolean;
}

const DashboardCard = ({ title, description, href, icon: Icon, progress, metric, status, featured = false }: DashboardCardProps) => (
<div className={`relative group ${featured ? 'md:col-span-2' : ''}`}>
      <div className={`
      rounded-2xl p-8 h-full
      ${featured ? 'bg-gradient-to-br from-white/10 to-white/5' : 'bg-white/5'}
      border border-white/20 hover:border-white/40 transition-all duration-500
      hover:backdrop-blur-sm hover:bg-white/10
      transform hover:scale-[1.01]
    `}>
    
    {/* Status indicator */}
    {status && (
      <div className="absolute top-4 right-4">
        <div className={`w-3 h-3 rounded-full ${
          status === 'active' ? 'bg-green-400 shadow-green-400/50' :
          status === 'paused' ? 'bg-yellow-400 shadow-yellow-400/50' :
          'bg-gray-400 shadow-gray-400/50'
        } shadow-lg`} />
      </div>
    )}

    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className={`
          ${featured ? 'w-16 h-16' : 'w-14 h-14'} 
          rounded-xl bg-white/10 backdrop-blur-sm 
          flex items-center justify-center
          border border-white/20
        `}>
          <Icon className={`${featured ? 'w-8 h-8' : 'w-7 h-7'} text-white`} />
        </div>
        <div>
          <h3 className={`${featured ? 'text-2xl' : 'text-xl'} font-argesta font-bold text-white mb-1`}>
            {title}
          </h3>
          <p className={`text-gray-400 ${featured ? 'text-base' : 'text-sm'} leading-relaxed`}>
            {description}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
    </div>
    
    {/* Metrics section */}
    {(progress !== undefined || metric) && (
      <div className="mb-6 space-y-4">
        {metric && (
          <div className="flex items-baseline space-x-2">
            <span className={`${featured ? 'text-4xl' : 'text-3xl'} font-argesta font-bold text-white`}>
              {metric}
            </span>
            <span className="text-gray-400 text-sm">this week</span>
          </div>
        )}
        
        {progress !== undefined && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )}
    
    <Link href={href} className="absolute inset-0 z-10" />
  </div>
</div>
);

interface StatCardProps {
label: string;
value: string;
change?: string;
positive?: boolean;
index: number;
}

const StatCard = ({ label, value, change, positive, index }: StatCardProps) => (
  <div className="relative group">
    <div className="relative bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
    {/* Subtle number indicator */}
    <div className="absolute top-3 right-3 text-white/20 font-argesta text-xs">
      0{index + 1}
    </div>
    
    <div className="space-y-3">
      <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">{label}</p>
      <p className="text-3xl font-argesta font-bold text-white">{value}</p>
      {change && (
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${positive ? 'bg-green-400' : 'bg-red-400'}`} />
          <p className={`text-xs font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
            {positive ? '+' : ''}{change} vs last week
          </p>
        </div>
      )}
    </div>
  </div>
</div>
);

interface QuickActionProps {
label: string;
href: string;
icon: React.ElementType;
}

const QuickAction = ({ label, href, icon: Icon }: QuickActionProps) => (
<Link href={href} className="group">
      <div className="
      flex items-center space-x-3 px-5 py-3 
      bg-white/5 hover:bg-white/10 
      border border-white/10 hover:border-white/30
      rounded-xl transition-all duration-300
    ">
    <Icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
    <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
      {label}
    </span>
  </div>
</Link>
);

export default function DashboardPage() {
const { data: session, isPending } = useSession();

if (isPending) {
  return (
    <div className="min-h-screen bg-pure-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        <BlurText text="Loading your dashboard..." className="text-gray-400" animateBy="words" />
      </div>
    </div>
  );
}

if (!session?.user) {
  return (
    <div className="min-h-screen bg-pure-black text-white flex items-center justify-center">
      <div className="text-center liquid-glass-enhanced rounded-2xl p-12 max-w-md border border-white/20">
        <User className="w-20 h-20 mx-auto mb-6 text-white/50" />
        <BlurText text="ACCESS DENIED" className="text-3xl font-argesta font-bold mb-4" />
        <p className="text-gray-400 mb-8 leading-relaxed">Authentication required to access this workspace.</p>
        <HoverBorderGradient as={Link} href="/auth/login" className="px-8 py-4 text-white font-medium">
          Sign In
        </HoverBorderGradient>
      </div>
    </div>
  );
}

// Mock data - à remplacer par de vraies données
const stats = {
  tradesThisWeek: 12,
  habitsCompleted: 8,
  pomodoroSessions: 24,
  goalsProgress: 67
};

return (
  <>
    <Header />
    <div className="min-h-screen bg-pure-black text-white pt-16">

    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Statistics Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-argesta font-bold text-white">Performance Overview</h2>
          <div className="text-sm text-gray-400 font-medium">Last 7 days</div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Trades Executed" 
            value={stats.tradesThisWeek.toString()} 
            change="3" 
            positive={true}
            index={0}
          />
          <StatCard 
            label="Habits Completed" 
            value={stats.habitsCompleted.toString()} 
            change="2" 
            positive={true}
            index={1}
          />
          <StatCard 
            label="Focus Sessions" 
            value={stats.pomodoroSessions.toString()} 
            change="5" 
            positive={true}
            index={2}
          />
          <StatCard 
            label="Goal Progress" 
            value={`${stats.goalsProgress}%`} 
            change="12%" 
            positive={true}
            index={3}
          />
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section>
        <h2 className="text-2xl font-argesta font-bold text-white mb-8">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <QuickAction label="New Trade" href="/trading-journal/new" icon={Plus} />
          <QuickAction label="Start Focus" href="/pomodoro" icon={Timer} />
          <QuickAction label="Check Habits" href="/habits" icon={CheckCircle} />
          <QuickAction label="Review Goals" href="/goals" icon={Target} />
        </div>
      </section>

      {/* Main Workspace */}
      <section>
        <h2 className="text-2xl font-argesta font-bold text-white mb-8">Your Workspace</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Featured card - Trading Journal */}
          <DashboardCard
            title="Trading Journal"
            description="Comprehensive trade tracking and performance analysis with advanced insights."
            href="/trading-journal"
            icon={TrendingUp}
            metric={`${stats.tradesThisWeek}`}
            status="active"
            featured={true}
          />
          
          <DashboardCard
            title="Habit Tracker"
            description="Build consistent daily habits that compound into extraordinary results."
            href="/habits"
            icon={Target}
            progress={75}
            status="active"
          />
          
          <DashboardCard
            title="Goal Planning"
            description="Strategic objective setting with milestone tracking and progress visualization."
            href="/goals"
            icon={Trophy}
            progress={stats.goalsProgress}
            status="active"
          />
          
          <DashboardCard
            title="Focus Timer"
            description="Deep work sessions using Pomodoro technique with Discord integration."
            href="/pomodoro"
            icon={Clock}
            metric={`${stats.pomodoroSessions}`}
            status="active"
          />
          
          <DashboardCard
            title="Analytics Hub"
            description="Comprehensive insights into productivity patterns and performance trends."
            href="/analytics"
            icon={BarChart3}
            status="paused"
          />
        </div>
      </section>

      {/* Footer Navigation */}
      <section className="pt-8 border-t border-white">
        <div className="flex justify-center">
          <HoverBorderGradient as={Link} href="/" className="bg-pure-black border-white/10 px-8 py-4 text-white font-medium">
            ← Return to Home
          </HoverBorderGradient>
        </div>
                </section>
      </div>
      </div>
    </>
  );
} 