'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { getAIAssignmentSuggestion, createTask } from '@/lib/actions';
import AssignTaskFlow from './assign-task-flow';
import type { AssignTaskOutput } from '@/ai/ai-task-assignment';
import { useUser } from '@/firebase';


export default function CreateTaskDialog({ circleId }: { circleId: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [suggestion, setSuggestion] = useState<AssignTaskOutput | null>(null);
  const { user } = useUser();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    setTaskTitle(title);
    setTaskDescription(description);

    try {
      const result = await getAIAssignmentSuggestion({
        taskDescription: description,
        circleId,
      });
      setSuggestion(result);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      // Handle error, maybe show a toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentComplete = (assignedTo: string, overrideLog?: any) => {
    if (!user) return;
    createTask({
      title: taskTitle,
      description: taskDescription,
      circleId,
      assignedTo,
      assignedBy: user.uid,
      overrideLog
    });
    resetAndClose();
  }

  const resetAndClose = () => {
    setSuggestion(null);
    setTaskDescription('');
    setTaskTitle('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {suggestion ? 'Assign Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        {!suggestion ? (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Finalize Q4 budget"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide a detailed description of the task..."
                required
              />
            </div>
            <Button type="submit" disabled={isLoading || !user}>
              {isLoading ? 'Analyzing...' : 'Get AI Suggestion'}
            </Button>
          </form>
        ) : (
          <AssignTaskFlow 
            suggestion={suggestion} 
            onComplete={handleAssignmentComplete}
            circleId={circleId}
           />
        )}
      </DialogContent>
    </Dialog>
  );
}
