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
import {
  Shield,
  Circle,
  Home,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockCircles, mockUsers } from '@/lib/data';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '../ui/separator';

export default function AppSidebar() {
  const pathname = usePathname();
  const currentUser = mockUsers.find(u => u.role === 'admin')!;
  const userCircles = mockCircles.filter(c => currentUser.circles.includes(c.circleId));

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
            {userCircles.map(circle => (
              <SidebarMenuItem key={circle.circleId}>
                <SidebarMenuButton 
                  asChild
                  isActive={pathname === `/circles/${circle.circleId}`}
                  tooltip={{children: circle.name}}
                >
                  <Link href={`/circles/${circle.circleId}`}>
                    <Circle />
                    <span>{circle.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='p-2'>
        <Separator className='mb-2' />
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
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-semibold truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
