export interface TimelineEvent {
  id: string;
  timestamp: Date;
  title: string;
  description?: string;
  imageUrl?: string; // Optional URL for an image (can be data URI for local preview)
  attachment?: {
    name: string;
    // url?: string; // In a real app, you'd store the URL after upload
  };
}
