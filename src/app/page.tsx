
'use client';

import * as React from 'react';
import { Search, X, Brain, Loader2, List, Rows, Settings, CalendarRange } from 'lucide-react'; // Import view icons, Settings icon, CalendarRange
import { motion, AnimatePresence } from 'framer-motion';
import { Timeline } from '@/components/timeline';
import { EventList } from '@/components/event-list'; // Import EventList component
import { EditEventForm } from '@/components/edit-event-form';
import { SearchBar } from '@/components/search-bar';
import { FilterControls } from '@/components/filter-controls';
import { DateFilterControls } from '@/components/date-filter-controls'; // Import DateFilterControls
import { QuickAddEventForm } from '@/components/quick-add-event-form';
import { WebdavSettings } from '@/components/webdav-settings'; // Import WebdavSettings
import { mockEvents } from '@/data/mock-events';
import type { TimelineEvent, EventType, ViewMode, DateFilterType } from '@/types/event'; // Add ViewMode, DateFilterType type
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs for view switching
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { summarizeEvents } from '@/ai/flows/summarize-events-flow'; // Import AI flow function
import type { SummarizeEventsInput } from '@/ai/schemas/summarize-events-schema'; // Import AI input type from new schema file
import type { TimelineEventInput } from '@/ai/schemas/event-schema'; // Import AI schema type for event mapping
import { getDateRange } from '@/lib/date-utils'; // Import date range calculation function


// Key for LocalStorage
const LOCAL_STORAGE_KEY = 'timeflow-events';

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

// Type for data stored in localStorage (with string dates)
type StoredTimelineEvent = Omit<TimelineEvent, 'timestamp'> & { timestamp: string };

export default function Home() {
  const [allEvents, setAllEvents] = React.useState<TimelineEvent[]>([]); // Store all events
  const [editingEvent, setEditingEvent] = React.useState<TimelineEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false); // State to track client-side rendering
  const [searchTerm, setSearchTerm] = React.useState(''); // State for search term
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | 'all'>('all'); // State for filter
  const [selectedDateFilter, setSelectedDateFilter] = React.useState<DateFilterType>('all'); // State for date filter
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false); // State for search expansion
  const [newlyAddedEventId, setNewlyAddedEventId] = React.useState<string | null>(null); // State for highlighting new event
  const quickAddFormRef = React.useRef<HTMLDivElement>(null); // Ref for the quick add form container
  const searchContainerRef = React.useRef<HTMLDivElement>(null); // Ref for the expanded search container
  const [bottomPadding, setBottomPadding] = React.useState(0); // Initial bottom padding, will be calculated
  const { toast } = useToast(); // Initialize toast hook
  const [isAiLoading, setIsAiLoading] = React.useState(false); // State for AI loading
  const [viewMode, setViewMode] = React.useState<ViewMode>('timeline'); // State for view mode
  const [isWebdavSettingsOpen, setIsWebdavSettingsOpen] = React.useState(false); // State for WebDAV settings dialog

  // Load events from LocalStorage on initial client-side mount
  React.useEffect(() => {
    setIsClient(true);
    try {
      const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedEvents) {
        const parsedEvents: StoredTimelineEvent[] = JSON.parse(storedEvents);
        // Convert ISO string timestamps back to Date objects
        const eventsWithDates = parsedEvents.map(event => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }));
        setAllEvents(sortEventsDescending(eventsWithDates));
      } else {
        // Optional: Initialize with mock events if nothing in storage
         // Or initialize with empty: setAllEvents([]);
         // Let's keep mock events for first-time users for now
         setAllEvents(sortEventsDescending(mockEvents));
      }
    } catch (error) {
      console.error("Error loading events from localStorage:", error);
      // Fallback to mock events or empty array in case of error
      setAllEvents(sortEventsDescending(mockEvents));
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  // Save events to LocalStorage whenever allEvents state changes
  React.useEffect(() => {
    // Only save if it's client-side and allEvents has been initialized
    if (isClient && allEvents.length > 0) {
        try {
        // Convert Date objects to ISO strings for serialization
        const eventsToStore: StoredTimelineEvent[] = allEvents.map(event => ({
            ...event,
            timestamp: event.timestamp.toISOString(),
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(eventsToStore));
        } catch (error) {
            console.error("Error saving events to localStorage:", error);
            // Optionally notify user about the saving issue
            // toast({ title: "保存失败", description: "无法将更改保存到本地存储。", variant: "destructive" });
        }
    }
    // If allEvents becomes empty after initialization, clear localStorage
    else if (isClient && allEvents.length === 0 && localStorage.getItem(LOCAL_STORAGE_KEY)) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [allEvents, isClient]); // Run whenever allEvents or isClient changes

   // Calculate bottom padding based on quick add form height
   React.useEffect(() => {
    // Function to calculate and set padding
    const calculatePadding = () => {
        if (quickAddFormRef.current) {
            const formHeight = quickAddFormRef.current.offsetHeight;
            setBottomPadding(formHeight); // Just use the form height
        } else {
            // Fallback or initial padding if ref not ready
            setBottomPadding(140); // Estimate default padding
        }
    };

    // Initial calculation only after client side is confirmed
    if(isClient) {
        calculatePadding();
        // Recalculate on window resize
        window.addEventListener('resize', calculatePadding);

        // Use ResizeObserver for more precise form height changes (optional but better)
        let resizeObserver: ResizeObserver | null = null;
        if (quickAddFormRef.current) {
            resizeObserver = new ResizeObserver(calculatePadding);
            resizeObserver.observe(quickAddFormRef.current);
        }

        // Cleanup listeners
        return () => {
            window.removeEventListener('resize', calculatePadding);
            if (resizeObserver && quickAddFormRef.current) {
                resizeObserver.unobserve(quickAddFormRef.current);
            }
        };
    }
   }, [isClient]); // Re-run if isClient changes

    // Function to close search and reset filters (Wrap in useCallback)
    const closeAndResetSearch = React.useCallback(() => {
        setIsSearchExpanded(false);
        setSearchTerm('');
        setSelectedEventType('all');
        setSelectedDateFilter('all');
    }, [setIsSearchExpanded, setSearchTerm, setSelectedEventType, setSelectedDateFilter]); // Add dependencies

    // Effect to handle clicks outside the expanded search area
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Only run if search is expanded and the click is outside the search container
            if (isSearchExpanded && searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                 // Also check if the click was on the search trigger button itself to prevent immediate closing
                 const triggerButton = document.getElementById('search-trigger-button'); // Assuming the trigger button has this ID
                 if (!triggerButton || !triggerButton.contains(event.target as Node)) {
                    closeAndResetSearch(); // Use the close/reset function
                 }
            }
        };

        // Add listener only when search is expanded
        if (isSearchExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchExpanded, closeAndResetSearch]); // Include closeAndResetSearch in dependencies

    // Effect to handle Escape key press to close search
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            closeAndResetSearch();
          }
        };

        // Add listener only when search is expanded
        if (isSearchExpanded) {
          document.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup listener
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }, [isSearchExpanded, closeAndResetSearch]); // Include closeAndResetSearch in dependencies


  const handleAddEvent = (newEventData: Omit<TimelineEvent, 'id' | 'timestamp' | 'title'>) => {
     // This function now only updates the state. Saving is handled by the useEffect hook.
     console.log("Adding event");

    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(), // Generate a unique ID
      timestamp: new Date(), // Set timestamp to current time
      title: '', // Title is intentionally left empty
      description: newEventData.description,
      eventType: newEventData.eventType,
      imageUrl: newEventData.imageUrl,
    };
    // Add new event and resort descending (newest first)
    setAllEvents((prevEvents) => {
        const updatedEvents = sortEventsDescending([...prevEvents, newEvent]);
        // Ensure scroll happens *after* state update is likely processed by React
        requestAnimationFrame(() => {
             if (viewMode === 'timeline') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
             }
             else if (viewMode === 'list') {
                const listContainer = document.getElementById('event-list-container');
                if (listContainer) listContainer.scrollTo({ top: 0, behavior: 'smooth' });
             }
        });
        // Set the ID for highlighting
        setNewlyAddedEventId(newEvent.id);
        // Clear the highlight after a delay
        setTimeout(() => setNewlyAddedEventId(null), 1500); // Highlight for 1.5 seconds
        return updatedEvents;
    });
  };

  const handleDeleteEvent = (id: string) => {
    // This function now only updates the state. Saving is handled by the useEffect hook.
    console.log("Deleting event:", id);
    const eventToDelete = allEvents.find(e => e.id === id);
    // Filter out the event
    setAllEvents((prevEvents) => sortEventsDescending(prevEvents.filter((event) => event.id !== id)));
  };

  // Function to open the edit dialog
  const handleOpenEditDialog = (event: TimelineEvent) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  // Updated handleEditEvent to accept timestamp
  const handleEditEvent = (id: string, updatedData: Partial<Omit<TimelineEvent, 'id' | 'title'>>) => {
     // This function now only updates the state. Saving is handled by the useEffect hook.
     console.log("Editing event:", id);

     const originalEvent = allEvents.find(e => e.id === id);
     if (!originalEvent) return; // Guard clause

     // Prepare the final update object - includes potentially updated timestamp
     const finalUpdatedData: Partial<Omit<TimelineEvent, 'id' | 'title'>> = { ...updatedData };

    setAllEvents((prevEvents) =>
      sortEventsDescending(prevEvents.map((event) =>
        event.id === id ? { ...event, ...finalUpdatedData } : event // Merge partial updates
      ))
    );

    // Close the dialog after successful edit
    setIsEditDialogOpen(false);
    setEditingEvent(null);
  };


  // Filter events based on search term, selected type, and selected date range
  const filteredEvents = React.useMemo(() => {
    const dateRange = getDateRange(selectedDateFilter); // Get { start: Date | null, end: Date | null }

    return allEvents.filter(event => {
      // Search only in description now
      const matchesSearch = searchTerm === '' ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by event type
      const matchesFilter = selectedEventType === 'all' || event.eventType === selectedEventType;

      // Filter by date range
      const matchesDate = !dateRange || (
           (!dateRange.start || event.timestamp >= dateRange.start) &&
           (!dateRange.end || event.timestamp <= dateRange.end)
      );

      return matchesSearch && matchesFilter && matchesDate; // Combine all filters
    });
  }, [allEvents, searchTerm, selectedEventType, selectedDateFilter]); // Add selectedDateFilter to dependencies

    // Function to handle AI summarization
    const handleAiSummarize = async () => {
        const query = searchTerm.trim();
        if (!query) {
            toast({
                title: "请输入查询",
                description: "请输入您想让 AI 总结的内容。",
                variant: "destructive",
            });
            return;
        }

        // Prepare events for AI (convert timestamp to ISO string)
        const eventsForAi: TimelineEventInput[] = filteredEvents.map(event => ({
            ...event,
            timestamp: event.timestamp.toISOString(), // Convert Date to ISO string
        }));

        setIsAiLoading(true);
        try {
            const input: SummarizeEventsInput = { query, events: eventsForAi };
            const result = await summarizeEvents(input);

            // Display the summary in a toast or alert dialog
            toast({
                title: "AI 总结",
                description: (
                    <div className="max-h-60 overflow-y-auto whitespace-pre-wrap">
                        {result.summary}
                    </div>
                ),
                duration: 9000, // Show longer for reading
            });

        } catch (error) {
            console.error("AI Summarization Error:", error);
            toast({
                title: "AI 总结出错",
                description: "无法获取 AI 总结。请稍后再试。",
                variant: "destructive",
            });
        } finally {
            setIsAiLoading(false);
        }
    };




  // Render only on the client to avoid hydration issues with Date formatting and initial load
  if (!isClient) {
     // Basic loading indicator
     return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-purple-100 dark:from-blue-900 dark:via-teal-900 dark:to-purple-950 p-4">
          <p className="text-foreground">加载中...</p>
        </main>
      );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 via-teal-50 to-purple-100 dark:from-blue-900 dark:via-teal-900 dark:to-purple-950 p-4 relative">
       {/* WebDAV Settings Button - Top Right */}
       <div className="absolute top-4 right-4 z-50">
         <Button variant="ghost" size="icon" onClick={() => setIsWebdavSettingsOpen(true)} aria-label="数据同步设置">
           <Settings className="h-5 w-5" />
         </Button>
       </div>

      {/* Main Content Area - Adjust bottom padding dynamically */}
       <div
          className="container mx-auto px-4 w-full max-w-4xl flex-1" // Use flex-1 to take available space
          style={{ paddingBottom: `${bottomPadding + 40}px` }} // Apply dynamic padding + extra space for search trigger
       >
        <h1 className="text-4xl font-bold text-center my-8 text-foreground">时光流</h1> {/* Title in Chinese, added margin */}

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-auto">
                <TabsList>
                    <TabsTrigger value="timeline" className="px-4 py-2 flex items-center gap-2">
                        <Rows className="h-4 w-4" /> 时间轴
                    </TabsTrigger>
                    <TabsTrigger value="list" className="px-4 py-2 flex items-center gap-2">
                        <List className="h-4 w-4" /> 列表
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>


        {/* Content Display based on viewMode */}
        <div className="mt-0">
             {viewMode === 'timeline' && (
                <Timeline
                 events={filteredEvents} // Pass filtered events
                 onEditEvent={handleOpenEditDialog} // Pass handler to open edit dialog
                 onDeleteEvent={handleDeleteEvent}
                 newlyAddedEventId={newlyAddedEventId} // Pass the ID for highlighting
                />
             )}
             {viewMode === 'list' && (
                <EventList
                 events={filteredEvents}
                 onEditEvent={handleOpenEditDialog}
                 onDeleteEvent={handleDeleteEvent}
                 newlyAddedEventId={newlyAddedEventId}
                />
             )}
        </div>
      </div>

       {/* Quick Add Event Form & Search - Fixed container at the bottom */}
       <div ref={quickAddFormRef} className="fixed bottom-0 left-0 right-0 z-40 bg-transparent pointer-events-none">
         {/* Container for centering content within the fixed area */}
         <div className="container mx-auto max-w-4xl relative pointer-events-auto p-4"> {/* Added padding here */}
           {/* Quick Add Form takes full width within the centered container */}
           <div className="w-full relative"> {/* Make this relative for absolute positioning of search */}
              {/* Search Trigger / Expanded Search Bar Area - Positioned above the Quick Add Form */}
               <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-auto w-full flex justify-center"> {/* Adjusted margin */}
                    <AnimatePresence mode="wait">
                    {isSearchExpanded ? (
                        <motion.div
                            key="search-bar"
                            ref={searchContainerRef} // Add ref to the expanded container
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm shadow-md border border-border w-full max-w-lg", // Max width for expanded state
                                "bg-gradient-to-r from-blue-100 via-teal-100 to-purple-200 dark:from-blue-800 dark:via-teal-800 dark:to-purple-800"
                            )}
                        >
                            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} className="flex-grow"/>
                            {/* Type Filter */}
                            <FilterControls
                                selectedType={selectedEventType}
                                onTypeChange={(value) => setSelectedEventType(value as EventType | 'all')}
                                className="w-auto flex-shrink-0"
                            />
                            {/* Date Filter */}
                            <DateFilterControls
                                selectedFilter={selectedDateFilter}
                                onFilterChange={setSelectedDateFilter}
                                className="w-auto flex-shrink-0"
                            />
                            {/* AI Summarize Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 flex-shrink-0 text-foreground/80 hover:text-primary",
                                    isAiLoading && "animate-spin" // Add spin animation when loading
                                )}
                                onClick={handleAiSummarize}
                                disabled={isAiLoading || !searchTerm.trim()} // Disable if loading or no query
                                aria-label="AI 总结"
                            >
                                {isAiLoading ? <Loader2 className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                            </Button>
                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0 text-foreground/80 hover:text-foreground" // Adjusted text color
                                onClick={closeAndResetSearch} // Use the new function
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
                            className="relative z-10" // Removed positioning adjustments, position controlled by parent div
                        >
                             <Button
                                id="search-trigger-button" // Add ID for click outside check
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "rounded-full backdrop-blur-sm shadow border border-border h-10 w-10", // Explicit size
                                    "bg-gradient-to-br from-blue-300 via-teal-300 to-purple-400 hover:opacity-90 text-white"
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
                 {/* Quick Add Form is now below the search trigger area */}
                <QuickAddEventForm onAddEvent={handleAddEvent} />
           </div>

         </div>
       </div>

       {/* Edit Event Dialog */}
       <EditEventForm
        event={editingEvent}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditEvent={handleEditEvent}
      />

       {/* WebDAV Settings Dialog */}
       <WebdavSettings
         isOpen={isWebdavSettingsOpen}
         onOpenChange={setIsWebdavSettingsOpen}
         // Add necessary props for saving/loading settings if needed
         // onSave={handleSaveWebdavSettings}
       />

      {/* Keep Toaster component */}
      <Toaster />
    </main>
  );
}


