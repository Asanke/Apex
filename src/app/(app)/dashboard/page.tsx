'use client';
import FocusInbox from '@/components/dashboard/focus-inbox';
import { useUser } from '@/firebase';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  // Optional authentication - works with or without auth
  const skipAuth = !user && process.env.NODE_ENV === 'development';

  if (isUserLoading && !skipAuth) {
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

  if (!user && !skipAuth) {
    return (
        <div className="container mx-auto text-center">
            <p>Please log in to see your dashboard.</p>
        </div>
    )
  }

  const userIdForDemo = user?.uid || 'mock-admin-user';

  return (
    <div className="container mx-auto">
      {skipAuth && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded-lg">
          <p className="text-blue-800">🔧 Development Mode: Using mock data (Firebase available for production)</p>
        </div>
      )}
      <FocusInbox userId={userIdForDemo} />
    </div>
  );
}
