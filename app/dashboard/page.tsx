"use client";

import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">You must be logged in to access this page.</p>
          <Link 
            href="/auth/login" 
            className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-argesta">ALTIORA DASHBOARD</h1>
            <p className="text-gray-400 mt-2">Welcome back, {user.name?.split(' ')[0] || 'User'}!</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              {user.name?.[0] || user.email[0]}
            </div>
            <button 
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
              className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Trading Journal</h2>
            <p className="text-gray-400 mb-4">Track your trades and analyze performance</p>
            <Link 
              href="/trading-journal"
              className="inline-block px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Open Journal
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Habit Tracker</h2>
            <p className="text-gray-400 mb-4">Build and maintain healthy habits</p>
            <Link 
              href="/habits"
              className="inline-block px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              View Habits
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Goals</h2>
            <p className="text-gray-400 mb-4">Set and track your objectives</p>
            <Link 
              href="/goals"
              className="inline-block px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Manage Goals
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pomodoro Timer</h2>
            <p className="text-gray-400 mb-4">Focus sessions with Discord sync</p>
            <Link 
              href="/pomodoro"
              className="inline-block px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Start Session
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-400 mb-4">Customize your experience</p>
            <Link 
              href="/settings"
              className="inline-block px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Open Settings
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <p className="text-gray-400 mb-4">Manage your account and billing</p>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-400">User ID:</span><br />
                <code className="text-xs bg-gray-800 px-2 py-1 rounded">{user.id}</code>
              </p>
              <p className="text-sm">
                <span className="text-gray-400">Joined:</span><br />
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-block px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 