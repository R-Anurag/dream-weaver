
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import BoardsSidebar from '@/components/boards-sidebar';
import DreamWeaverClient from '@/components/dream-weaver-client';
import type { Board } from '@/types';
import { WelcomeBoard } from '@/components/dream-weaver-client';

const STORAGE_KEY = 'dreamWeaverBoards';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load boards from localStorage on initial render
    setIsLoaded(false);
    try {
      const savedBoards = localStorage.getItem(STORAGE_KEY);
      if (savedBoards) {
        const parsedBoards = JSON.parse(savedBoards);
        if(Array.isArray(parsedBoards) && parsedBoards.length > 0) {
            setBoards(parsedBoards);
            setActiveBoardId(parsedBoards[0].id);
        } else {
             // If storage is corrupted or empty array
             const welcome: Board = { ...WelcomeBoard, id: generateId() };
             setBoards([welcome]);
             setActiveBoardId(welcome.id);
        }
      } else {
        // Create a welcome board for new users
        const welcome: Board = { ...WelcomeBoard, id: generateId() };
        setBoards([welcome]);
        setActiveBoardId(welcome.id);
      }
    } catch (error) {
      console.error("Failed to load boards from localStorage", error);
       const welcome: Board = { ...WelcomeBoard, id: generateId() };
       setBoards([welcome]);
       setActiveBoardId(welcome.id);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Save boards to localStorage whenever they change
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
      } catch (error) {
        console.error("Failed to save boards to localStorage", error);
      }
    }
  }, [boards, isLoaded]);

  const handleAddBoard = () => {
    const newBoard: Board = {
      id: generateId(),
      name: `New Board ${boards.filter(b => b.name.startsWith("New Board")).length + 1}`,
      items: [],
    };
    setBoards(prevBoards => [...prevBoards, newBoard]);
    setActiveBoardId(newBoard.id);
  };

  const handleDeleteBoard = (boardId: string) => {
    setBoards(prevBoards => {
        const newBoards = prevBoards.filter(b => b.id !== boardId);
        if (activeBoardId === boardId) {
            setActiveBoardId(newBoards.length > 0 ? newBoards[0].id : null);
        }
        return newBoards;
    });
  };
  
  const handleRenameBoard = (boardId: string, newName: string) => {
    setBoards(boards.map(b => b.id === boardId ? {...b, name: newName} : b));
  }

  const handleUpdateBoardItems = (boardId: string, items: Board['items']) => {
    setBoards(prevBoards =>
      prevBoards.map(board =>
        board.id === boardId ? { ...board, items } : board
      )
    );
  };
  
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
              key={activeBoardId}
              board={boards.find(b => b.id === activeBoardId)}
              onUpdateItems={handleUpdateBoardItems}
            />
        </SidebarInset>
    </div>
  );
}
