
"use client";

import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

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
