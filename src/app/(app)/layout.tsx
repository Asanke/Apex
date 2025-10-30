'use client';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { createUserProfile } from '@/lib/actions';
import { useEffect, useState } from 'react';

function UserProfileInitializer() {
  // Skip user profile creation when auth is disabled
  return null;
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
