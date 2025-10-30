'use client';

import CreateTaskDialog from '@/components/tasks/create-task-dialog';
import TaskList from '@/components/tasks/task-list';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Circle, Task } from '@/lib/types';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { notFound } from 'next/navigation';

export default function CircleDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const circleRef = useMemoFirebase(
    () => doc(firestore, 'circles', params.id),
    [firestore, params.id]
  );
  const { data: circle, isLoading: isCircleLoading } = useDoc<Circle>(circleRef);

  const tasksQuery = useMemoFirebase(
    () => query(collection(firestore, `circles/${params.id}/tasks`), orderBy('createdAt', 'desc')),
    [firestore, params.id]
  );
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksQuery);
  
  if (!isCircleLoading && !circle) {
    notFound();
  }

  if (isCircleLoading || areTasksLoading) {
    return (
        <div className="container mx-auto">
            <div className="animate-pulse">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-8 w-48 bg-muted rounded"></div>
                        <div className="h-4 w-64 bg-muted rounded mt-2"></div>
                    </div>
                    <div className="h-10 w-28 bg-muted rounded"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-32 bg-muted rounded-lg"></div>
                    <div className="h-32 bg-muted rounded-lg"></div>
                    <div className="h-32 bg-muted rounded-lg"></div>
                </div>
            </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{circle?.name}</h1>
          <p className="text-muted-foreground">Manage tasks and members for this circle.</p>
        </div>
        <CreateTaskDialog circleId={params.id} />
      </div>
      <TaskList tasks={tasks || []} />
    </div>
  );
}
