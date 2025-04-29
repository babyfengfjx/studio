
"use client";

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CalendarCheck, StickyNote, CheckSquare, Image as ImageIcon } from 'lucide-react'; // Removed Paperclip
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale'; // Import Chinese locale
import Image from 'next/image'; // Import next/image

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardFooter import
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
        setFormattedDate(format(timestamp, 'yyyy年M月d日 HH:mm', { locale: zhCN }));
    }, [timestamp]); // Re-run if timestamp changes

    if (!formattedDate) {
        try {
            return <>{format(timestamp, 'yyyy年M月d日 HH:mm', { locale: zhCN })}</>;
        } catch (e) {
            return <span className="opacity-50">...</span>;
        }
    }
    return <>{formattedDate}</>;
};


export function Timeline({ events, onEditEvent, onDeleteEvent, newlyAddedEventId }: TimelineProps) {
  const [eventToDelete, setEventToDelete] = React.useState<TimelineEvent | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [hoveredEventId, setHoveredEventId] = React.useState<string | null>(null); // Track hovered event

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageDialogOpen(true);
  };

  const highlightAnimation = {
    scale: [1, 1.02, 1],
    backgroundColor: ["hsl(var(--card))", "hsl(var(--accent)/0.5)", "hsl(var(--card))"],
    transition: { duration: 1.0, ease: "easeInOut" },
  };


  return (
     <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <TooltipProvider>
            <div ref={timelineRef} className="relative w-full max-w-4xl mx-auto px-4 pt-8 pb-12">
                 <div
                    className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2"
                    style={{
                        backgroundImage: `linear-gradient(to bottom, hsl(var(--chart-1)), hsl(var(--chart-2)), hsl(var(--chart-3)), hsl(var(--chart-4)), hsl(var(--chart-5)))`,
                        // Use a mask to create the dashed effect - kept as solid gradient now
                        // maskImage: `repeating-linear-gradient(to bottom, black 0, black 8px, transparent 8px, transparent 16px)`,
                        // maskSize: '1px 16px',
                        // maskRepeat: 'repeat-y',
                        // maskPosition: 'center',
                    }}
                ></div>

                <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                         <p className="text-center text-muted-foreground py-10">没有找到事件。</p>
                    ) : (
                        events.map((event, index) => {
                        const isCardRightAligned = index % 2 === 0;
                        const isNewlyAdded = event.id === newlyAddedEventId;
                        const isHovered = hoveredEventId === event.id;

                        return (
                            <motion.div
                                key={event.id}
                                layout
                                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: isNewlyAdded ? highlightAnimation.scale : 1,
                                    backgroundColor: isNewlyAdded ? highlightAnimation.backgroundColor[1] : undefined, // Apply bg during highlight
                                }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 30,
                                    backgroundColor: isNewlyAdded ? { duration: 0.4, delay: 0.2, ease: "easeInOut" } : undefined, // Animate bg color back
                                    ...(isNewlyAdded ? highlightAnimation.transition : {}),
                                }}
                                className={cn(
                                    "mb-12 flex items-start w-full relative group",
                                    isCardRightAligned ? 'flex-row' : 'flex-row-reverse'
                                )}
                                style={{ zIndex: events.length - index }}
                                onMouseEnter={() => setHoveredEventId(event.id)}
                                onMouseLeave={() => setHoveredEventId(null)}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-1/2 top-5 -translate-x-1/2 -translate-y-1/2 z-20">
                                    <div className="bg-accent rounded-full p-1.5 shadow-md ring-2 ring-background">
                                        {getEventTypeIcon(event.eventType)}
                                    </div>
                                </div>

                                {/* Timestamp Column */}
                                <div className={cn(
                                    "w-1/2 pt-1",
                                    isCardRightAligned ? 'pr-8 text-right' : 'pl-8 text-left'
                                )}>
                                    <div className={cn(
                                        "inline-block text-base font-semibold text-foreground px-3 py-1.5 rounded-lg bg-background/60 backdrop-blur-md shadow-md border border-border/50",
                                    )}>
                                        <FormattedTimestamp timestamp={event.timestamp} />
                                    </div>
                                </div>

                                {/* Card Column */}
                                <div className={cn("w-1/2 relative", isCardRightAligned ? 'pl-8' : 'pr-8' )}>
                                     {/* Action Buttons Container - Positioned above the card */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                                animate={{ opacity: 1, y: -20, scale: 1 }} // Move up
                                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 15, duration: 0.2 }}
                                                className={cn(
                                                    "absolute left-1/2 -translate-x-1/2 top-0 z-20 flex space-x-1 p-1 rounded-full bg-background shadow-lg border border-border/50",
                                                     //isCardRightAligned ? 'left-1/2 -translate-x-1/2' : 'right-1/2 translate-x-1/2' // Adjust based on card alignment
                                                )}
                                                style={{ marginTop: '-10px' }} // Offset slightly above the card
                                            >
                                                 <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditEvent(event)} aria-label="编辑事件">
                                                                <Edit className="h-4 w-4" />
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
                                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                        aria-label="删除事件"
                                                                        onClick={() => setEventToDelete(event)}
                                                                        >
                                                                        <Trash2 className="h-4 w-4" />
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
                                                                        if (eventToDelete) {
                                                                            onDeleteEvent(eventToDelete.id);
                                                                        }
                                                                        setEventToDelete(null);
                                                                        }}>
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
                                        "shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-border/50 relative z-10 flex flex-col overflow-hidden",
                                        'text-left',
                                        "bg-gradient-to-br from-card via-secondary/10 to-accent/10 dark:from-card dark:via-secondary/5 dark:to-accent/5"
                                    )}>
                                        <CardContent className={cn(
                                            "pt-4 pb-4 px-4 flex-grow relative",
                                            event.description ? "" : "justify-end"
                                        )}>
                                            <div className={cn(
                                                "flex items-center",
                                                event.description ? "justify-between" : "justify-end"
                                             )}>
                                                {event.description && (
                                                    <p className="text-sm text-foreground whitespace-pre-wrap flex-1 mr-3">{event.description}</p>
                                                )}
                                                {event.imageUrl && (
                                                    <DialogTrigger asChild>
                                                        <button
                                                            onClick={() => handleImageClick(event.imageUrl!)}
                                                            className="flex-shrink-0 relative w-10 h-10 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                            aria-label="查看图片"
                                                        >
                                                            <Image
                                                                src={event.imageUrl}
                                                                alt={`事件图片预览`}
                                                                fill
                                                                className="object-cover"
                                                                sizes="40px"
                                                            />
                                                        </button>
                                                    </DialogTrigger>
                                                )}
                                            </div>
                                        </CardContent>

                                        {/* Removed Card Footer for Attachment */}
                                    </Card>
                                </div>
                            </motion.div>
                        );
                        })
                     )}
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
                        className="object-contain rounded-md"
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
