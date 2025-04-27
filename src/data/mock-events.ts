import type { TimelineEvent } from '@/types/event';

export const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    title: '项目启动会议',
    description: '与团队讨论项目目标和时间表。',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    title: '设计评审',
    description: '评审新功能的最新 UI 模型。',
  },
  {
    id: '3',
    timestamp: new Date(), // Now
    title: '开始开发任务',
    description: '开始编写身份验证模块的代码。',
  },
   {
    id: '4',
    timestamp: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours from now
    title: '客户电话会议',
    description: '就反馈问题与客户进行跟进电话。',
  },
   {
    id: '5',
    timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
    title: '部署到预发布环境',
    description: '准备构建以部署到预发布环境。',
  },
];
