
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CalendarCheck, Image as ImageIcon, StickyNote, CheckSquare } from 'lucide-react'; // Removed Paperclip
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardFooter, CardHeader
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
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TimelineEvent, EventType } from '@/types/event';
import { cn } from '@/lib/utils';

interface EventListProps {
  events: TimelineEvent[];
  onEditEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
  newlyAddedEventId?: string | null;
}

// Helper function to get the icon based on event type
const getEventTypeIcon = (eventType: EventType) => {
  switch (eventType) {
    case 'note':
      return <StickyNote className="h-4 w-4 text-muted-foreground" />;
    case 'todo':
      return <CheckSquare className="h-4 w-4 text-muted-foreground" />;
    case 'schedule':
      return <CalendarCheck className="h-4 w-4 text-muted-foreground" />;
    default:
      return <CalendarCheck className="h-4 w-4 text-muted-foreground" />;
  }
};

// Helper function to get Chinese label for event type
const getEventTypeLabel = (eventType: EventType): string => {
  switch (eventType) {
    case 'note': return '笔记';
    case 'todo': return '待办';
    case 'schedule': return '日程';
    default: return '事件';
  }
};


// Client-side date formatting component
const FormattedTimestamp: React.FC<{ timestamp: Date; formatString?: string }> = ({ timestamp, formatString = 'yyyy年M月d日 HH:mm' }) => {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        setFormattedDate(format(timestamp, formatString, { locale: zhCN }));
    }, [timestamp, formatString]); // Re-run if timestamp changes

    if (!formattedDate) {
        try {
            return <>{format(timestamp, formatString, { locale: zhCN })}</>;
        } catch (e) {
            return <span className="opacity-50">...</span>;
        }
    }
    return <>{formattedDate}</>;
};

export function EventList({ events, onEditEvent, onDeleteEvent, newlyAddedEventId }: EventListProps) {
  const [eventToDelete, setEventToDelete] = React.useState<TimelineEvent | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = React.useState<string | null>(null); // Track hovered event

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageDialogOpen(true);
  };

  const highlightAnimation = {
    scale: [1, 1.02, 1],
    backgroundColor: ["hsl(var(--card))", "hsl(var(--accent)/0.5)", "hsl(var(--card))"], // Flash accent color
    transition: { duration: 1.0, ease: "easeInOut" },
  };

  return (
    <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
      <TooltipProvider>
        <div id="event-list-container" className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Add scroll */}
          <AnimatePresence initial={false}>
            {events.length === 0 ? (
               <p className="text-center text-muted-foreground py-10">没有找到事件。</p>
            ) : (
                events.map((event) => {
                const isNewlyAdded = event.id === newlyAddedEventId;
                const isHovered = hoveredEventId === event.id; // Check if the current event is hovered
                return (
                    <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        ...(isNewlyAdded ? { scale: highlightAnimation.scale, backgroundColor: highlightAnimation.backgroundColor } : {}),
                    }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                     transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                        ...(isNewlyAdded ? highlightAnimation.transition : {}),
                     }}
                     onMouseEnter={() => setHoveredEventId(event.id)} // Set hovered ID on mouse enter
                     onMouseLeave={() => setHoveredEventId(null)} // Clear hovered ID on mouse leave
                     className="relative" // Add relative positioning for absolute positioned actions
                    >
                    {/* Action Buttons Container - Positioned above the card */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: -15, scale: 1 }} // Move up slightly less than timeline
                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15, duration: 0.2 }}
                                className={cn(
                                    "absolute left-1/2 -translate-x-1/2 top-0 z-20 flex space-x-1 p-1 rounded-full bg-background shadow-lg border border-border/50",
                                )}
                                style={{ marginTop: '-5px' }} // Offset slightly above the card
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditEvent(event)} aria-label="编辑事件">
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                    <p>编辑事件</p>
                                    </TooltipContent>
                                </Tooltip>
                                <AlertDialog>
                                    <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            aria-label="删除事件"
                                            onClick={() => setEventToDelete(event)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>删除事件</p>
                                    </TooltipContent>
                                    </Tooltip>
                                    {eventToDelete?.id === event.id && (
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                                        <AlertDialogDescription>
                                             此操作无法撤销。这将永久删除类型为 "{getEventTypeLabel(eventToDelete.eventType)}" 的事件。
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setEventToDelete(null)}>取消</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            onClick={() => {
                                            if (eventToDelete) onDeleteEvent(eventToDelete.id);
                                            setEventToDelete(null);
                                            }}
                                        >
                                            删除
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                    )}
                                </AlertDialog>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Event Card */}
                    <Card className={cn(
                        "shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden", // Removed group class
                        isNewlyAdded && "border-2 border-primary",
                        "bg-gradient-to-br from-card via-secondary/10 to-accent/10 dark:from-card dark:via-secondary/5 dark:to-accent/5" // Add gradient
                    )}>
                        <CardContent className="p-3 text-sm text-foreground relative">
                             {/* Top Right Corner: Timestamp */}
                             <div className="absolute top-2 right-2 z-10">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    <FormattedTimestamp timestamp={event.timestamp} formatString="M月d日 HH:mm" />
                                </span>
                            </div>

                            {/* Type Icon and Derived Title */}
                            <div className="flex items-center gap-2 mb-2 pr-16"> {/* Adjust padding-right if needed */}
                               {getEventTypeIcon(event.eventType)}
                               <span className="text-base font-medium truncate flex-1">{deriveTitle(event.description)}</span>
                            </div>

                            {/* Main Content (Description and Image) */}
                            {event.description && <p className="whitespace-pre-wrap mb-2">{event.description}</p>}
                            {event.imageUrl && (
                                <DialogTrigger asChild>
                                <button
                                    onClick={() => handleImageClick(event.imageUrl!)}
                                    className="mt-2 block w-20 h-20 rounded-md overflow-hidden border hover:border-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    aria-label="查看图片"
                                >
                                    <Image
                                    src={event.imageUrl}
                                    alt={`事件图片预览`}
                                    width={80}
                                    height={80}
                                    className="object-cover w-full h-full"
                                    />
                                </button>
                                </DialogTrigger>
                            )}
                        </CardContent>
                         {/* Removed CardFooter for Attachment */}
                    </Card>
                    </motion.div>
                );
                })
             )}
          </AnimatePresence>
        </div>
      </TooltipProvider>

      <DialogContent className="max-w-3xl p-2">
        {selectedImageUrl && (
          <div className="relative w-full aspect-video">
            <Image
              src={selectedImageUrl}
              alt="放大的图片预览"
              fill
              className="object-contain rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Function to derive title from description (moved from page.tsx for reuse)
const deriveTitle = (description?: string): string => {
    if (!description) return '新事件'; // Default title if no description
    const lines = description.split('\n');
    const firstLine = lines[0].trim();
    if (firstLine) {
        return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
    }
    const snippet = description.trim().substring(0, 50);
    return snippet.length === 50 ? snippet + '...' : (snippet || '新事件');
};
