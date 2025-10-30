import type { Task } from '@/lib/types';
import TaskCard from './task-card';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed">
        <h3 className="text-lg font-medium">No Tasks Here</h3>
        <p className="text-muted-foreground">
          Create a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskCard key={task.taskId} task={task} />
      ))}
    </div>
  );
}
