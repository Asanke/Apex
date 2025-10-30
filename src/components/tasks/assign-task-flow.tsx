'use client';
import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Check, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { User, Circle } from '@/lib/types';
import type { AssignTaskOutput } from '@/ai/ai-task-assignment';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AssignTaskFlowProps {
  suggestion: AssignTaskOutput;
  onComplete: (assignedTo: string, overrideLog?: any) => void;
  circleId: string;
}

export default function AssignTaskFlow({
  suggestion,
  onComplete,
  circleId,
}: AssignTaskFlowProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isAssigning, setIsAssigning] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideChoice, setOverrideChoice] = useState<string | null>(null);


  const suggestedUserRef = useMemo(() => doc(firestore, 'users', suggestion.bestFitUserId), [firestore, suggestion.bestFitUserId]);
  const { data: suggestedUser } = useDoc<User>(suggestedUserRef);

  const circleRef = useMemo(() => doc(firestore, 'circles', circleId), [firestore, circleId]);
  const { data: circle } = useDoc<Circle>(circleRef);
  
  const otherUsers = circle?.members.filter(m => m.userId !== suggestion.bestFitUserId) || [];

  const handleAssign = async (userId: string, reason?: string) => {
    setIsAssigning(true);

    let overrideLog;
    if (showOverride && reason) {
        overrideLog = {
            overridden: true,
            originalSuggestion: suggestion.bestFitUserId,
            finalChoice: userId,
            adminReason: reason,
        };
    }

    await onComplete(userId, overrideLog);
    
    setIsAssigning(false);
    toast({
      title: 'Task Assigned!',
      description: 'The task has been successfully created and assigned.',
    });
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
            {otherUsers.map(member => (
              <UserSelectItem key={member.userId} userId={member.userId} />
            ))}
          </SelectContent>
        </Select>
        <Textarea
          placeholder="Reason for override (for AI learning)..."
          id="override-reason"
          required
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowOverride(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const reason = (
                document.getElementById('override-reason') as HTMLTextAreaElement
              ).value;
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
  
  const userImage = PlaceHolderImages.find(img => img.id === suggestedUser?.id)?.imageUrl;

  return (
    <div className="space-y-4 py-4">
      {suggestedUser && (
        <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">AI Suggestion</p>
          <div className="mt-2 flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userImage} alt={suggestedUser.name} />
              <AvatarFallback>{suggestedUser.name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{suggestedUser.name}</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground italic">
            &ldquo;{suggestion.reason}&rdquo;
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          onClick={() => handleAssign(suggestion.bestFitUserId)}
          disabled={isAssigning || !suggestedUser}
          size="lg"
        >
          <Check className="mr-2 h-4 w-4" />
          {isAssigning
            ? 'Assigning...'
            : `Assign to ${suggestedUser?.name || '...'}`}
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


function UserSelectItem({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const userRef = useMemo(() => doc(firestore, 'users', userId), [firestore, userId]);
    const { data: user } = useDoc<User>(userRef);
    const userImage = PlaceHolderImages.find(img => img.id === user?.id)?.imageUrl;

    if (!user) return <SelectItem value={userId}>Loading...</SelectItem>;

    return (
        <SelectItem value={user.id}>
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={userImage} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
            </div>
        </SelectItem>
    );
}
