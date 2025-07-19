
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import BoardsSidebarWrapper from '@/components/boards-sidebar-wrapper';
import DreamWeaverClientWrapper from '@/components/dream-weaver-client-wrapper';

export default function Home() {
  return (
    <div className="flex h-screen w-screen bg-background font-body text-foreground overflow-hidden">
        <Sidebar>
            <BoardsSidebarWrapper />
        </Sidebar>
        <SidebarInset>
            <DreamWeaverClientWrapper />
        </SidebarInset>
    </div>
  );
}
