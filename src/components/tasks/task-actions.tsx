'use client';

import { Button } from "../ui/button";
import type { Task } from "@/lib/types";
import { RejectTaskDialog } from "./reject-task-dialog";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TaskActions({ task }: { task: Task }) {
    const { toast } = useToast();

    const handleComplete = () => {
        // In a real app, this would be a server action
        console.log("Completing task", task.taskId);
        toast({
            title: "Task Completed",
            description: `"${task.title}" has been marked as complete.`,
        });
    }

    // Only show actions for certain statuses
    const showActions = ['pending_acceptance', 'in_progress', 'pending_review', 'overdue'].includes(task.status);
    const showComplete = ['in_progress', 'pending_review', 'overdue'].includes(task.status);
    const showReject = ['pending_acceptance'].includes(task.status);


    if (!showActions) return null;

    return (
        <div className="flex items-center gap-2">
            {showReject && <RejectTaskDialog task={task} />}
            
            {showComplete && 
                <Button size="sm" variant="outline" onClick={handleComplete}>
                    <Check className="h-4 w-4 mr-1" />
                    Complete
                </Button>
            }
        </div>
    )
}
