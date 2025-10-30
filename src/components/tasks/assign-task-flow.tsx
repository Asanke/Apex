'use client';
import { useState } from 'react';
import { mockUsers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Check, Users, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AssignTaskFlowProps {
  suggestion: {
    bestFit: string;
    reason: string;
  };
  onComplete: () => void;
}

export default function AssignTaskFlow({ suggestion, onComplete }: AssignTaskFlowProps) {
  const suggestedUser = mockUsers.find(u => u.userId === suggestion.bestFit)!;
  const otherUsers = mockUsers.filter(u => u.userId !== suggestion.bestFit);

  const [isAssigning, setIsAssigning] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideChoice, setOverrideChoice] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAssign = async (userId: string | null, reason?: string) => {
    setIsAssigning(true);
    // In a real app, this would be a server action call to create the task
    // with the final assignment details and override log if applicable.
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAssigning(false);
    
    toast({
        title: "Task Assigned!",
        description: "The task has been successfully created and assigned.",
    });

    onComplete();
  };

  if (showOverride) {
    return (
        <div className="space-y-4 py-4">
            <h3 className="font-semibold">Choose Someone Else</h3>
            <Select onValueChange={setOverrideChoice}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                    {otherUsers.map(user => (
                        <SelectItem key={user.userId} value={user.userId}>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={user.avatarUrl} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Textarea
                placeholder="Reason for override (for AI learning)..."
                id="override-reason"
                required
            />
            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowOverride(false)}>Cancel</Button>
                <Button
                    onClick={() => {
                        const reason = (document.getElementById('override-reason') as HTMLTextAreaElement).value;
                        if (overrideChoice && reason) {
                            handleAssign(overrideChoice, reason);
                        }
                    }}
                    disabled={isAssigning || !overrideChoice}
                >
                    {isAssigning ? 'Assigning...' : 'Assign & Teach AI'}
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">AI Suggestion</p>
        <div className="mt-2 flex flex-col items-center gap-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={suggestedUser.avatarUrl} alt={suggestedUser.name} />
            <AvatarFallback>{suggestedUser.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <p className="font-semibold">{suggestedUser.name}</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground italic">
          &ldquo;{suggestion.reason}&rdquo;
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={() => handleAssign(suggestion.bestFit)}
          disabled={isAssigning}
          size="lg"
        >
          <Check className="mr-2 h-4 w-4" />
          {isAssigning ? 'Assigning...' : `Assign to ${suggestedUser.name}`}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowOverride(true)}
          disabled={isAssigning}
        >
          <Users className="mr-2 h-4 w-4" />
          Choose Someone Else
        </Button>
      </div>
    </div>
  );
}
