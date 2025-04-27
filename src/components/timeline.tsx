
"use client";

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CalendarCheck, Paperclip, Image as ImageIcon, StickyNote, CheckSquare } from 'lucide-react'; // Added more icons
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale'; // Import Chinese locale
import Image from 'next/image'; // Import next/image

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import type { TimelineEvent, EventType } from '@/types/event';
import { cn } from '@/lib/utils'; // Import cn utility

interface TimelineProps {
  events: TimelineEvent[];
  onEditEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
}

// Helper function to get the icon based on event type
const getEventTypeIcon = (eventType: EventType) => {
  switch (eventType) {
    case 'note':
      return <StickyNote className="h-5 w-5 text-accent-foreground" />;
    case 'todo':
      return <CheckSquare className="h-5 w-5 text-accent-foreground" />;
    case 'schedule':
      return <CalendarCheck className="h-5 w-5 text-accent-foreground" />;
    default:
      return <CalendarCheck className="h-5 w-5 text-accent-foreground" />; // Default icon
  }
};


export function Timeline({ events, onEditEvent, onDeleteEvent }: TimelineProps) {
  // State to manage which event is pending deletion for confirmation
  const [eventToDelete, setEventToDelete] = React.useState<TimelineEvent | null>(null);


  return (
     <TooltipProvider> {/* Wrap with TooltipProvider */}
        <div className="relative w-full max-w-4xl mx-auto px-4 py-8"> {/* Increased max-width */}
        {/* Central Timeline Line with Gradient */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-teal-400 to-purple-400 -translate-x-1/2 rounded-full"></div>

        <AnimatePresence initial={false}>
            {events.map((event, index) => {
              const isLeftAligned = index % 2 !== 0; // Determine alignment

              return (
                <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="mb-12 flex justify-between items-start w-full relative" // Increased mb
                    style={{ zIndex: events.length - index }} // Ensure later (visually upper) items overlap earlier ones
                >
                    {/* Timeline Dot - Position adjusted slightly */}
                    {/* Ensure dot is visually above the line and card */}
                    <div className="absolute left-1/2 top-1 -translate-x-1/2 z-20">
                    <div className="bg-accent rounded-full p-1.5 shadow-md ring-2 ring-background"> {/* Adjusted padding */}
                        {getEventTypeIcon(event.eventType)}
                    </div>
                    </div>

                    {/* Left or Right Column */}
                    <div className={cn(
                        "w-[calc(50%-2rem)] flex flex-col", // Adjust width and use flex-col
                         isLeftAligned ? 'items-start text-left' : 'items-end text-right' // Align items based on side
                    )}>
                        {/* Timestamp Area */}
                         <div className={cn(
                            "text-sm text-muted-foreground mb-2 px-2 py-1 rounded-md bg-background/50 backdrop-blur-sm shadow-sm border", // Add subtle background and border
                             isLeftAligned ? 'self-start' : 'self-end' // Align self
                         )}>
                            {/* Format date using Chinese locale and 24-hour format */}
                            {format(event.timestamp, 'yyyy年M月d日 HH:mm', { locale: zhCN })}
                        </div>

                        {/* Spacer for the other side */}
                         {!isLeftAligned && <div className="flex-grow"></div>}
                    </div>


                    {/* The other side - Card Area */}
                     <div className={cn(
                         "w-[calc(50%-2rem)]", // Adjust width
                         isLeftAligned ? 'pl-8' : 'pr-8' // Add padding towards the center line
                     )}>
                        {/* Spacer for the other side's timestamp */}
                         {isLeftAligned && <div className="h-8 mb-2"></div>} {/* Adjust height to match timestamp */}

                        <Card className={cn(
                            "shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card border border-border/50 relative z-10 flex flex-col", // Increased shadow, subtle border, z-10 for card content, flex col
                            isLeftAligned ? 'text-left' : 'text-right' // Align text inside card based on side
                        )}>
                            {/* Image Section (if imageUrl exists) */}
                            {event.imageUrl && (
                                <div className="relative w-full h-48 border-b"> {/* Fixed height container */}
                                    <Image
                                        src={event.imageUrl} // Use event imageUrl
                                        alt={`事件 "${event.title}" 的图片`}
                                        fill
                                        className="object-cover" // Cover the container
                                    />
                                    {/* Optional: Add a small indicator */}
                                    <div className="absolute bottom-1 right-1 bg-black/50 text-white p-1 rounded">
                                        <ImageIcon className="h-3 w-3"/>
                                    </div>
                                </div>
                            )}

                            {/* Card Header */}
                            <CardHeader className="pb-3 pt-4 flex-shrink-0"> {/* Adjusted padding */}
                                <div className={cn(
                                    "flex items-start", // Removed justify-between here
                                    isLeftAligned ? 'justify-between flex-row' : 'justify-between flex-row-reverse' // Adjust order and justification
                                )}>
                                <div className={cn(
                                    "flex-1 min-w-0", // Ensure title/desc take space
                                    isLeftAligned ? 'mr-2' : 'ml-2' // Add margin between text and actions
                                    )}>
                                    <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
                                    {/* Timestamp moved outside */}
                                </div>
                                <div className={`flex space-x-1 flex-shrink-0`}> {/* Actions */}
                                    {/* Edit button */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditEvent(event)} aria-label="编辑事件"> {/* Translate aria-label */}
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>编辑事件</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    {/* Delete Button */}
                                    <AlertDialog>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        aria-label="删除事件" // Translate aria-label
                                                        onClick={() => setEventToDelete(event)} // Set the event to delete on click
                                                        >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>删除事件</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        {/* Conditionally render content based on selected event */}
                                        {eventToDelete?.id === event.id && (
                                            <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>确定要删除吗？</AlertDialogTitle> {/* Translate */}
                                                <AlertDialogDescription>
                                                此操作无法撤销。这将永久删除类型为 "{getEventTypeLabel(eventToDelete.eventType)}"、标题为 "{eventToDelete.title}" 的事件。 {/* Translate and add type */}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setEventToDelete(null)}>取消</AlertDialogCancel> {/* Translate & clear state on cancel */}
                                                <AlertDialogAction
                                                    className="bg-destructive hover:bg-destructive/90"
                                                    onClick={() => {
                                                        onDeleteEvent(eventToDelete.id);
                                                        setEventToDelete(null); // Clear state after deletion
                                                        }}>
                                                    删除 {/* Translate */}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                            </AlertDialogContent>
                                        )}
                                    </AlertDialog>
                                </div>
                                </div>
                            </CardHeader>

                            {/* Card Content (Description) */}
                            {event.description && (
                            <CardContent className="pt-0 pb-4 flex-grow"> {/* Adjusted padding, allow content to grow */}
                                <p className="text-sm text-foreground whitespace-pre-wrap">{event.description}</p> {/* Added whitespace-pre-wrap */}
                            </CardContent>
                            )}

                            {/* Card Footer (Attachment) */}
                            {event.attachment && (
                                <CardFooter className={cn(
                                    "pt-0 pb-3 border-t mt-auto", // Added border-top and margin-top auto
                                    isLeftAligned ? 'flex justify-start' : 'flex justify-end' // Align attachment based on side
                                )}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            {/* In a real app, this would be a link to the actual file */}
                                            <Button variant="link" size="sm" className="text-muted-foreground p-0 h-auto">
                                                <Paperclip className="h-4 w-4 mr-1" />
                                                {event.attachment.name}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>下载附件: {event.attachment.name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardFooter>
                            )}
                        </Card>
                     </div>

                    {/* Explicitly place the other column based on alignment */}
                    {!isLeftAligned && (
                         <div className={cn(
                            "w-[calc(50%-2rem)] flex flex-col",
                            'items-start text-left'
                         )}>
                            {/* Timestamp Area */}
                            <div className={cn(
                                "text-sm text-muted-foreground mb-2 px-2 py-1 rounded-md bg-background/50 backdrop-blur-sm shadow-sm border",
                                'self-start'
                             )}>
                                {format(event.timestamp, 'yyyy年M月d日 HH:mm', { locale: zhCN })}
                            </div>
                             {/* Spacer */}
                             <div className="flex-grow"></div>
                         </div>
                    )}


                </motion.div>
                );
            })}
        </AnimatePresence>
        </div>
     </TooltipProvider>
  );
}


// Helper function to get Chinese label for event type
const getEventTypeLabel = (eventType: EventType): string => {
  switch (eventType) {
    case 'note': return '笔记';
    case 'todo': return '待办';
    case 'schedule': return '日程';
    default: return '事件';
  }
};
