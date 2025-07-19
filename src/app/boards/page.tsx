
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import BoardsSidebar from '@/components/boards-sidebar';
import DreamWeaverClient from '@/components/dream-weaver-client';
import type { Board } from '@/types';
import { WelcomeBoard } from '@/components/dream-weaver-client';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const getInitialBoards = (): Board[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const savedBoards = localStorage.getItem('dreamWeaverBoards');
    if (savedBoards) {
      const parsedBoards = JSON.parse(savedBoards);
      if (Array.isArray(parsedBoards) && parsedBoards.length > 0) {
        return parsedBoards;
      }
    }
  } catch (error) {
    console.error("Failed to load boards from localStorage", error);
  }
  
  const welcome = { ...WelcomeBoard, id: generateId() };
  return [welcome];
};


export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>(getInitialBoards);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(() => {
      const initialBoards = getInitialBoards();
      return initialBoards.length > 0 ? initialBoards[0].id : null;
  });

  useEffect(() => {
    // This effect now only runs to initialize the active board ID
    // if it wasn't set from the initial boards state.
    if (!activeBoardId && boards.length > 0) {
        setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  useEffect(() => {
    // This effect is for saving to localStorage whenever boards change.
    if (boards.length > 0) {
      // Don't save the placeholder welcome board if it's the only one
      if (boards.length === 1 && boards[0].id === 'welcome-board' && boards[0].name === 'Welcome ✨') {
          return;
      }
      localStorage.setItem('dreamWeaverBoards', JSON.stringify(boards));
    } else {
      localStorage.removeItem('dreamWeaverBoards');
    }
  }, [boards]);

  const handleAddBoard = () => {
    const newBoard: Board = {
      id: generateId(),
      name: `New Board ${boards.filter(b => b.name.startsWith("New Board")).length + 1}`,
      items: [],
    };
    // If the only board is the welcome board, replace it. Otherwise, add to the array.
    const newBoards = boards.length === 1 && boards[0].id.startsWith('welcome') 
        ? [newBoard] 
        : [...boards, newBoard];

    setBoards(newBoards);
    setActiveBoardId(newBoard.id);
  };

  const handleDeleteBoard = (boardId: string) => {
    setBoards(prevBoards => {
      const newBoards = prevBoards.filter(b => b.id !== boardId);
      if (activeBoardId === boardId) {
        if (newBoards.length > 0) {
          setActiveBoardId(newBoards[0].id);
        } else {
          const welcome = { ...WelcomeBoard, id: generateId() };
          setActiveBoardId(welcome.id);
          return [welcome];
        }
      }
      return newBoards.length > 0 ? newBoards : [{...WelcomeBoard, id: generateId()}];
    });
  };
  
  const handleRenameBoard = (boardId: string, newName: string) => {
    setBoards(boards.map(b => b.id === boardId ? {...b, name: newName} : b));
  }
  
  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
  }

  return (
    <div className="flex h-screen w-screen bg-background font-body text-foreground overflow-hidden">
        <Sidebar>
            <BoardsSidebar
              boards={boards}
              activeBoardId={activeBoardId}
              onSelectBoard={handleSelectBoard}
              onAddBoard={handleAddBoard}
              onDeleteBoard={handleDeleteBoard}
              onRenameBoard={handleRenameBoard}
            />
        </Sidebar>
        <SidebarInset>
            <DreamWeaverClient
              boards={boards}
              setBoards={setBoards}
              activeBoardId={activeBoardId}
            />
        </SidebarInset>
    </div>
  );
}
