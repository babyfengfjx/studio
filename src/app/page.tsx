'use client';

import * as React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { AddEventForm } from '@/components/add-event-form';
import { Timeline } from '@/components/timeline';
import { EditEventForm } from '@/components/edit-event-form'; // Import EditEventForm
import { mockEvents } from '@/data/mock-events';
import type { TimelineEvent } from '@/types/event';

export default function Home() {
  const [events, setEvents] = React.useState<TimelineEvent[]>(mockEvents);
  const [editingEvent, setEditingEvent] = React.useState<TimelineEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleAddEvent = (newEventData: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    const newEvent: TimelineEvent = {
      ...newEventData,
      id: crypto.randomUUID(), // Generate a unique ID
      timestamp: new Date(), // Set timestamp to current time
    };
    setEvents((prevEvents) => [...prevEvents, newEvent].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())); // Keep sorted
    toast({
        title: "事件已添加",
        description: `事件 "${newEvent.title}" 已添加到您的时间轴。`,
      });
  };

  const handleDeleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
     toast({
        title: "事件已删除",
        description: `事件 "${eventToDelete?.title}" 已从您的时间轴移除。`,
        variant: "destructive",
      });
  };

  // Function to open the edit dialog
  const handleOpenEditDialog = (event: TimelineEvent) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  // Function to handle the actual edit submission
  const handleEditEvent = (id: string, updatedData: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id ? { ...event, ...updatedData } : event
      ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) // Keep sorted
    );
     toast({
        title: "事件已更新",
        description: `事件 "${updatedData.title}" 已更新。`,
      });
    // Close the dialog after successful edit
    setIsEditDialogOpen(false);
    setEditingEvent(null);
  };

   React.useEffect(() => {
    // Initial sort when component mounts
    setEvents(prevEvents => [...prevEvents].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  }, []);


  return (
    // Apply gradient background
    <main className="flex min-h-screen flex-col items-center justify-between py-12 bg-gradient-to-br from-blue-50 via-teal-50 to-purple-100 dark:from-blue-900 dark:via-teal-900 dark:to-purple-950">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10 text-foreground">时光流</h1> {/* Title in Chinese */}
        <Timeline
          events={events}
          onEditEvent={handleOpenEditDialog} // Pass handler to open edit dialog
          onDeleteEvent={handleDeleteEvent}
         />
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
