
'use client';

import * as React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { AddEventForm } from '@/components/add-event-form';
import { Timeline } from '@/components/timeline';
import { EditEventForm } from '@/components/edit-event-form';
import { SearchBar } from '@/components/search-bar'; // Import SearchBar
import { FilterControls } from '@/components/filter-controls'; // Import FilterControls
import { mockEvents } from '@/data/mock-events';
import type { TimelineEvent, EventType } from '@/types/event';

// Helper function to sort events by timestamp descending (newest first)
const sortEventsDescending = (events: TimelineEvent[]): TimelineEvent[] => {
  return [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Helper function to get Chinese label for event type (can be moved to a utils file)
const getEventTypeLabel = (eventType?: EventType): string => {
  if (!eventType) return '事件'; // Fallback
  switch (eventType) {
    case 'note': return '笔记';
    case 'todo': return '待办';
    case 'schedule': return '日程';
    default: return '事件';
  }
};

export default function Home() {
  const [allEvents, setAllEvents] = React.useState<TimelineEvent[]>([]); // Store all events
  const [editingEvent, setEditingEvent] = React.useState<TimelineEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false); // State to track client-side rendering
  const [searchTerm, setSearchTerm] = React.useState(''); // State for search term
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | 'all'>('all'); // State for filter
  const { toast } = useToast();

   // Set isClient to true only on the client side and load initial data
  React.useEffect(() => {
    setIsClient(true);
    setAllEvents(sortEventsDescending(mockEvents)); // Load and sort mock data into allEvents
  }, []);


  const handleAddEvent = (newEventData: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    const newEvent: TimelineEvent = {
      ...newEventData,
      id: crypto.randomUUID(), // Generate a unique ID
      timestamp: new Date(), // Set timestamp to current time
    };
    // Add new event and resort descending
    setAllEvents((prevEvents) => sortEventsDescending([...prevEvents, newEvent]));
    toast({
        title: "事件已添加",
        description: `类型为 "${getEventTypeLabel(newEvent.eventType)}" 的事件 "${newEvent.title}" 已添加到您的时间轴。`, // Include type in toast
      });
  };

  const handleDeleteEvent = (id: string) => {
    const eventToDelete = allEvents.find(e => e.id === id);
    // Filter out the event and resort (though filtering doesn't change order)
    setAllEvents((prevEvents) => sortEventsDescending(prevEvents.filter((event) => event.id !== id)));
     toast({
        title: "事件已删除",
        description: `类型为 "${getEventTypeLabel(eventToDelete?.eventType)}" 的事件 "${eventToDelete?.title}" 已从您的时间轴移除。`, // Include type in toast
        variant: "destructive",
      });
  };

  // Function to open the edit dialog
  const handleOpenEditDialog = (event: TimelineEvent) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  // Function to handle the actual edit submission
  // Accepts Partial update data
  const handleEditEvent = (id: string, updatedData: Partial<Omit<TimelineEvent, 'id' | 'timestamp'>>) => {
     const originalEvent = allEvents.find(e => e.id === id);
    setAllEvents((prevEvents) =>
      sortEventsDescending(prevEvents.map((event) =>
        event.id === id ? { ...event, ...updatedData } : event // Merge partial updates
      ))
    );
     toast({
        title: "事件已更新",
        description: `类型为 "${getEventTypeLabel(updatedData.eventType ?? originalEvent?.eventType)}" 的事件 "${updatedData.title ?? originalEvent?.title}" 已更新。`, // Include type and use existing title if not updated
      });
    // Close the dialog after successful edit
    setIsEditDialogOpen(false);
    setEditingEvent(null);
  };

  // Filter events based on search term and selected type
  const filteredEvents = React.useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = searchTerm === '' ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter = selectedEventType === 'all' || event.eventType === selectedEventType;

      return matchesSearch && matchesFilter;
    });
  }, [allEvents, searchTerm, selectedEventType]);


  // Render only on the client to avoid hydration issues with Date formatting and initial load
  if (!isClient) {
     // You could show a loading spinner or skeleton here
     return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-purple-100 dark:from-blue-900 dark:via-teal-900 dark:to-purple-950 p-4"> {/* Added padding */}
          <p className="text-foreground">加载中...</p> {/* Basic loading indicator */}
        </main>
      );
  }


  return (
    // Apply gradient background
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 via-teal-50 to-purple-100 dark:from-blue-900 dark:via-teal-900 dark:to-purple-950 p-4 relative"> {/* Add relative positioning */}
      <div className="container mx-auto px-4 w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-foreground">时光流</h1> {/* Title in Chinese */}

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 sticky top-4 z-30 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow"> {/* Added sticky positioning */}
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <FilterControls
             selectedType={selectedEventType}
             onTypeChange={(value) => setSelectedEventType(value as EventType | 'all')}
             />
        </div>

        {/* Timeline Section */}
        <div className="mt-8"> {/* Add margin top to push timeline below sticky controls */}
             <Timeline
              events={filteredEvents} // Pass filtered events
              onEditEvent={handleOpenEditDialog} // Pass handler to open edit dialog
              onDeleteEvent={handleDeleteEvent}
             />
        </div>

      </div>
      <AddEventForm onAddEvent={handleAddEvent} />
       {/* Edit Event Dialog */}
       <EditEventForm
        event={editingEvent}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditEvent={handleEditEvent}
      />
      <Toaster />
    </main>
  );
}
