'use client';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Shield, Circle, Home, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { User, Circle as CircleType } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: currentUser } = useDoc<User>(userRef);

  const circlesQuery = useMemoFirebase(
    () =>
      currentUser?.id
        ? query(
            collection(firestore, 'circles'),
            where('members', 'array-contains', { userId: currentUser.id, role_in_circle: currentUser.role })
          )
        : null,
    [firestore, currentUser]
  );
  const { data: userCircles } = useCollection<CircleType>(circlesQuery);
  
  const userImage = PlaceHolderImages.find(img => img.id === currentUser?.id)?.imageUrl || currentUser?.avatarUrl;
  
  if (isUserLoading || !currentUser) {
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                <div className="bg-primary rounded-lg p-2 text-primary-foreground">
                    <Shield className="h-6 w-6" />
                </div>
                <h1 className="text-xl font-semibold font-headline">Apex</h1>
                </div>
            </SidebarHeader>
            <SidebarContent className='p-2'>
                {/* Skeleton Loading State */}
            </SidebarContent>
        </Sidebar>
    )
  }


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2 text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold font-headline">Apex</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                <Link href="/dashboard">
                  <Home />
                  Focus Inbox
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Circles</SidebarGroupLabel>
          <SidebarMenu>
            {userCircles?.map(circle => (
              <SidebarMenuItem key={circle.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/circles/${circle.id}`}
                  tooltip={{ children: circle.name }}
                >
                  <Link href={`/circles/${circle.id}`}>
                    <Circle />
                    <span>{circle.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Separator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#">
                <Settings />
                Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-2 rounded-lg mt-2">
          <Avatar>
            <AvatarImage src={userImage || undefined} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-semibold truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.email}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
