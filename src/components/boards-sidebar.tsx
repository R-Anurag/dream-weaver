
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusSquare, Trash2, Check, X, Edit2, Compass, Brush, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { Board } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


interface BoardsSidebarProps {
  boards: Board[];
  activeBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onAddBoard: () => void;
  onDeleteBoard: (id: string) => void;
  onRenameBoard: (id: string, newName: string) => void;
}

const MenuItem = ({ href, onClick, icon: Icon, children }: { href?: string, onClick?: () => void, icon: React.ElementType, children: React.ReactNode }) => {
    const commonProps = {
        className: "flex items-center gap-3 text-sm font-medium p-2 rounded-md hover:bg-secondary cursor-pointer",
        onClick: onClick,
    };

    const content = (
        <>
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span>{children}</span>
        </>
    );

    if (href) {
        return <Link href={href} {...commonProps}>{content}</Link>;
    }

    return <div {...commonProps}>{content}</div>;
}

export default function BoardsSidebar({
  boards,
  activeBoardId,
  onSelectBoard,
  onAddBoard,
  onDeleteBoard,
  onRenameBoard,
}: BoardsSidebarProps) {
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const { toggleSidebar, state } = useSidebar();
  
  const handleStartEditing = (board: Board) => {
    setEditingBoardId(board.id);
    setRenameValue(board.name);
  };

  const handleCancelEditing = () => {
    setEditingBoardId(null);
    setRenameValue('');
  };

  const handleSaveRename = () => {
    if (editingBoardId && renameValue.trim()) {
      onRenameBoard(editingBoardId, renameValue.trim());
      handleCancelEditing();
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border p-4 shadow-md z-20">
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="flex items-center gap-2">
            <Brush className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl font-headline">Dream Weaver</span>
        </Link>
         <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle Menu"
        >
            {state === 'expanded' ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </Button>
      </div>
       <div className="flex flex-col gap-1 px-2">
         <MenuItem href="/explore" icon={Compass}>Explore</MenuItem>
         <MenuItem onClick={onAddBoard} icon={PlusSquare}>New Board</MenuItem>
      </div>
      
      <Separator className="my-4" />

      <ScrollArea className="flex-1 -mx-4">
        <div className="px-4">
          <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">My Boards</h2>
          {boards.map(board => (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              className={cn(`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors mb-1`, 
                activeBoardId === board.id ? 'bg-accent/20' : 'hover:bg-secondary'
              )}
            >
              {editingBoardId === board.id ? (
                <div className="flex-1 flex items-center gap-1">
                  <Input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                    className="h-8 bg-background"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveRename}><Check className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEditing}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate font-medium">{board.name}</span>
                    <div className="flex items-center">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleStartEditing(board); }}><Edit2 className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive/80 hover:text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your board
                              and all its items.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteBoard(board.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
