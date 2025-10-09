"use client";

import { api } from "@/trpc/client";

export function HabitHeatmap() {
const { data: heatmapData, isLoading } = api.profile.getHabitHeatmap.useQuery();

if (isLoading || !heatmapData) {
    return (
    <div className="bg-black/20 border border-white/10 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-40 mb-4" />
        <div className="h-32 bg-white/10 rounded" />
    </div>
    );
}

const generateDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const count = heatmapData[dateString] || 0;
    days.push({ date: dateString, count });
    }
    
    return days;
};

const days = generateDays();

const weeks: Array<Array<{ date: string; count: number }>> = [];
let currentWeek: Array<{ date: string; count: number }> = [];

days.forEach((day, index) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();
    
    if (index === 0 && dayOfWeek !== 0) {
    for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', count: 0 });
    }
    }
    
    currentWeek.push(day);
    
    if (dayOfWeek === 6 || index === days.length - 1) {
    weeks.push([...currentWeek]);
    currentWeek = [];
    }
});

const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-white/5";
    if (count === 1) return "bg-white/20";
    if (count === 2) return "bg-white/40";
    if (count >= 3) return "bg-white/60";
    return "bg-white/5";
};

  return (
    <div className="bg-black/20 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-xs text-white/40 uppercase tracking-wider">Habit Activity</h3>
      </div>

      <div className="overflow-x-auto w-full">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm transition-all duration-200 hover:ring-1 hover:ring-white/40 ${
                    day.date ? getIntensityClass(day.count) : 'opacity-0'
                  }`}
                  title={day.date ? `${day.date}: ${day.count} completion${day.count !== 1 ? 's' : ''}` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <p className="text-[10px] text-white/40 mr-16">Last year</p>
      </div>
    </div>
  );
}

