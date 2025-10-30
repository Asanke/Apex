import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Task } from '@/lib/types';
import StatusIndicator from './status-indicator';
import { mockUsers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { TaskActions } from './task-actions';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const assignedToUser = mockUsers.find(u => u.userId === task.assignedTo);
  const lastActivity = task.log.length > 0 ? task.log[task.log.length - 1].timestamp : Date.now();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <StatusIndicator status={task.status} />
                    <span>{task.title}</span>
                </CardTitle>
                <CardDescription className="mt-1">
                    {task.description}
                </CardDescription>
            </div>
            {assignedToUser && (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={assignedToUser.avatarUrl} alt={assignedToUser.name} />
                        <AvatarFallback>{assignedToUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            )}
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
        </div>
        <TaskActions task={task} />
      </CardFooter>
    </Card>
  );
}
