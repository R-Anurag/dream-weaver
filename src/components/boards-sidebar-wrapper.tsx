"use client";

import React, { useState, useEffect } from 'react';
import type { Board } from '@/types';
import BoardsSidebar from '@/components/boards-sidebar';
import { WelcomeBoard } from '@/components/dream-weaver-client';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export default function BoardsSidebarWrapper() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  useEffect(() => {
    let loadedBoards: Board[] = [];
    try {
      const savedBoards = localStorage.getItem('dreamWeaverBoards');
      if (savedBoards) {
        loadedBoards = JSON.parse(savedBoards);
      }
    } catch (error) {
      console.error("Failed to load boards from localStorage", error);
    }
    
    if (loadedBoards.length > 0) {
      setBoards(loadedBoards);
      setActiveBoardId(prevId => prevId ?? loadedBoards[0].id);
    } else {
      const welcome = { ...WelcomeBoard, id: generateId() };
      setBoards([welcome]);
      setActiveBoardId(welcome.id);
    }
  }, []);

  useEffect(() => {
    if (boards.length > 0) {
      localStorage.setItem('dreamWeaverBoards', JSON.stringify(boards));
    } else {
      localStorage.removeItem('dreamWeaverBoards');
    }
  }, [boards]);

  const handleAddBoard = () => {
    const newBoard: Board = {
      id: generateId(),
      name: `New Board ${boards.length + 1}`,
      items: [],
    };
    const newBoards = [...boards, newBoard];
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
      return newBoards;
    });
  };
  
  const handleRenameBoard = (boardId: string, newName: string) => {
    setBoards(boards.map(b => b.id === boardId ? {...b, name: newName} : b));
  }
  
  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
  }
  
  // This is a bit of a hack to pass state between two different top-level page components.
  // We'll pass the state down to the DreamWeaverClient on the main page.
  // And the sidebar will manage its own state here.
  if (typeof window !== 'undefined') {
    (window as any).__DREAM_WEAVER_BOARDS_STATE = {
      boards,
      setBoards,
      activeBoardId,
      setActiveBoardId,
    };
  }


  return (
    <BoardsSidebar
      boards={boards}
      activeBoardId={activeBoardId}
      onSelectBoard={handleSelectBoard}
      onAddBoard={handleAddBoard}
      onDeleteBoard={handleDeleteBoard}
      onRenameBoard={handleRenameBoard}
    />
  );
}
