'use client';

import { useState, useEffect } from 'react';
import { prioritizeFocusInbox } from '@/ai/flows/focus-inbox-prioritization';
import TaskCard from '../tasks/task-card';
import { useFirestore } from '@/firebase';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import type { Task } from '@/lib/types';

async function getFocusInboxItems(firestore: any, userId: string) {
    const pendingReviewQuery = query(
        collectionGroup(firestore, 'tasks'),
        where('status', '==', 'pending_review'),
        where('assignedBy', '==', userId)
    );

    const overdueQuery = query(
        collectionGroup(firestore, 'tasks'),
        where('status', '==', 'overdue'),
         where('assignedTo', '==', userId)
    );
    
    const pendingAcceptanceQuery = query(
        collectionGroup(firestore, 'tasks'),
        where('status', '==', 'pending_acceptance'),
        where('assignedTo', '==', userId)
    );


    const [pendingReviewSnapshot, overdueSnapshot, pendingAcceptanceSnapshot] = await Promise.all([
        getDocs(pendingReviewQuery),
        getDocs(overdueQuery),
        getDocs(pendingAcceptanceQuery)
    ]);

    const pendingReviewTasks = pendingReviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    const overdueTasks = overdueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    const pendingAcceptanceTasks = pendingAcceptanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    
    // In a real app, you would also fetch other items like alerts, suggestions, etc.
    const allTasks = [...pendingReviewTasks, ...overdueTasks, ...pendingAcceptanceTasks];

    if (allTasks.length === 0) {
        return [];
    }
    
    // Use AI prioritization with fallback
    try {
        const { prioritizedItems } = await prioritizeFocusInbox({
            pendingApprovals: pendingReviewTasks.map(t => t.id),
            aiIdentifiedBottlenecks: [], // This would come from another AI flow
            changeRequests: [],
            failureToReachAlerts: [],
            aiSuggestions: [],
        });

        // Create a map for quick lookups
        const taskMap = new Map(allTasks.map(task => [task.id, task]));

        // Sort the original tasks array based on the prioritized list
        const sortedTasks = prioritizedItems.map((id: string) => taskMap.get(id)).filter((task: Task | undefined): task is Task => !!task);
        
        // Add any tasks that were not in the prioritized list to the end
        const unprioritizedTasks = allTasks.filter(task => !prioritizedItems.includes(task.id));

        return [...sortedTasks, ...unprioritizedTasks];
    } catch (error) {
        console.warn('AI prioritization failed, falling back to simple sort:', error);
        // Return tasks sorted by creation date if AI fails
        return allTasks.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
    }
}


export default function FocusInbox({ userId }: { userId: string}) {
  const firestore = useFirestore();
  const [prioritizedItems, setPrioritizedItems] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFocusInboxItems() {
      if (!firestore || !userId) return;
      
      try {
        setIsLoading(true);
        const items = await getFocusInboxItems(firestore, userId);
        setPrioritizedItems(items);
      } catch (error) {
        console.error('Error loading focus inbox items:', error);
        setPrioritizedItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadFocusInboxItems();
  }, [firestore, userId]);

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-muted rounded-md mb-2"></div>
          <div className="h-4 w-1/2 bg-muted rounded-md mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Welcome, Admin</h2>
        <p className="text-muted-foreground">
          Here are the items requiring your immediate attention.
        </p>
      </div>
      <div className="space-y-4">
        {prioritizedItems.length > 0 ? (
          prioritizedItems.map(item => (
            <TaskCard
              key={item.id}
              task={item}
            />
          ))
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <h3 className="text-lg font-medium">All Clear!</h3>
            <p className="text-muted-foreground">
              Your focus inbox is empty. Great job!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
