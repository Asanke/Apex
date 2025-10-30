import { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: 'admin' | 'partner' | 'staff_level_1' | 'family';
  circles: string[];
  ai_profile: {
    expertise: string[];
    success_rate: number;
    rejection_overrides: {
      timestamp: number;
      taskId: string;
      reason_given: string;
      reason_valid_by_ai: boolean;
    }[];
  };
};

export type Circle = {
  id: string;
  circleId: string;
  name: string;
  owner: string;
  members: {
    userId: string;
    role_in_circle: string;
  }[];
};

export type TaskStatus =
  | 'pending_acceptance'
  | 'in_progress'
  | 'pending_review'
  | 'completed'
  | 'blocked'
  | 'rejected_by_override'
  | 'pending_approval' // for tasks created by partners
  | 'overdue'
  | 'alert' // for Failure to Reach
  | 'ai_suggestion'; // for AI suggestions in focus inbox

export type Task = {
  id: string;
  taskId: string;
  title: string;
  description: string;
  circleId: string;
  media: string[];
  assignedBy: string;
  assignedTo: string;
  status: TaskStatus;
  createdAt: Timestamp;
  log: {
    timestamp: number;
    action: string;
    from?: string;
    to?: string;
    reason?: string;
  }[];
  overrideLog?: {
    overridden: boolean;
    originalSuggestion: string;
    finalChoice: string;
    adminReason: string;
  };
};

export type FocusInboxItem = {
  id: string;
  type: 'task' | 'alert' | 'suggestion';
  title: string;
  summary: string;
  status: TaskStatus;
  timestamp: number;
  relatedId: string; // taskId or userId
};
