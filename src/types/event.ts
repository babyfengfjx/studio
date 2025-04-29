
export type EventType = 'note' | 'todo' | 'schedule';
export type ViewMode = 'timeline' | 'list'; // Add ViewMode type

// Define possible date filter values
export type DateFilterType =
  | 'all'
  | 'today'
  | 'thisWeek'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'thisQuarter'
  | 'lastMonth';


export interface TimelineEvent {
  id: string;
  timestamp: Date; // Keep as Date for frontend logic (sorting, formatting)
  eventType: EventType;
  title: string; // Title is still present but often derived, not mandatory input
  description: string;
  imageUrl?: string;
  // Removed userId field
  // Removed attachment field
}

