
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Paperclip, Image as ImageIcon, XCircle, StickyNote, CheckSquare, CalendarCheck, Tags } from "lucide-react";
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
// Add other allowed types if needed
// const ALLOWED_ATTACHMENT_TYPES = [ ... ];

// Define allowed event types
const EVENT_TYPES: EventType[] = ['note', 'todo', 'schedule'];


// Check if running in the browser environment
const isBrowser = typeof window !== 'undefined';

// Function to derive title from description (e.g., first line or first 30 chars)
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
// Title is removed from direct user input validation, will be derived
const formSchema = z.object({
  eventType: z.enum(EVENT_TYPES, { required_error: "请选择事件类型。" }), // Add eventType validation
  description: z.string().max(500, { message: "描述不能超过500个字符。" }).optional(), // Keep description validation
  image: z.any() // Use z.any() for FileList compatibility with SSR
    .optional()
    .refine(
        (files) => {
            if (!isBrowser || !files || !(files instanceof FileList)) return true; // Skip on server or if not a FileList
            return files.length === 0 || files[0].size <= MAX_FILE_SIZE;
        },
        `图片大小不能超过 5MB。`
    )
    .refine(
        (files) => {
            if (!isBrowser || !files || !(files instanceof FileList)) return true; // Skip on server or if not a FileList
            return files.length === 0 || ALLOWED_IMAGE_TYPES.includes(files[0].type);
        },
        "只允许上传 JPG, PNG, WEBP, GIF 格式的图片。"
    ),
  attachment: z.any() // Use z.any() for FileList compatibility with SSR
    .optional()
     .refine(
        (files) => {
             if (!isBrowser || !files || !(files instanceof FileList)) return true; // Skip on server or if not a FileList
            return files.length === 0 || files[0].size <= MAX_FILE_SIZE;
        },
        `附件大小不能超过 5MB。`
    )
    // Example: Add more specific attachment type validation if needed
    // .refine(...)
});


type EditEventFormProps = {
  event: TimelineEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEditEvent: (id: string, updatedData: Partial<Omit<TimelineEvent, 'id' | 'timestamp'>>) => void; // Use Partial for updates
};

export function EditEventForm({ event, isOpen, onOpenChange, onEditEvent }: EditEventFormProps) {
   // Store initial values separately to manage preview states
   const [initialImageUrl, setInitialImageUrl] = React.useState<string | undefined>(undefined);
   const [initialAttachmentName, setInitialAttachmentName] = React.useState<string | undefined>(undefined);
   const [attachmentName, setAttachmentName] = React.useState<string | null>(null);
   // Flags to track if the user wants to clear existing files
   const [clearExistingImage, setClearExistingImage] = React.useState(false);
   const [clearExistingAttachment, setClearExistingAttachment] = React.useState(false);
   // State to control visibility of optional fields
   const [showTypeSelect, setShowTypeSelect] = React.useState(true); // Default to true for edit
   const [showImageUpload, setShowImageUpload] = React.useState(false);
   const [showAttachmentUpload, setShowAttachmentUpload] = React.useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Default values will be set in useEffect
    defaultValues: {
      eventType: 'note', // Default, will be overridden
      // title is removed from default values
      description: "",
      image: undefined,
      attachment: undefined,
    },
  });

  const attachmentFile = form.watch("attachment");
  const imageFile = form.watch("image");
  const descriptionValue = form.watch("description"); // Watch description for title display

 // Reset form and manage visibility when the event prop changes or dialog opens/closes
 React.useEffect(() => {
    if (event && isOpen) {
        form.reset({
            eventType: event.eventType,
            // title is removed from reset
            description: event.description ?? "",
            image: undefined, // Reset file inputs on open
            attachment: undefined,
        });
        // Set initial values for display/clearing logic
        setInitialImageUrl(event.imageUrl);
        setInitialAttachmentName(event.attachment?.name);
        setAttachmentName(event.attachment?.name ?? null); // Show current attachment name initially

        // Decide initial visibility based on whether the event HAS these properties
        setShowTypeSelect(true); // Keep type always visible/toggleable for editing
        setShowImageUpload(!!event.imageUrl); // Show if there IS an image
        setShowAttachmentUpload(!!event.attachment); // Show if there IS an attachment

        // Reset clearing flags
        setClearExistingImage(false);
        setClearExistingAttachment(false);

    } else if (!isOpen) {
        // Reset everything when dialog closes
         form.reset({
            eventType: 'note',
            // title is removed from reset
            description: "",
            image: undefined,
            attachment: undefined,
        });
        setInitialImageUrl(undefined);
        setInitialAttachmentName(undefined);
        setAttachmentName(null);
        setClearExistingImage(false);
        setClearExistingAttachment(false);
        // Reset visibility toggles
        setShowTypeSelect(true); // Reset to default visibility state for edit
        setShowImageUpload(false);
        setShowAttachmentUpload(false);
    }
}, [event, isOpen, form]);



   // Update attachment name display based on selected file or initial state
   React.useEffect(() => {
        if (attachmentFile && attachmentFile instanceof FileList && attachmentFile.length > 0) {
            const file = attachmentFile[0];
            if (file.size <= MAX_FILE_SIZE) {
                setAttachmentName(file.name);
                setClearExistingAttachment(false); // New file overrides clear intent
            } else {
                // Invalid new file, revert to showing initial name if it exists
                 setAttachmentName(initialAttachmentName ?? null);
                 form.setValue("attachment", undefined); // Clear invalid file from form
            }
        } else if (!clearExistingAttachment) {
            // No new file and not cleared, show the initial attachment name
            setAttachmentName(initialAttachmentName ?? null);
        } else {
            // Explicitly cleared
            setAttachmentName(null);
        }
   }, [attachmentFile, initialAttachmentName, clearExistingAttachment, form]); // Added form dep


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!event) return;

    // Derive title from the description before submitting
    const derivedTitle = deriveTitle(values.description);

    const updatedData: Partial<Omit<TimelineEvent, 'id' | 'timestamp'>> = {
        eventType: values.eventType, // Include event type in update
        title: derivedTitle, // Set the derived title
        description: values.description,
    };

    // Handle Image: Upload new, clear existing, or keep existing
    const imageInput = values.image as unknown as FileList | undefined; // Type assertion
    if (imageInput && imageInput.length > 0) {
        const file = imageInput[0];
        if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
            updatedData.imageUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        }
    } else if (clearExistingImage) {
        updatedData.imageUrl = undefined; // Explicitly set to undefined to clear
    } // If neither new image nor clear flag, existing imageUrl remains implicitly unchanged


     // Handle Attachment: Upload new, clear existing, or keep existing
     const attachmentInput = values.attachment as unknown as FileList | undefined; // Type assertion
     if (attachmentInput && attachmentInput.length > 0) {
         const file = attachmentInput[0];
          if (file.size <= MAX_FILE_SIZE) {
            // In a real app, upload the file here and get a URL/identifier
            updatedData.attachment = { name: file.name };
         }
     } else if (clearExistingAttachment) {
         updatedData.attachment = undefined; // Explicitly set to undefined to clear
     } // If neither new attachment nor clear flag, existing attachment remains implicitly unchanged


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
        // Optional: Hide the input again?
        // setShowImageUpload(false);
   };

    // Function to handle clearing the attachment (newly selected or existing)
   const handleClearAttachment = () => {
        form.setValue("attachment", undefined); // Clear file input in form
        setClearExistingAttachment(true); // Mark existing attachment for removal on save
        // Name cleared by useEffect
        // Optional: Hide the input again?
        // setShowAttachmentUpload(false);
   };

  if (!event) return null; // Don't render the dialog if no event is selected

  // Derive title for display purposes based on current description form value
  const displayTitle = deriveTitle(descriptionValue);

  return (
    <TooltipProvider>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px]"> {/* Increased width slightly */}
            <DialogHeader>
            {/* Display derived title */}
            <DialogTitle className="truncate pr-8">{displayTitle}</DialogTitle>
            <DialogDescription>
                 更新事件详情。点击下方图标编辑类型、图片或附件。 {/* Updated Description */}
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Added scroll */}

                 {/* Title (Hidden/Read-Only - No longer directly editable) */}
                 {/* You could optionally show the derived title here read-only if needed */}
                 {/* <Input type="hidden" {...form.register("title")} /> */}
                 {/* Or a disabled input for display */}
                  {/* <FormItem>
                     <FormLabel>标题 (自动生成)</FormLabel>
                     <FormControl>
                         <Input disabled value={displayTitle} className="text-lg font-semibold text-muted-foreground"/>
                     </FormControl>
                  </FormItem> */}


                {/* Description (Now the primary content input) */}
                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                         {/* <FormLabel>内容</FormLabel> Remove label or change to "内容" */}
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
                        render={({ field: { onChange, onBlur, name, ref } }) => (
                            <FormItem className="mt-4">
                            <FormLabel className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" /> {initialImageUrl ? "替换图片" : "上传图片"} (可选, 最多 5MB)
                                </FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept={ALLOWED_IMAGE_TYPES.join(",")}
                                        onChange={(e) => {
                                             onChange(e.target.files);
                                             setClearExistingImage(false); // Selecting new file cancels clear intent
                                        }}
                                        onBlur={onBlur}
                                        name={name}
                                        ref={ref}
                                        className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                    {/* Clear Image Button - Show if a NEW file is staged OR an initial image exists and isn't marked for clearing */}
                                    {(form.getValues("image") || (initialImageUrl && !clearExistingImage)) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={handleClearImage}
                                            aria-label="清除图片"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>
                                {initialImageUrl && !form.getValues("image") && !clearExistingImage ? `当前图片: ${initialImageUrl.substring(0,30)}...` : ""} {/* Show initial image info */}
                                {initialImageUrl && clearExistingImage ? "当前图片将被移除。" : ""}
                                {form.getValues("image") ? "已选择新图片。" : ""}
                                {/* Choose a new image to replace the existing one. Click clear to remove it. */}
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     </motion.div>
                 )}

                {/* Attachment Upload */}
                 {showAttachmentUpload && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <FormField
                        control={form.control}
                        name="attachment"
                        render={({ field: { onChange, onBlur, name, ref } }) => (
                            <FormItem className="mt-4">
                            <FormLabel className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4" /> {initialAttachmentName ? "替换附件" : "添加附件"} (可选, 最多 5MB)
                            </FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                <Input
                                        type="file"
                                        onChange={(e) => {
                                            onChange(e.target.files);
                                            // setClearExistingAttachment(false); // Handled by useEffect now
                                        }}
                                        onBlur={onBlur}
                                        name={name}
                                        ref={ref}
                                        className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
                                    />
                                    {/* Clear Attachment Button - Show if NEW file staged OR initial exists and not marked for clearing */}
                                    {(form.getValues("attachment") || (initialAttachmentName && !clearExistingAttachment)) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={handleClearAttachment}
                                            aria-label="清除附件"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
                             <FormDescription>
                                {attachmentName && !form.getValues("attachment") && !clearExistingAttachment ? `当前附件: ${attachmentName}` : ""}
                                {initialAttachmentName && clearExistingAttachment ? "当前附件将被移除。" : ""}
                                {form.getValues("attachment") && attachmentName ? `已选择新附件: ${attachmentName}` : ""}
                                {/* Choose a new attachment to replace the existing one. Click clear to remove it. */}
                             </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     </motion.div>
                 )}


                {/* Action Icons & Footer */}
                 <div className="flex items-center gap-2 pt-4 border-t mt-auto">
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
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowAttachmentUpload(!showAttachmentUpload)}
                                className={cn("text-muted-foreground", showAttachmentUpload && "bg-accent text-accent-foreground")}
                                aria-label={initialAttachmentName ? "编辑附件" : "添加附件"}
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                             <p>{initialAttachmentName ? "编辑附件" : "添加附件"}</p>
                        </TooltipContent>
                    </Tooltip>
                     <div className="flex-grow"></div> {/* Spacer */}
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>取消</Button>
                     <Button type="submit" disabled={!descriptionValue?.trim()}>保存更改</Button> {/* Disable save if description is empty */}
                 </div>
            </form>
            </Form>
        </DialogContent>
        </Dialog>
    </TooltipProvider>
  );
}
