
import type { TimelineEvent } from '@/types/event';

// Use a fixed base date to ensure consistency between server and client rendering
const baseDate = new Date(2024, 5, 15, 10, 0, 0); // Example: June 15, 2024, 10:00:00

export const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: new Date(baseDate.getTime() - 1000 * 60 * 60 * 2), // 8:00 AM on baseDate
    eventType: 'schedule',
    title: '', // Title removed - will be derived
    description: '与团队讨论项目目标和时间表。\n这是第一行。\n这是第二行。',
    // Removed attachment
  },
  {
    id: '2',
    timestamp: new Date(baseDate.getTime() - 1000 * 60 * 30), // 9:30 AM on baseDate
    eventType: 'note',
    title: '', // Title removed - will be derived
    description: '评审新功能的最新 UI 模型。', // Removed attachment reference
    imageUrl: 'https://picsum.photos/seed/designreview/400/200',
  },
  {
    id: '3',
    timestamp: new Date(baseDate.getTime()), // 10:00 AM on baseDate
    eventType: 'todo',
    title: '', // Title removed - will be derived
    description: '开始编写身份验证模块的代码。',
  },
   {
    id: '4',
    timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 3), // 1:00 PM on baseDate
    eventType: 'schedule',
    title: '', // Title removed - will be derived
    description: '就反馈问题与客户进行跟进电话。客户提供了截图。',
     imageUrl: 'https://picsum.photos/seed/clientcall/400/200',
  },
   {
    id: '5',
    timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 24), // 10:00 AM on the day after baseDate
    eventType: 'todo',
    title: '', // Title removed - will be derived
    description: '准备构建以部署到预发布环境。', // Removed attachment reference
     // Removed attachment
  },
   {
    id: '6',
    timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 26), // 12:00 PM on the day after baseDate
    eventType: 'note',
    title: '', // Title removed - will be derived
    description: '团队一起外出享用午餐。这是强制描述。', // Added mandatory description
     imageUrl: 'https://picsum.photos/seed/teamlunch/400/200',
     // Removed attachment
  },
   {
    id: '7',
    timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 28), // 2:00 PM on the day after baseDate
    eventType: 'note',
    title: '', // Title removed - will be derived
    description: '记录一个关于新功能的新想法。', // Example without image/attachment
  },
];

