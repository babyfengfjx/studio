/**
 * @fileOverview Zod schema definitions for the summarizeEvents flow.
 */
import { z } from 'zod';
import { TimelineEventSchema } from '@/ai/schemas/event-schema'; // Ensure TimelineEventSchema is imported

export const SummarizeEventsInputSchema = z.object({
  query: z.string().describe('The user\'s query about the events (e.g., "Summarize my work this week", "What meetings did I have yesterday?").'),
  events: z.array(TimelineEventSchema).describe('An array of timeline events to be summarized. Events should be relevant to the query if possible.'),
});
export type SummarizeEventsInput = z.infer<typeof SummarizeEventsInputSchema>;

export const SummarizeEventsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the events based on the user\'s query.'),
});
export type SummarizeEventsOutput = z.infer<typeof SummarizeEventsOutputSchema>;
