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

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100),
  description: z.string().max(500).optional(),
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
    if (event) {
      form.reset({
        title: event.title,
        description: event.description ?? "",
      });
    } else {
      form.reset({ // Reset to empty if no event is provided (e.g., on close)
        title: "",
        description: "",
      });
    }
  }, [event, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (event) {
      onEditEvent(event.id, values);
    }
    onOpenChange(false); // Close the dialog
  }

  // Handle closing without saving
  const handleOpenChange = (open: boolean) => {
    if (!open) {
       // Optionally reset form on close if needed, though useEffect already handles much of this
       form.reset({ title: event?.title ?? "", description: event?.description ?? "" });
    }
    onOpenChange(open);
  }

  if (!event) return null; // Don't render the dialog if no event is selected

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details for your timeline event.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Meeting with team" {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Discuss project progress..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
