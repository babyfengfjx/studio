
"use client";

import * as React from "react";
import { Image as ImageIcon, XCircle, StickyNote, CheckSquare, CalendarCheck, Send } from "lucide-react"; // Removed Paperclip
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

// Define allowed event types
const EVENT_TYPES: EventType[] = ['note', 'todo', 'schedule'];

type QuickAddEventFormProps = {
  // Title is no longer directly provided by this form
  // Attachment is removed
  onAddEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp' | 'title'>) => void;
};

export function QuickAddEventForm({ onAddEvent }: QuickAddEventFormProps) {
  const [description, setDescription] = React.useState(""); // Use description for the main input
  const [eventType, setEventType] = React.useState<EventType>('note');
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
  const { toast } = useToast(); // Use toast for validation errors

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null); // Ref for textarea
  const formRef = React.useRef<HTMLFormElement>(null); // Ref for the form element

  // Function to process and set the image file
  const processImageFile = (file: File) => {
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
  };

  // Handle image selection from file input
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset input value to allow selecting the same file again
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Handle pasting image into textarea
  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          event.preventDefault(); // Prevent pasting text representation
          processImageFile(file);
          break; // Process only the first image found
        }
      }
    }
  };


  const clearImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
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
    // Allow submission even if description is empty, if there's an image
    if (!trimmedDescription && !imageFile) {
        // Prevent submission if both are empty
        return;
    }

    let imageUrl: string | undefined = undefined;

    // Process image if present (use preview URL)
    if (imageFile) {
        imageUrl = imagePreviewUrl ?? undefined; // Use preview generated earlier
    }


    onAddEvent({
      eventType,
      description: trimmedDescription, // Can be empty if image exists
      imageUrl,
    });

    // Reset form after submission
    setDescription("");
    setEventType('note'); // Reset to default type
    clearImage();
    // Reset textarea height
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus(); // Optionally refocus textarea
    }
  }, [description, eventType, imageFile, imagePreviewUrl, onAddEvent]); // Added imageFile to dependencies


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
              placeholder="记录您的想法、任务或日程... (Ctrl+Enter 提交，可粘贴图片)" // Updated placeholder
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown} // Add keydown listener
              onPaste={handlePaste} // Add paste listener
              className={cn(
                  "w-full resize-none border-0 shadow-none focus-visible:ring-0 text-base p-1 placeholder-muted-foreground/70 overflow-hidden", // Added overflow-hidden
                  "bg-transparent transition-all duration-200 ease-in-out", // Transparent background
                  "min-h-[40px]" // Ensure a minimum height similar to one line input
                )}
              rows={1} // Start with 1 row, will auto-expand
            />

            {/* Previews */}
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

                </div>

                 {/* Search Trigger Button - Positioned absolutely in the center */}
                 {/* This is handled in page.tsx */}


            {/* Submit Button - Use gradient and move to the right */}
            <Button
                type="submit"
                size="sm"
                className="h-7 px-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white flex-shrink-0" // Added flex-shrink-0
                disabled={!description.trim() && !imageFile} // Disable if description and image are empty
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
          </CardFooter>
        </form>
      </Card>
    </TooltipProvider>
  );
}
