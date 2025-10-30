'use client';
import { SidebarTrigger } from '../ui/sidebar';
import UserNav from './user-nav';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Circle } from '@/lib/types';


function getHeaderTitle(pathname: string, circleName?: string): string {
    if (pathname.startsWith('/dashboard')) {
        return 'Focus Inbox';
    }
    if (pathname.startsWith('/circles/')) {
        return circleName || 'Circle';
    }
    return 'Apex';
}

export default function Header() {
  const pathname = usePathname();
  const firestore = useFirestore();

  const circleId = pathname.startsWith('/circles/') ? pathname.split('/')[2] : null;

  const circleRef = useMemo(() => {
    if (!circleId) return null;
    return doc(firestore, 'circles', circleId);
  }, [firestore, circleId]);

  const { data: circle } = useDoc<Circle>(circleRef);

  const title = getHeaderTitle(pathname, circle?.name);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      </div>

      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>

      <UserNav />
    </header>
  );
}
