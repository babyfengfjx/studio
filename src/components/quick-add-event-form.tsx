
"use client";

import * as React from "react";
import { Paperclip, Image as ImageIcon, XCircle, StickyNote, CheckSquare, CalendarCheck, Send } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // For hidden file inputs
import { Card, CardContent, CardFooter } from "@/components/ui/card"; // Use Card for structure
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TimelineEvent, EventType } from "@/types/event";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast"; // Import useToast


// Define MAX_FILE_SIZE constant (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Add other allowed types if needed
// const ALLOWED_ATTACHMENT_TYPES = [ ... ];

// Define allowed event types
const EVENT_TYPES: EventType[] = ['note', 'todo', 'schedule'];

type QuickAddEventFormProps = {
  // Title is no longer directly provided by this form
  onAddEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp' | 'title'>) => void;
};

export function QuickAddEventForm({ onAddEvent }: QuickAddEventFormProps) {
  const [description, setDescription] = React.useState(""); // Use description for the main input
  const [eventType, setEventType] = React.useState<EventType>('note');
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
  const [attachmentName, setAttachmentName] = React.useState<string | null>(null);
  const { toast } = useToast(); // Use toast for validation errors

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const attachmentInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null); // Ref for textarea
  const formRef = React.useRef<HTMLFormElement>(null); // Ref for the form element

  // Handle image selection and preview
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "图片太大", description: `图片大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB。`, variant: "destructive" });
        return;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({ title: "图片格式不支持", description: "只允许上传 JPG, PNG, WEBP, GIF 格式的图片。", variant: "destructive" });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Handle attachment selection
  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > MAX_FILE_SIZE) {
            toast({ title: "附件太大", description: `附件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB。`, variant: "destructive" });
            return;
          }
      setAttachmentFile(file);
      setAttachmentName(file.name);
    }
     // Reset input value to allow selecting the same file again
     if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentName(null);
  };

  // Auto-resize textarea height based on content
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
    }
  }, [description]);

  // Define handleSubmit as useCallback to prevent recreation on every render
  const handleSubmit = React.useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Prevent default form submission if called from event

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
        // Do not show toast, just prevent submission silently or give subtle feedback
        // toast({ title: "内容不能为空", description: "请输入事件内容。", variant: "destructive" });
        return; // Prevent submission if input is empty
    }

    let imageUrl: string | undefined = undefined;
    let attachmentData: TimelineEvent['attachment'] | undefined = undefined;

    // Process image if present
    if (imageFile) {
        imageUrl = imagePreviewUrl ?? undefined; // Use preview generated earlier
    }

    // Process attachment if present
    if (attachmentFile) {
        attachmentData = { name: attachmentFile.name };
    }

    onAddEvent({
      eventType,
      description: trimmedDescription,
      imageUrl,
      attachment: attachmentData,
    });

    // Reset form after submission
    setDescription("");
    setEventType('note'); // Reset to default type
    clearImage();
    clearAttachment();
    // Reset textarea height
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus(); // Optionally refocus textarea
    }
  }, [description, eventType, imageFile, attachmentFile, imagePreviewUrl, onAddEvent, toast]); // Include all dependencies


   // Handle Ctrl+Enter / Cmd+Enter submission
   const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault(); // Prevent default Enter behavior (newline)
        handleSubmit(); // Call the memoized handleSubmit
      }
   };


  return (
    <TooltipProvider>
      {/* Apply gradient background */}
      <Card className="shadow-md overflow-hidden border-0 rounded-lg bg-gradient-to-br from-blue-100 via-teal-100 to-purple-200 dark:from-blue-800 dark:via-teal-800 dark:to-purple-800">
        <form ref={formRef} onSubmit={handleSubmit}> {/* Add ref to form */}
          <CardContent className="p-3 space-y-2 pb-1"> {/* Adjusted bottom padding */}
            {/* Combined Input field for description */}
             <Textarea
              ref={textareaRef} // Add ref
              placeholder="记录您的想法、任务或日程... (Ctrl+Enter 提交)" // Updated placeholder
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown} // Add keydown listener
              className={cn(
                  "w-full resize-none border-0 shadow-none focus-visible:ring-0 text-base p-1 placeholder-muted-foreground/70 overflow-hidden", // Added overflow-hidden
                  "bg-transparent transition-all duration-200 ease-in-out", // Transparent background
                  "min-h-[40px]" // Ensure a minimum height similar to one line input
                )}
              rows={1} // Start with 1 row, will auto-expand
            />

            {/* REMOVED Separator */}

            {/* Previews and Attachment Name */}
            <div className="flex items-center gap-2 flex-wrap">
                 {/* Image Preview */}
                {imagePreviewUrl && (
                <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0"> {/* Smaller preview */}
                    <Image
                        src={imagePreviewUrl}
                        alt="图片预览"
                        fill // Use fill instead of layout="fill"
                        sizes="64px" // Add sizes attribute
                        className="object-cover" // Add object-cover
                    />
                    <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-5 w-5 bg-black/50 text-white hover:bg-black/70 rounded-full p-0.5"
                    onClick={clearImage}
                    aria-label="清除图片"
                    >
                    <XCircle className="h-3 w-3" />
                    </Button>
                </div>
                )}

                {/* Attachment Name Display */}
                {attachmentName && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary p-1.5 rounded-md max-w-[calc(100%-5rem)]"> {/* Limit width */}
                    <Paperclip className="h-3 w-3 flex-shrink-0" />
                    <span className="flex-1 truncate font-medium text-foreground">{attachmentName}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive flex-shrink-0 p-0.5"
                        onClick={clearAttachment}
                        aria-label="清除附件"
                    >
                        <XCircle className="h-3 w-3" />
                    </Button>
                </div>
                )}
            </div>
          </CardContent>

          {/* Card Footer now contains actions and search trigger */}
           <CardFooter className="bg-muted/30 p-2 flex items-center justify-between gap-1 border-t border-border/20 relative"> {/* Added relative positioning */}
                {/* Action Icons Group */}
                <div className="flex items-center gap-0.5 flex-grow"> {/* Reduced gap, flex-grow */}
                    {/* Event Type Select */}
                    <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <SelectTrigger className="w-auto h-7 px-1.5 border-0 bg-transparent shadow-none focus:ring-0 text-muted-foreground hover:text-foreground"> {/* Smaller trigger, hover effect */}
                                    <SelectValue>
                                    {eventType === 'note' && <StickyNote className="h-4 w-4" />}
                                    {eventType === 'todo' && <CheckSquare className="h-4 w-4" />}
                                    {eventType === 'schedule' && <CalendarCheck className="h-4 w-4" />}
                                    </SelectValue>
                                </SelectTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>选择事件类型</p>
                            </TooltipContent>
                        </Tooltip>
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

                    {/* Image Upload Trigger */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground" // Smaller button, hover effect
                            onClick={() => imageInputRef.current?.click()}
                            aria-label="添加图片"
                        >
                            <ImageIcon className="h-4 w-4" /> {/* Smaller icon */}
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>添加图片</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Attachment Upload Trigger */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground" // Smaller button, hover effect
                            onClick={() => attachmentInputRef.current?.click()}
                            aria-label="添加附件"
                        >
                            <Paperclip className="h-4 w-4" /> {/* Smaller icon */}
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>添加附件</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                 {/* Search Trigger Button - Positioned absolutely in the center */}
                 {/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <SearchTriggerButton /> Place the SearchTriggerButton component here
                 </div> */}


            {/* Submit Button - Use gradient and move to the right */}
            <Button
                type="submit"
                size="sm"
                className="h-7 px-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white flex-shrink-0" // Added flex-shrink-0
                disabled={!description.trim()} // Disable if description is empty
            >
              <Send className="h-4 w-4 mr-1" /> 添加
            </Button>


            {/* Hidden File Inputs */}
            <Input
              ref={imageInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              onChange={handleImageChange}
              className="hidden"
            />
            <Input
              ref={attachmentInputRef}
              type="file"
            //   accept={ALLOWED_ATTACHMENT_TYPES.join(",")} // Add if needed
              onChange={handleAttachmentChange}
              className="hidden"
            />
          </CardFooter>
        </form>
      </Card>
    </TooltipProvider>
  );
}
