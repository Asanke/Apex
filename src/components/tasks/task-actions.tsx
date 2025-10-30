'use client';

import { Button } from "../ui/button";
import type { Task } from "@/lib/types";
import { RejectTaskDialog } from "./reject-task-dialog";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateTaskStatus } from "@/lib/actions";

export function TaskActions({ task }: { task: Task }) {
    const { toast } = useToast();

    const handleAction = async (status: 'completed' | 'in_progress') => {
        const result = await updateTaskStatus({ taskId: task.id, circleId: task.circleId, status });
        if (result.success) {
            toast({
                title: `Task ${status === 'completed' ? 'Completed' : 'Started'}`,
                description: `"${task.title}" has been updated.`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        }
    }

    const showAccept = task.status === 'pending_acceptance';
    const showComplete = ['in_progress', 'pending_review', 'overdue'].includes(task.status);
    const showReject = task.status === 'pending_acceptance';

    if (!showAccept && !showComplete && !showReject) return null;

    return (
        <div className="flex items-center gap-2">
            {showReject && <RejectTaskDialog task={task} />}
            
            {showAccept && 
                <Button size="sm" variant="outline" onClick={() => handleAction('in_progress')}>
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                </Button>
            }

            {showComplete && 
                <Button size="sm" variant="outline" onClick={() => handleAction('completed')}>
                    <Check className="h-4 w-4 mr-1" />
                    Complete
                </Button>
            }
        </div>
    )
}
