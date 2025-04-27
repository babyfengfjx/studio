
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TimelineEvent } from "@/types/event";

// Zod schema with Chinese validation messages
const formSchema = z.object({
  title: z.string().min(1, { message: "标题不能为空。" }).max(100, { message: "标题不能超过100个字符。" }),
  description: z.string().max(500, { message: "描述不能超过500个字符。" }).optional(),
});


type EditEventFormProps = {
  event: TimelineEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEditEvent: (id: string, updatedData: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
};

export function EditEventForm({ event, isOpen, onOpenChange, onEditEvent }: EditEventFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Use defaultValues to pre-populate form when 'event' changes
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
    },
  });

  // Reset form when the event prop changes (e.g., when opening the dialog with a new event)
  React.useEffect(() => {
    if (event && isOpen) { // Reset only if event exists and dialog is open
      form.reset({
        title: event.title,
        description: event.description ?? "",
      });
    } else if (!isOpen) { // Reset to empty if dialog is closed
      form.reset({
        title: "",
        description: "",
      });
    }
  }, [event, isOpen, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (event) {
      onEditEvent(event.id, values);
    }
    onOpenChange(false); // Close the dialog
  }

  // Handle closing without saving
  const handleOpenChange = (open: boolean) => {
    // Resetting is handled by useEffect now
    onOpenChange(open);
  }

  if (!event) return null; // Don't render the dialog if no event is selected

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑事件</DialogTitle> {/* Translate */}
          <DialogDescription>
            更新您的时间轴事件的详细信息。 {/* Translate */}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标题</FormLabel> {/* Translate */}
                  <FormControl>
                    <Input placeholder="例如：团队会议" {...field} /> {/* Translate placeholder */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    /> {/* Translate placeholder */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>取消</Button> {/* Translate */}
                <Button type="submit">保存更改</Button> {/* Translate */}
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
