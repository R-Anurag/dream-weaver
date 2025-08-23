
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
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from './ui/button';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useSidebar } from './ui/sidebar';

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
    case 'drawing':
        return {
             ...baseItem,
            width: 0, height: 0,
            style: {
                ...baseItem.style,
                strokeColor: '#000000',
                strokeWidth: 4,
                points: [],
            }
        };
    default:
      throw new Error('Unknown item type');
  }
};

export const WelcomeBoard: Omit<Board, 'id'> = {
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
};

export default function DreamWeaverClient({ board, onUpdateItems }: { board: Board | undefined, onUpdateItems: (boardId: string, items: CanvasItem[]) => void }) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'pencil' | 'eraser'>('select');
  const [localItems, setLocalItems] = useState<CanvasItem[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { state, toggleSidebar } = useSidebar();
  
  useEffect(() => {
    setLocalItems(board?.items || []);
    setSelectedItemId(null);
    setIsPropertiesPanelOpen(false);
    setActiveTool('select');
  }, [board]);


  const updateItems = (newItems: CanvasItem[], updateStorage: boolean = true) => {
      setLocalItems(newItems);
      if(board && updateStorage) {
          onUpdateItems(board.id, newItems);
      }
  }

  const handleUpdateItem = useCallback((updatedItem: CanvasItem) => {
    const newItems = localItems.map(item => (item.id === updatedItem.id ? updatedItem : item));
    updateItems(newItems);
  }, [localItems, updateItems]);

  const handleSelectItem = useCallback((itemId: string | null) => {
    if (itemId) {
      if (selectedItemId !== itemId) {
         setSelectedItemId(itemId);
      }
      setActiveTool('select');
      
      const itemToMove = localItems.find(item => item.id === itemId);
      if (itemToMove && itemToMove.type !== 'drawing') {
          const newItems = localItems.filter(item => item.id !== itemId);
          newItems.push(itemToMove);
          updateItems(newItems, true); // explicitly save on reorder
      }
    } else {
      setSelectedItemId(null);
    }
  }, [selectedItemId, localItems, updateItems]);

  const selectedItem = localItems.find(i => i.id === selectedItemId);

  const handleAddItem = (type: ItemType, content?: string, shape?: ShapeType) => {
    if (!board) {
        toast({ title: "No board selected", description: "Please select or create a board first.", variant: "destructive" });
        return;
    }
    const newItem = createNewItem(type, content, shape);
    updateItems([...localItems, newItem]);

    if (type !== 'drawing') {
      handleSelectItem(newItem.id);
    }
  };

  const handleAddDrawingItem = useCallback((item: CanvasItem) => {
    if (!board) return;
    updateItems([...localItems, item]);
  }, [board, localItems, updateItems]);
  
  const handleDeleteItem = useCallback((itemIdToDelete: string) => {
    if (!itemIdToDelete || !board) return;
    updateItems(localItems.filter(i => i.id !== itemIdToDelete));
    if (selectedItemId === itemIdToDelete) {
        setSelectedItemId(null);
        setIsPropertiesPanelOpen(false);
    }
  }, [board, localItems, selectedItemId, updateItems]);

  const renderPanels = () => {
    if (isMobile) {
      return (
          <Sheet open={isPropertiesPanelOpen} onOpenChange={setIsPropertiesPanelOpen}>
            <SheetContent side="bottom" className="h-auto max-h-[80vh] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b">
                  <SheetTitle className="capitalize text-lg">{selectedItem?.type} Properties</SheetTitle>
                   <SheetDescription className="sr-only">Edit the properties of the selected canvas item.</SheetDescription>
              </SheetHeader>
              {selectedItem && (
                 <PropertiesPanel
                    key={selectedItem.id}
                    item={selectedItem}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={() => handleDeleteItem(selectedItem.id)}
                    onClose={() => setIsPropertiesPanelOpen(false)}
                  />
              )}
            </SheetContent>
          </Sheet>
      );
    }

    if (isPropertiesPanelOpen && selectedItem) {
      return (
        <PropertiesPanel
          key={selectedItem.id}
          item={selectedItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={() => handleDeleteItem(selectedItem.id)}
          onClose={() => setIsPropertiesPanelOpen(false)}
        />
      );
    }
    
    return null;
  }
  
  return (
      <main className="flex-1 flex flex-row relative">
        <div className="flex-1 flex flex-col relative">
          <header className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2">
             <Button
                onClick={toggleSidebar}
                variant="ghost"
                size="icon"
                className="bg-card shadow-lg border border-border"
                aria-label="Toggle Menu"
            >
                {state === 'expanded' ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </Button>
            <div className="flex items-center justify-end gap-2">
            </div>
          </header>

          <Toolbar onAddItem={handleAddItem} activeTool={activeTool} onSetTool={setActiveTool} />
          <Canvas
            boardItems={localItems}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddDrawingItem}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
            onEditItem={() => setIsPropertiesPanelOpen(true)}
            onDeleteItem={handleDeleteItem}
            activeTool={activeTool}
          />
        </div>
        {renderPanels()}
      </main>
  );
}
