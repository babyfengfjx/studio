
export type EventType = 'note' | 'todo' | 'schedule';
export type ViewMode = 'timeline' | 'list'; // Add ViewMode type

export interface TimelineEvent {
  id: string;
  timestamp: Date; // Keep as Date for frontend logic (sorting, formatting)
  eventType: EventType;
  title: string; // Title is still present but often derived, not mandatory input
  description: string;
  imageUrl?: string;
  attachment?: {
    name: string;
    // url?: string; // Keep URL optional/removed if not needed for core functionality
  };
  // Removed userId field
}
