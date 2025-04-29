
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Image as ImageIcon, XCircle, StickyNote, CheckSquare, CalendarCheck, Tags, Upload, Paperclip } from "lucide-react"; // Removed Paperclip
import { motion } from 'framer-motion';

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
  // attachment field removed
});


type EditEventFormProps = {
  event: TimelineEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // Attachment removed from TimelineEvent Omit
  onEditEvent: (id: string, updatedData: Partial<Omit<TimelineEvent, 'id' | 'timestamp' | 'title'>>) => void; // Title removed from type constraint
};

export function EditEventForm({ event, isOpen, onOpenChange, onEditEvent }: EditEventFormProps) {
   // Store initial values separately to manage preview states
   const [initialImageUrl, setInitialImageUrl] = React.useState<string | undefined>(undefined);
   // Removed initialAttachmentName state
   const [imageFileName, setImageFileName] = React.useState<string | null>(null); // State for selected image file name
   // Removed attachmentName state
   // Flags to track if the user wants to clear existing files
   const [clearExistingImage, setClearExistingImage] = React.useState(false);
   // Removed clearExistingAttachment state
   // State to control visibility of optional fields
   const [showTypeSelect, setShowTypeSelect] = React.useState(true); // Default to true for edit
   const [showImageUpload, setShowImageUpload] = React.useState(false);
   // Removed showAttachmentUpload state

   const imageInputRef = React.useRef<HTMLInputElement>(null);
   // Removed attachmentInputRef

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Default values will be set in useEffect
    defaultValues: {
      eventType: 'note', // Default, will be overridden
      description: "",
      image: undefined,
      // attachment removed
    },
  });

  // Removed attachmentFile watcher
  const imageFile = form.watch("image");
  const descriptionValue = form.watch("description"); // Watch description for title display in header

 // Reset form and manage visibility when the event prop changes or dialog opens/closes
 React.useEffect(() => {
    if (event && isOpen) {
        form.reset({
            eventType: event.eventType,
            description: event.description ?? "",
            image: undefined, // Reset file inputs on open
            // attachment removed
        });
        // Set initial values for display/clearing logic
        setInitialImageUrl(event.imageUrl);
        // Removed setInitialAttachmentName
        // Removed setAttachmentName
        setImageFileName(null); // Reset selected image file name

        // Decide initial visibility based on whether the event HAS these properties
        setShowTypeSelect(true); // Keep type always visible/toggleable for editing
        setShowImageUpload(!!event.imageUrl); // Show if there IS an image
        // Removed setShowAttachmentUpload logic

        // Reset clearing flags
        setClearExistingImage(false);
        // Removed setClearExistingAttachment

    } else if (!isOpen) {
        // Reset everything when dialog closes
         form.reset({
            eventType: 'note',
            description: "",
            image: undefined,
            // attachment removed
        });
        setInitialImageUrl(undefined);
        // Removed setInitialAttachmentName
        // Removed setAttachmentName
        setImageFileName(null);
        setClearExistingImage(false);
        // Removed setClearExistingAttachment
        // Reset visibility toggles
        setShowTypeSelect(true); // Reset to default visibility state for edit
        setShowImageUpload(false);
        // Removed setShowAttachmentUpload(false);
    }
 }, [event, isOpen, form]);


 // Removed useEffect for attachment name display

    // Update image file name display
    React.useEffect(() => {
        if (imageFile && imageFile instanceof FileList && imageFile.length > 0) {
            const file = imageFile[0];
            if (file.size <= MAX_FILE_SIZE && ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setImageFileName(file.name);
                setClearExistingImage(false);
            } else {
                setImageFileName(null); // Clear name if file is invalid
                // form.setValue("image", undefined); // Consider clearing invalid file
            }
        } else {
            setImageFileName(null); // Clear name if no file is selected
        }
    }, [imageFile, form]); // Removed initialAttachmentName, clearExistingAttachment deps



  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!event) return;

    // Title is no longer explicitly managed or derived here for submission
    const updatedData: Partial<Omit<TimelineEvent, 'id' | 'timestamp' | 'title'>> = { // Title and attachment removed from type
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


     // Removed Attachment handling logic


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

    // Removed handleClearAttachment function

  if (!event) return null; // Don't render the dialog if no event is selected

  // Derive title for display purposes in the Dialog Header based on current description form value
  const displayTitle = deriveTitle(descriptionValue);

  return (
    <TooltipProvider>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col"> {/* Increased width, added flex props */}
            <DialogHeader>
            <DialogTitle className="truncate pr-8">{displayTitle}</DialogTitle>
            <DialogDescription>
                 更新事件详情。点击下方图标编辑类型或图片。 {/* Updated Description */}
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
                                                    form.setValue("image", e.target.files); // Update form state correctly
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

                    {/* Removed Attachment Upload Section */}

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
                    {/* Removed Attachment Tooltip/Button */}
                     <div className="flex-grow"></div> {/* Spacer */}
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>取消</Button>
                    {/* Trigger form submission via formRef */}
                     <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} disabled={!descriptionValue?.trim()}>保存更改</Button> {/* Disable save if description is empty */}
                 </div>
             </DialogFooter>
        </DialogContent>
        </Dialog>
    </TooltipProvider>
  );
}
