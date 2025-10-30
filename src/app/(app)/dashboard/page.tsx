'use client';
import FocusInbox from '@/components/dashboard/focus-inbox';
import { useUser } from '@/firebase';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  // Debug mode - show dashboard even without authentication
  const debugMode = true;

  if (isUserLoading && !debugMode) {
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

  if (!user && !debugMode) {
    return (
        <div className="container mx-auto text-center">
            <p>Please log in to see your dashboard.</p>
        </div>
    )
  }

  const userIdForDemo = user?.uid || 'demo-user-id';

  return (
    <div className="container mx-auto">
      {debugMode && !user && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-800">🐛 Debug Mode: Running without authentication</p>
        </div>
      )}
      <FocusInbox userId={userIdForDemo} />
    </div>
  );
}
