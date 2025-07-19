"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusSquare, Trash2, Check, X, Edit2 } from 'lucide-react';
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

interface BoardsSidebarProps {
  boards: Board[];
  activeBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onAddBoard: () => void;
  onDeleteBoard: (id: string) => void;
  onRenameBoard: (id: string, newName: string) => void;
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
    <aside className="w-64 bg-card border-r border-border flex flex-col p-4 shadow-md z-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold font-headline">Dream Weaver</h1>
      </div>
      <Button onClick={onAddBoard} variant="outline" className="w-full mb-4">
        <PlusSquare className="mr-2 h-4 w-4" />
        New Board
      </Button>
      <ScrollArea className="flex-1 -mx-4">
        <div className="px-4">
          {boards.map(board => (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors mb-2 ${
                activeBoardId === board.id ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/20'
              }`}
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
                  <span className="truncate font-medium">{board.name}</span>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
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
      <div className="text-xs text-muted-foreground mt-4 text-center">
        Visualize your goals. Manifest your dreams.
      </div>
    </aside>
  );
}
