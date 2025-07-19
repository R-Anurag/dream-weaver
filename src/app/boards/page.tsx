
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import BoardsSidebar from '@/components/boards-sidebar';
import DreamWeaverClient from '@/components/dream-weaver-client';
import type { Board } from '@/types';
import { WelcomeBoard } from '@/components/dream-weaver-client';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const getInitialWelcomeBoard = (): Board[] => {
  const welcome = { ...WelcomeBoard, id: generateId() };
  return [welcome];
};


export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load boards from localStorage only on the client side
    let loadedBoards: Board[] = [];
    try {
      const savedBoards = localStorage.getItem('dreamWeaverBoards');
      if (savedBoards) {
        const parsedBoards = JSON.parse(savedBoards);
        if (Array.isArray(parsedBoards) && parsedBoards.length > 0) {
          loadedBoards = parsedBoards;
        }
      }
    } catch (error) {
      console.error("Failed to load boards from localStorage", error);
    }

    if (loadedBoards.length > 0) {
      setBoards(loadedBoards);
      setActiveBoardId(loadedBoards[0].id);
    } else {
      const welcome = { ...WelcomeBoard, id: generateId() };
      setBoards([welcome]);
      setActiveBoardId(welcome.id);
    }
    setIsLoaded(true);
  }, []);
  
  useEffect(() => {
    // This effect is for saving to localStorage whenever boards change.
    // We only save if isLoaded is true, to prevent overwriting on initial load.
    if (isLoaded) {
      if (boards.length > 0) {
        // Don't save the placeholder welcome board if it's the only one and it hasn't been modified.
        if (boards.length === 1 && boards[0].id.startsWith('welcome-') && boards[0].items.length <= 2) {
            return;
        }
        localStorage.setItem('dreamWeaverBoards', JSON.stringify(boards));
      } else {
        localStorage.removeItem('dreamWeaverBoards');
      }
    }
  }, [boards, isLoaded]);

  const handleAddBoard = () => {
    const newBoard: Board = {
      id: generateId(),
      name: `New Board ${boards.filter(b => b.name.startsWith("New Board")).length + 1}`,
      items: [],
    };
    
    setBoards(prevBoards => {
       const isWelcomeBoard = prevBoards.length === 1 && prevBoards[0].id.startsWith('welcome-');
       const newBoards = isWelcomeBoard ? [newBoard] : [...prevBoards, newBoard];
       setActiveBoardId(newBoard.id);
       return newBoards;
    });
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
    <div className="flex min-h-svh w-screen bg-background font-body text-foreground overflow-hidden">
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
