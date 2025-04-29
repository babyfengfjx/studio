
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
  description: z.string().describe('The main content or description of the event.'),
  imageUrl: z.string().url().optional().describe('Optional URL of an associated image.'),
  // Removed attachment field schema
}).describe('Represents a single event on the timeline.');

export type TimelineEventInput = z.infer<typeof TimelineEventSchema>;
