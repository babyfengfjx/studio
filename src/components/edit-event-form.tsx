
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Image as ImageIcon, XCircle, StickyNote, CheckSquare, CalendarCheck, Tags, Upload, CalendarIcon, Clock } from "lucide-react";
import { motion } from 'framer-motion';
import { format, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover
import { Calendar } from "@/components/ui/calendar"; // Import Calendar
import type { TimelineEvent, EventType } from "@/types/event";
import { cn } from "@/lib/utils";

// Define MAX_FILE_SIZE constant (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Define allowed event types
const EVENT_TYPES: EventType[] = ['note', 'todo', 'schedule'];


// Check if running in the browser environment
const isBrowser = typeof window !== 'undefined';

// Function to derive title from description (used for display in dialog header)
const deriveTitle = (description?: string): string => {
    if (!description) return '新事件'; // Default title if no description
    const lines = description.split('\n');
    const firstLine = lines[0].trim();
    if (firstLine) {
        return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine; // Use first line or truncate
    }
    // If first line is empty but there's more content, use a snippet
    const snippet = description.trim().substring(0, 50);
    return snippet.length === 50 ? snippet + '...' : (snippet || '新事件');
};

// Zod schema with Chinese validation messages and file inputs
// Title is removed from validation
// Attachment field is removed
const formSchema = z.object({
  timestamp: z.date({ required_error: "请选择日期和时间。" }), // Add timestamp validation
  eventType: z.enum(EVENT_TYPES, { required_error: "请选择事件类型。" }), // Add eventType validation
  description: z.string().max(500, { message: "描述不能超过500个字符。" }).optional(), // Keep description validation
  image: z.any() // Use z.any() for FileList compatibility with SSR
    .optional()
    .refine(
        (files) => {
            if (!isBrowser || !files || !(files instanceof FileList) || files.length === 0) return true; // Skip on server or if no files
            return files[0].size <= MAX_FILE_SIZE;
        },
        `图片大小不能超过 5MB。`
    )
    .refine(
        (files) => {
             if (!isBrowser || !files || !(files instanceof FileList) || files.length === 0) return true; // Skip on server or if no files
            return ALLOWED_IMAGE_TYPES.includes(files[0].type);
        },
        "只允许上传 JPG, PNG, WEBP, GIF 格式的图片。"
    ),
});


type EditEventFormProps = {
  event: TimelineEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // Attachment removed from TimelineEvent Omit
  // Timestamp is added to allow updating it
  onEditEvent: (id: string, updatedData: Partial<Omit<TimelineEvent, 'id' | 'title'>>) => void;
};

export function EditEventForm({ event, isOpen, onOpenChange, onEditEvent }: EditEventFormProps) {
   // Store initial values separately to manage preview states
   const [initialImageUrl, setInitialImageUrl] = React.useState<string | undefined>(undefined);
   const [imageFileName, setImageFileName] = React.useState<string | null>(null); // State for selected image file name
   // Flags to track if the user wants to clear existing files
   const [clearExistingImage, setClearExistingImage] = React.useState(false);
   // State to control visibility of optional fields
   const [showTypeSelect, setShowTypeSelect] = React.useState(true); // Default to true for edit
   const [showImageUpload, setShowImageUpload] = React.useState(false);
   const [showDateTimePicker, setShowDateTimePicker] = React.useState(false); // State for date/time picker visibility

   const imageInputRef = React.useRef<HTMLInputElement>(null);
   const [calendarOpen, setCalendarOpen] = React.useState(false); // State for calendar popover

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Default values will be set in useEffect
    defaultValues: {
      timestamp: new Date(), // Default, will be overridden
      eventType: 'note',
      description: "",
      image: undefined,
    },
  });

  const imageFile = form.watch("image");
  const descriptionValue = form.watch("description"); // Watch description for title display in header
  const currentTimestamp = form.watch("timestamp"); // Watch timestamp for time inputs

 // Reset form and manage visibility when the event prop changes or dialog opens/closes
 React.useEffect(() => {
    if (event && isOpen) {
        form.reset({
            timestamp: event.timestamp, // Set initial timestamp
            eventType: event.eventType,
            description: event.description ?? "",
            image: undefined, // Reset file inputs on open
        });
        // Set initial values for display/clearing logic
        setInitialImageUrl(event.imageUrl);
        setImageFileName(null); // Reset selected image file name

        // Decide initial visibility based on whether the event HAS these properties
        setShowTypeSelect(true); // Keep type always visible/toggleable for editing
        setShowImageUpload(!!event.imageUrl); // Show if there IS an image
        setShowDateTimePicker(true); // Always show date/time for editing

        // Reset clearing flags
        setClearExistingImage(false);

    } else if (!isOpen) {
        // Reset everything when dialog closes
         form.reset({
            timestamp: new Date(),
            eventType: 'note',
            description: "",
            image: undefined,
        });
        setInitialImageUrl(undefined);
        setImageFileName(null);
        setClearExistingImage(false);
        // Reset visibility toggles
        setShowTypeSelect(true);
        setShowImageUpload(false);
        setShowDateTimePicker(false); // Hide by default when closed
    }
 }, [event, isOpen, form]);


    // Update image file name display
    React.useEffect(() => {
        if (imageFile && imageFile instanceof FileList && imageFile.length > 0) {
            const file = imageFile[0];
            if (file.size <= MAX_FILE_SIZE && ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setImageFileName(file.name);
                setClearExistingImage(false);
            } else {
                setImageFileName(null); // Clear name if file is invalid
            }
        } else {
            setImageFileName(null); // Clear name if no file is selected
        }
    }, [imageFile, form]);



  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!event) return;

    // Title is no longer explicitly managed or derived here for submission
    const updatedData: Partial<Omit<TimelineEvent, 'id' | 'title'>> = { // Title removed from type
        timestamp: values.timestamp, // Include timestamp
        eventType: values.eventType, // Include event type in update
        description: values.description,
    };

    // Handle Image: Upload new, clear existing, or keep existing
    const imageInput = values.image as unknown as FileList | undefined; // Type assertion
    if (imageInput && imageInput.length > 0) {
        const file = imageInput[0];
        // Validation is done by Zod and useEffect, assume file is valid here if present
        updatedData.imageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });

    } else if (clearExistingImage) {
        updatedData.imageUrl = undefined; // Explicitly set to undefined to clear
    } // If neither new image nor clear flag, existing imageUrl remains implicitly unchanged


    onEditEvent(event.id, updatedData);
    onOpenChange(false); // Close the dialog
  }

  // Handle closing without saving
  const handleOpenChange = (open: boolean) => {
    // Resetting is handled by useEffect now based on `isOpen`
    onOpenChange(open);
  }

   // Function to handle clearing the image (newly selected or existing)
   const handleClearImage = () => {
        form.setValue("image", undefined); // Clear file input in form
        setClearExistingImage(true); // Mark existing image for removal on save
        setImageFileName(null); // Clear display name
        if (imageInputRef.current) imageInputRef.current.value = ""; // Reset input element
   };


  if (!event) return null; // Don't render the dialog if no event is selected

  // Derive title for display purposes in the Dialog Header based on current description form value
  const displayTitle = deriveTitle(descriptionValue);

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
        let newDate = currentTimestamp;
        if (type === 'hour' && numericValue >= 0 && numericValue <= 23) {
            newDate = setHours(newDate, numericValue);
        } else if (type === 'minute' && numericValue >= 0 && numericValue <= 59) {
            newDate = setMinutes(newDate, numericValue);
        }
        newDate = setSeconds(newDate, 0); // Reset seconds/ms for simplicity
        newDate = setMilliseconds(newDate, 0);
        form.setValue("timestamp", newDate, { shouldValidate: true });
    }
};


  return (
    <TooltipProvider>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col"> {/* Increased width, added flex props */}
            <DialogHeader>
            <DialogTitle className="truncate pr-8">{displayTitle}</DialogTitle>
            <DialogDescription>
                 更新事件详情。点击下方图标编辑类型、图片或时间。 {/* Updated Description */}
            </DialogDescription>
            </DialogHeader>
            {/* Form container scrolls */}
            <div className="flex-grow overflow-y-auto pr-2 -mr-6 pl-6"> {/* Adjusted padding */}
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4"> {/* Removed scroll from form */}

                    {/* Description (Now the primary content input) */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Textarea
                                placeholder="编辑事件内容..." // Updated placeholder
                                className="resize-none min-h-[150px] text-base" // Increased min-height
                                {...field}
                                value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* --- Conditionally Rendered Fields --- */}

                     {/* Date/Time Picker */}
                     {showDateTimePicker && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                             <FormField
                                 control={form.control}
                                 name="timestamp"
                                 render={({ field }) => (
                                     <FormItem className="flex flex-col mt-4">
                                         <FormLabel>事件时间</FormLabel>
                                         <div className="flex items-center gap-2">
                                            {/* Date Picker Popover */}
                                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[180px] pl-3 text-left font-normal", // Adjusted width
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        >
                                                        {field.value ? (
                                                            format(field.value, "yyyy年M月d日", { locale: zhCN }) // Format date
                                                        ) : (
                                                            <span>选择日期</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            // Preserve time when changing date
                                                            const currentHour = field.value.getHours();
                                                            const currentMinute = field.value.getMinutes();
                                                            let newDate = setHours(date, currentHour);
                                                            newDate = setMinutes(newDate, currentMinute);
                                                            newDate = setSeconds(newDate, 0);
                                                            newDate = setMilliseconds(newDate, 0);
                                                            field.onChange(newDate);
                                                        } else {
                                                            field.onChange(date);
                                                        }
                                                        setCalendarOpen(false); // Close calendar on select
                                                    }}
                                                    initialFocus
                                                    locale={zhCN} // Set locale for calendar display
                                                />
                                                </PopoverContent>
                                            </Popover>

                                            {/* Time Input */}
                                            <div className="flex items-center gap-1">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="23"
                                                        value={format(field.value, 'HH')}
                                                        onChange={(e) => handleTimeChange('hour', e.target.value)}
                                                        className="w-14 h-9 text-center px-1" // Adjusted size
                                                        aria-label="小时"
                                                    />
                                                </FormControl>
                                                <span>:</span>
                                                 <FormControl>
                                                     <Input
                                                         type="number"
                                                         min="0"
                                                         max="59"
                                                         value={format(field.value, 'mm')}
                                                         onChange={(e) => handleTimeChange('minute', e.target.value)}
                                                         className="w-14 h-9 text-center px-1" // Adjusted size
                                                         aria-label="分钟"
                                                     />
                                                 </FormControl>
                                            </div>
                                         </div>
                                         <FormMessage />
                                     </FormItem>
                                 )}
                                />
                            </motion.div>
                     )}


                    {/* Event Type Selection */}
                    {showTypeSelect && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <FormField
                            control={form.control}
                            name="eventType"
                            render={({ field }) => (
                                <FormItem className="mt-4">
                                <FormLabel>事件类型</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} /* Controlled component */ >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择事件类型..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="note">
                                        <div className="flex items-center gap-2">
                                        <StickyNote className="h-4 w-4" /> 笔记
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="todo">
                                        <div className="flex items-center gap-2">
                                            <CheckSquare className="h-4 w-4" /> 待办
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="schedule">
                                        <div className="flex items-center gap-2">
                                            <CalendarCheck className="h-4 w-4" /> 日程
                                        </div>
                                    </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </motion.div>
                    )}

                   {/* Image Upload */}
                    {showImageUpload && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormLabel className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4" /> {initialImageUrl ? "替换图片" : "上传图片"} (可选, 最多 5MB)
                                        </FormLabel>
                                        {/* Custom File Input Look */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => imageInputRef.current?.click()}
                                                className="flex-shrink-0"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                选择文件
                                            </Button>
                                            <span className="text-sm text-muted-foreground truncate flex-1">
                                                {imageFileName ?? (clearExistingImage ? "无文件" : "未选择文件")}
                                            </span>
                                            {/* Clear Button */}
                                            {(imageFileName || (initialImageUrl && !clearExistingImage)) && (
                                                 <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                                                    onClick={handleClearImage}
                                                    aria-label="清除图片"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {/* Hidden Actual Input */}
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept={ALLOWED_IMAGE_TYPES.join(",")}
                                                className="hidden" // Hide the default input
                                                ref={imageInputRef} // Assign ref
                                                onChange={(e) => {
                                                    field.onChange(e.target.files); // Update form state correctly using field.onChange
                                                }}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {initialImageUrl && !imageFileName && !clearExistingImage ? `当前图片: ${initialImageUrl.substring(initialImageUrl.lastIndexOf('/') + 1) || '图片'}` : ""}
                                            {initialImageUrl && clearExistingImage ? "当前图片将被移除。" : ""}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}


                     {/* This empty div ensures the footer doesn't overlap last form item */}
                     <div className="h-1"></div>

                </form>
                </Form>
            </div>
            {/* Action Icons & Footer - Placed outside the scrolling container */}
             <DialogFooter className="pt-4 border-t sticky bottom-0 bg-background px-6 pb-6 -mx-6 -mb-6 mt-auto"> {/* Adjust padding */}
                <div className="flex items-center gap-2 w-full">
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowDateTimePicker(!showDateTimePicker)}
                                className={cn("text-muted-foreground", showDateTimePicker && "bg-accent text-accent-foreground")}
                                aria-label="编辑事件时间"
                            >
                                <Clock className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>编辑事件时间</p>
                        </TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowTypeSelect(!showTypeSelect)}
                                className={cn("text-muted-foreground", showTypeSelect && "bg-accent text-accent-foreground")}
                                aria-label="编辑事件类型"
                            >
                                <Tags className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>编辑事件类型</p>
                        </TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowImageUpload(!showImageUpload)}
                                className={cn("text-muted-foreground", showImageUpload && "bg-accent text-accent-foreground")}
                                aria-label={initialImageUrl ? "编辑图片" : "添加图片"}
                            >
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                             <p>{initialImageUrl ? "编辑图片" : "添加图片"}</p>
                        </TooltipContent>
                    </Tooltip>
                     <div className="flex-grow"></div> {/* Spacer */}
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>取消</Button>
                    {/* Trigger form submission via formRef */}
                     <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} disabled={!descriptionValue?.trim() && !imageFile && !initialImageUrl}>保存更改</Button> {/* Allow save if only image exists */}
                 </div>
             </DialogFooter>
        </DialogContent>
        </Dialog>
    </TooltipProvider>
  );
}

    