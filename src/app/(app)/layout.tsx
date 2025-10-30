'use client';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { createUserProfile } from '@/lib/actions';
import { useEffect, useState } from 'react';

function UserProfileInitializer() {
  const { user } = useUser();
  const [isProfileCreated, setIsProfileCreated] = useState(false);

  useEffect(() => {
    async function checkAndCreateProfile() {
      if (user && !isProfileCreated) {
        // This server action should be idempotent
        await createUserProfile({
          userId: user.uid,
          email: user.email,
          name: user.displayName,
          avatarUrl: user.photoURL,
        });
        setIsProfileCreated(true);
      }
    }
    checkAndCreateProfile();
  }, [user, isProfileCreated]);

  return null; // This component does not render anything
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UserProfileInitializer />
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
