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
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Filter Label with Icon */}
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-white/60" />
        <span className="text-white/80 font-argesta">Filter by period:</span>
      </div>

      {/* Month Dropdown - Only show for monthly view */}
      {filter.view === 'monthly' && (
        <Select value={filter.month} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-32 bg-black/50 border-white/20 text-white rounded-lg">
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

      {/* Year Dropdown - Show for monthly and yearly views */}
      {(filter.view === 'monthly' || filter.view === 'yearly') && (
        <Select value={filter.year} onValueChange={handleYearChange}>
          <SelectTrigger className="w-20 bg-black/50 border-white/20 text-white rounded-lg">
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

      {/* View Selection Buttons */}
      <div className="flex space-x-1">
        <Button
          onClick={() => handleViewChange('monthly')}
          variant={filter.view === 'monthly' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-lg ${
            filter.view === 'monthly' 
              ? 'bg-white text-black hover:bg-white/90' 
              : 'bg-black/50 border-white/20 text-white/70 hover:bg-white/10'
          }`}
        >
          Monthly View
        </Button>
        <Button
          onClick={() => handleViewChange('yearly')}
          variant={filter.view === 'yearly' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-lg ${
            filter.view === 'yearly' 
              ? 'bg-white text-black hover:bg-white/90' 
              : 'bg-black/50 border-white/20 text-white/70 hover:bg-white/10'
          }`}
        >
          Yearly View
        </Button>
        <Button
          onClick={() => handleViewChange('all')}
          variant={filter.view === 'all' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-lg ${
            filter.view === 'all' 
              ? 'bg-white text-black hover:bg-white/90' 
              : 'bg-black/50 border-white/20 text-white/70 hover:bg-white/10'
          }`}
        >
          All Trades
        </Button>
      </div>
    </div>
  );
}