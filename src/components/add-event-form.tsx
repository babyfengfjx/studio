
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";

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

type AddEventFormProps = {
  onAddEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
};

export function AddEventForm({ onAddEvent }: AddEventFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddEvent(values);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground fixed bottom-8 right-8 shadow-lg rounded-full p-4 h-auto aspect-square">
          <Plus className="h-6 w-6" />
          <span className="sr-only">添加事件</span> {/* Translate sr-only text */}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新事件</DialogTitle> {/* Translate */}
          <DialogDescription>
            填写新时间轴事件的详细信息。 {/* Translate */}
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
                    {/* Pass props explicitly */}
                     <Input
                      placeholder="例如：团队会议"
                      {...field} // Keep the spread for necessary form props
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                    />
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
                    {/* Pass props explicitly */}
                     <Textarea
                      placeholder="例如：讨论项目进展..."
                      className="resize-none"
                      {...field} // Keep the spread for necessary form props
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="submit">添加事件</Button> {/* Translate */}
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
