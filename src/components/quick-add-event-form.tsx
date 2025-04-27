
"use client";

import * as React from "react";
import { Plus, Paperclip, Image as ImageIcon, XCircle, StickyNote, CheckSquare, CalendarCheck, Tags, Send } from "lucide-react";
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
import { Separator } from "@/components/ui/separator"; // Import Separator


// Define MAX_FILE_SIZE constant (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Add other allowed types if needed
// const ALLOWED_ATTACHMENT_TYPES = [ ... ];

// Define allowed event types
const EVENT_TYPES: EventType[] = ['note', 'todo', 'schedule'];

type QuickAddEventFormProps = {
  onAddEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
};

export function QuickAddEventForm({ onAddEvent }: QuickAddEventFormProps) {
  const [inputValue, setInputValue] = React.useState(""); // Combine title/desc for simplicity
  const [eventType, setEventType] = React.useState<EventType>('note');
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
  const [attachmentName, setAttachmentName] = React.useState<string | null>(null);
  const { toast } = useToast(); // Use toast for validation errors

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const attachmentInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
        toast({ title: "内容不能为空", description: "请输入事件内容或标题。", variant: "destructive" });
        return; // Prevent submission if input is empty
    }

    // Split title (first line) and description (rest)
    const lines = trimmedValue.split('\n');
    const title = lines[0]; // Use the first line as title
    const description = lines.length > 1 ? lines.slice(1).join('\n').trim() : undefined; // Use trim() for description

    let imageUrl: string | undefined = undefined;
    let attachmentData: TimelineEvent['attachment'] | undefined = undefined;

    // Process image if present
    if (imageFile) {
        // Reuse the preview URL if available, otherwise generate one (should be generated on selection)
        imageUrl = imagePreviewUrl ?? undefined; // Use preview generated earlier
        // In a real app, you'd likely upload here and get a URL
    }

    // Process attachment if present
    if (attachmentFile) {
        // In a real app, upload the file here and get a URL
        attachmentData = { name: attachmentFile.name };
    }


    onAddEvent({
      eventType,
      title: title, // Title is now the first line
      description: description, // Description is the rest
      imageUrl,
      attachment: attachmentData,
    });

    // Reset form after submission
    setInputValue("");
    setEventType('note'); // Reset to default type
    clearImage();
    clearAttachment();
  };

  return (
    <TooltipProvider>
      {/* Use Card for better structure and styling in fixed position */}
      <Card className="shadow-md overflow-hidden border-0 rounded-lg">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-3 space-y-2"> {/* Reduced padding slightly */}
            {/* Input field simulating Title/Content separation */}
            <Textarea
              placeholder="输入标题 (可选)" // Placeholder for Title
              value={inputValue.split('\n')[0]} // Only show first line
              onChange={(e) => {
                const currentLines = inputValue.split('\n');
                currentLines[0] = e.target.value;
                setInputValue(currentLines.join('\n'));
              }}
              rows={1} // Single row for title-like appearance
              className="w-full resize-none border-0 shadow-none focus-visible:ring-0 text-base font-medium p-1 placeholder-muted-foreground/70" // Styling for title
            />
            <Separator className="my-1" /> {/* Separator line */}
             <Textarea
              placeholder="记录您的想法、任务或日程..." // Placeholder for Content
              value={inputValue.split('\n').slice(1).join('\n')} // Show lines after the first
              onChange={(e) => {
                const currentLines = inputValue.split('\n');
                 // Keep the first line (title) and update the rest
                setInputValue([currentLines[0], e.target.value].join('\n'));
              }}
              className="w-full resize-none border-0 shadow-none focus-visible:ring-0 text-base min-h-[60px] p-1 placeholder-muted-foreground/70" // Adjusted min-height and padding
            />


            {/* Previews and Attachment Name */}
            <div className="flex items-center gap-2 flex-wrap">
                 {/* Image Preview */}
                {imagePreviewUrl && (
                <div className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0"> {/* Smaller preview */}
                    <Image src={imagePreviewUrl} alt="图片预览" layout="fill" objectFit="cover" />
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

          <CardFooter className="bg-muted/50 p-2 flex items-center justify-between gap-1">
            <div className="flex items-center gap-0.5"> {/* Reduced gap */}
               {/* Event Type Select */}
                <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SelectTrigger className="w-auto h-7 px-1.5 border-0 bg-transparent shadow-none focus:ring-0"> {/* Smaller trigger */}
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
                    className="h-7 w-7" // Smaller button
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
                    className="h-7 w-7" // Smaller button
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

            {/* Submit Button */}
            <Button type="submit" size="sm" className="h-7 px-3"> {/* Smaller button */}
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

