
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Board, CanvasItem, ItemType, ShapeType } from '@/types';
import Canvas from '@/components/canvas';
import Toolbar from '@/components/toolbar';
import PropertiesPanel from '@/components/properties-panel';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebar } from './ui/sidebar';
import { Button } from './ui/button';
import { Menu, UploadCloud } from 'lucide-react';
import { PublishDialog } from './publish-dialog';

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

export const WelcomeBoard: Board = {
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
  ],
  published: false,
};

export default function DreamWeaverClient({ boards, setBoards, activeBoardId }: { boards: Board[], setBoards: (boards: Board[] | ((prev: Board[]) => Board[])) => void, activeBoardId: string | null }) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  
  useEffect(() => {
    // When the active board changes, deselect any selected item and close the panel.
    setSelectedItemId(null);
    setIsPropertiesPanelOpen(false);
  }, [activeBoardId]);

  const handleUpdateItem = useCallback((updatedItem: CanvasItem) => {
    setBoards(prevBoards =>
      prevBoards.map(board =>
        board.id === activeBoardId
          ? { ...board, items: board.items.map(item => (item.id === updatedItem.id ? updatedItem : item)) }
          : board
      )
    );
  }, [activeBoardId, setBoards]);

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
  }, [activeBoardId, setBoards]);

  const activeBoard = boards.find(b => b.id === activeBoardId);
  const selectedItem = activeBoard?.items.find(i => i.id === selectedItemId);

  const handleAddItem = (type: ItemType, content?: string, shape?: ShapeType) => {
    if (!activeBoardId) {
        toast({ title: "No board selected", description: "Please select or create a board first.", variant: "destructive" });
        return;
    }
    const newItem = createNewItem(type, content, shape);
    setBoards(prevBoards => prevBoards.map(b => b.id === activeBoardId ? { ...b, items: [...b.items, newItem] } : b));
    handleSelectItem(newItem.id);
  };
  
  const handleDeleteItem = useCallback((itemIdToDelete: string) => {
    if (!itemIdToDelete || !activeBoardId) return;
    setBoards(boards.map(b => b.id === activeBoardId ? { ...b, items: b.items.filter(i => i.id !== itemIdToDelete) } : b));
    if (selectedItemId === itemIdToDelete) {
        setSelectedItemId(null);
        setIsPropertiesPanelOpen(false);
    }
  }, [activeBoardId, boards, selectedItemId, setBoards]);

  const handleClosePanel = () => {
    setIsPropertiesPanelOpen(false);
  }

  const handlePublish = (details: Partial<Board>) => {
    if (!activeBoardId) return;
    setBoards(prevBoards =>
      prevBoards.map(board =>
        board.id === activeBoardId
          ? { ...board, ...details, published: true }
          : board
      )
    );
    toast({
      title: "Board Published!",
      description: "Your vision board is now live on the Explore page.",
    });
    setIsPublishing(false);
  };

  const renderPropertiesPanel = () => {
    if (!selectedItem) return null;
    
    const panel = (
      <PropertiesPanel
        key={selectedItemId}
        item={selectedItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={() => handleDeleteItem(selectedItem.id)}
        onClose={handleClosePanel}
      />
    );

    if (isMobile) {
      return (
        <Sheet open={isPropertiesPanelOpen} onOpenChange={setIsPropertiesPanelOpen}>
          <SheetContent side="bottom" className="h-auto max-h-[80vh] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
                <SheetTitle className="capitalize text-lg">{selectedItem.type} Properties</SheetTitle>
            </SheetHeader>
            {panel}
          </SheetContent>
        </Sheet>
      )
    }

    if (isPropertiesPanelOpen) {
       return panel;
    }

    return null;
  }

  return (
      <main className="flex-1 flex flex-row relative">
        <div className="flex-1 flex flex-col relative">
          {isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 z-10 bg-card shadow-lg border border-border"
              aria-label="Toggle Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Button
            onClick={() => setIsPublishing(true)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-card shadow-lg border border-border"
            aria-label={activeBoard?.published ? "Update Board" : "Publish Board"}
          >
            <UploadCloud className="h-5 w-5" />
          </Button>
          <Toolbar onAddItem={handleAddItem} />
          <Canvas
            board={activeBoard}
            onUpdateItem={handleUpdateItem}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
            onEditItem={() => setIsPropertiesPanelOpen(true)}
            onDeleteItem={handleDeleteItem}
          />
        </div>
        {renderPropertiesPanel()}
        {activeBoard && <PublishDialog
            isOpen={isPublishing}
            onOpenChange={setIsPublishing}
            board={activeBoard}
            onPublish={handlePublish}
         />}
      </main>
  );
}
