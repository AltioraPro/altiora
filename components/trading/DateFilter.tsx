"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DateFilterState {
  view: 'monthly' | 'yearly' | 'all';
  month?: string;
  year?: string;
}

interface DateFilterProps {
  onFilterChange: (filter: DateFilterState) => void;
  className?: string;
}

export function DateFilter({ onFilterChange, className = "" }: DateFilterProps) {
  const [filter, setFilter] = useState<DateFilterState>({ 
    view: 'all'
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString());

  const handleViewChange = (view: 'monthly' | 'yearly' | 'all') => {
    let newFilter = { ...filter, view };
    
    if (view === 'monthly' && !newFilter.month) {
      const currentMonthIndex = new Date().getMonth();
      newFilter = { ...newFilter, month: months[currentMonthIndex] };
    }
    if ((view === 'monthly' || view === 'yearly') && !newFilter.year) {
      newFilter = { ...newFilter, year: new Date().getFullYear().toString() };
    }
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleMonthChange = (month: string) => {
    const newFilter = { ...filter, month };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleYearChange = (year: string) => {
    const newFilter = { ...filter, year };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${className}`}>
      {/* Filter Label */}
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-white/60" />
        <span className="text-white/70 text-sm font-medium">Period:</span>
      </div>

      {/* Date Selectors */}
      <div className="flex items-center gap-2">
        {filter.view === 'monthly' && (
          <Select value={filter.month} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-28 bg-black/40 border-white/15 text-white rounded-md h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              {months.map((month) => (
                <SelectItem key={month} value={month} className="text-white hover:bg-white/10">
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(filter.view === 'monthly' || filter.view === 'yearly') && (
          <Select value={filter.year} onValueChange={handleYearChange}>
            <SelectTrigger className="w-16 bg-black/40 border-white/15 text-white rounded-md h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              {years.map((year) => (
                <SelectItem key={year} value={year} className="text-white hover:bg-white/10">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* View Toggle Buttons */}
      <div className="flex bg-black/30 rounded-lg p-1 border border-white/10">
        <Button
          onClick={() => handleViewChange('monthly')}
          variant="ghost"
          size="sm"
          className={`h-7 px-3 text-xs rounded-md transition-all ${
            filter.view === 'monthly' 
              ? 'bg-white/20 text-white shadow-sm' 
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          Monthly
        </Button>
        <Button
          onClick={() => handleViewChange('yearly')}
          variant="ghost"
          size="sm"
          className={`h-7 px-3 text-xs rounded-md transition-all ${
            filter.view === 'yearly' 
              ? 'bg-white/20 text-white shadow-sm' 
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          Yearly
        </Button>
        <Button
          onClick={() => handleViewChange('all')}
          variant="ghost"
          size="sm"
          className={`h-7 px-3 text-xs rounded-md transition-all ${
            filter.view === 'all' 
              ? 'bg-white/20 text-white shadow-sm' 
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          All
        </Button>
      </div>
    </div>
  );
}