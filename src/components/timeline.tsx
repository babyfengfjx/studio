
"use client";

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale'; // Import Chinese locale

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
  onEditEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export function Timeline({ events, onEditEvent, onDeleteEvent }: TimelineProps) {
  // Events should already be sorted by the parent component (page.tsx)
  // const sortedEvents = React.useMemo(() =>
  //   [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
  //   [events]
  // );

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 py-8">
      {/* Central Timeline Line with Gradient */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-teal-400 to-purple-400 -translate-x-1/2 rounded-full"></div>

      <AnimatePresence initial={false}>
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`mb-8 flex justify-between items-start w-full ${ // Use items-start to align dot with card top
              index % 2 === 0 ? 'flex-row-reverse text-right' : 'text-left' // Adjust text alignment
            }`}
          >
            {/* Timeline Dot - Position adjusted slightly */}
            <div className="absolute left-1/2 -translate-x-1/2 transform translate-y-1 z-10">
               <div className="bg-accent rounded-full p-1 shadow-md ring-2 ring-background"> {/* Added ring for contrast */}
                 <CalendarClock className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>

            {/* Spacer */}
            <div className="w-5/12"></div>

            {/* Event Card - Enhanced shadow and border */}
            <div className={`w-5/12 ${index % 2 === 0 ? 'pl-4' : 'pr-4'}`}> {/* Add padding to avoid overlap with line */}
              <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card border border-border/50"> {/* Increased shadow, subtle border */}
                <CardHeader className="pb-3 pt-4"> {/* Adjusted padding */}
                   <div className={`flex justify-between items-start ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}> {/* Reverse actions for right-aligned cards */}
                     <div className="flex-1 min-w-0"> {/* Ensure title/desc take space */}
                       <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
                       <CardDescription className="text-sm text-muted-foreground pt-1">
                         {/* Format date using Chinese locale */}
                         {format(event.timestamp, 'PPP p', { locale: zhCN })}
                       </CardDescription>
                     </div>
                     <div className={`flex space-x-1 ${index % 2 === 0 ? 'ml-2' : 'mr-2'} flex-shrink-0`}> {/* Actions */}
                       {/* Edit button */}
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditEvent(event)} aria-label="编辑事件"> {/* Translate aria-label */}
                         <Edit className="h-4 w-4" />
                       </Button>
                       {/* Delete Button */}
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="删除事件"> {/* Translate aria-label */}
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>确定要删除吗？</AlertDialogTitle> {/* Translate */}
                             <AlertDialogDescription>
                               此操作无法撤销。这将永久删除标题为 "{event.title}" 的事件。 {/* Translate */}
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>取消</AlertDialogCancel> {/* Translate */}
                             <AlertDialogAction
                               className="bg-destructive hover:bg-destructive/90"
                               onClick={() => onDeleteEvent(event.id)}>
                               删除 {/* Translate */}
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>
                   </div>
                </CardHeader>
                {event.description && (
                  <CardContent className="pt-0 pb-4"> {/* Adjusted padding */}
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
