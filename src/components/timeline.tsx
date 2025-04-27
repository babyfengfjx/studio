"use client";

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { TimelineEvent } from '@/types/event';

interface TimelineProps {
  events: TimelineEvent[];
  onEditEvent: (event: TimelineEvent) => void; // Placeholder for edit functionality
  onDeleteEvent: (id: string) => void;
}

export function Timeline({ events, onEditEvent, onDeleteEvent }: TimelineProps) {
  const sortedEvents = React.useMemo(() =>
    [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [events]
  );

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 py-8">
      {/* Central Timeline Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>

      <AnimatePresence initial={false}>
        {sortedEvents.map((event, index) => (
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`mb-8 flex justify-between items-center w-full ${
              index % 2 === 0 ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Timeline Dot */}
            <div className="absolute left-1/2 -translate-x-1/2 z-10">
              <div className="bg-accent rounded-full p-1 shadow-md">
                 <CalendarClock className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>

            {/* Spacer */}
            <div className="w-5/12"></div>

            {/* Event Card */}
            <div className="w-5/12">
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
                <CardHeader className="pb-3">
                   <div className="flex justify-between items-start">
                     <div>
                       <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
                       <CardDescription className="text-sm text-muted-foreground pt-1">
                         {format(event.timestamp, 'PPp')} {/* Format: Sep 14, 2023, 2:30:00 PM */}
                       </CardDescription>
                     </div>
                     <div className="flex space-x-1">
                        {/* Edit button - Placeholder */}
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditEvent(event)} aria-label="Edit Event">
                         <Edit className="h-4 w-4" />
                       </Button>
                       {/* Delete Button */}
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Delete Event">
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                             <AlertDialogDescription>
                               This action cannot be undone. This will permanently delete the event titled "{event.title}".
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                               className="bg-destructive hover:bg-destructive/90"
                               onClick={() => onDeleteEvent(event.id)}>
                               Delete
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>
                   </div>
                </CardHeader>
                {event.description && (
                  <CardContent>
                    <p className="text-sm text-foreground">{event.description}</p>
                  </CardContent>
                )}
              </Card>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
