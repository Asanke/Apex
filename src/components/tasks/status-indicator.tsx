import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/lib/types';

interface StatusIndicatorProps {
  status: TaskStatus;
  className?: string;
}

const statusColors: Record<TaskStatus, string> = {
  pending_acceptance: 'bg-yellow-500',
  in_progress: 'bg-yellow-500',
  pending_review: 'bg-yellow-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
  rejected_by_override: 'bg-red-500',
  pending_approval: 'bg-yellow-500',
  overdue: 'bg-red-500',
  alert: 'bg-red-500',
  ai_suggestion: 'bg-blue-500',
};

export default function StatusIndicator({ status, className }: StatusIndicatorProps) {
  return (
    <div
      className={cn(
        'h-3 w-3 rounded-full shrink-0',
        statusColors[status] || 'bg-gray-400',
        className
      )}
      aria-label={`Status: ${status.replace(/_/g, ' ')}`}
      title={`Status: ${status.replace(/_/g, ' ')}`}
    />
  );
}
