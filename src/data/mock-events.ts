
import type { TimelineEvent } from '@/types/event';

// Use a fixed base date to ensure consistency between server and client rendering
const baseDate = new Date(2024, 5, 15, 10, 0, 0); // Example: June 15, 2024, 10:00:00

export const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: new Date(baseDate.getTime() - 1000 * 60 * 60 * 2), // 8:00 AM on baseDate
    eventType: 'schedule',
    title: '项目启动会议', // Keep existing title for mock, will be overwritten if description changes
    description: '与团队讨论项目目标和时间表。\n这是第一行。\n这是第二行。',
    attachment: { name: '会议纪要.pdf' }
  },
  {
    id: '2',
    timestamp: new Date(baseDate.getTime() - 1000 * 60 * 30), // 9:30 AM on baseDate
    eventType: 'note',
    title: '设计评审',
    description: '评审新功能的最新 UI 模型。查看附件获取详细信息。',
    imageUrl: 'https://picsum.photos/seed/designreview/400/200',
  },
  {
    id: '3',
    timestamp: new Date(baseDate.getTime()), // 10:00 AM on baseDate
    eventType: 'todo',
    title: '开始开发任务',
    description: '开始编写身份验证模块的代码。',
  },
   {
    id: '4',
    timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 3), // 1:00 PM on baseDate
    eventType: 'schedule',
    title: '客户电话会议',
    description: '就反馈问题与客户进行跟进电话。客户提供了截图。',
     imageUrl: 'https://picsum.photos/seed/clientcall/400/200',
  },
   {
    id: '5',
    timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 24), // 10:00 AM on the day after baseDate
    eventType: 'todo',
    title: '部署到预发布环境',
    description: '准备构建以部署到预发布环境。部署说明已附上。',
     attachment: { name: '部署说明.docx' }
  },
   {
    id: '6',
    timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 26), // 12:00 PM on the day after baseDate
    eventType: 'note',
    title: '午餐团队建设',
    description: '团队一起外出享用午餐。这是强制描述。', // Added mandatory description
     imageUrl: 'https://picsum.photos/seed/teamlunch/400/200',
     attachment: { name: '餐厅收据.png' }
  },
   {
    id: '7',
    timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 28), // 2:00 PM on the day after baseDate
    eventType: 'note',
    title: '新想法',
    description: '记录一个关于新功能的新想法。', // Example without image/attachment
  },
];
