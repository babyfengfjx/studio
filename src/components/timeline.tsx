
"use client";

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CalendarClock, Paperclip, Image as ImageIcon } from 'lucide-react'; // Added Paperclip and ImageIcon
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale'; // Import Chinese locale
import Image from 'next/image'; // Import next/image

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardFooter
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
import type { TimelineEvent } from '@/types/event';

interface TimelineProps {
  events: TimelineEvent[];
  onEditEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export function Timeline({ events, onEditEvent, onDeleteEvent }: TimelineProps) {
  // State to manage which event is pending deletion for confirmation
  const [eventToDelete, setEventToDelete] = React.useState<TimelineEvent | null>(null);


  return (
     <TooltipProvider> {/* Wrap with TooltipProvider */}
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
                className={`mb-8 flex justify-between items-start w-full relative ${ // Add relative positioning for z-index
                index % 2 === 0 ? 'flex-row-reverse text-right' : 'text-left' // Adjust text alignment
                }`}
                style={{ zIndex: events.length - index }} // Ensure later (visually upper) items overlap earlier ones
            >
                {/* Timeline Dot - Position adjusted slightly */}
                {/* Ensure dot is visually above the line and card */}
                <div className="absolute left-1/2 top-1 -translate-x-1/2 z-20">
                <div className="bg-accent rounded-full p-1 shadow-md ring-2 ring-background"> {/* Added ring for contrast */}
                    <CalendarClock className="h-5 w-5 text-accent-foreground" />
                </div>
                </div>


                {/* Spacer - Keeps cards aligned */}
                <div className="w-[calc(50%-0.5rem)]"></div> {/* Adjust spacer width */}


                {/* Event Card - Enhanced shadow and border */}
                 <div className={`w-[calc(50%-0.5rem)] ${index % 2 === 0 ? 'pl-4' : 'pr-4'}`}> {/* Add padding to avoid overlap with line */}
                 <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card border border-border/50 relative z-10 flex flex-col"> {/* Increased shadow, subtle border, z-10 for card content, flex col */}
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
                        <div className={`flex justify-between items-start ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}> {/* Reverse actions for right-aligned cards */}
                        <div className="flex-1 min-w-0"> {/* Ensure title/desc take space */}
                            <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground pt-1">
                            {/* Format date using Chinese locale and 24-hour format */}
                            {format(event.timestamp, 'PPP HH:mm', { locale: zhCN })}
                            </CardDescription>
                        </div>
                        <div className={`flex space-x-1 ${index % 2 === 0 ? 'ml-2' : 'mr-2'} flex-shrink-0`}> {/* Actions */}
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
                                        此操作无法撤销。这将永久删除标题为 "{eventToDelete.title}" 的事件。 {/* Translate */}
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
                        <CardFooter className="pt-0 pb-3 flex justify-start border-t mt-auto"> {/* Added border-top and margin-top auto */}
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
            </motion.div>
            ))}
        </AnimatePresence>
        </div>
     </TooltipProvider>
  );
}
