"use client";

import { useState } from "react";
import { Calendar, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DateFilterState {
  type: 'all' | 'day' | 'month' | 'year' | 'custom';
  value?: string;
  startDate?: string;
  endDate?: string;
}

interface DateFilterProps {
  onFilterChange: (filter: DateFilterState) => void;
  className?: string;
}

export function DateFilter({ onFilterChange, className = "" }: DateFilterProps) {
  const [filter, setFilter] = useState<DateFilterState>({ type: 'all' });
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeChange = (type: string) => {
    const newFilter: DateFilterState = { type: type as DateFilterState['type'] };
    
    if (type === 'day') {
      newFilter.value = new Date().toISOString().split('T')[0];
    } else if (type === 'month') {
      const now = new Date();
      newFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else if (type === 'year') {
      newFilter.value = new Date().getFullYear().toString();
    }
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleValueChange = (value: string) => {
    const newFilter = { ...filter, value };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFilter = { ...filter, [field]: value };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const clearFilter = () => {
    const newFilter: DateFilterState = { type: 'all' };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const getDisplayText = () => {
    switch (filter.type) {
      case 'day':
        return filter.value ? new Date(filter.value).toLocaleDateString('en-US') : 'Today';
      case 'month':
        return filter.value ? new Date(filter.value + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'This month';
      case 'year':
        return filter.value || 'This year';
      case 'custom':
        return filter.startDate && filter.endDate 
          ? `${new Date(filter.startDate).toLocaleDateString('en-US')} - ${new Date(filter.endDate).toLocaleDateString('en-US')}`
          : 'Custom period';
      default:
        return 'All dates';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
      >
        <Filter className="w-4 h-4 mr-2" />
        {getDisplayText()}
        {filter.type !== 'all' && (
          <X 
            className="w-4 h-4 ml-2 hover:bg-white/20 rounded" 
            onClick={(e) => {
              e.stopPropagation();
              clearFilter();
            }}
          />
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 border border-white/20 bg-black/90 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="text-white font-medium">Filter by date</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/80 mb-2 block">Filter type</label>
                <Select value={filter.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="all" className="text-white hover:bg-white/10">All dates</SelectItem>
                    <SelectItem value="day" className="text-white hover:bg-white/10">Specific day</SelectItem>
                    <SelectItem value="month" className="text-white hover:bg-white/10">Specific month</SelectItem>
                    <SelectItem value="year" className="text-white hover:bg-white/10">Specific year</SelectItem>
                    <SelectItem value="custom" className="text-white hover:bg-white/10">Custom period</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filter.type === 'day' && (
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Date</label>
                  <input
                    type="date"
                    value={filter.value || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white"
                  />
                </div>
              )}

              {filter.type === 'month' && (
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Month</label>
                  <input
                    type="month"
                    value={filter.value || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white"
                  />
                </div>
              )}

              {filter.type === 'year' && (
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Year</label>
                  <input
                    type="number"
                    min="2020"
                    max={new Date().getFullYear() + 1}
                    value={filter.value || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white"
                    placeholder="2024"
                  />
                </div>
              )}

              {filter.type === 'custom' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-white/80 mb-2 block">Start date</label>
                    <input
                      type="date"
                      value={filter.startDate || ''}
                      onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/80 mb-2 block">End date</label>
                    <input
                      type="date"
                      value={filter.endDate || ''}
                      onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                Close
              </Button>
              <Button
                onClick={clearFilter}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
