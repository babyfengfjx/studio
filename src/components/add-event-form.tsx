
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Paperclip, Image as ImageIcon, XCircle, StickyNote, CheckSquare, CalendarCheck, Tags } from "lucide-react"; // Added Tags icon

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from "@/components/ui/select"; // Import Select components
import type { TimelineEvent, EventType } from "@/types/event";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip


// Define MAX_FILE_SIZE constant (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_ATTACHMENT_TYPES = [ // Example allowed types, adjust as needed
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];

// Define allowed event types
const EVENT_TYPES: EventType[] = ['note', 'todo', 'schedule'];

// Check if running in the browser environment
const isBrowser = typeof window !== 'undefined';

// Zod schema with Chinese validation messages and file inputs
const formSchema = z.object({
  eventType: z.enum(EVENT_TYPES, { required_error: "请选择事件类型。" }), // Add eventType validation
  title: z.string().min(1, { message: "标题不能为空。" }).max(100, { message: "标题不能超过100个字符。" }),
  description: z.string().max(500, { message: "描述不能超过500个字符。" }).optional(),
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
    // .refine(
    //     (files) => {
    //         if (!isBrowser || !files || !(files instanceof FileList)) return true;
    //         return files.length === 0 || ALLOWED_ATTACHMENT_TYPES.includes(files[0].type);
    //     },
    //     "不支持的文件类型。"
    // )
});

type AddEventFormProps = {
  onAddEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
};

export function AddEventForm({ onAddEvent }: AddEventFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [attachmentName, setAttachmentName] = React.useState<string | null>(null);
  // State to control visibility of optional fields
  const [showTypeSelect, setShowTypeSelect] = React.useState(false);
  const [showImageUpload, setShowImageUpload] = React.useState(false);
  const [showAttachmentUpload, setShowAttachmentUpload] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: 'note', // Default event type
      title: "",
      description: "",
      image: undefined,
      attachment: undefined,
    },
  });

  const attachmentFile = form.watch("attachment");
  const imageFile = form.watch("image"); // Watch image for preview/clear logic

   // Update attachment name display
   React.useEffect(() => {
    if (attachmentFile && attachmentFile instanceof FileList && attachmentFile.length > 0) {
      const file = attachmentFile[0];
       if (file.size <= MAX_FILE_SIZE) {
         setAttachmentName(file.name);
       } else {
          // Clear name if file is invalid
          setAttachmentName(null);
          form.setValue("attachment", undefined); // Also clear invalid file from form
       }
    } else {
      setAttachmentName(null);
    }
  }, [attachmentFile, form]);

  // Reset optional fields visibility and attachment name on dialog close/submit
   const resetOptionalFields = () => {
    setShowTypeSelect(false);
    setShowImageUpload(false);
    setShowAttachmentUpload(false);
    setAttachmentName(null);
    form.reset(); // Reset the entire form
   };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    let imageUrl: string | undefined = undefined;
    let attachmentData: TimelineEvent['attachment'] | undefined = undefined;

    // Process image if present and valid
    if (values.image && values.image instanceof FileList && values.image.length > 0) {
        const file = values.image[0];
        // Re-check validity just in case, though Zod handles form submission validation
        if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
             // Read file as Data URI for simulation
             imageUrl = await new Promise((resolve) => {
                 const reader = new FileReader();
                 reader.onloadend = () => resolve(reader.result as string);
                 reader.readAsDataURL(file);
             });
        }
    }

    // Process attachment if present and valid
    if (values.attachment && values.attachment instanceof FileList && values.attachment.length > 0) {
        const file = values.attachment[0];
         if (file.size <= MAX_FILE_SIZE) {
            // In a real app, upload the file here and get a URL
            attachmentData = { name: file.name };
         }
    }

    onAddEvent({
        eventType: values.eventType, // Pass event type
        title: values.title,
        description: values.description,
        imageUrl: imageUrl, // Pass the data URI or undefined
        attachment: attachmentData, // Pass the attachment name or undefined
    });

    // Reset form and visibility states
    resetOptionalFields();
    setIsOpen(false);
  }

  const clearImage = () => {
    form.setValue("image", undefined); // Clear react-hook-form state
    // Optional: automatically hide the input again
    // setShowImageUpload(false);
  };

  const clearAttachment = () => {
    form.setValue("attachment", undefined); // Clear react-hook-form state
     // Name cleared by useEffect
    // Optional: automatically hide the input again
    // setShowAttachmentUpload(false);
  };

  return (
     <TooltipProvider>
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                 resetOptionalFields();
            }
            setIsOpen(open);
        }}>
        <DialogTrigger asChild>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground fixed bottom-8 right-8 shadow-lg rounded-full p-4 h-auto aspect-square">
            <Plus className="h-6 w-6" />
            <span className="sr-only">添加事件</span> {/* Translate sr-only text */}
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
            <DialogTitle>添加新事件</DialogTitle>
            <DialogDescription>
                输入标题和描述。点击下方图标添加类型、图片或附件。 {/* Updated Description */}
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">

                {/* Title (Always Visible) */}
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    {/* <FormLabel>标题</FormLabel>  Label can be hidden for simplicity */}
                    <FormControl>
                        <Input
                            placeholder="输入事件标题..." // Simplified placeholder
                            {...field}
                            className="text-lg font-semibold" // Make title stand out
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {/* Description (Always Visible) */}
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    {/* <FormLabel>描述 (可选)</FormLabel> */}
                    <FormControl>
                        <Textarea
                            placeholder="添加描述 (可选)..." // Simplified placeholder
                            className="resize-none min-h-[100px]" // Ensure decent height
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <ImageIcon className="h-4 w-4" /> 上传图片 (可选, 最多 5MB)
                                </FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input
                                    type="file"
                                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                                    onChange={(e) => onChange(e.target.files)}
                                    onBlur={onBlur}
                                    name={name}
                                    ref={ref}
                                    className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                    {/* Clear Image Button */}
                                    {imageFile && imageFile.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={clearImage}
                                            aria-label="清除图片"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
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
                                <Paperclip className="h-4 w-4" /> 添加附件 (可选, 最多 5MB)
                            </FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        // accept={ALLOWED_ATTACHMENT_TYPES.join(",")}
                                        onChange={(e) => onChange(e.target.files)}
                                        onBlur={onBlur}
                                        name={name}
                                        ref={ref}
                                        className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
                                    />
                                    {/* Clear Attachment Button */}
                                    {attachmentFile && attachmentFile.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={clearAttachment}
                                            aria-label="清除附件"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        {/* Attachment Name Display */}
                        {attachmentName && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            已选择附件: <span className="font-medium text-foreground">{attachmentName}</span>
                        </div>
                        )}
                    </motion.div>
                 )}


                {/* Action Icons */}
                <div className="flex items-center gap-2 pt-4 border-t mt-auto">
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowTypeSelect(!showTypeSelect)}
                                className={cn("text-muted-foreground", showTypeSelect && "bg-accent text-accent-foreground")}
                                aria-label="选择事件类型"
                            >
                                <Tags className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>选择事件类型</p>
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
                                aria-label="添加图片"
                            >
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>添加图片</p>
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
                                aria-label="添加附件"
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>添加附件</p>
                        </TooltipContent>
                    </Tooltip>
                     <div className="flex-grow"></div> {/* Spacer */}
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>取消</Button>
                    <Button type="submit">添加事件</Button>
                </div>

            </form>
            </Form>
        </DialogContent>
        </Dialog>
    </TooltipProvider>
  );
}

// Import motion for animation (install if needed: npm install framer-motion)
import { motion } from 'framer-motion';
