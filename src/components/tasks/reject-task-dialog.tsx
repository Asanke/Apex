
'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { useState } from 'react';
import type { Task } from '@/lib/types';
import { rejectTask } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { X, AlertCircle } from 'lucide-react';

export function RejectTaskDialog({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverride, setShowOverride] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setShowOverride(false);

    const formData = new FormData(event.currentTarget);
    const reason = formData.get('reason') as string;
    const overrideCode = formData.get('overrideCode') as string | undefined;

    try {
      const result = await rejectTask({
        taskId: task.taskId,
        reason,
        taskDescription: task.description,
        overrideCode,
      });

      if (result.success) {
        toast({
            title: "Task Rejected",
            description: result.message,
        });
        setOpen(false);
      } else {
        setError(result.message);
        setShowOverride(true);
      }
    } catch (e) {
      setError('An unexpected error occurred.');
      setShowOverride(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive_outline">
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reject Task</DialogTitle>
            <DialogDescription>
              Provide a clear, actionable reason for rejecting this task.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Rejection Invalid</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for rejection</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="e.g., Conflicting with priority project X, missing critical info Y..."
                required
              />
            </div>

            {showOverride && (
              <div className="grid gap-2">
                <Label htmlFor="overrideCode">Admin Override Code</Label>
                <Input
                  id="overrideCode"
                  name="overrideCode"
                  placeholder="Enter code if you have one"
                />
                 <p className="text-xs text-muted-foreground">If the rejection is blocked, you can call the admin to get a temporary override code.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Rejection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
