
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Board, CanvasItem, ItemType, ShapeType, Proposal } from '@/types';
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
import { UploadCloud, Inbox, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { PublishDialog } from './publish-dialog';
import ProposalsPanel from './proposals-panel';
import { sampleProposals } from '@/lib/sample-data';
import { Badge } from './ui/badge';
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
  published: false,
};

export default function DreamWeaverClient({ board, onUpdateItems, onUpdateBoardDetails }: { board: Board | undefined, onUpdateItems: (boardId: string, items: CanvasItem[]) => void, onUpdateBoardDetails: (boardId: string, details: Partial<Board>) => void }) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [isProposalsPanelOpen, setIsProposalsPanelOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTool, setActiveTool] = useState<'select' | 'pencil' | 'eraser'>('select');
  const [localItems, setLocalItems] = useState<CanvasItem[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { state, toggleSidebar } = useSidebar();
  
  useEffect(() => {
    setLocalItems(board?.items || []);
    setSelectedItemId(null);
    setIsPropertiesPanelOpen(false);
    setIsProposalsPanelOpen(false);
    setActiveTool('select');
  }, [board]);

  useEffect(() => {
    if (board?.id) {
        try {
            const storedProposals = localStorage.getItem(`proposals_${board.id}`);
            const localProposals: Proposal[] = storedProposals ? JSON.parse(storedProposals) : [];
            const sampleForBoard = sampleProposals.filter(sp => sp.boardId === board.id);
            const combinedProposals = [...localProposals, ...sampleForBoard.filter(sp => !localProposals.some(lp => lp.id === sp.id))];
            setProposals(combinedProposals);
        } catch (error) {
            console.error("Failed to load proposals", error);
            setProposals([]);
        }
    } else {
        setProposals([]);
    }
  }, [board]);

  const pendingProposalsCount = useMemo(() => {
    return proposals.filter(p => p.status === 'pending').length;
  }, [proposals]);

  const updateItems = (newItems: CanvasItem[], updateStorage: boolean = true) => {
      setLocalItems(newItems);
      if(board && updateStorage) {
          onUpdateItems(board.id, newItems);
      }
  }

  const handleUpdateItem = useCallback((updatedItem: CanvasItem) => {
    const newItems = localItems.map(item => (item.id === updatedItem.id ? updatedItem : item));
    updateItems(newItems);
  }, [localItems]);

  const handleSelectItem = useCallback((itemId: string | null) => {
    if (itemId) {
      if (selectedItemId !== itemId) {
         setSelectedItemId(itemId);
      }
      setActiveTool('select');
      
      const itemToMove = localItems.find(item => item.id === itemId);
      if (itemToMove?.type !== 'drawing') {
          const newItems = localItems.filter(item => item.id !== itemId);
          newItems.push(itemToMove);
          updateItems(newItems, true); // explicitly save on reorder
      }
    } else {
      setSelectedItemId(null);
    }
  }, [selectedItemId, localItems]);

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
  }, [board, localItems]);
  
  const handleDeleteItem = useCallback((itemIdToDelete: string) => {
    if (!itemIdToDelete || !board) return;
    updateItems(localItems.filter(i => i.id !== itemIdToDelete));
    if (selectedItemId === itemIdToDelete) {
        setSelectedItemId(null);
        setIsPropertiesPanelOpen(false);
    }
  }, [board, localItems, selectedItemId]);

  const handlePublish = (details: Partial<Board>) => {
    if (!board) return;
    onUpdateBoardDetails(board.id, details);
    toast({
      title: "Board Published!",
      description: "Your vision board is now live on the Explore page.",
    });
    setIsPublishing(false);
  };

  const handleUpdateProposal = (updatedProposal: Proposal) => {
    const updatedProposals = proposals.map(p => p.id === updatedProposal.id ? updatedProposal : p);
    setProposals(updatedProposals);
    try {
        localStorage.setItem(`proposals_${board?.id}`, JSON.stringify(updatedProposals.filter(p => !sampleProposals.some(sp => sp.id === p.id))));
    } catch(e) {
        console.error("Failed to save proposals", e);
    }
  };

  const renderPanels = () => {
    if (isMobile) {
      return (
        <>
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
          <Sheet open={isProposalsPanelOpen} onOpenChange={setIsProposalsPanelOpen}>
            <SheetContent side="bottom" className="h-auto max-h-[80vh] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Proposals Inbox</SheetTitle>
                    <SheetDescription className="sr-only">View and manage collaboration proposals for this board.</SheetDescription>
                </SheetHeader>
                {board && <ProposalsPanel board={board} proposals={proposals} onUpdateProposal={handleUpdateProposal} onClose={() => setIsProposalsPanelOpen(false)} />}
            </SheetContent>
          </Sheet>
        </>
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

    if (isProposalsPanelOpen && board) {
      return (
        <ProposalsPanel
          board={board}
          proposals={proposals}
          onUpdateProposal={handleUpdateProposal}
          onClose={() => setIsProposalsPanelOpen(false)}
        />
      );
    }
    
    return null;
  }
  
  const PublishTrigger = (
      <Button
          onClick={() => setIsPublishing(true)}
          variant="ghost"
          size="icon"
          className="bg-card shadow-lg border border-border"
          aria-label={board?.published ? "Update Board" : "Publish Board"}
          >
          <UploadCloud className="h-5 w-5" />
      </Button>
  );


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
                {board?.published && (
                    <Button
                        onClick={() => setIsProposalsPanelOpen(true)}
                        variant="ghost"
                        size="icon"
                        className="bg-card shadow-lg border border-border relative"
                        aria-label="View Proposals"
                    >
                        <Inbox className="h-5 w-5" />
                        {pendingProposalsCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                {pendingProposalsCount}
                            </Badge>
                        )}
                    </Button>
                )}
                 {board && (
                     <PublishDialog
                        board={board}
                        onPublish={handlePublish}
                        isOpen={isPublishing}
                        onOpenChange={setIsPublishing}
                    >
                       {PublishTrigger}
                    </PublishDialog>
                 )}
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
