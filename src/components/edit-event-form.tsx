
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Paperclip, Image as ImageIcon, XCircle } from "lucide-react"; // Import icons
import Image from 'next/image'; // Import next/image

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
import type { TimelineEvent } from "@/types/event";

// Define MAX_FILE_SIZE constant (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Add other allowed types if needed
// const ALLOWED_ATTACHMENT_TYPES = [ ... ];


// Check if running in the browser environment
const isBrowser = typeof window !== 'undefined';

// Zod schema with Chinese validation messages and file inputs
const formSchema = z.object({
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
   const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
   const [attachmentName, setAttachmentName] = React.useState<string | null>(null);
   // Flags to track if the user wants to clear existing files
   const [clearExistingImage, setClearExistingImage] = React.useState(false);
   const [clearExistingAttachment, setClearExistingAttachment] = React.useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Default values will be set in useEffect
    defaultValues: {
      title: "",
      description: "",
      image: undefined,
      attachment: undefined,
    },
  });

  const imageFile = form.watch("image");
  const attachmentFile = form.watch("attachment");


 // Reset form and previews when the event prop changes or dialog opens/closes
 React.useEffect(() => {
    if (event && isOpen) {
        form.reset({
            title: event.title,
            description: event.description ?? "",
            image: undefined, // Reset file inputs
            attachment: undefined,
        });
        // Set initial values for preview/display
        setInitialImageUrl(event.imageUrl);
        setInitialAttachmentName(event.attachment?.name);
        // Initially, show existing image/attachment if present
        setImagePreviewUrl(event.imageUrl ?? null);
        setAttachmentName(event.attachment?.name ?? null);
        // Reset clearing flags
        setClearExistingImage(false);
        setClearExistingAttachment(false);

    } else if (!isOpen) {
        // Reset everything when dialog closes
        form.reset({
            title: "",
            description: "",
            image: undefined,
            attachment: undefined,
        });
        setInitialImageUrl(undefined);
        setInitialAttachmentName(undefined);
        setImagePreviewUrl(null);
        setAttachmentName(null);
        setClearExistingImage(false);
        setClearExistingAttachment(false);
    }
}, [event, isOpen, form]);


  // Update image preview based on selected file
  React.useEffect(() => {
    if (imageFile && imageFile instanceof FileList && imageFile.length > 0) {
      const file = imageFile[0];
       if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result as string);
                 // If a new image is selected, don't clear the existing one on save
                 setClearExistingImage(false);
            };
            reader.readAsDataURL(file);
       } else {
           // If file is invalid, revert to initial or clear
           setImagePreviewUrl(initialImageUrl ?? null);
       }
    } else if (!clearExistingImage) {
        // If no file selected and not explicitly cleared, show initial image
        setImagePreviewUrl(initialImageUrl ?? null);
    } else {
         // If cleared, show nothing
         setImagePreviewUrl(null);
    }

     // Cleanup function to revoke object URL
    return () => {
        if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
             URL.revokeObjectURL(imagePreviewUrl);
        }
    }
  }, [imageFile, initialImageUrl, clearExistingImage, imagePreviewUrl]); // Depend on clear flag and preview URL for cleanup


   // Update attachment name display based on selected file
   React.useEffect(() => {
    if (attachmentFile && attachmentFile instanceof FileList && attachmentFile.length > 0) {
        const file = attachmentFile[0];
        if (file.size <= MAX_FILE_SIZE) {
            setAttachmentName(file.name);
            // If a new attachment is selected, don't clear the existing one on save
            setClearExistingAttachment(false);
        } else {
             // If file is invalid, revert to initial or clear
             setAttachmentName(initialAttachmentName ?? null);
        }

    } else if (!clearExistingAttachment) {
         // If no file selected and not explicitly cleared, show initial attachment
         setAttachmentName(initialAttachmentName ?? null);
    } else {
         // If cleared, show nothing
         setAttachmentName(null);
    }
  }, [attachmentFile, initialAttachmentName, clearExistingAttachment]); // Depend on clear flag


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!event) return;

    const updatedData: Partial<Omit<TimelineEvent, 'id' | 'timestamp'>> = {
        title: values.title,
        description: values.description,
    };

    // Handle Image: Upload new, clear existing, or keep existing
    if (values.image && values.image instanceof FileList && values.image.length > 0) {
        const file = values.image[0];
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
     if (values.attachment && values.attachment instanceof FileList && values.attachment.length > 0) {
         const file = values.attachment[0];
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
        setImagePreviewUrl(null); // Clear preview immediately
   };

    // Function to handle clearing the attachment (newly selected or existing)
   const handleClearAttachment = () => {
        form.setValue("attachment", undefined); // Clear file input in form
        setClearExistingAttachment(true); // Mark existing attachment for removal on save
        setAttachmentName(null); // Clear display name immediately
   };

  if (!event) return null; // Don't render the dialog if no event is selected

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]"> {/* Increased width slightly */}
        <DialogHeader>
          <DialogTitle>编辑事件</DialogTitle> {/* Translate */}
          <DialogDescription>
            更新您的时间轴事件的详细信息。您可以替换或清除现有的图片/附件。 {/* Translate */}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Added scroll */}
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
                       accept={ALLOWED_IMAGE_TYPES.join(",")}
                       onChange={(e) => onChange(e.target.files)}
                       onBlur={onBlur}
                       name={name}
                       ref={ref}
                       className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                     />
                  </FormControl>
                   <FormDescription>
                    选择新图片将会替换现有图片。
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Image Preview / Existing Image */}
             {imagePreviewUrl && (
               <div className="mt-2 space-y-2">
                 <p className="text-sm font-medium">图片预览:</p>
                 <div className="relative group w-full h-48">
                    <Image
                        src={imagePreviewUrl} // Shows existing or new preview
                        alt="图片预览"
                        fill
                        className="rounded-md object-cover border"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 bg-black/50 text-white hover:bg-black/70 rounded-full h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleClearImage} // Use specific clear handler
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
                        onChange={(e) => onChange(e.target.files)}
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                         className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
                      />
                  </FormControl>
                    <FormDescription>
                     选择新附件将会替换现有附件。
                    </FormDescription>
                   <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachment Name Display / Existing Attachment */}
            {attachmentName && (
              <div className="mt-2 flex items-center justify-between text-sm bg-muted p-2 rounded-md">
                <span>当前附件: <span className="font-medium">{attachmentName}</span></span>
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={handleClearAttachment} // Use specific clear handler
                    aria-label="清除附件"
                >
                    <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}


             <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>取消</Button> {/* Translate */}
                <Button type="submit">保存更改</Button> {/* Translate */}
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

