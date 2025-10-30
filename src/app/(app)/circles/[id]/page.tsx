import CreateTaskDialog from '@/components/tasks/create-task-dialog';
import TaskList from '@/components/tasks/task-list';
import { Button } from '@/components/ui/button';
import { mockCircles, mockTasks } from '@/lib/data';
import { Plus } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function CircleDetailPage({ params }: { params: { id: string } }) {
  const circle = mockCircles.find(c => c.circleId === params.id);
  
  if (!circle) {
    notFound();
  }

  const tasksInCircle = mockTasks.filter(t => t.circleId === circle.circleId);

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{circle.name}</h1>
          <p className="text-muted-foreground">Manage tasks and members for this circle.</p>
        </div>
        <CreateTaskDialog circleId={circle.circleId} />
      </div>
      <TaskList tasks={tasksInCircle} />
    </div>
  );
}
