
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Paperclip, Image as ImageIcon, XCircle, StickyNote, CheckSquare, CalendarCheck } from "lucide-react"; // Import new icons

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
import Image from 'next/image'; // Import next/image

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
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
  const [attachmentName, setAttachmentName] = React.useState<string | null>(null);

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

  const imageFile = form.watch("image");
  const attachmentFile = form.watch("attachment");

  // Update image preview
  React.useEffect(() => {
    let objectUrl: string | null = null; // Store object URL to revoke
    if (imageFile && imageFile instanceof FileList && imageFile.length > 0) {
      const file = imageFile[0];
      if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
        objectUrl = URL.createObjectURL(file);
        setImagePreviewUrl(objectUrl);
      } else {
         // Clear preview if file is invalid after selection (though Zod should prevent submission)
         setImagePreviewUrl(null);
      }

    } else {
      setImagePreviewUrl(null);
    }
     // Cleanup function to revoke object URL
    return () => {
        if (objectUrl) {
             URL.revokeObjectURL(objectUrl);
             setImagePreviewUrl(null); // Clear state on cleanup as well
        }
    }
  }, [imageFile]); // Rerun when imageFile changes


   // Update attachment name display
   React.useEffect(() => {
    if (attachmentFile && attachmentFile instanceof FileList && attachmentFile.length > 0) {
      const file = attachmentFile[0];
       if (file.size <= MAX_FILE_SIZE) {
         setAttachmentName(file.name);
       } else {
          // Clear name if file is invalid
          setAttachmentName(null);
       }
    } else {
      setAttachmentName(null);
    }
  }, [attachmentFile]);


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

    // Reset form and previews
    form.reset();
    setImagePreviewUrl(null);
    setAttachmentName(null);
    setIsOpen(false);
  }

  const clearImage = () => {
    form.setValue("image", undefined); // Clear react-hook-form state
    // Preview cleared by useEffect
  };

  const clearAttachment = () => {
    form.setValue("attachment", undefined); // Clear react-hook-form state
     // Name cleared by useEffect
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
             // Reset form and previews if dialog is closed without submitting
             form.reset();
             setImagePreviewUrl(null);
             setAttachmentName(null);
        }
        setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground fixed bottom-8 right-8 shadow-lg rounded-full p-4 h-auto aspect-square">
          <Plus className="h-6 w-6" />
          <span className="sr-only">添加事件</span> {/* Translate sr-only text */}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]"> {/* Increased width slightly */}
        <DialogHeader>
          <DialogTitle>添加新事件</DialogTitle> {/* Translate */}
          <DialogDescription>
            填写新时间轴事件的详细信息，选择类型，并可选择添加图片或附件。 {/* Translate */}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Added scroll */}

             {/* Event Type Selection */}
             <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
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

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标题</FormLabel> {/* Translate */}
                  <FormControl>
                     <Input
                      placeholder="例如：团队会议"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述 (可选)</FormLabel> {/* Translate */}
                  <FormControl>
                     <Textarea
                      placeholder="例如：讨论项目进展..."
                      className="resize-none"
                      {...field}
                       value={field.value ?? ""} // Ensure value is controlled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Image Upload */}
             <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                   <FormLabel className="flex items-center gap-2">
                     <ImageIcon className="h-4 w-4" /> 图片 (可选, 最多 5MB)
                    </FormLabel>
                  <FormControl>
                    <Input
                       type="file"
                       accept={ALLOWED_IMAGE_TYPES.join(",")} // Set accepted types
                       onChange={(e) => onChange(e.target.files)} // Pass FileList to RHF
                       onBlur={onBlur}
                       name={name}
                       ref={ref}
                       className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Image Preview */}
             {imagePreviewUrl && (
               <div className="mt-2 space-y-2">
                 <p className="text-sm font-medium">图片预览:</p>
                 <div className="relative group w-full h-48"> {/* Fixed height container */}
                    <Image
                        src={imagePreviewUrl}
                        alt="图片预览"
                        fill // Use fill to cover the container
                        className="rounded-md object-cover border" // Add object-cover
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 bg-black/50 text-white hover:bg-black/70 rounded-full h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={clearImage}
                        aria-label="清除图片"
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                 </div>

               </div>
             )}


            {/* Attachment Upload */}
            <FormField
              control={form.control}
              name="attachment"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                   <FormLabel className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" /> 附件 (可选, 最多 5MB)
                   </FormLabel>
                  <FormControl>
                      <Input
                        type="file"
                        // accept={ALLOWED_ATTACHMENT_TYPES.join(",")} // Optional: specify allowed types
                        onChange={(e) => onChange(e.target.files)}
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                         className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
                      />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachment Name Display */}
            {attachmentName && (
              <div className="mt-2 flex items-center justify-between text-sm bg-muted p-2 rounded-md">
                <span>已选择附件: <span className="font-medium">{attachmentName}</span></span>
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={clearAttachment}
                    aria-label="清除附件"
                >
                    <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}


             <DialogFooter className="pt-4"> {/* Add padding top to footer */}
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>取消</Button>
                <Button type="submit">添加事件</Button> {/* Translate */}
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

