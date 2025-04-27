
"use client";

import * as React from "react";
import { ListFilter, StickyNote, CheckSquare, CalendarCheck, List } from "lucide-react"; // Import icons
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventType } from "@/types/event";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label"; // Import Label

interface FilterControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedType: EventType | 'all';
  onTypeChange: (value: EventType | 'all') => void;
}

// Helper function to get Chinese label for event type
const getEventTypeLabel = (eventType: EventType | 'all'): string => {
  switch (eventType) {
    case 'note': return '笔记';
    case 'todo': return '待办';
    case 'schedule': return '日程';
    case 'all': return '所有类型';
    default: return '事件';
  }
};

export function FilterControls({ selectedType, onTypeChange, className, ...props }: FilterControlsProps) {
  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Label htmlFor="event-type-filter">按类型筛选</Label>
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger id="event-type-filter" className="w-full"> {/* Use full width in dialog */}
          <SelectValue placeholder="按类型筛选..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" /> {getEventTypeLabel('all')}
            </div>
          </SelectItem>
          <SelectItem value="note">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" /> {getEventTypeLabel('note')}
            </div>
          </SelectItem>
          <SelectItem value="todo">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" /> {getEventTypeLabel('todo')}
            </div>
          </SelectItem>
          <SelectItem value="schedule">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" /> {getEventTypeLabel('schedule')}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
