
"use client";

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CalendarCheck, StickyNote, CheckSquare, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

interface TimelineProps {
  events: TimelineEvent[];
  onEditEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
  newlyAddedEventId?: string | null;
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
      return <CalendarCheck className="h-5 w-5 text-accent-foreground" />;
  }
};

// Client-side date formatting component
const FormattedTimestamp: React.FC<{ timestamp: Date; formatString?: string }> = ({ timestamp, formatString = 'yyyy年M月d日 HH:mm' }) => {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        try {
          if (timestamp && !isNaN(timestamp.getTime())) {
            setFormattedDate(format(timestamp, formatString, { locale: zhCN }));
          } else {
            setFormattedDate(null); // Set to null if timestamp is invalid
          }
        } catch (error) {
          console.error("Error formatting date:", error, timestamp);
          setFormattedDate(null); // Fallback on error
        }
    }, [timestamp, formatString]); // Re-run if timestamp changes

    if (!formattedDate) {
        // Fallback if state is null or initial render before useEffect
        return <span className="opacity-50">...</span>;
    }
    return <>{formattedDate}</>;
};

// Define a palette of gradient classes using chart colors
const dateGradients = [
    'from-chart-1/70 to-chart-2/70',
    'from-chart-2/70 to-chart-3/70',
    'from-chart-3/70 to-chart-4/70',
    'from-chart-4/70 to-chart-5/70',
    'from-chart-5/70 to-chart-1/70',
];


export function Timeline({ events, onEditEvent, onDeleteEvent, newlyAddedEventId }: TimelineProps) {
  const [eventToDelete, setEventToDelete] = React.useState<TimelineEvent | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [hoveredEventId, setHoveredEventId] = React.useState<string | null>(null);

  // Map to store assigned gradient for each date string ('yyyy-MM-dd')
  const dateColorMap = React.useRef(new Map<string, string>());
  // Counter to cycle through the gradient palette
  const colorIndex = React.useRef(0);

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
                        backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 5px, hsl(var(--border)) 5px, hsl(var(--border)) 10px), linear-gradient(to bottom, hsl(var(--chart-1)), hsl(var(--chart-2)), hsl(var(--chart-3)), hsl(var(--chart-4)), hsl(var(--chart-5)))`,
                        backgroundSize: '1px 10px, 100% 100%', // Size for dashes and main gradient
                        backgroundRepeat: 'repeat-y, no-repeat',
                        backgroundPosition: 'center, center',
                    }}
                 />


                <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                         <p className="text-center text-muted-foreground py-10">没有找到事件。</p>
                    ) : (
                        events.map((event, index) => {
                        const isCardRightAligned = index % 2 === 0;
                        const isNewlyAdded = event.id === newlyAddedEventId;
                        const isHovered = hoveredEventId === event.id;

                        // Determine the color for the current day
                         let dailyGradientClass = 'from-background to-background'; // Default gradient
                         try {
                            if (event.timestamp && !isNaN(event.timestamp.getTime())) {
                                const eventDateString = format(event.timestamp, 'yyyy-MM-dd');
                                if (!dateColorMap.current.has(eventDateString)) {
                                    dateColorMap.current.set(eventDateString, dateGradients[colorIndex.current % dateGradients.length]);
                                    colorIndex.current++;
                                }
                                dailyGradientClass = dateColorMap.current.get(eventDateString) || dateGradients[0]; // Fallback gradient
                            }
                         } catch (error) {
                             console.error("Error calculating date gradient for event:", event.id, error);
                             // Keep the default gradient on error
                         }


                        return (
                            <motion.div
                                key={event.id}
                                layout
                                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: isNewlyAdded ? highlightAnimation.scale : 1,
                                    // backgroundColor: isNewlyAdded ? highlightAnimation.backgroundColor[1] : undefined, // Removed BG highlight as it might conflict with card BG
                                }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 30,
                                    // backgroundColor: isNewlyAdded ? { duration: 0.4, delay: 0.2, ease: "easeInOut" } : undefined,
                                    ...(isNewlyAdded ? highlightAnimation.transition : {}),
                                }}
                                className={cn(
                                    "mb-12 flex items-center w-full relative group", // Align items center for vertical positioning
                                    isCardRightAligned ? 'flex-row' : 'flex-row-reverse'
                                )}
                                style={{ zIndex: events.length - index }}
                                onMouseEnter={() => setHoveredEventId(event.id)}
                                onMouseLeave={() => setHoveredEventId(null)}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"> {/* Center vertically */}
                                    <div className={cn(
                                        "rounded-full p-1.5 shadow-md ring-2 ring-background",
                                         "bg-gradient-to-br", // Apply gradient to dot background
                                         dailyGradientClass // Use the day's gradient
                                      )}>
                                        {getEventTypeIcon(event.eventType)}
                                    </div>
                                </div>

                                {/* Timestamp Column */}
                                <div className={cn(
                                    "w-1/2", // Let flexbox handle vertical alignment via items-center on parent
                                    isCardRightAligned ? 'pr-8 text-right' : 'pl-8 text-left'
                                )}>
                                    <div className={cn(
                                        "inline-block text-sm font-semibold text-primary-foreground px-3 py-1.5 rounded-lg shadow-lg border border-border/30",
                                        "bg-gradient-to-br", // Apply gradient
                                        dailyGradientClass // Use the day's gradient
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
                                                    "absolute left-1/2 -translate-x-1/2 top-0 z-30 flex space-x-1 p-1 rounded-full bg-background shadow-lg border border-border/50",
                                                )}
                                                style={{ marginTop: '-10px' }}
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
                                     <motion.div
                                        animate={{
                                            ...(isNewlyAdded ? {
                                                scale: highlightAnimation.scale,
                                                // Use box-shadow for highlight effect
                                                boxShadow: ["0 0 0 0px hsl(var(--primary)/0.0)", "0 0 0 3px hsl(var(--primary)/0.5)", "0 0 0 0px hsl(var(--primary)/0.0)"],
                                            } : {}),
                                        }}
                                        transition={{ ...(isNewlyAdded ? highlightAnimation.transition : {}) }}
                                     >
                                        <Card className={cn(
                                            "shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-border/50 relative z-10 flex flex-col overflow-hidden",
                                            'text-left',
                                            // Apply a subtle daily gradient to the card as well
                                            "bg-gradient-to-br",
                                            dailyGradientClass.replace('/70', '/10') // Make card gradient much subtler
                                        )}>
                                            <CardContent className={cn(
                                                "pt-4 pb-4 px-4 flex-grow relative",
                                                // Remove explicit justify-end when no description
                                                // Use min-h to ensure card has some height even if only image exists
                                                "min-h-[4rem]"
                                            )}>
                                                <div className={cn(
                                                    "flex items-center gap-3", // Add gap between description and image
                                                    // Keep items centered vertically within the content area
                                                )}>
                                                    {/* Description takes available space */}
                                                    {event.description && (
                                                        <p className="text-sm text-foreground whitespace-pre-wrap flex-1">{event.description}</p>
                                                    )}
                                                    {/* Image aligned to the right */}
                                                    {event.imageUrl && (
                                                        <DialogTrigger asChild>
                                                            <button
                                                                onClick={() => handleImageClick(event.imageUrl!)}
                                                                className={cn(
                                                                    "flex-shrink-0 relative w-10 h-10 rounded-full overflow-hidden border-2 border-background hover:border-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                                                    !event.description && "ml-auto" // Push image to right if no description
                                                                )}
                                                                aria-label="查看图片"
                                                                style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }} // Add subtle drop shadow
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
                                        </Card>
                                     </motion.div>
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
}
