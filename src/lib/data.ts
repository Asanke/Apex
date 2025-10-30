import type { User, Circle, Task, FocusInboxItem } from './types';

export const mockUsers: User[] = [
  {
    userId: 'user_admin',
    email: 'admin@apex.com',
    name: 'Admin',
    avatarUrl: 'https://picsum.photos/seed/1/100/100',
    role: 'admin',
    circles: ['circle_1', 'circle_2', 'circle_3', 'circle_4'],
    ai_profile: {
      expertise: ['management', 'finance', 'strategy'],
      success_rate: 0.98,
      rejection_overrides: [],
    },
  },
  {
    userId: 'user_partner_1',
    email: 'partner1@apex.com',
    name: 'Brenda Smith',
    avatarUrl: 'https://picsum.photos/seed/2/100/100',
    role: 'partner',
    circles: ['circle_1'],
    ai_profile: {
      expertise: ['cnc', 'woodworking', 'supply_chain'],
      success_rate: 0.92,
      rejection_overrides: [
        {
          timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
          taskId: 'task_3',
          reason_given: "I'm too busy",
          reason_valid_by_ai: false,
        },
      ],
    },
  },
  {
    userId: 'user_staff_1',
    email: 'staff1@apex.com',
    name: 'John Doe',
    avatarUrl: 'https://picsum.photos/seed/3/100/100',
    role: 'staff_level_1',
    circles: ['circle_1'],
    ai_profile: {
      expertise: ['finishing', 'sanding'],
      success_rate: 0.88,
      rejection_overrides: [],
    },
  },
  {
    userId: 'user_partner_2',
    email: 'partner2@apex.com',
    name: 'Carlos Garcia',
    avatarUrl: 'https://picsum.photos/seed/4/100/100',
    role: 'partner',
    circles: ['circle_2'],
    ai_profile: {
      expertise: ['payment_gateways', 'frontend_dev', 'user_experience'],
      success_rate: 0.95,
      rejection_overrides: [],
    },
  },
];

export const mockCircles: Circle[] = [
  {
    circleId: 'circle_1',
    name: 'Infinity/Luxus Cabinets',
    owner: 'user_admin',
    members: [
      { userId: 'user_admin', role_in_circle: 'admin' },
      { userId: 'user_partner_1', role_in_circle: 'partner' },
      { userId: 'user_staff_1', role_in_circle: 'staff' },
    ],
  },
  {
    circleId: 'circle_2',
    name: 'FinTech Venture',
    owner: 'user_admin',
    members: [
      { userId: 'user_admin', role_in_circle: 'admin' },
      { userId: 'user_partner_2', role_in_circle: 'partner' },
    ],
  },
  {
    circleId: 'circle_3',
    name: 'Family',
    owner: 'user_admin',
    members: [{ userId: 'user_admin', role_in_circle: 'admin' }],
  },
  {
    circleId: 'circle_4',
    name: 'Personal/Admin',
    owner: 'user_admin',
    members: [{ userId: 'user_admin', role_in_circle: 'admin' }],
  },
];

export const mockTasks: Task[] = [
  {
    taskId: 'task_1',
    title: 'Finalize Q3 Financial Report',
    description: 'Compile all financial data from Q3 and generate the final report for the board meeting.',
    circleId: 'circle_2',
    media: [],
    assignedBy: 'user_admin',
    assignedTo: 'user_partner_2',
    status: 'pending_review',
    log: [{ timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, action: 'created' }],
  },
  {
    taskId: 'task_2',
    title: 'Design new cabinet hinge mechanism',
    description: 'Develop and prototype a new soft-close hinge mechanism for the Luxus line. Needs to be cost-effective and durable.',
    circleId: 'circle_1',
    media: [],
    assignedBy: 'user_admin',
    assignedTo: 'user_partner_1',
    status: 'in_progress',
    log: [{ timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, action: 'created' }],
  },
  {
    taskId: 'task_3',
    title: 'Client Follow-up: Highgarden Project',
    description: 'Contact the client for the Highgarden project to get final sign-off on the design mockups.',
    circleId: 'circle_1',
    media: [],
    assignedBy: 'user_admin',
    assignedTo: 'user_partner_1',
    status: 'pending_acceptance',
    log: [{ timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, action: 'created' }],
  },
  {
    taskId: 'task_4',
    title: 'Sand and finish 20 cabinet doors',
    description: 'Complete the sanding and apply the first coat of finish to 20 doors for the Elm Street order.',
    circleId: 'circle_1',
    media: [],
    assignedBy: 'user_partner_1',
    assignedTo: 'user_staff_1',
    status: 'completed',
    log: [{ timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, action: 'created' }],
  },
  {
    taskId: 'task_5',
    title: 'Pay quarterly taxes',
    description: 'Ensure quarterly estimated taxes are paid on time for FinTech Venture.',
    circleId: 'circle_4',
    media: [],
    assignedBy: 'user_admin',
    assignedTo: 'user_admin',
    status: 'overdue',
    log: [{ timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, action: 'created' }],
  },
];

export const mockFocusInboxItems: FocusInboxItem[] = [
  {
    id: 'focus_1',
    type: 'alert',
    title: 'Failure to Reach: John Doe',
    summary: 'System attempted to alert John Doe 50 times for task "Complete staining" with no response.',
    status: 'alert',
    timestamp: Date.now() - 1 * 60 * 1000,
    relatedId: 'user_staff_1',
  },
  {
    id: 'focus_2',
    type: 'task',
    title: 'Approval needed: Q3 Financial Report',
    summary: 'Carlos Garcia has submitted the Q3 report for your review and approval.',
    status: 'pending_review',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    relatedId: 'task_1',
  },
  {
    id: 'focus_3',
    type: 'task',
    title: 'Task Overdue: Pay quarterly taxes',
    summary: 'This task is 3 days overdue. Immediate action is required.',
    status: 'overdue',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    relatedId: 'task_5',
  },
  {
    id: 'focus_4',
    type: 'suggestion',
    title: 'AI Suggestion: Re-assign task',
    summary: 'AI detected a bottleneck. Task "Design new cabinet hinge mechanism" has been "In Progress" for 5 days. Suggest re-assigning or checking in.',
    status: 'ai_suggestion',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    relatedId: 'task_2',
  },
];
