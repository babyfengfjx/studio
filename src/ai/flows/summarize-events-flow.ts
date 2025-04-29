
'use server';
/**
 * @fileOverview An AI flow to summarize timeline events based on a user query.
 *
 * - summarizeEvents - A function that takes a query and events and returns a summary.
 */

import { ai } from '@/ai/ai-instance';
import {
    SummarizeEventsInputSchema,
    SummarizeEventsOutputSchema,
    type SummarizeEventsInput,
    type SummarizeEventsOutput
} from '@/ai/schemas/summarize-events-schema'; // Import from the new schema file

// Define the prompt for the AI model
const summarizePrompt = ai.definePrompt({
  name: 'summarizeEventsPrompt',
  input: { schema: SummarizeEventsInputSchema },
  output: { schema: SummarizeEventsOutputSchema },
  prompt: `You are a helpful assistant analyzing a user's timeline events.
The user has provided a list of their events (notes, todos, schedules) and a query.
Analyze the events provided below and generate a concise summary that directly answers the user's query.
Focus on the information relevant to the query based on the event timestamps, types, and descriptions.

User Query: {{{query}}}

Events:
{{#if events.length}}
{{#each events}}
- Date: {{timestamp}}
  Type: {{eventType}}
  Description: {{description}}
  {{#if imageUrl}}(Has Image){{/if}}
  {{#if attachment}}(Has Attachment: {{attachment.name}}){{/if}}

{{/each}}
{{else}}
No events provided.
{{/if}}

Based on the query and the events, provide a summary. If no relevant events are found, state that.
`,
});


// Define the Genkit flow
const summarizeEventsFlow = ai.defineFlow<
  typeof SummarizeEventsInputSchema,
  typeof SummarizeEventsOutputSchema
>(
  {
    name: 'summarizeEventsFlow',
    inputSchema: SummarizeEventsInputSchema,
    outputSchema: SummarizeEventsOutputSchema,
  },
  async (input) => {
    // If no events are passed, return a predefined message immediately.
    if (!input.events || input.events.length === 0) {
        return { summary: "没有可供总结的事件。" }; // "There are no events to summarize."
    }

    // Call the Gemini model with the prompt and input
    const { output } = await summarizePrompt(input);

    // Ensure output is not null, though the schema validation should handle this.
    // Provide a default fallback summary if the output is unexpectedly null.
    return output ?? { summary: "无法生成摘要。" }; // "Could not generate summary."
  }
);

// Exported wrapper function to be called from the frontend
export async function summarizeEvents(input: SummarizeEventsInput): Promise<SummarizeEventsOutput> {
  return summarizeEventsFlow(input);
}
