'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Task, User } from '@/lib/types';
import StatusIndicator from './status-indicator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { TaskActions } from './task-actions';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useMemo } from 'react';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const firestore = useFirestore();

  const assignedToUserRef = useMemo(() => {
    if (!task.assignedTo) return null;
    return doc(firestore, 'users', task.assignedTo);
  }, [firestore, task.assignedTo]);

  const { data: assignedToUser } = useDoc<User>(assignedToUserRef);

  const lastActivity = task.log?.length > 0 ? task.log[task.log.length - 1].timestamp : (task.createdAt?.toDate() || Date.now());

  const userImage = PlaceHolderImages.find(img => img.id === assignedToUser?.id)?.imageUrl;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <StatusIndicator status={task.status} />
              <span>{task.title}</span>
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {task.description}
            </CardDescription>
          </div>
          {assignedToUser && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userImage} alt={assignedToUser.name} />
                <AvatarFallback>{assignedToUser.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {lastActivity ? `Updated ${formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}` : 'No activity yet'}
        </div>
        <TaskActions task={task} />
      </CardFooter>
    </Card>
  );
}
