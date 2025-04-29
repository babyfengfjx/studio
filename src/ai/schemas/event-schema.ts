/**
 * @fileOverview Zod schema definition for TimelineEvent.
 */
import { z } from 'zod';

// Define allowed event types matching the frontend type
const EVENT_TYPES_SCHEMA = z.enum(['note', 'todo', 'schedule']);

export const TimelineEventSchema = z.object({
  id: z.string().describe('Unique identifier for the event.'),
  // Use string for timestamp as Date objects might not serialize/deserialize well across boundaries.
  // Expect ISO 8601 format string.
  timestamp: z.string().datetime().describe('The date and time of the event in ISO 8601 format.'),
  eventType: EVENT_TYPES_SCHEMA.describe('The type of the event (note, todo, schedule).'),
  title: z.string().describe('The title of the event (often derived from the description).'),
  description: z.string().describe('The main content or description of the event.'),
  imageUrl: z.string().url().optional().describe('Optional URL of an associated image.'),
  attachment: z.object({
    name: z.string().describe('The name of the attached file.'),
    // url: z.string().url().optional().describe('Optional URL to the stored attachment.') // URL might not be available/needed for summarization
  }).optional().describe('Optional attached file information.'),
}).describe('Represents a single event on the timeline.');

export type TimelineEventInput = z.infer<typeof TimelineEventSchema>;
