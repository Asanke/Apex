import { mockFocusInboxItems } from '@/lib/data';
import { prioritizeFocusInbox } from '@/ai/flows/focus-inbox-prioritization';
import TaskCard from '../tasks/task-card';

export default async function FocusInbox() {
  // In a real application, you would fetch these from your database
  const pendingApprovals = ['task_1'];
  const aiIdentifiedBottlenecks = ['task_2'];
  const changeRequests: string[] = [];
  const failureToReachAlerts = ['user_staff_1'];
  const aiSuggestions = ['task_2'];

  // This would be an API call to a server action/route that runs the Genkit flow
  // const { prioritizedItems } = await prioritizeFocusInbox({
  //   pendingApprovals,
  //   aiIdentifiedBottlenecks,
  //   changeRequests,
  //   failureToReachAlerts,
  //   aiSuggestions,
  // });

  // For now, we use the mock data directly.
  const prioritizedItems = mockFocusInboxItems;

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
              task={{
                taskId: item.relatedId,
                title: item.title,
                description: item.summary,
                status: item.status,
                circleId: 'N/A',
                assignedBy: 'System',
                assignedTo: 'user_admin',
                media: [],
                log: [{ timestamp: item.timestamp, action: 'flagged' }],
              }}
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
