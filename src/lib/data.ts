import { PlaceHolderImages } from './placeholder-images';
import type { User, Circle, Task, FocusInboxItem } from './types';

export const mockUsers: User[] = [
  {
    id: 'user_admin',
    userId: 'user_admin',
    email: 'admin@apex.com',
    name: 'Admin',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'user_admin')?.imageUrl || '',
    role: 'admin',
    circles: ['circle_1', 'circle_2', 'circle_3', 'circle_4'],
    ai_profile: {
      expertise: ['management', 'finance', 'strategy'],
      success_rate: 0.98,
      rejection_overrides: [],
    },
  },
  {
    id: 'user_partner_1',
    userId: 'user_partner_1',
    email: 'partner1@apex.com',
    name: 'Brenda Smith',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'user_partner_1')?.imageUrl || '',
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
    id: 'user_staff_1',
    userId: 'user_staff_1',
    email: 'staff1@apex.com',
    name: 'John Doe',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'user_staff_1')?.imageUrl || '',
    role: 'staff_level_1',
    circles: ['circle_1'],
    ai_profile: {
      expertise: ['finishing', 'sanding'],
      success_rate: 0.88,
      rejection_overrides: [],
    },
  },
  {
    id: 'user_partner_2',
    userId: 'user_partner_2',
    email: 'partner2@apex.com',
    name: 'Carlos Garcia',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'user_partner_2')?.imageUrl || '',
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
    id: 'circle_1',
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
    id: 'circle_2',
    circleId: 'circle_2',
    name: 'FinTech Venture',
    owner: 'user_admin',
    members: [
      { userId: 'user_admin', role_in_circle: 'admin' },
      { userId: 'user_partner_2', role_in_circle: 'partner' },
    ],
  },
  {
    id: 'circle_3',
    circleId: 'circle_3',
    name: 'Family',
    owner: 'user_admin',
    members: [{ userId: 'user_admin', role_in_circle: 'admin' }],
  },
  {
    id: 'circle_4',
    circleId: 'circle_4',
    name: 'Personal/Admin',
    owner: 'user_admin',
    members: [{ userId: 'user_admin', role_in_circle: 'admin' }],
  },
];
