"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProgressData {
  date: string;
  completionPercentage: number;
}

interface HabitsProgressChartProps {
  data?: ProgressData[];
}

export function HabitsProgressChart({ data }: HabitsProgressChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((item, index) => ({
      ...item,
      dayName: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: new Date(item.date).getDate(),
      isToday: item.date === new Date().toISOString().split('T')[0],
      trend: index > 0 ? item.completionPercentage - data[index - 1]!.completionPercentage : 0,
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (!chartData.length) return { average: 0, trend: 0, bestDay: 0, worstDay: 0 };
    
    const percentages = chartData.map(d => d.completionPercentage);
    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const trend = chartData.length > 1 
      ? chartData[chartData.length - 1]!.completionPercentage - chartData[0]!.completionPercentage
      : 0;
    const bestDay = Math.max(...percentages);
    const worstDay = Math.min(...percentages);
    
    return { average, trend, bestDay, worstDay };
  }, [chartData]);

  if (!data || data.length === 0) {
    return <HabitsProgressChartSkeleton />;
  }

  const maxHeight = 200;
  const chartHeight = maxHeight - 40;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold font-argesta tracking-tight">
              PROGRESS (LAST 7 DAYS)
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Evolution of your daily discipline
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold font-argesta">
                {Math.round(stats.average)}%
              </div>
              <div className="text-white/60 font-argesta">AVERAGE</div>
            </div>
            
            <div className="w-px h-8 bg-white/20" />
            
            <div className="flex items-center space-x-2">
              {stats.trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : stats.trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-400" />
              ) : (
                <Minus className="w-4 h-4 text-white/60" />
              )}
              <span className={`font-argesta ${
                stats.trend > 0 ? "text-green-400" : 
                stats.trend < 0 ? "text-red-400" : "text-white/60"
              }`}>
                {stats.trend > 0 ? "+" : ""}{Math.round(stats.trend)}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between opacity-20">
            {[100, 75, 50, 25, 0].map((value) => (
              <div key={value} className="flex items-center">
                <span className="text-xs text-white/40 font-argesta w-8">
                  {value}
                </span>
                <div className="flex-1 h-px bg-white/10 ml-2" />
              </div>
            ))}
          </div>

          {/* Chart Container */}
          <div className="relative ml-10">
            <svg 
              width="100%" 
              height={maxHeight}
              className="overflow-visible"
            >
              {/* Chart Area */}
              <g>
                {/* Bars */}
                {chartData.map((item, index) => {
                  const barHeight = (item.completionPercentage / 100) * chartHeight;
                  const barWidth = 32;
                  const x = index * 60 + 20;
                  const y = chartHeight - barHeight + 20;
                  
                  return (
                    <g key={item.date}>
                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx={4}
                        className={`transition-all duration-500 ${
                          item.isToday
                            ? "fill-white"
                            : item.completionPercentage === 100
                            ? "fill-green-500"
                            : item.completionPercentage >= 75
                            ? "fill-white/80"
                            : item.completionPercentage >= 50
                            ? "fill-white/60"
                            : "fill-white/40"
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      />
                      
                      {/* Percentage Label */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        className="fill-white/80 text-xs font-argesta"
                      >
                        {item.completionPercentage}%
                      </text>
                      
                      {/* Day Label */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight + 40}
                        textAnchor="middle"
                        className={`text-xs font-argesta ${
                          item.isToday ? "fill-white font-bold" : "fill-white/60"
                        }`}
                      >
                        {item.dayName.toUpperCase()}
                      </text>
                      
                      {/* Date */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight + 55}
                        textAnchor="middle"
                        className="fill-white/40 text-xs font-argesta"
                      >
                        {item.dayNumber}
                      </text>
                      
                      {/* Today Indicator */}
                      {item.isToday && (
                        <circle
                          cx={x + barWidth / 2}
                          cy={y - 20}
                          r={3}
                          className="fill-white animate-pulse"
                        />
                      )}
                    </g>
                  );
                })}
                
                {/* Trend Line */}
                <path
                  d={`M ${chartData.map((item, index) => {
                    const x = index * 60 + 20 + 16; // Center of bar
                    const y = chartHeight - (item.completionPercentage / 100) * chartHeight + 20;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}`}
                  stroke="white"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  fill="none"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-white/60 font-argesta">100% COMPLETED</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white rounded" />
              <span className="text-white/60 font-argesta">TODAY</span>
            </div>
          </div>
          
          <div className="text-white/40 font-argesta">
            Best: {stats.bestDay}% • Worst: {stats.worstDay}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function HabitsProgressChartSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-64 bg-white/10 rounded mb-2" />
          <div className="h-4 w-48 bg-white/5 rounded" />
        </div>
        <div className="flex items-center space-x-6">
          <div className="h-8 w-12 bg-white/10 rounded" />
          <div className="h-8 w-12 bg-white/10 rounded" />
        </div>
      </div>
      
      <div className="h-64 bg-white/10 rounded-xl" />
      
      <div className="mt-6 pt-6 border-t border-white/10 flex justify-between">
        <div className="flex space-x-6">
          <div className="h-4 w-20 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/10 rounded" />
        </div>
        <div className="h-4 w-32 bg-white/10 rounded" />
      </div>
    </div>
  );
} 