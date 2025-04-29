
"use client";

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CalendarCheck, Paperclip, Image as ImageIcon, StickyNote, CheckSquare } from 'lucide-react'; // Added more icons
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale'; // Import Chinese locale
import Image from 'next/image'; // Import next/image

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"; // Import Dialog for image preview
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import type { TimelineEvent, EventType } from '@/types/event';
import { cn } from '@/lib/utils'; // Import cn utility

interface TimelineProps {
  events: TimelineEvent[];
  onEditEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
  newlyAddedEventId?: string | null; // Optional prop for highlighting
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

// New component to handle client-side date formatting
const FormattedTimestamp: React.FC<{ timestamp: Date }> = ({ timestamp }) => {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        // Format the date only on the client side after mount
        // Ensure it's 24-hour format 'HH:mm'
        setFormattedDate(format(timestamp, 'yyyy年M月d日 HH:mm', { locale: zhCN }));
    }, [timestamp]); // Re-run if timestamp changes

    if (!formattedDate) {
        // Render loading state or placeholder initially and on server
        return <span className="opacity-50">加载中...</span>;
    }

    return <>{formattedDate}</>;
};


export function Timeline({ events, onEditEvent, onDeleteEvent, newlyAddedEventId }: TimelineProps) {
  // State to manage which event is pending deletion for confirmation
  const [eventToDelete, setEventToDelete] = React.useState<TimelineEvent | null>(null);
  // State for image preview dialog
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null); // Ref for the timeline container

  // Handler to open image dialog
  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageDialogOpen(true);
  };

  // Highlight animation definition
  const highlightAnimation = {
    scale: [1, 1.05, 1], // Briefly scale up and back
    transition: { duration: 0.8, ease: "easeInOut" }, // Smoother transition
  };


  return (
     <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}> {/* Wrap the entire list for Dialog context */}
        <TooltipProvider> {/* Wrap with TooltipProvider */}
            {/* Reduced bottom padding */}
            <div ref={timelineRef} className="relative w-full max-w-4xl mx-auto px-4 pt-8 pb-12">
                 {/* Central Timeline Line - Dashed Colorful Gradient */}
                <div
                    className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2"
                    style={{
                    // Define the colorful gradient
                    backgroundImage: `linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))`,
                    // Use a mask to create the dashed effect
                    maskImage: `repeating-linear-gradient(to bottom, black 0, black 8px, transparent 8px, transparent 16px)`, // 8px dash, 8px gap
                    maskSize: '1px 16px', // Control width and pattern repeat size
                    maskRepeat: 'repeat-y',
                    maskPosition: 'center',
                    }}
                ></div>

                <AnimatePresence initial={false}>
                    {events.map((event, index) => {
                    // If index is even, card is on the right, timestamp on the left.
                    // If index is odd, card is on the left, timestamp on the right.
                    const isCardRightAligned = index % 2 === 0;
                    const isNewlyAdded = event.id === newlyAddedEventId;

                    return (
                        <motion.div
                            key={event.id}
                            layout // Enable layout animation
                            initial={{ opacity: 0, y: 50, scale: 0.3 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: isNewlyAdded ? highlightAnimation.scale : 1, // Apply scale animation if newly added
                            }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 30,
                                // Apply highlight transition only if newly added
                                ...(isNewlyAdded ? highlightAnimation.transition : {}),
                            }}
                            // Main container for the row, using flex to align items
                            className={cn(
                                "mb-12 flex items-center w-full relative", // Use items-center for vertical alignment
                                isCardRightAligned ? 'flex-row' : 'flex-row-reverse' // Change order: timestamp first or card first
                            )}
                            style={{ zIndex: events.length - index }} // Ensure later items overlap for visual correctness
                        >
                            {/* Timeline Dot - Centered vertically relative to the row */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="bg-accent rounded-full p-1.5 shadow-md ring-2 ring-background"> {/* Adjusted padding */}
                                {getEventTypeIcon(event.eventType)}
                            </div>
                            </div>

                            {/* Timestamp Column */}
                            <div className={cn(
                                "w-1/2", // Takes up half the width
                                isCardRightAligned ? 'pr-8 text-right' : 'pl-8 text-left' // Padding away from center line, text aligned to outside
                            )}>
                            {/* Enhanced Timestamp Display */}
                            <div className={cn(
                                "inline-block text-base font-semibold text-foreground px-3 py-1.5 rounded-lg bg-background/60 backdrop-blur-md shadow-md border border-border/50", // Increased font size, padding, bolder text, slightly stronger background/shadow
                            )}>
                                {/* Use the client-side formatting component */}
                                <FormattedTimestamp timestamp={event.timestamp} />
                            </div>
                            </div>

                            {/* Card Column */}
                            <div className={cn(
                                "w-1/2", // Takes up the other half
                                isCardRightAligned ? 'pl-8' : 'pr-8' // Padding away from center line
                            )}>
                                <Card className={cn(
                                    "shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card border border-border/50 relative z-10 flex flex-col", // Increased shadow, subtle border, z-10, flex col
                                    'text-left'
                                )}>

                                    {/* Card Header - Title and Actions */}
                                    <CardHeader className="pb-3 pt-4 flex-shrink-0"> {/* Adjusted padding */}
                                        <div className="flex items-start justify-between"> {/* Items start, space between title block and actions */}
                                            {/* Title */}
                                            <CardTitle className="text-lg font-semibold flex-1 min-w-0 mr-2">{event.title}</CardTitle>
                                            {/* Actions */}
                                            <div className="flex space-x-1 flex-shrink-0">
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
                                                                    if (eventToDelete) { // Null check before accessing id
                                                                        onDeleteEvent(eventToDelete.id);
                                                                    }
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

                                    {/* Card Content (Description and Image) */}
                                    <CardContent className={cn(
                                        "pt-0 pb-4 flex-grow flex items-center", // Make content a flex container, center items vertically
                                        event.description ? "justify-between" : "justify-end" // Justify between if description exists, else end for just image
                                    )}>
                                        {event.description && (
                                            <p className="text-sm text-foreground whitespace-pre-wrap flex-1 mr-3">{event.description}</p> /* Added whitespace-pre-wrap, flex-1, margin-right */
                                        )}
                                        {/* Circular Image Preview (if imageUrl exists) */}
                                        {event.imageUrl && (
                                            <DialogTrigger asChild>
                                                <button
                                                    onClick={() => handleImageClick(event.imageUrl!)}
                                                    className="flex-shrink-0 relative w-10 h-10 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                    aria-label="查看图片"
                                                >
                                                    <Image
                                                        src={event.imageUrl}
                                                        alt={`事件 "${event.title}" 的图片预览`}
                                                        fill
                                                        className="object-cover" // Cover the circle
                                                        sizes="40px" // Add sizes attribute
                                                    />
                                                </button>
                                            </DialogTrigger>
                                        )}
                                    </CardContent>


                                    {/* Card Footer (Attachment) */}
                                    {event.attachment && (
                                        <CardFooter className={cn(
                                            "pt-0 pb-3 border-t mt-auto flex justify-start" // Aligned to start
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
                        </motion.div>
                    );
                    })}
                </AnimatePresence>
            </div>
        </TooltipProvider>

         {/* Image Preview Dialog Content */}
        <DialogContent className="max-w-3xl p-2">
            {selectedImageUrl && (
                <div className="relative w-full aspect-video">
                    <Image
                        src={selectedImageUrl}
                        alt="放大的图片预览"
                        fill
                        className="object-contain rounded-md" // Use contain to show the whole image
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Add sizes attribute
                    />
                </div>
            )}
        </DialogContent>
     </Dialog>
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

