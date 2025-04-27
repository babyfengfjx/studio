
export type EventType = 'note' | 'todo' | 'schedule';

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  eventType: EventType; // Added field for event type
  title: string; // Title will be derived from description
  description: string; // Description is now mandatory
  imageUrl?: string; // Optional URL for an image (can be data URI for local preview)
  attachment?: {
    name: string;
    // url?: string; // In a real app, you'd store the URL after upload
  };
}
