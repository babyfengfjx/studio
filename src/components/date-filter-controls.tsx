
"use client";

import * as React from "react";
import { CalendarRange, CalendarDays } from "lucide-react"; // Import icons
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { DateFilterType } from "@/types/event";
import { cn } from "@/lib/utils";

interface DateFilterControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedFilter: DateFilterType;
  onFilterChange: (value: DateFilterType) => void;
}

// Helper function to get Chinese label for date filter type
const getDateFilterLabel = (filterType: DateFilterType): string => {
  switch (filterType) {
    case 'all': return '全部时间';
    case 'today': return '今天';
    case 'thisWeek': return '本周';
    case 'last7days': return '过去 7 天';
    case 'last30days': return '过去 30 天';
    case 'thisMonth': return '本月';
    case 'thisQuarter': return '本季度';
    case 'lastMonth': return '上个月';
    default: return '筛选时间';
  }
};

const dateFilterOptions: DateFilterType[] = [
  'all',
  'today',
  'thisWeek',
  'last7days',
  'last30days',
  'thisMonth',
  'thisQuarter',
  'lastMonth',
];

export function DateFilterControls({ selectedFilter, onFilterChange, className, ...props }: DateFilterControlsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <Label htmlFor="date-filter" className="sr-only">按时间筛选</Label>
      <Select value={selectedFilter} onValueChange={onFilterChange}>
        <SelectTrigger
          id="date-filter"
          className={cn(
              "h-8 w-auto px-2 py-1 text-xs border-0 shadow-none focus:ring-0", // Smaller height, padding, text size, less visual clutter
              "bg-transparent text-foreground/80 hover:text-foreground" // Transparent background, adjusted text color
          )}
          aria-label="筛选时间范围"
        >
          <CalendarRange className="h-3 w-3 mr-1" /> {/* Smaller icon */}
          <SelectValue placeholder="筛选时间..." />
        </SelectTrigger>
        <SelectContent>
          {dateFilterOptions.map((filter) => (
            <SelectItem key={filter} value={filter}>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> {getDateFilterLabel(filter)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
