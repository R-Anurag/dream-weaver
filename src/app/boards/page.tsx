
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import BoardsSidebar from '@/components/boards-sidebar';
import DreamWeaverClient from '@/components/dream-weaver-client';
import type { Board } from '@/types';
import { getBoards, createBoard, deleteBoard, updateBoard } from '@/lib/board-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBoards = async () => {
      setIsLoading(true);
      try {
        const fetchedBoards = await getBoards();
        setBoards(fetchedBoards);
        if (fetchedBoards.length > 0) {
          const lastActiveBoardId = localStorage.getItem('lastActiveBoardId');
          const boardToSelect = fetchedBoards.find(b => b.id === lastActiveBoardId) || fetchedBoards[0];
          setActiveBoardId(boardToSelect.id);
        }
      } catch (error) {
        console.error("Failed to load boards", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBoards();
  }, []);

  const handleAddBoard = async () => {
    try {
      const newBoard = await createBoard();
      setBoards(prevBoards => [...prevBoards, newBoard]);
      setActiveBoardId(newBoard.id);
    } catch (error) {
      console.error("Failed to add board", error);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await deleteBoard(boardId);
      setBoards(prevBoards => {
        const newBoards = prevBoards.filter(b => b.id !== boardId);
        if (activeBoardId === boardId) {
          const newActiveId = newBoards.length > 0 ? newBoards[0].id : null;
          setActiveBoardId(newActiveId);
           if (newActiveId) {
            localStorage.setItem('lastActiveBoardId', newActiveId);
          } else {
            localStorage.removeItem('lastActiveBoardId');
          }
        }
        return newBoards;
      });
    } catch (error) {
      console.error("Failed to delete board", error);
    }
  };

  const handleUpdateBoard = useCallback(async (boardId: string, updates: Partial<Omit<Board, 'id'>>) => {
    try {
        const updatedBoard = await updateBoard(boardId, updates);
        setBoards(prevBoards =>
            prevBoards.map(board =>
            board.id === boardId ? updatedBoard : board
            )
        );
        return updatedBoard;
    } catch (error) {
        console.error("Failed to update board", error);
        throw error;
    }
  }, []);
  
  const handleRenameBoard = (boardId: string, newName: string) => {
    handleUpdateBoard(boardId, { name: newName });
  };
  
  const handleUpdateBoardItems = (boardId: string, items: Board['items']) => {
      handleUpdateBoard(boardId, { items });
  };


  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    localStorage.setItem('lastActiveBoardId', boardId);
  };
  
  const renderLoadingState = () => (
    <div className="flex min-h-svh w-screen bg-background font-body text-foreground overflow-hidden">
        <div className="hidden md:block w-64 p-4 space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-8">
            <Skeleton className="h-full w-full" />
        </div>
    </div>
  )
  
  if (isLoading) {
    return renderLoadingState();
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
          onUpdateBoard={handleUpdateBoard}
        />
      </SidebarInset>
    </div>
  );
}
