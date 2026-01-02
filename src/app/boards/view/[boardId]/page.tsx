
"use client";

import React, { useState, useEffect } from 'react';
import type { Board } from '@/types';
import CanvasItemComponent from '@/components/canvas-item';
import { sampleBoards } from '@/lib/sample-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ProposalDialog } from '@/components/proposal-dialog';
import { getBoards } from '@/lib/board-service';
import { hasSentProposal } from '@/lib/proposal-service';


interface ViewOnlyCanvasProps {
  board: Board | undefined;
}

function ViewOnlyCanvas({ board }: ViewOnlyCanvasProps) {
  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-muted-foreground">Board not found.</p>
      </div>
    );
  }

  return (
    <div
      id="canvas"
      className="flex-1 w-full h-full bg-background relative overflow-auto rounded-lg border shadow-inner"
      style={{
          backgroundSize: '20px 20px',
          backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
      }}
    >
      {board.items.map(item => (
        <div key={item.id} style={{ pointerEvents: 'none' }}>
            <CanvasItemComponent
              item={item}
              onUpdate={() => {}}
              isSelected={false}
              isEditing={false}
              onSelect={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onDoubleClick={() => {}}
              onStopEditing={() => {}}
              onItemPointerDown={() => {}}
            />
        </div>
      ))}
    </div>
  );
}


export default function ViewBoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const [board, setBoard] = useState<Board | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSentProposalState, setHasSentProposalState] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!boardId) return;

    const findBoard = async () => {
      setIsLoading(true);
      // Check sample boards first
      const sampleBoard = sampleBoards.find(b => b.id === boardId);
      if (sampleBoard) {
        setBoard(sampleBoard);
      } else {
        // If not in sample, check "database" (localStorage via service)
        try {
          const userBoards = await getBoards();
          const userBoard = userBoards.find(b => b.id === boardId);
          if (userBoard) {
            setBoard(userBoard);
          }
        } catch (error) {
          console.error("Failed to load board", error);
        }
      }
      
      try {
        // Check if a proposal was already sent
        const alreadySent = await hasSentProposal(boardId, 'A Collaborator'); // Using mock user name
        setHasSentProposalState(alreadySent);
      } catch (error) {
         console.error("Failed to check for existing proposals", error);
      }
      
      setIsLoading(false);
    };

    findBoard();

  }, [boardId]);

  return (
    <div className="flex flex-col min-h-svh w-screen bg-background" key={boardId}>
         <header className="p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between gap-4">
            <div className="flex-shrink-0">
                <Button asChild variant={isMobile ? "ghost" : "outline"} size={isMobile ? "icon" : "default"}>
                    <Link href="/explore">
                        <ArrowLeft className={cn(!isMobile && "mr-2", "h-4 w-4")} />
                        {!isMobile && 'Back to Explore'}
                    </Link>
                </Button>
            </div>
            <div className="flex-1 text-center min-w-0 px-4">
                 <h1 className="text-lg md:text-xl font-bold font-headline truncate" title={board?.name}>{board?.name || 'Loading...'}</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate" title={board?.description}>{board?.description}</p>
            </div>
            <div className="flex-shrink-0">
              {board && (
                <ProposalDialog 
                    board={board} 
                    onProposalSent={() => setHasSentProposalState(true)}
                >
                    <Button disabled={hasSentProposalState}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {hasSentProposalState ? 'Proposal Sent' : 'Collaborate'}
                    </Button>
                </ProposalDialog>
              )}
            </div>
        </header>
        <main className="flex-1 flex flex-col relative p-4 md:p-8">
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <ViewOnlyCanvas board={board} />
            )}
        </main>
    </div>
  );
}
