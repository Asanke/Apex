'use client';

import { useState, useEffect } from 'react';
import { prioritizeFocusInbox } from '@/ai/flows/focus-inbox-prioritization';
import TaskCard from '../tasks/task-card';
import { useFirestore } from '@/firebase';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import type { Task } from '@/lib/types';

// Mock data fallback for when Firebase is not available
const mockTasks: Task[] = [
  {
    id: 'task-1',
    taskId: 'task-1',
    title: 'Review Q4 Budget Proposal',
    description: 'Review and approve the quarterly budget proposal for the cabinet business unit.',
    circleId: 'circle_1',
    media: [],
    assignedBy: 'user_admin',
    assignedTo: 'user_partner_1',
    status: 'pending_review',
    createdAt: { toDate: () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } as any,
    log: [
      {
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        action: 'created',
        from: 'user_admin',
      },
    ],
  },
  {
    id: 'task-2',
    taskId: 'task-2',
    title: 'Update CNC Machine Settings',
    description: 'Calibrate and update the CNC machine settings for the new cabinet door patterns.',
    circleId: 'circle_1',
    media: [],
    assignedBy: 'user_admin',
    assignedTo: 'user_staff_1',
    status: 'overdue',
    createdAt: { toDate: () => new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) } as any,
    log: [
      {
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        action: 'created',
        from: 'user_admin',
      },
    ],
  },
  {
    id: 'task-3',
    taskId: 'task-3',
    title: 'Payment Gateway Integration',
    description: 'Integrate Stripe payment gateway for the new FinTech client portal.',
    circleId: 'circle_2',
    media: [],
    assignedBy: 'user_admin',
    assignedTo: 'user_partner_2',
    status: 'pending_acceptance',
    createdAt: { toDate: () => new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) } as any,
    log: [
      {
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        action: 'created',
        from: 'user_admin',
      },
    ],
  },
];

async function getFocusInboxItems(firestore: any, userId: string): Promise<Task[]> {
  // Try Firebase first, fallback to mock data
  try {
    if (!firestore) {
      console.warn('Firebase not available, using mock data');
      return mockTasks;
    }

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
    
    const allTasks = [...pendingReviewTasks, ...overdueTasks, ...pendingAcceptanceTasks];

    if (allTasks.length === 0) {
      console.log('No Firebase tasks found, using mock data');
      return mockTasks;
    }
    
    // Use AI prioritization with fallback
    try {
      const { prioritizedItems } = await prioritizeFocusInbox({
        pendingApprovals: pendingReviewTasks.map(t => t.id),
        aiIdentifiedBottlenecks: [],
        changeRequests: [],
        failureToReachAlerts: [],
        aiSuggestions: [],
      });

      const taskMap = new Map(allTasks.map(task => [task.id, task]));
      const sortedTasks = prioritizedItems.map((id: string) => taskMap.get(id)).filter((task: Task | undefined): task is Task => !!task);
      const unprioritizedTasks = allTasks.filter(task => !prioritizedItems.includes(task.id));

      return [...sortedTasks, ...unprioritizedTasks];
    } catch (error) {
      console.warn('AI prioritization failed, falling back to simple sort:', error);
      return allTasks.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
    }
  } catch (error) {
    console.warn('Firebase query failed, using mock data:', error);
    return mockTasks;
  }
}


export default function FocusInbox({ userId }: { userId: string}) {
  const firestore = useFirestore();
  const [prioritizedItems, setPrioritizedItems] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFocusInboxItems() {
      try {
        setIsLoading(true);
        const items = await getFocusInboxItems(firestore, userId);
        setPrioritizedItems(items);
      } catch (error) {
        console.error('Error loading focus inbox items:', error);
        setPrioritizedItems(mockTasks); // Fallback to mock data
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
