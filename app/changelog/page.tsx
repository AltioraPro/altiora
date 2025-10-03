import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Plus, Zap, Bug, Star } from "lucide-react";

export default function ChangelogPage() {
  const releases = [
    {
      version: "2.1.0",
      date: "2024-01-15",
      type: "major",
      title: "Discord Integration & Advanced Analytics",
      changes: [
        { type: "feature", text: "Discord bot integration for Pomodoro sessions" },
        { type: "feature", text: "Advanced trading analytics dashboard" },
        { type: "feature", text: "Habit streak analytics and insights" },
        { type: "improvement", text: "Improved performance across all modules" },
        { type: "fix", text: "Fixed timezone issues in habit tracking" },
      ]
    },
    {
      version: "2.0.0",
      date: "2024-01-01",
      type: "major",
      title: "Major Platform Overhaul",
      changes: [
        { type: "feature", text: "Complete UI/UX redesign with glassmorphism effects" },
        { type: "feature", text: "New goal planning system with OKRs" },
        { type: "feature", text: "Enhanced trading journal with emotion tracking" },
        { type: "improvement", text: "Faster load times and better mobile experience" },
        { type: "improvement", text: "Improved accessibility features" },
      ]
    },
    {
      version: "1.8.2",
      date: "2023-12-20",
      type: "patch",
      title: "Bug Fixes & Performance",
      changes: [
        { type: "fix", text: "Fixed habit completion not saving properly" },
        { type: "fix", text: "Resolved trading journal export issues" },
        { type: "improvement", text: "Optimized database queries for better performance" },
      ]
    },
    {
      version: "1.8.0",
      date: "2023-12-10",
      type: "minor",
      title: "Enhanced Habit Tracking",
      changes: [
        { type: "feature", text: "Calendar view for habit tracking" },
        { type: "feature", text: "Habit templates and suggestions" },
        { type: "improvement", text: "Better habit statistics and insights" },
        { type: "fix", text: "Fixed notification timing issues" },
      ]
    },
    {
      version: "1.7.0",
      date: "2023-11-25",
      type: "minor",
      title: "Trading Journal Enhancements",
      changes: [
        { type: "feature", text: "AI-powered trade analysis suggestions" },
        { type: "feature", text: "Custom tags and filtering system" },
        { type: "feature", text: "Trade performance visualization charts" },
        { type: "improvement", text: "Enhanced data export capabilities" },
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Plus className="w-4 h-4 text-green-400" />;
      case "improvement":
        return <Zap className="w-4 h-4 text-blue-400" />;
      case "fix":
        return <Bug className="w-4 h-4 text-red-400" />;
      default:
        return <Star className="w-4 h-4 text-white/60" />;
    }
  };

  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case "major":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "minor":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "patch":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-pure-black text-pure-white pt-20">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold  mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              CHANGELOG
            </h1>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto opacity-50" />
            <p className="text-white/60 mt-6 ">
              Track all updates, improvements, and new features
            </p>
          </div>

          <div className="space-y-8">
            {releases.map((release, index) => (
              <div key={index} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                {/* Release Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getVersionBadgeColor(release.type)}`}>
                        v{release.version}
                      </span>
                      <span className="text-white/50 text-sm ">
                        {new Date(release.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold  text-white">
                    {release.title}
                  </h2>
                </div>

                {/* Changes List */}
                <div className="p-6">
                  <div className="space-y-3">
                    {release.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="flex items-start space-x-3">
                        {getTypeIcon(change.type)}
                        <span className="text-white/80 text-sm leading-relaxed flex-1">
                          {change.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-12 bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-bold  text-white mb-4">Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Plus className="w-4 h-4 text-green-400" />
                <span className="text-white/70 text-sm">New Feature</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-white/70 text-sm">Improvement</span>
              </div>
              <div className="flex items-center space-x-3">
                <Bug className="w-4 h-4 text-red-400" />
                <span className="text-white/70 text-sm">Bug Fix</span>
              </div>
            </div>
          </div>

          {/* Subscribe to Updates */}
          <div className="mt-12 text-center bg-white/5 rounded-2xl border border-white/10 p-8">
            <h3 className="text-xl font-bold  text-white mb-4">
              Stay Updated
            </h3>
            <p className="text-white/60 mb-6">
              Get notified about new releases and features
            </p>
            <a
              href="mailto:updates@altiora.app?subject=Subscribe to Updates"
              className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl text-white transition-all duration-300 "
            >
              Subscribe to Updates
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 