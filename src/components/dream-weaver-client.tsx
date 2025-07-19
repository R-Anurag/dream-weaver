"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Board, CanvasItem, ItemType, ShapeType } from '@/types';
import BoardsSidebar from '@/components/boards-sidebar';
import Canvas from '@/components/canvas';
import Toolbar from '@/components/toolbar';
import PropertiesPanel from '@/components/properties-panel';
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const createNewItem = (type: ItemType, content: string = '', shape: ShapeType = 'rectangle'): CanvasItem => {
  const baseItem = {
    id: generateId(),
    type,
    x: 150,
    y: 150,
    rotation: 0,
    style: {
      backgroundColor: '#ffffff',
      color: '#000000',
      fontFamily: 'Alegreya',
      fontSize: 16,
      borderColor: '#000000',
      borderWidth: 0,
      textAlign: 'center' as const,
      shape,
    },
  };

  switch (type) {
    case 'text':
      return { ...baseItem, width: 200, height: 50, content: 'Editable Text' };
    case 'image':
      return { ...baseItem, width: 200, height: 200, content };
    case 'post-it':
      return {
        ...baseItem,
        width: 150,
        height: 150,
        content: 'A quick note...',
        rotation: -3,
        style: { ...baseItem.style, backgroundColor: '#FFFACD', color: '#333333', textAlign: 'left' as const },
      };
    case 'shape':
      return {
        ...baseItem,
        width: 150,
        height: 150,
        content: '',
        style: { ...baseItem.style, backgroundColor: '#E6E6FA', borderColor: '#A0A0E0', borderWidth: 2 },
      };
    default:
      throw new Error('Unknown item type');
  }
};

const WelcomeBoard: Board = {
  id: 'welcome-board',
  name: 'Welcome ✨',
  items: [
    {
      id: generateId(), type: 'text', x: 50, y: 50, width: 400, height: 100, rotation: 0, content: 'Welcome to Dream Weaver!',
      style: { backgroundColor: 'transparent', color: '#333', fontFamily: 'Alegreya', fontSize: 32, borderColor: '', borderWidth: 0, textAlign: 'left', shape: 'rectangle' }
    },
    {
      id: generateId(), type: 'post-it', x: 500, y: 80, width: 200, height: 200, rotation: 5, content: 'Add images, shapes, and notes to visualize your dreams. \n\nLet\'s get started!',
      style: { backgroundColor: '#FFFACD', color: '#333333', fontFamily: 'Alegreya', fontSize: 16, borderColor: '#000000', borderWidth: 0, textAlign: 'left', shape: 'rectangle' }
    },
  ]
};

export default function DreamWeaverClient() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedBoards = localStorage.getItem('dreamWeaverBoards');
      if (savedBoards) {
        const parsedBoards = JSON.parse(savedBoards);
        if (parsedBoards.length > 0) {
          setBoards(parsedBoards);
          setActiveBoardId(parsedBoards[0].id);
        } else {
            setBoards([WelcomeBoard]);
            setActiveBoardId(WelcomeBoard.id);
        }
      } else {
        setBoards([WelcomeBoard]);
        setActiveBoardId(WelcomeBoard.id);
      }
    } catch (error) {
      console.error("Failed to load boards from localStorage", error);
      setBoards([WelcomeBoard]);
      setActiveBoardId(WelcomeBoard.id);
    }
  }, []);

  useEffect(() => {
    if (boards.length > 0) {
      localStorage.setItem('dreamWeaverBoards', JSON.stringify(boards));
    }
  }, [boards]);
  
  const handleUpdateItem = useCallback((updatedItem: CanvasItem) => {
    setBoards(prevBoards =>
      prevBoards.map(board =>
        board.id === activeBoardId
          ? { ...board, items: board.items.map(item => (item.id === updatedItem.id ? updatedItem : item)) }
          : board
      )
    );
  }, [activeBoardId]);

  const handleSelectItem = useCallback((itemId: string | null) => {
    setSelectedItemId(itemId);
    if (itemId) {
      setBoards(prevBoards =>
        prevBoards.map(board => {
          if (board.id !== activeBoardId) return board;
          const itemIndex = board.items.findIndex(item => item.id === itemId);
          if (itemIndex === -1 || itemIndex === board.items.length - 1) return board;
          
          const itemToMove = board.items[itemIndex];
          const newItems = [...board.items];
          newItems.splice(itemIndex, 1);
          newItems.push(itemToMove);

          return { ...board, items: newItems };
        })
      );
    }
  }, [activeBoardId]);

  const activeBoard = boards.find(b => b.id === activeBoardId);
  const selectedItem = activeBoard?.items.find(i => i.id === selectedItemId);

  const handleAddItem = (type: ItemType, content?: string, shape?: ShapeType) => {
    if (!activeBoardId) {
        toast({ title: "No board selected", description: "Please select or create a board first.", variant: "destructive" });
        return;
    }
    const newItem = createNewItem(type, content, shape);
    setBoards(boards.map(b => b.id === activeBoardId ? { ...b, items: [...b.items, newItem] } : b));
    handleSelectItem(newItem.id);
  };
  
  const handleDeleteItem = () => {
    if (!selectedItemId || !activeBoardId) return;
    setBoards(boards.map(b => b.id === activeBoardId ? { ...b, items: b.items.filter(i => i.id !== selectedItemId) } : b));
    setSelectedItemId(null);
  }

  const handleAddBoard = () => {
    const newBoard: Board = {
      id: generateId(),
      name: `New Board ${boards.length + 1}`,
      items: [],
    };
    setBoards([...boards, newBoard]);
    setActiveBoardId(newBoard.id);
    setSelectedItemId(null);
  };

  const handleDeleteBoard = (boardId: string) => {
    const newBoards = boards.filter(b => b.id !== boardId);
    setBoards(newBoards);
    if (activeBoardId === boardId) {
      const newActiveId = newBoards.length > 0 ? newBoards[0].id : null;
      setActiveBoardId(newActiveId);
      setSelectedItemId(null);
    }
    if (newBoards.length === 0) {
      localStorage.removeItem('dreamWeaverBoards');
    }
  };
  
  const handleRenameBoard = (boardId: string, newName: string) => {
    setBoards(boards.map(b => b.id === boardId ? {...b, name: newName} : b));
  }
  
  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setSelectedItemId(null);
  }

  return (
    <SidebarProvider>
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
          <main className="flex-1 flex flex-row relative">
            <div className="flex-1 flex flex-col relative">
              <Toolbar onAddItem={handleAddItem} />
              <Canvas
                board={activeBoard}
                onUpdateItem={handleUpdateItem}
                selectedItemId={selectedItemId}
                onSelectItem={handleSelectItem}
              />
            </div>
            {selectedItem && (
              <PropertiesPanel
                item={selectedItem}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onClose={() => setSelectedItemId(null)}
              />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}