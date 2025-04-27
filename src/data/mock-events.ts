import type { TimelineEvent } from '@/types/event';

export const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    title: 'Project Kickoff Meeting',
    description: 'Discuss project goals and timelines with the team.',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    title: 'Design Review',
    description: 'Review the latest UI mockups for the new feature.',
  },
  {
    id: '3',
    timestamp: new Date(), // Now
    title: 'Start Development Task',
    description: 'Begin coding the authentication module.',
  },
   {
    id: '4',
    timestamp: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours from now
    title: 'Client Call',
    description: 'Follow up call with the client regarding feedback.',
  },
   {
    id: '5',
    timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
    title: 'Deploy to Staging',
    description: 'Prepare the build for staging environment deployment.',
  },
];
