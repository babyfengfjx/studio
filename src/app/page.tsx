
'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react'; // Import Search and X icons
import { motion, AnimatePresence } from 'framer-motion'; // Import motion components
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Timeline } from '@/components/timeline';
import { EditEventForm } from '@/components/edit-event-form';
import { SearchBar } from '@/components/search-bar';
import { FilterControls } from '@/components/filter-controls';
import { QuickAddEventForm } from '@/components/quick-add-event-form';
import { mockEvents } from '@/data/mock-events';
import type { TimelineEvent, EventType } from '@/types/event';
import { Button } from '@/components/ui/button'; // Import Button
import { cn } from '@/lib/utils'; // Import cn utility

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

// Function to derive title from description (e.g., first line or first 50 chars)
const deriveTitle = (description?: string): string => {
    if (!description) return '新事件'; // Default title if no description
    const lines = description.split('\n');
    const firstLine = lines[0].trim();
    if (firstLine) {
        return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine; // Use first line or truncate
    }
    // If first line is empty but there's more content, use a snippet
    const snippet = description.trim().substring(0, 50);
    return snippet.length === 50 ? snippet + '...' : (snippet || '新事件');
};


export default function Home() {
  const [allEvents, setAllEvents] = React.useState<TimelineEvent[]>([]); // Store all events
  const [editingEvent, setEditingEvent] = React.useState<TimelineEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false); // State to track client-side rendering
  const [searchTerm, setSearchTerm] = React.useState(''); // State for search term
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | 'all'>('all'); // State for filter
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false); // State for search expansion
  const { toast } = useToast();

   // Set isClient to true only on the client side and load initial data
  React.useEffect(() => {
    setIsClient(true);
    setAllEvents(sortEventsDescending(mockEvents)); // Load and sort mock data into allEvents
  }, []);


  // Updated handleAddEvent: Title is derived from description
  const handleAddEvent = (newEventData: Omit<TimelineEvent, 'id' | 'timestamp' | 'title'>) => {
     const derivedTitle = deriveTitle(newEventData.description);
    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(), // Generate a unique ID
      timestamp: new Date(), // Set timestamp to current time
      title: derivedTitle, // Derive title from description
      description: newEventData.description, // Full description
      eventType: newEventData.eventType,
      imageUrl: newEventData.imageUrl,
      attachment: newEventData.attachment,
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
     // If description is updated, also update the title
     const finalUpdatedData = { ...updatedData };
     if (updatedData.description !== undefined) {
         finalUpdatedData.title = deriveTitle(updatedData.description);
     } else if (updatedData.title === undefined && originalEvent) {
         // Ensure title is updated if description changes, even if title wasn't explicitly passed
         finalUpdatedData.title = deriveTitle(originalEvent.description);
     }


    setAllEvents((prevEvents) =>
      sortEventsDescending(prevEvents.map((event) =>
        event.id === id ? { ...event, ...finalUpdatedData } : event // Merge partial updates
      ))
    );
     toast({
        title: "事件已更新",
        description: `类型为 "${getEventTypeLabel(finalUpdatedData.eventType ?? originalEvent?.eventType)}" 的事件 "${finalUpdatedData.title ?? originalEvent?.title}" 已更新。`, // Include type and use existing title if not updated
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
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 via-teal-50 to-purple-100 dark:from-blue-900 dark:via-teal-900 dark:to-purple-950 p-4 relative">
      {/* Main Content Area - Increased bottom padding to accommodate fixed form & search */}
      <div className="container mx-auto px-4 w-full max-w-4xl pb-[220px]"> {/* Increased bottom padding */}
        <h1 className="text-4xl font-bold text-center my-8 text-foreground">时光流</h1> {/* Title in Chinese, added margin */}


        {/* Timeline Section - No top margin, adjusted bottom padding handled by parent */}
        <div className="mt-0">
             <Timeline
              events={filteredEvents} // Pass filtered events
              onEditEvent={handleOpenEditDialog} // Pass handler to open edit dialog
              onDeleteEvent={handleDeleteEvent}
             />
        </div>

      </div>

      {/* Search Trigger / Expanded Search Bar Area - Positioned above the quick add form */}
       <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4 flex justify-center items-center h-16"> {/* Adjusted bottom position */}
         {/* Timeline Connector Line (Visible when search is NOT expanded) */}
         {!isSearchExpanded && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-purple-400 to-purple-400 rounded-b-full mb-[-4px]"></div> {/* Adjusted height and margin */}
         )}
         <AnimatePresence mode="wait">
           {isSearchExpanded ? (
             <motion.div
               key="search-bar"
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 10, scale: 0.95 }}
               transition={{ duration: 0.2, ease: 'easeInOut' }}
               className={cn(
                   "flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm shadow-md border border-border w-full max-w-md",
                   // Apply gradient background to expanded search bar
                   "bg-gradient-to-r from-blue-100 via-teal-100 to-purple-200 dark:from-blue-800 dark:via-teal-800 dark:to-purple-800"
                )}
             >
               <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} className="flex-grow"/>
               <FilterControls
                 selectedType={selectedEventType}
                 onTypeChange={(value) => setSelectedEventType(value as EventType | 'all')}
                 className="w-auto flex-shrink-0" // Adjust styling for inline display
               />
                <Button
                   variant="ghost"
                   size="icon"
                   className="h-8 w-8 flex-shrink-0 text-foreground/80 hover:text-foreground" // Adjusted text color
                   onClick={() => setIsSearchExpanded(false)}
                   aria-label="关闭搜索"
                 >
                   <X className="h-4 w-4" />
                 </Button>
             </motion.div>
           ) : (
             <motion.div
               key="search-trigger"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               transition={{ duration: 0.15, ease: 'easeOut' }}
               className="relative" // Needed for absolute connector positioning
             >

               <Button
                 variant="ghost"
                 size="icon"
                 className={cn(
                     "rounded-full backdrop-blur-sm shadow border border-border",
                     // Apply gradient background to search trigger button
                     "bg-gradient-to-br from-blue-300 via-teal-300 to-purple-400 hover:opacity-90 text-white" // Gradient background and text color
                    )}
                 onClick={() => setIsSearchExpanded(true)}
                 aria-label="打开搜索与筛选"
               >
                 <Search className="h-5 w-5" />
               </Button>
             </motion.div>
           )}
         </AnimatePresence>
       </div>


       {/* Quick Add Event Form - Fixed at the bottom */}
       <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/90 backdrop-blur-md border-t border-border shadow-lg">
         <div className="container mx-auto max-w-4xl flex items-end gap-2"> {/* Use flex to align items */}
           {/* Quick Add Form takes full space */}
           <div className="flex-grow">
             <QuickAddEventForm onAddEvent={handleAddEvent} />
           </div>
            {/* REMOVED Search/Filter Trigger Button from here */}
         </div>
       </div>

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
