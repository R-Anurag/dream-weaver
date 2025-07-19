
"use client";

import { SidebarProvider } from '@/components/ui/sidebar';

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
        {children}
    </SidebarProvider>
  )
}
